import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULTS } from '../SimulationEngine';

export function useSimulation() {
  const [state, setState] = useState({
    t: 0,
    V: new Float32Array(0),
    spikes: [],
    firing_rates: new Float32Array(0),
    stimuli: new Array(DEFAULTS.n_groups).fill(0),
  });
  const [params, setParams] = useState(DEFAULTS);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('../simWorker.js', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'STATE_UPDATE') {
        setState(payload);
      }
    };

    workerRef.current.postMessage({ type: 'INIT', payload: params });

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const start = useCallback(() => {
    workerRef.current.postMessage({ type: 'START' });
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    workerRef.current.postMessage({ type: 'STOP' });
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    workerRef.current.postMessage({ type: 'RESET' });
    setState(prev => ({
      ...prev,
      t: 0,
      V: new Float32Array(prev.V.length).fill(params.V_rest),
      spikes: [],
      firing_rates: new Float32Array(prev.firing_rates.length).fill(0),
      stimuli: new Array(params.n_groups).fill(0),
    }));
  }, [params.V_rest, params.n_groups]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => {
      const updated = { ...prev, ...newParams };
      workerRef.current.postMessage({ type: 'UPDATE_PARAMS', payload: updated });
      return updated;
    });
  }, []);

  const loadItem = useCallback((groupIndex) => {
    workerRef.current.postMessage({ type: 'LOAD_ITEM', payload: groupIndex });
  }, []);

  const removeItem = useCallback((groupIndex) => {
    workerRef.current.postMessage({ type: 'REMOVE_ITEM', payload: groupIndex });
  }, []);

  const step = useCallback(() => {
    workerRef.current.postMessage({ type: 'STEP' });
  }, []);

  return {
    state,
    params,
    isRunning,
    start,
    stop,
    reset,
    updateParams,
    loadItem,
    removeItem,
    step
  };
}
