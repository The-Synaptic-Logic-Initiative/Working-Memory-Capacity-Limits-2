import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function SpikeRaster({ spikes, params, currentTime }) {
  const svgRef = useRef(null);
  const { n_groups, n_exc_per_group, n_inh_per_group } = params;
  const n_per_group = n_exc_per_group + n_inh_per_group;
  const total_neurons = n_groups * n_per_group;

  const width = 800;
  const height = 500;
  const margin = { top: 40, right: 20, bottom: 40, left: 60 };
  const window_size = 500; // ms to show

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3.scaleLinear()
      .domain([currentTime - window_size, currentTime])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, total_neurons])
      .range([height - margin.bottom, margin.top]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${Math.round(d)}ms`))
      .attr("color", "#475569");

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(n_groups).tickFormat(d => {
        if (d % n_per_group === 0) return `SLOT ${d / n_per_group + 1}`;
        return "";
      }))
      .attr("color", "#475569");

    // Grid lines for groups
    for (let g = 1; g < n_groups; g++) {
      svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScale(g * n_per_group))
        .attr("y2", yScale(g * n_per_group))
        .attr("stroke", "#1C2333")
        .attr("stroke-width", 1);
    }

    // Filter spikes in window
    const visibleSpikes = spikes.filter(s => s.t > currentTime - window_size);

    // Draw spikes
    svg.append("g")
      .selectAll("line")
      .data(visibleSpikes)
      .enter()
      .append("line")
      .attr("x1", d => xScale(d.t))
      .attr("x2", d => xScale(d.t))
      .attr("y1", d => yScale(d.g * n_per_group + d.n))
      .attr("y2", d => yScale(d.g * n_per_group + d.n + 0.8))
      .attr("stroke", d => d.is_inh ? "#C026D3" : "#FFFFFF")
      .attr("stroke-width", 1.5)
      .attr("opacity", d => Math.max(0.2, (d.t - (currentTime - window_size)) / window_size));

  }, [spikes, currentTime, n_groups, n_per_group, total_neurons]);

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold text-accent-cyan mono tracking-tight">SPIKE RASTER PLOT</h3>
          <p className="text-[10px] text-text-tertiary mono">SCROLLING WINDOW: LAST {window_size}MS</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] mono">
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3 bg-white" />
            <span className="text-text-secondary">EXC SPIKE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3 bg-purple-500" />
            <span className="text-text-secondary">INH SPIKE</span>
          </div>
        </div>
      </div>
      <div className="flex-1 relative">
        <svg 
          ref={svgRef} 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
