/**
 * SNN Simulation Engine
 * Implements Leaky Integrate-and-Fire (LIF) neurons with lateral inhibition.
 */

export const DEFAULTS = {
  // Neuron parameters
  V_rest: -70,           // mV
  V_threshold: -55,      // mV
  V_reset: -75,          // mV
  tau_m: 20,             // ms
  R: 1,                  // Membrane resistance
  refractory_period: 2,  // ms

  // Network parameters
  n_groups: 10,
  n_exc_per_group: 15,
  n_inh_per_group: 3,

  // Weight parameters
  w_exc: 12.0,            // was 0.8
  w_inh: 8.0,            // was 0.6
  w_rec_inh: 5.0,        // was 0.4
  w_drive_inh: 12.0,      // was 1.0

  // Input parameters
  I_stim: 25.0,           // was 2.5
  stim_duration: 100,    // ms

  // Simulation
  dt: 0.1,               // ms per step
  sim_speed: 1,          // Simulation speed multiplier (1 = realtime)
};

export class SimulationEngine {
  constructor(params = {}) {
    this.params = { ...DEFAULTS, ...params };
    this.reset();
  }

  updateParams(newParams) {
    this.params = { ...this.params, ...newParams };
  }

  reset() {
    const { n_groups, n_exc_per_group, n_inh_per_group, V_rest } = this.params;
    
    this.t = 0;
    this.total_neurons = n_groups * (n_exc_per_group + n_inh_per_group);
    
    // Arrays for states
    this.V = new Float32Array(this.total_neurons).fill(V_rest);
    this.refractory = new Float32Array(this.total_neurons).fill(0);
    this.spikes = []; // Recent spikes for visualization: [{t, g, n, is_inh}]
    this.last_spike_times = new Float32Array(this.total_neurons).fill(-1000);
    
    // External stimulus tracking
    this.stimuli = new Array(n_groups).fill(0); // Time remaining for each group's stimulus
    
    // Firing rate tracking (sliding window)
    this.firing_rates = new Float32Array(n_groups).fill(0);

    // Reset spike accumulators — must be sized to n_groups (not hardcoded 10)
    this.prev_exc_spikes = new Int32Array(n_groups).fill(0);
    this.prev_inh_spikes = new Int32Array(n_groups).fill(0);
  }

  loadItem(groupIndex) {
    if (groupIndex >= 0 && groupIndex < this.params.n_groups) {
      this.stimuli[groupIndex] = this.params.stim_duration;
    }
  }

  removeItem(groupIndex) {
    if (groupIndex >= 0 && groupIndex < this.params.n_groups) {
      this.stimuli[groupIndex] = 0;
      // We also need to collapse the activity. 
      // Naturally it might collapse if we just stop stimulus, 
      // but if it's self-sustaining, we might need to inhibit it briefly?
      // Actually, usually "remove" means just stop driving.
    }
  }

  step() {
    const { 
      n_groups, n_exc_per_group, n_inh_per_group, 
      V_rest, V_threshold, V_reset, tau_m, R, refractory_period,
      w_exc, w_inh, w_rec_inh, w_drive_inh, I_stim, dt 
    } = this.params;

    const n_per_group = n_exc_per_group + n_inh_per_group;
    
    // 1. Collect all spikes from the PREVIOUS timestep to compute current
    // We'll use the last_spike_times to check if a neuron fired in the previous step
    // However, a better way is to track "active spikes" that have an effect.
    // For simplicity and performance, we'll assume a spike has a delta-function effect in the next timestep.
    
    const group_exc_spikes = new Int32Array(n_groups);
    const group_inh_spikes = new Int32Array(n_groups);
    
    // 2. Identify which groups fired in the last step
    // (We'll do this during the neuron loop below for the NEXT step)
    
    // 3. Update all neurons
    for (let g = 0; g < n_groups; g++) {
      const group_offset = g * n_per_group;
      
      // External stimulus
      let external_I = this.stimuli[g] > 0 ? I_stim : 0;
      // Clamp to 0 to prevent floating-point negatives
      if (this.stimuli[g] > 0) this.stimuli[g] = Math.max(0, this.stimuli[g] - dt);

      for (let n = 0; n < n_per_group; n++) {
        const idx = group_offset + n;
        const is_inh = n >= n_exc_per_group;

        // Compute Input Current
        let I = 0;
        if (!is_inh) {
          // Excitatory neuron input
          I += external_I;
          
          // Recurrent excitation from own group
          // We count how many exc neurons in this group spiked in the last timestep
          // For simplicity, let's use the spike events from the previous global step
          I += this.prev_exc_spikes[g] * w_exc;
          
          // Recurrent inhibition from own group's interneurons
          I -= this.prev_inh_spikes[g] * w_rec_inh;
          
          // Lateral inhibition from OTHER groups' interneurons
          for (let other_g = 0; other_g < n_groups; other_g++) {
            if (other_g !== g) {
              I -= this.prev_inh_spikes[other_g] * w_inh;
            }
          }
        } else {
          // Inhibitory neuron input (interneurons)
          // Driven by excitatory neurons in the same group
          I += this.prev_exc_spikes[g] * w_drive_inh;
        }

        // Add some noise to prevent perfect synchronization
        I += (Math.random() - 0.5) * 0.5;

        // LIF update
        if (this.refractory[idx] > 0) {
          this.V[idx] = V_reset;
          this.refractory[idx] -= dt;
        } else {
          const dV = (-(this.V[idx] - V_rest) + R * I) / tau_m;
          this.V[idx] += dV * dt;

          // Threshold check
          if (this.V[idx] >= V_threshold) {
            this.V[idx] = V_reset;
            this.refractory[idx] = refractory_period;
            
            // Record spike
            if (is_inh) group_inh_spikes[g]++;
            else group_exc_spikes[g]++;
            
            this.spikes.push({ t: this.t, g, n, is_inh });
          }
        }
      }
    }

    // Update state for next step
    this.prev_exc_spikes = group_exc_spikes;
    this.prev_inh_spikes = group_inh_spikes;
    this.t += dt;

    // Update firing rates every 50ms (simulated time)
    if (Math.round(this.t / dt) % Math.round(50 / dt) === 0) {
      this.updateFiringRates();
    }

    // Limit spikes history for visualization
    if (this.spikes.length > 2000) {
      this.spikes = this.spikes.slice(-1000);
    }
  }

  updateFiringRates() {
    const window_size = 50; // ms
    const cutoff = this.t - window_size;
    // Count excitatory spikes per group in the window — single pass over spikes array
    const counts = new Int32Array(this.params.n_groups);
    for (let i = 0; i < this.spikes.length; i++) {
      const s = this.spikes[i];
      if (!s.is_inh && s.t > cutoff) counts[s.g]++;
    }
    // Rate = (count / neurons) / (window / 1000)
    const scale = this.params.n_exc_per_group * (window_size / 1000);
    for (let g = 0; g < this.params.n_groups; g++) {
      this.firing_rates[g] = counts[g] / scale;
    }
  }

  // Spike accumulators — properly sized and reset in reset()
  prev_exc_spikes = new Int32Array(10).fill(0);
  prev_inh_spikes = new Int32Array(10).fill(0);
}
