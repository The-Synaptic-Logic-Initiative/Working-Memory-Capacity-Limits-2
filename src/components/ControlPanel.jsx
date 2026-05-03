import React from 'react';
import { Play, Pause, RefreshCw, ChevronRight, Sliders, Layers, Target } from 'lucide-react';
import { clsx } from 'clsx';

export default function ControlPanel({ 
  params, updateParams, isRunning, start, stop, reset, step, 
  loadItem, removeItem, firingRates, stimuli 
}) {
  const PRESETS = [
    { name: "Miller's Classic", desc: "Default — 7±2 emergence", w_inh: 0.6 },
    { name: "Break the Limit", desc: "Low inhibition, high capacity", w_inh: 0.2 },
    { name: "Hard Suppress", desc: "High inhibition, low capacity", w_inh: 1.1 },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Simulation Controls */}
      <div className="p-6 border-b border-border bg-black/20">
        <h2 className="text-xs font-bold text-text-tertiary tracking-widest mb-4 flex items-center gap-2">
          <Target className="w-3.5 h-3.5" />
          SIMULATION CONTROLS
        </h2>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            onClick={isRunning ? stop : start}
            className={clsx(
              "flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all",
              isRunning ? "bg-accent-red/10 text-accent-red hover:bg-accent-red/20" : "bg-accent-green/10 text-accent-green hover:bg-accent-green/20"
            )}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'PAUSE' : 'START'}
          </button>
          <button 
            onClick={reset}
            className="flex items-center justify-center gap-2 py-3 bg-bg-tertiary text-text-secondary hover:text-text-primary rounded-md text-sm font-bold border border-border hover:border-text-tertiary transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            RESET
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] mono text-text-tertiary uppercase">Sim Speed</span>
          <div className="flex bg-bg-tertiary rounded p-1 border border-border">
            {[0.5, 1, 2, 5, 10].map(speed => (
              <button
                key={speed}
                onClick={() => updateParams({ sim_speed: speed })}
                className={clsx(
                  "px-2 py-1 text-[10px] mono rounded transition-all",
                  params.sim_speed === speed ? "bg-accent-blue text-white" : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Item Loader */}
      <div className="p-6 border-b border-border overflow-y-auto">
        <h2 className="text-xs font-bold text-text-tertiary tracking-widest mb-4 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" />
          ITEM LOADER (WORKING MEMORY SLOTS)
        </h2>
        
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 10 }).map((_, i) => {
            const isLoaded = stimuli[i] > 0;
            const isActive = firingRates[i] > 10;
            const rate = Math.round(firingRates[i]);

            return (
              <button
                key={i}
                onClick={() => isLoaded || isActive ? removeItem(i) : loadItem(i)}
                className={clsx(
                  "p-3 rounded-lg border text-left transition-all relative group overflow-hidden",
                  isActive 
                    ? "bg-accent-green/5 border-accent-green/30 text-accent-green" 
                    : isLoaded 
                      ? "bg-accent-cyan/5 border-accent-cyan/30 text-accent-cyan pulse-loading"
                      : "bg-bg-tertiary border-border text-text-tertiary hover:border-text-secondary"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] mono">SLOT {i + 1}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-accent-green shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                </div>
                <div className="text-sm font-bold truncate">
                  {isActive ? 'ACTIVE' : isLoaded ? 'LOADING...' : 'EMPTY'}
                </div>
                <div className="text-[9px] mono opacity-60">
                  {rate > 0 ? `${rate} Hz` : '0 Hz'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* The Hero Dial - Inhibition Control */}
      <div className="p-6 border-b border-border bg-black/20">
        <h2 className="text-xs font-bold text-text-tertiary tracking-widest mb-2 flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5" />
          LATERAL INHIBITION STRENGTH
        </h2>
        <p className="text-[10px] text-text-tertiary mb-6 uppercase leading-tight">
          Controls competition between chunks. Higher values reduce capacity.
        </p>

        <div className="flex flex-col items-center py-4">
          <input 
            type="range" 
            min="0.1" 
            max="1.2" 
            step="0.05"
            value={params.w_inh}
            onChange={(e) => updateParams({ w_inh: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-blue"
          />
          <div className="flex justify-between w-full mt-2 mono text-[10px] text-text-tertiary">
            <span>WEAK (CAP ~12)</span>
            <span className="text-accent-blue font-bold text-lg">{params.w_inh.toFixed(2)}</span>
            <span>STRONG (CAP ~2)</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => updateParams({ w_inh: preset.w_inh })}
              className={clsx(
                "p-2 rounded text-[9px] mono border transition-all text-center leading-tight",
                params.w_inh === preset.w_inh 
                  ? "bg-accent-blue/10 border-accent-blue text-accent-blue" 
                  : "bg-bg-tertiary border-border text-text-tertiary hover:border-text-secondary"
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Parameters */}
      <div className="p-6">
        <details className="group">
          <summary className="text-xs font-bold text-text-tertiary tracking-widest flex items-center justify-between cursor-pointer list-none">
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              EXPERT MODE
            </span>
            <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
          </summary>
          <div className="mt-4 space-y-4">
            {[
              { label: "Membrane Leak (τm)", key: "tau_m", min: 5, max: 100, step: 1 },
              { label: "Excitation (w_exc)", key: "w_exc", min: 0.1, max: 2.0, step: 0.05 },
              { label: "Reset Potential", key: "V_reset", min: -90, max: -60, step: 1 },
            ].map(p => (
              <div key={p.key}>
                <div className="flex justify-between text-[10px] mono text-text-secondary mb-1">
                  <span>{p.label}</span>
                  <span className="text-accent-cyan">{params[p.key]}</span>
                </div>
                <input 
                  type="range" 
                  min={p.min} 
                  max={p.max} 
                  step={p.step}
                  value={params[p.key]}
                  onChange={(e) => updateParams({ [p.key]: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
