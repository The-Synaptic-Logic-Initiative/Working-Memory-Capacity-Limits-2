import React, { useState } from 'react';
import { BookOpen, Cpu, Lightbulb, Workflow, Network } from 'lucide-react';
import { clsx } from 'clsx';

export default function TheoryPanel({ isVisible }) {
  const [activeTab, setActiveTab] = useState('science');

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('science')}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-bold tracking-widest transition-all",
            activeTab === 'science' ? "text-accent-blue bg-accent-blue/5" : "text-text-tertiary hover:text-text-secondary"
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          THE SCIENCE
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-bold tracking-widest transition-all",
            activeTab === 'hardware' ? "text-accent-cyan bg-accent-cyan/5" : "text-text-tertiary hover:text-text-secondary"
          )}
        >
          <Cpu className="w-3.5 h-3.5" />
          HARDWARE ANALOGY
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {activeTab === 'science' ? (
          <>
            <section>
              <h3 className="text-xs font-bold text-accent-blue mono mb-3 flex items-center gap-2">
                <Workflow className="w-4 h-4" />
                HOW IT WORKS
              </h3>
              <div className="space-y-4 text-xs leading-relaxed text-text-secondary">
                <div className="p-3 bg-bg-tertiary rounded border border-border">
                  <p className="font-bold text-text-primary mb-1">1. LIF NEURONS</p>
                  Neurons integrate incoming current like a leaky capacitor. When they cross -55mV, they "spike" and reset.
                </div>
                <div className="p-3 bg-bg-tertiary rounded border border-border">
                  <p className="font-bold text-text-primary mb-1">2. RECURRENT EXCITATION</p>
                  Groups of neurons are wired to excite each other. This creates a self-sustaining loop that stores a "chunk" of info.
                </div>
                <div className="p-3 bg-bg-tertiary rounded border border-border">
                  <p className="font-bold text-text-primary mb-1">3. LATERAL INHIBITION</p>
                  Each active group suppresses all other groups. This creates **competition**.
                </div>
                <div className="p-3 bg-bg-tertiary rounded border border-border">
                  <p className="font-bold text-text-primary mb-1">4. THE EMERGENCE</p>
                  As you load more items, the total inhibition floor rises. Eventually, it exceeds the excitatory drive of the weakest item, causing it to collapse.
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-text-primary mono mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accent-amber" />
                OBSERVATION
              </h3>
              <p className="text-xs text-text-tertiary italic leading-relaxed">
                Notice how the 8th item causes a cascade of inhibition. The "7±2" limit isn't programmed—it falls out of the physics of the network.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h3 className="text-xs font-bold text-accent-cyan mono mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                BRAINSTORM: NEUROMORPHIC
              </h3>
              <div className="space-y-4 text-xs leading-relaxed text-text-secondary">
                <p>
                  The SNN architecture is more similar to digital hardware than standard deep learning.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] mono">
                  <div className="p-2 bg-bg-tertiary rounded border border-border text-center">
                    <div className="text-accent-cyan mb-1">NEURON</div>
                    <div className="text-text-primary">TRANSISTOR</div>
                  </div>
                  <div className="p-2 bg-bg-tertiary rounded border border-border text-center">
                    <div className="text-accent-cyan mb-1">SPIKE</div>
                    <div className="text-text-primary">5V PULSE</div>
                  </div>
                  <div className="p-2 bg-bg-tertiary rounded border border-border text-center">
                    <div className="text-accent-cyan mb-1">RHYTHM</div>
                    <div className="text-text-primary">CLOCK SIG</div>
                  </div>
                  <div className="p-2 bg-bg-tertiary rounded border border-border text-center">
                    <div className="text-accent-cyan mb-1">LEAK</div>
                    <div className="text-text-primary">CAPACITANCE</div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="p-4 bg-accent-blue/5 border border-accent-blue/20 rounded-lg">
                <h4 className="text-[10px] font-bold text-accent-blue mono mb-2 uppercase flex items-center gap-2">
                  <Network className="w-3 h-3" />
                  Future Direction
                </h4>
                <p className="text-[10px] text-text-secondary leading-normal">
                  Building working memory chips using asynchronous logic gates. Unlike RAM, this memory is "alive"—it consumes power based on activity, not just storage.
                </p>
              </div>
            </section>

            <div className="mt-8 flex justify-center">
              <div className="w-full aspect-video rounded border border-border bg-black/40 flex items-center justify-center p-4">
                {/* Placeholder for simple circuit diagram */}
                <div className="text-[10px] mono text-text-tertiary text-center">
                  [ SIMPLIFIED CIRCUIT DIAGRAM ]
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="w-4 h-4 border border-accent-cyan rounded-full" />
                    <div className="w-12 h-px bg-border" />
                    <div className="w-6 h-6 border border-white rotate-45" />
                    <div className="w-12 h-px bg-border" />
                    <div className="w-4 h-4 border border-accent-red rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
