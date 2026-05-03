import React, { useState, useEffect } from 'react';
import { useSimulation } from './hooks/useSimulation';
import ControlPanel from './components/ControlPanel';
import NetworkVisualizer from './components/NetworkVisualizer';
import SpikeRaster from './components/SpikeRaster';
import CapacityMeter from './components/CapacityMeter';
import TheoryPanel from './components/TheoryPanel';
import { Beaker, Play, Pause, RefreshCw, Info, Cpu, Activity, Zap } from 'lucide-react';

export default function App() {
  const { 
    state, params, isRunning, 
    start, stop, reset, updateParams, 
    loadItem, removeItem, step 
  } = useSimulation();

  const [activeTab, setActiveTab] = useState('network');
  const [isTheoryOpen, setIsTheoryOpen] = useState(true);

  // Auto-run experiment helper
  const runExperiment = () => {
    reset();
    start();
    let count = 0;
    const interval = setInterval(() => {
      if (count < 10) {
        loadItem(count);
        count++;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-bg-secondary shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-blue/20 rounded flex items-center justify-center">
            <Cpu className="w-5 h-5 text-accent-blue" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mono">WORKING MEMORY <span className="text-accent-blue">ENGINE</span></h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs mono text-text-secondary">
            <div className="flex flex-col items-end">
              <span>SIM TIME</span>
              <span className="text-text-primary font-medium">{Math.floor(state.t)} ms</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-end">
              <span>LOAD</span>
              <span className="text-accent-green font-medium">
                {state.firing_rates.filter(r => r > 10).length} ITEMS
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-end">
              <span>SUPPRESSION</span>
              <span className="text-accent-red font-medium">
                {Math.round(params.w_inh * 100)}%
              </span>
            </div>
          </div>

          <button 
            onClick={runExperiment}
            className="flex items-center gap-2 bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-lg shadow-accent-blue/20"
          >
            <Beaker className="w-4 h-4" />
            RUN EXPERIMENT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Control Panel */}
        <div className="w-[320px] border-r border-border bg-bg-secondary overflow-y-auto shrink-0">
          <ControlPanel 
            params={params} 
            updateParams={updateParams}
            isRunning={isRunning}
            start={start}
            stop={stop}
            reset={reset}
            step={step}
            loadItem={loadItem}
            removeItem={removeItem}
            firingRates={state.firing_rates}
            stimuli={state.stimuli}
          />
        </div>

        {/* Center Visualization Area */}
        <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden relative">
          {/* Tabs */}
          <div className="flex border-b border-border bg-bg-secondary/50 px-4">
            {[
              { id: 'network', label: 'NETWORK ACTIVITY', icon: Activity },
              { id: 'raster', label: 'SPIKE RASTER', icon: Zap },
              { id: 'capacity', label: 'CAPACITY ANALYSIS', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-widest transition-all border-b-2 ${
                  activeTab === tab.id 
                    ? 'border-accent-blue text-accent-blue bg-accent-blue/5' 
                    : 'border-transparent text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Visualization Content */}
          <div className="flex-1 p-6 overflow-hidden">
            <div className="w-full h-full scientific-panel overflow-hidden relative bg-black/40">
              {activeTab === 'network' && (
                <NetworkVisualizer state={state} params={params} />
              )}
              {activeTab === 'raster' && (
                <SpikeRaster spikes={state.spikes} params={params} currentTime={state.t} />
              )}
              {activeTab === 'capacity' && (
                <CapacityMeter state={state} params={params} />
              )}
            </div>
          </div>
        </div>

        {/* Right Theory/Brainstorm Panel */}
        <div className={`transition-all duration-300 overflow-hidden border-l border-border bg-bg-secondary shrink-0 ${isTheoryOpen ? 'w-[360px]' : 'w-0'}`}>
          <TheoryPanel isVisible={isTheoryOpen} />
        </div>

        {/* Toggle Theory Panel */}
        <button 
          onClick={() => setIsTheoryOpen(!isTheoryOpen)}
          className="absolute right-4 bottom-4 w-10 h-10 bg-bg-tertiary border border-border rounded-full flex items-center justify-center shadow-xl hover:border-accent-blue transition-colors z-50"
        >
          <Info className={`w-5 h-5 ${isTheoryOpen ? 'text-accent-blue' : 'text-text-secondary'}`} />
        </button>
      </main>
    </div>
  );
}
