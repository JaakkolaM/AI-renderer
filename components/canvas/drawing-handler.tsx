'use client';

import { useRef, useState } from 'react';
import { Layer } from 'react-konva';
import { useCanvasStore } from '@/lib/store/canvas-store';
import { Shape } from '@/lib/types';
import Konva from 'konva';

interface Point {
  x: number;
  y: number;
}

export function useDrawingHandler(stageRef: React.RefObject<Konva.Stage>) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  
  const currentTool = useCanvasStore((state) => state.currentTool);
  const drawingSettings = useCanvasStore((state) => state.drawingSettings);
  const addShape = useCanvasStore((state) => state.addShape);
  
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only handle drawing tools
    if (!['rectangle', 'circle', 'ellipse', 'line', 'bezier'].includes(currentTool)) {
      return;
    }
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;
    
    setIsDrawing(true);
    setStartPoint(pos);
    
    // For bezier curves, add points on each click
    if (currentTool === 'bezier') {
      setCurrentPoints([...currentPoints, pos.x, pos.y]);
    } else {
      setCurrentPoints([pos.x, pos.y]);
    }
  };
  
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !startPoint) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;
    
    // Update current points for preview
    if (currentTool === 'line') {
      setCurrentPoints([startPoint.x, startPoint.y, pos.x, pos.y]);
    }
  };
  
  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !startPoint) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;
    
    // Don't create tiny shapes
    const minSize = 5;
    const dx = Math.abs(pos.x - startPoint.x);
    const dy = Math.abs(pos.y - startPoint.y);
    
    if (currentTool !== 'bezier' && (dx < minSize || dy < minSize)) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoints([]);
      return;
    }
    
    // Create the shape
    createShape(startPoint, pos);
    
    // Reset drawing state (except for bezier which needs multiple clicks)
    if (currentTool !== 'bezier') {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoints([]);
    }
  };
  
  const createShape = (start: Point, end: Point) => {
    const id = `shape-${Date.now()}-${Math.random()}`;
    const baseShape = {
      id,
      strokeColor: drawingSettings.strokeColor,
      fillColor: drawingSettings.fillEnabled ? drawingSettings.fillColor : 'transparent',
      strokeWidth: drawingSettings.strokeWidth,
      opacity: 1,
      rotation: 0,
    };
    
    let shape: Shape | null = null;
    
    switch (currentTool) {
      case 'rectangle': {
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        
        shape = {
          ...baseShape,
          type: 'rectangle',
          x,
          y,
          width,
          height,
          cornerRadius: drawingSettings.cornerRadius,
        };
        break;
      }
      
      case 'circle': {
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        
        shape = {
          ...baseShape,
          type: 'circle',
          x: start.x,
          y: start.y,
          radius,
        };
        break;
      }
      
      case 'ellipse': {
        const radiusX = Math.abs(end.x - start.x) / 2;
        const radiusY = Math.abs(end.y - start.y) / 2;
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;
        
        shape = {
          ...baseShape,
          type: 'ellipse',
          x: centerX,
          y: centerY,
          radiusX,
          radiusY,
        };
        break;
      }
      
      case 'line': {
        shape = {
          ...baseShape,
          type: 'line',
          x: 0,
          y: 0,
          points: [start.x, start.y, end.x, end.y],
        };
        break;
      }
    }
    
    if (shape) {
      addShape(shape);
    }
  };
  
  const finishBezier = () => {
    if (currentPoints.length >= 4) { // At least 2 points
      const id = `shape-${Date.now()}-${Math.random()}`;
      const shape: Shape = {
        id,
        type: 'bezier',
        x: 0,
        y: 0,
        points: currentPoints,
        strokeColor: drawingSettings.strokeColor,
        fillColor: 'transparent',
        strokeWidth: drawingSettings.strokeWidth,
        opacity: 1,
        rotation: 0,
      };
      
      addShape(shape);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoints([]);
  };
  
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    finishBezier,
    isDrawing,
    currentPoints,
  };
}

