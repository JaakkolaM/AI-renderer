'use client';

import { Rect, Circle, Ellipse, Line, Transformer } from 'react-konva';
import { useRef, useEffect } from 'react';
import { useCanvasStore } from '@/lib/store/canvas-store';
import { Shape } from '@/lib/types';
import Konva from 'konva';

interface ShapeRendererProps {
  shape: Shape;
}

export function ShapeRenderer({ shape }: ShapeRendererProps) {
  const shapeRef = useRef<any>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  const selectedShapeId = useCanvasStore((state) => state.selectedShapeId);
  const selectShape = useCanvasStore((state) => state.selectShape);
  const updateShape = useCanvasStore((state) => state.updateShape);
  const currentTool = useCanvasStore((state) => state.currentTool);
  
  const isSelected = selectedShapeId === shape.id;
  
  // Attach transformer to selected shape
  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  
  const handleSelect = () => {
    if (currentTool === 'select') {
      selectShape(shape.id);
    } else if (currentTool === 'delete') {
      useCanvasStore.getState().deleteShape(shape.id);
    }
  };
  
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateShape(shape.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };
  
  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and update dimensions
    node.scaleX(1);
    node.scaleY(1);
    
    const updates: any = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };
    
    // Update dimensions based on shape type
    if (shape.type === 'rectangle') {
      updates.width = Math.max(5, node.width() * scaleX);
      updates.height = Math.max(5, node.height() * scaleY);
    } else if (shape.type === 'circle') {
      updates.radius = Math.max(5, node.radius() * Math.max(scaleX, scaleY));
    } else if (shape.type === 'ellipse') {
      updates.radiusX = Math.max(5, node.radiusX() * scaleX);
      updates.radiusY = Math.max(5, node.radiusY() * scaleY);
    }
    
    updateShape(shape.id, updates);
  };
  
  const commonProps = {
    ref: shapeRef,
    onClick: handleSelect,
    onTap: handleSelect,
    draggable: currentTool === 'select',
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    stroke: shape.strokeColor,
    strokeWidth: shape.strokeWidth,
    opacity: shape.opacity,
  };
  
  let shapeElement = null;
  
  switch (shape.type) {
    case 'rectangle':
      shapeElement = (
        <Rect
          {...commonProps}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={shape.fillColor}
          cornerRadius={shape.cornerRadius}
          rotation={shape.rotation}
        />
      );
      break;
      
    case 'circle':
      shapeElement = (
        <Circle
          {...commonProps}
          x={shape.x}
          y={shape.y}
          radius={shape.radius}
          fill={shape.fillColor}
          rotation={shape.rotation}
        />
      );
      break;
      
    case 'ellipse':
      shapeElement = (
        <Ellipse
          {...commonProps}
          x={shape.x}
          y={shape.y}
          radiusX={shape.radiusX}
          radiusY={shape.radiusY}
          fill={shape.fillColor}
          rotation={shape.rotation}
        />
      );
      break;
      
    case 'line':
    case 'bezier':
      shapeElement = (
        <Line
          {...commonProps}
          points={shape.points}
          fill={shape.fillColor}
          tension={shape.type === 'bezier' ? 0.5 : 0}
          closed={false}
        />
      );
      break;
  }
  
  return (
    <>
      {shapeElement}
      {isSelected && currentTool === 'select' && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

