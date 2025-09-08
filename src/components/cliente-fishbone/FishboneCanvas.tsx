import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ClienteFishboneView, FishboneZoomLevel } from '@/types/cliente-fishbone';

interface FishboneCanvasProps {
  fishboneData: ClienteFishboneView[];
  zoomLevel: FishboneZoomLevel;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
  children: React.ReactNode;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

const FishboneCanvas: React.FC<FishboneCanvasProps> = ({
  fishboneData,
  zoomLevel,
  onNodeClick,
  children
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.max(width, 800), height: Math.max(height, 600) });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Auto-fit to content
  const fitToContent = useCallback(() => {
    if (!fishboneData || fishboneData.length === 0) return;
    
    const etapasCount = fishboneData[0]?.etapas?.length || 0;
    const contentWidth = etapasCount * 120 + 300; // Estimate content width
    const contentHeight = 400; // Estimate content height
    
    const scaleX = (dimensions.width * 0.9) / contentWidth;
    const scaleY = (dimensions.height * 0.9) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1.5); // Max zoom 1.5x
    
    const newX = (dimensions.width - contentWidth * newScale) / 2;
    const newY = (dimensions.height - contentHeight * newScale) / 2;
    
    setTransform({ x: newX, y: newY, scale: newScale });
  }, [fishboneData, dimensions]);

  // Auto-fit when data changes
  useEffect(() => {
    if (fishboneData && fishboneData.length > 0) {
      setTimeout(fitToContent, 100); // Small delay to ensure DOM is ready
    }
  }, [fishboneData, fitToContent]);

  // Mouse/Touch handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPoint({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - startPoint.x,
      y: e.clientY - startPoint.y
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.3, transform.scale + delta), 3);
    
    // Zoom toward mouse position
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      setTransform(prev => ({
        x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
        y: mouseY - (mouseY - prev.y) * (newScale / prev.scale),
        scale: newScale
      }));
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setStartPoint({ 
        x: e.touches[0].clientX - transform.x, 
        y: e.touches[0].clientY - transform.y 
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    e.preventDefault();
    setTransform(prev => ({
      ...prev,
      x: e.touches[0].clientX - startPoint.x,
      y: e.touches[0].clientY - startPoint.y
    }));
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Zoom controls
  const zoomIn = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.3, 3)
    }));
  };

  const zoomOut = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.3, 0.3)
    }));
  };

  const resetView = () => {
    fitToContent();
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-background border rounded-lg"
      style={{ minHeight: '600px' }}
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-background border rounded-lg shadow-md hover:bg-accent flex items-center justify-center text-sm font-semibold"
          aria-label="Zoom In"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-background border rounded-lg shadow-md hover:bg-accent flex items-center justify-center text-sm font-semibold"
          aria-label="Zoom Out"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-background border rounded-lg shadow-md hover:bg-accent flex items-center justify-center text-xs"
          aria-label="Fit to Screen"
        >
          ⌂
        </button>
      </div>

      {/* Scale Indicator */}
      <div className="absolute bottom-4 right-4 z-10 bg-background/90 border rounded px-2 py-1 text-xs text-muted-foreground">
        {Math.round(transform.scale * 100)}%
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className={`absolute inset-0 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {children}
        </g>
      </svg>

      {/* Loading overlay when no data */}
      {(!fishboneData || fishboneData.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-center text-muted-foreground">
            <p>Selecione um cliente para visualizar a espinha de peixe</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishboneCanvas;