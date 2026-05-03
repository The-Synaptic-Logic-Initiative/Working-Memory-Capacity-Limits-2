import React, { useEffect, useRef } from 'react';

export default function NetworkVisualizer({ state, params }) {
  const canvasRef = useRef(null);
  const { V, stimuli } = state;
  const { n_groups, n_exc_per_group, n_inh_per_group, V_rest, V_threshold } = params;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const n_per_group = n_exc_per_group + n_inh_per_group;
    const cellWidth = (width - 40) / n_per_group;
    const cellHeight = (height - 60) / n_groups;
    const padding = 2;

    ctx.clearRect(0, 0, width, height);

    // Draw Labels
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.textAlign = 'right';
    for (let g = 0; g < n_groups; g++) {
      ctx.fillText(`SLOT ${g + 1}`, 35, 30 + g * cellHeight + cellHeight / 2);
    }

    // Draw Grid
    for (let g = 0; g < n_groups; g++) {
      const isStimulated = stimuli[g] > 0;
      const groupOffset = g * n_per_group;

      for (let n = 0; n < n_per_group; n++) {
        const idx = groupOffset + n;
        const isInh = n >= n_exc_per_group;
        const val = V[idx];

        // Color mapping: V_rest (-70) -> V_threshold (-55)
        // Normalize 0 to 1
        const normalized = Math.max(0, Math.min(1, (val - V_rest) / (V_threshold - V_rest)));
        
        let color;
        if (val >= V_threshold - 0.1) {
          color = '#FFFFFF'; // Spike flash
        } else if (isInh) {
          // Purple/Pink for inhibitory
          color = `rgba(192, 38, 211, ${0.2 + normalized * 0.8})`;
        } else {
          // Blue/Cyan for excitatory
          color = `rgba(6, 182, 212, ${0.1 + normalized * 0.9})`;
        }

        ctx.fillStyle = color;
        const x = 40 + n * cellWidth;
        const y = 20 + g * cellHeight;
        
        ctx.fillRect(x + padding, y + padding, cellWidth - padding * 2, cellHeight - padding * 2);

        // Highlight active group
        if (isStimulated) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(40, y, width - 60, cellHeight);
        }
      }
    }

    // Legend
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText('EXCITATORY NEURONS', 40, height - 10);
    ctx.fillText('INHIBITORY', 40 + n_exc_per_group * cellWidth, height - 10);

  }, [V, n_groups, n_exc_per_group, n_inh_per_group, V_rest, V_threshold, stimuli]);

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold text-accent-blue mono tracking-tight">REAL-TIME MEMBRANE POTENTIAL HEATMAP</h3>
          <p className="text-[10px] text-text-tertiary mono">MONITORING {n_groups * (n_exc_per_group + n_inh_per_group)} LIF NEURONS</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-accent-cyan rounded-sm" />
            <span className="text-text-secondary">EXC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-purple-500 rounded-sm" />
            <span className="text-text-secondary">INH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-white rounded-sm" />
            <span className="text-text-secondary">SPIKE</span>
          </div>
        </div>
      </div>
      <div className="flex-1 relative">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={500} 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
