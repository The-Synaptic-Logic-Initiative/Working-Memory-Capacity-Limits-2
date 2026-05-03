/**
 * SNN Simulation Engine - Working Memory Edition
 * Implements Leaky Integrate-and-Fire (LIF) neurons with slow NMDA 
 * synaptic traces and fast GABA lateral inhibition.
 */

export const DEFAULTS = {
  // Neuron parameters
  V_rest: -70,           // mV
  V_threshold: -50,      // mV (Slightly higher to require sustained drive)
  V_reset: -75,          // mV
  tau_m: 20,             // ms (Membrane time constant)
  R: 1,                  // Membrane resistance
  refractory_period: 2,  // ms

  // Network parameters
  n_groups: 10,
  n_exc_per_group: 15,
  n_inh_per_group: 3,

  // NEW: Synaptic Time Constants (The secret to persistent memory)
  tau_NMDA: 100,         // ms - Slow excitation (sustains the memory)
  tau_GABA: 10,          // ms - Fast inhibition (stabilizes the network)

  // NEW: Berserk Weights
  w_exc: 45.0,           // Massive recurrent excitation to survive the NMDA leak
  w_inh: 25.0,           // Strong lateral inhibition for the 7±2 capacity limit
  w_rec_inh: 5.0,        // Local suppression to prevent runaway seizures
  w_drive_inh: 30.0,     // Strong drive from local exc to local interneurons

  // Input parameters
  I_stim: 40.0,          // Stronger punch to load items into memory
  stim_duration: 150,    // ms

  // Simulation
  dt: 0.1,               // ms per step
  sim_speed: 1,          // Simulation speed multiplier
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
    
    // Arrays for neuron states
    this.V = new Float32Array(this.total_neurons).fill(V_rest);
    this.refractory = new Float32Array(this.total_neurons).fill(0);
    this.spikes = [];
    
    // NEW: Continuous Synaptic State Variables (NMDA & GABA pools)
    this.S_exc = new Float32Array(n_groups).fill(0);
    this.S_inh = new Float32Array(n_groups).fill(0);
    
    this.stimuli = new Array(n_groups).fill(0);
    this.firing_rates = new Float32Array(n_groups).fill(0);

    // Properly sized arrays for tracking spikes between timesteps
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
      // To force remove an item, we aggressively wipe its NMDA memory trace
      this.S_exc[groupIndex] = 0;
    }
  }

  step() {
    const { 
      n_groups, n_exc_per_group, n_inh_per_group, 
      V_rest, V_threshold, V_reset, tau_m, R, refractory_period,
      tau_NMDA, tau_GABA, w_exc, w_inh, w_rec_inh, w_drive_inh, I_stim, dt 
    } = this.params;

    const n_per_group = n_exc_per_group + n_inh_per_group;
    
    // 1. Update Synaptic State Variables (The Differential Equations)
    for (let g = 0; g < n_groups; g++) {
      // Add the instantaneous jump from spikes in the exact previous timestep
      this.S_exc[g] += this.prev_exc_spikes[g];
      this.S_inh[g] += this.prev_inh_spikes[g];
      
      // Apply exponential decay
      this.S_exc[g] -= (this.S_exc[g] / tau_NMDA) * dt;
      this.S_inh[g] -= (this.S_inh[g] / tau_GABA) * dt;
    }

    const group_exc_spikes = new Int32Array(n_groups);
    const group_inh_spikes = new Int32Array(n_groups);
    
    // 2. Update all neurons
    for (let g = 0; g < n_groups; g++) {
      const group_offset = g * n_per_group;
      
      let external_I = this.stimuli[g] > 0 ? I_stim : 0;
      if (this.stimuli[g] > 0) this.stimuli[g] = Math.max(0, this.stimuli[g] - dt);

      for (let n = 0; n < n_per_group; n++) {
        const idx = group_offset + n;
        const is_inh = n >= n_exc_per_group;

        // Compute Input Current using the slow synaptic variables
        let I = 0;
        if (!is_inh) {
          I += external_I;
          
          // NMDA Recurrent excitation
          I += this.S_exc[g] * w_exc;
          
          // GABA Recurrent inhibition (local)
          I -= this.S_inh[g] * w_rec_inh;
          
          // GABA Lateral inhibition (Global pool from all other groups)
          for (let other_g = 0; other_g < n_groups; other_g++) {
            if (other_g !== g) {
              I -= this.S_inh[other_g] * w_inh;
            }
          }
        } else {
          // Interneurons are driven by their local excitatory NMDA pool
          I += this.S_exc[g] * w_drive_inh;
        }

        // Background noise
        I += (Math.random() - 0.5) * 1.5;

        // LIF Voltage Update
        if (this.refractory[idx] > 0) {
          this.V[idx] = V_reset;
          this.refractory[idx] -= dt;
        } else {
          const dV = (-(this.V[idx] - V_rest) + R * I) / tau_m;
          this.V[idx] += dV * dt;

          if (this.V[idx] >= V_threshold) {
            this.V[idx] = V_reset;
            this.refractory[idx] = refractory_period;
            
            if (is_inh) group_inh_spikes[g]++;
            else group_exc_spikes[g]++;
            
            this.spikes.push({ t: this.t, g, n, is_inh });
          }
        }
      }
    }

    this.prev_exc_spikes = group_exc_spikes;
    this.prev_inh_spikes = group_inh_spikes;
    this.t += dt;

    if (Math.round(this.t / dt) % Math.round(50 / dt) === 0) {
      this.updateFiringRates();
    }

    if (this.spikes.length > 2000) {
      this.spikes = this.spikes.slice(-1000);
    }
  }

  updateFiringRates() {
    const window_size = 50; 
    const cutoff = this.t - window_size;
    const counts = new Int32Array(this.params.n_groups);
    
    for (let i = 0; i < this.spikes.length; i++) {
      const s = this.spikes[i];
      if (!s.is_inh && s.t > cutoff) counts[s.g]++;
    }
    
    const scale = this.params.n_exc_per_group * (window_size / 1000);
    for (let g = 0; g < this.params.n_groups; g++) {
      this.firing_rates[g] = counts[g] / scale;
    }
  }
}
