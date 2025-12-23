'use client';

import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Line as KonvaLine } from 'react-konva';
import { useCanvasStore } from '@/lib/store/canvas-store';
import { ShapeRenderer } from './shape-renderer';
import { useDrawingHandler } from './drawing-handler';
import Konva from 'konva';

interface VectorCanvasProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export function VectorCanvas({ stageRef }: VectorCanvasProps) {
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(null);
  
  const dimensions = useCanvasStore((state) => state.dimensions);
  const shapes = useCanvasStore((state) => state.shapes);
  const backgroundImage = useCanvasStore((state) => state.backgroundImage);
  const currentTool = useCanvasStore((state) => state.currentTool);
  const selectShape = useCanvasStore((state) => state.selectShape);
  const drawingSettings = useCanvasStore((state) => state.drawingSettings);
  
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDrawing,
    currentPoints,
  } = useDrawingHandler(stageRef);
  
  // Load background image
  useEffect(() => {
    if (backgroundImage?.url) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = backgroundImage.url;
      img.onload = () => {
        setBackgroundImg(img);
      };
    } else {
      setBackgroundImg(null);
    }
  }, [backgroundImage?.url]);
  
  // Handle click on empty canvas
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicked on stage (not a shape), deselect
    if (e.target === e.target.getStage()) {
      selectShape(null);
    }
  };
  
  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="bg-gray-50"
      >
        {/* Background Layer */}
        <Layer>
          {backgroundImg && backgroundImage && (
            <KonvaImage
              image={backgroundImg}
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              opacity={backgroundImage.opacity}
              listening={false}
            />
          )}
        </Layer>
        
        {/* Drawing Layer */}
        <Layer>
          {shapes.map((shape) => (
            <ShapeRenderer key={shape.id} shape={shape} />
          ))}
          
          {/* Preview line while drawing */}
          {isDrawing && currentPoints.length >= 2 && currentTool === 'line' && (
            <KonvaLine
              points={currentPoints}
              stroke={drawingSettings.strokeColor}
              strokeWidth={drawingSettings.strokeWidth}
              opacity={0.5}
              dash={[5, 5]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

