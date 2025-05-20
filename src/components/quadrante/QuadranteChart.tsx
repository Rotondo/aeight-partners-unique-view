
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { QuadrantPoint } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface QuadranteChartProps {
  data: QuadrantPoint[];
  isLoading: boolean;
  onPointClick?: (pointId: string) => void;
}

const QuadranteChart: React.FC<QuadranteChartProps> = ({ 
  data, 
  isLoading,
  onPointClick 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  useEffect(() => {
    if (isLoading || !data.length || !svgRef.current) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, 5])
      .range([0, width]);
      
    const yScale = d3.scaleLinear()
      .domain([0, 5])
      .range([height, 0]);
      
    const sizeScale = d3.scaleLinear()
      .domain([1, 5])
      .range([5, 20]);
      
    // Add X and Y axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
      
    svg.append('g')
      .call(d3.axisLeft(yScale));
      
    // Add axis labels
    svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .style('font-size', '12px')
      .text('Potencial de Geração de Leads (0-5)');
      
    svg.append('text')
      .attr('class', 'y-axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${-margin.left + 15},${height/2}) rotate(-90)`)
      .style('font-size', '12px')
      .text('Potencial de Investimento (0-5)');
    
    // Add quadrant lines
    const quadrantX = 2.5;
    const quadrantY = 2.5;
    
    svg.append('line')
      .attr('x1', xScale(quadrantX))
      .attr('y1', 0)
      .attr('x2', xScale(quadrantX))
      .attr('y2', height)
      .attr('stroke', '#94a3b8')
      .attr('stroke-dasharray', '4');
      
    svg.append('line')
      .attr('x1', 0)
      .attr('y1', yScale(quadrantY))
      .attr('x2', width)
      .attr('y2', yScale(quadrantY))
      .attr('stroke', '#94a3b8')
      .attr('stroke-dasharray', '4');
    
    // Add quadrant labels
    svg.append('text')
      .attr('x', xScale(1.25))
      .attr('y', yScale(4))
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .text('Alto investimento');
      
    svg.append('text')
      .attr('x', xScale(1.25))
      .attr('y', yScale(3.75))
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .text('Baixo leads');
      
    svg.append('text')
      .attr('x', xScale(3.75))
      .attr('y', yScale(4))
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .text('Alto investimento');
      
    svg.append('text')
      .attr('x', xScale(3.75))
      .attr('y', yScale(3.75))
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .text('Alto leads');
      
    svg.append('text')
      .attr('x', xScale(1.25))
      .attr('y', yScale(1.25))
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .text('Baixo investimento');
      
    svg.append('text')
      .attr('x', xScale(1.25))
      .attr('y', yScale(1))
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .text('Baixo leads');
      
    svg.append('text')
      .attr('x', xScale(3.75))
      .attr('y', yScale(1.25))
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .text('Baixo investimento');
      
    svg.append('text')
      .attr('x', xScale(3.75))
      .attr('y', yScale(1))
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .text('Alto leads');
    
    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('padding', '8px')
      .style('background', 'white')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);
    
    // Add data points
    svg.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => sizeScale(d.engajamento))
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        tooltip
          .style('opacity', 0.9)
          .html(`
            <div style="font-weight: bold">${d.nome}</div>
            <div>Potencial de leads: ${d.x}</div>
            <div>Potencial de investimento: ${d.y}</div>
            <div>Engajamento: ${d.engajamento}</div>
            <div>Tamanho: ${d.tamanho}</div>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      })
      .on('click', (event, d) => {
        if (onPointClick) {
          onPointClick(d.id);
        }
      });

    // Add labels for points
    svg.selectAll('.data-point-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'data-point-label')
      .attr('x', d => xScale(d.x))
      .attr('y', d => yScale(d.y) - sizeScale(d.engajamento) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#64748b')
      .text(d => d.nome.length > 15 ? d.nome.substring(0, 15) + '...' : d.nome);

    // Cleanup on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, isLoading, onPointClick]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!data.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
        <p>Nenhum dado disponível para exibição</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default QuadranteChart;
