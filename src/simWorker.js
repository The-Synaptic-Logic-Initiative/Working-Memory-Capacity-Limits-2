import { SimulationEngine } from './SimulationEngine.js';

let engine = null;
let loopTimeout = null; 
let lastTimestamp = 0;

// Optimization: We reuse a single state object to prevent constant garbage collection
const payloadBuffer = {
  t: 0,
  V: null,
  spikes: null,
  firing_rates: null,
  stimuli: null,
  S_exc: null, // Sending our new memory traces to the UI just in case!
  S_inh: null
};

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      engine = new SimulationEngine(payload);
      postState();
      break;

    case 'UPDATE_PARAMS':
      if (engine) engine.updateParams(payload);
      break;

    case 'LOAD_ITEM':
      if (engine) engine.loadItem(payload);
      break;

    case 'REMOVE_ITEM':
      if (engine) engine.removeItem(payload);
      break;

    case 'RESET':
      stopLoop();
      if (engine) {
        engine.reset();
        postState();
      }
      break;

    case 'START':
      if (!loopTimeout) {
        lastTimestamp = performance.now();
        scheduleLoop();
      }
      break;

    case 'STOP':
      stopLoop();
      postState();
      break;

    case 'STEP':
      if (engine) {
        engine.step();
        postState();
      }
      break;
  }
};

function stopLoop() {
  if (loopTimeout !== null) {
    clearTimeout(loopTimeout);
    loopTimeout = null;
  }
}

function scheduleLoop() {
  // Target 60fps (16.6ms)
  loopTimeout = setTimeout(run, 16);
}

function run() {
  loopTimeout = null;
  if (!engine) return;

  const now = performance.now();
  let dt_real = now - lastTimestamp;
  lastTimestamp = now;

  // CRITICAL SAFETY CATCH: If the user switched tabs and the browser throttled 
  // the worker, dt_real will be massive. We cap it to prevent the physics 
  // engine from trying to process 10,000 steps at once and crashing the tab.
  if (dt_real > 100) {
    dt_real = 16; // Pretend only one frame passed to save the engine
  }

  const sim_speed = engine.params.sim_speed || 1;
  
  // Calculate exactly how many 0.1ms physics steps fit into this real-time frame
  const steps_per_frame = Math.max(1, Math.round((dt_real * sim_speed) / engine.params.dt));

  // Run the berserk physics loop
  for (let i = 0; i < steps_per_frame; i++) {
    engine.step();
  }

  postState();
  scheduleLoop(); 
}

function postState() {
  if (!engine) return;

  // We map the data into our reusable buffer to keep memory profiling clean
  payloadBuffer.t = engine.t;
  payloadBuffer.V = engine.V;
  payloadBuffer.spikes = engine.spikes;
  payloadBuffer.firing_rates = engine.firing_rates;
  payloadBuffer.stimuli = engine.stimuli;
  payloadBuffer.S_exc = engine.S_exc; 
  payloadBuffer.S_inh = engine.S_inh;

  self.postMessage({
    type: 'STATE_UPDATE',
    payload: payloadBuffer,
  });
}
