import { SimulationEngine } from './SimulationEngine.js';

let engine = null;
let loopTimeout = null; // setTimeout handle — requestAnimationFrame does NOT exist in Workers
let lastTimestamp = 0;

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      engine = new SimulationEngine(payload);
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
      if (engine) engine.reset();
      break;

    case 'START':
      if (!loopTimeout) {
        lastTimestamp = performance.now();
        scheduleLoop();
      }
      break;

    case 'STOP':
      stopLoop();
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
  // Target ~60fps (16ms). Use setTimeout which IS available in workers.
  loopTimeout = setTimeout(run, 16);
}

function run() {
  loopTimeout = null;
  if (!engine) return;

  const now = performance.now();
  const dt_real = now - lastTimestamp;
  lastTimestamp = now;

  // Run a batch of simulation steps to match the desired sim_speed
  // sim_speed: 1 = realtime, 2 = 2x faster, etc.
  const sim_speed = engine.params.sim_speed || 1;
  // Steps to run in 16ms of real time at the given sim_speed
  const steps_per_frame = Math.max(1, Math.round((16 * sim_speed) / engine.params.dt));

  for (let i = 0; i < steps_per_frame; i++) {
    engine.step();
  }

  postState();
  scheduleLoop(); // queue next frame
}

function postState() {
  self.postMessage({
    type: 'STATE_UPDATE',
    payload: {
      t: engine.t,
      V: engine.V,
      spikes: engine.spikes,
      firing_rates: engine.firing_rates,
      stimuli: engine.stimuli,
    },
  });
}
