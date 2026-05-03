import React from 'react';
import { TrendingDown, Users, Activity } from 'lucide-react';
import { clsx } from 'clsx';

export default function CapacityMeter({ state, params }) {
  const { firing_rates } = state;
  const { w_inh } = params;

  const activeCount = firing_rates.filter(r => r > 10).length;
  
  // Suppression floor: normalized from w_inh
  // 0.1 -> 0%, 1.2 -> 100%
  const suppressionPercent = Math.min(100, Math.max(0, ((w_inh - 0.1) / 1.1) * 100));

  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <h2 className="text-xl font-bold mb-2 mono text-accent-blue flex items-center gap-2">
          <Activity className="w-5 h-5" />
          WORKING MEMORY CAPACITY
        </h2>
        <p className="text-xs text-text-tertiary mono uppercase mb-12">
          Current Load vs. Suppression Floor
        </p>

        {/* Capacity Bar Visualization */}
        <div className="relative h-64 bg-bg-tertiary rounded-xl border border-border overflow-hidden flex items-end px-4 gap-2 pb-2">
          {/* Waterline (Inhibition) */}
          <div 
            className="absolute left-0 right-0 bg-accent-red/20 border-t border-accent-red/50 z-10 transition-all duration-500"
            style={{ height: `${suppressionPercent}%`, bottom: 0 }}
          >
            <div className="absolute top-2 left-4 text-[10px] font-bold text-accent-red mono flex items-center gap-2">
              <TrendingDown className="w-3 h-3" />
              SUPPRESSION FLOOR
            </div>
          </div>

          {/* Active Items */}
          {Array.from({ length: 10 }).map((_, i) => {
            const isActive = firing_rates[i] > 10;
            const rate = firing_rates[i];
            const height = Math.min(100, (rate / 60) * 100);

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 z-20">
                <div 
                  className={clsx(
                    "w-full rounded-t-sm transition-all duration-300 relative",
                    isActive ? "bg-accent-green" : "bg-text-tertiary/20"
                  )}
                  style={{ height: `${isActive ? height : 4}%` }}
                >
                  {isActive && (
                    <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-bold text-accent-green mono">
                      {Math.round(rate)}
                    </div>
                  )}
                </div>
                <span className="text-[9px] mono text-text-tertiary"># {i+1}</span>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="scientific-panel p-4 flex flex-col items-center">
            <span className="text-[10px] mono text-text-tertiary uppercase mb-1">Active Chunks</span>
            <div className="text-3xl font-bold text-accent-green">{activeCount}</div>
            <div className="text-[10px] mono text-text-tertiary mt-1">/ 10 SLOTS</div>
          </div>
          <div className="scientific-panel p-4 flex flex-col items-center">
            <span className="text-[10px] mono text-text-tertiary uppercase mb-1">System Capacity</span>
            <div className="text-3xl font-bold text-accent-blue">
              {activeCount >= 9 ? 'UNLIMITED' : activeCount > 7 ? 'HIGH' : activeCount > 4 ? 'OPTIMAL' : 'LOW'}
            </div>
            <div className="text-[10px] mono text-text-tertiary mt-1">EMERGENCE STABLE</div>
          </div>
        </div>

        {activeCount > 7 && (
          <div className="mt-6 p-3 bg-accent-amber/10 border border-accent-amber/30 rounded text-accent-amber text-[10px] mono text-center">
            ⚠️ APPROACHING BIOLOGICAL LIMIT (7±2)
          </div>
        )}
      </div>
    </div>
  );
}
