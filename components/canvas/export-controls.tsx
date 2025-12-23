'use client';

import { useRef } from 'react';
import { useCanvasStore } from '@/lib/store/canvas-store';
import { exportAsPNG, exportAsSVG, exportAsJSON, importFromJSON } from '@/lib/canvas-export';
import { Download, FileJson, Upload } from 'lucide-react';
import Konva from 'konva';

interface ExportControlsProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export function ExportControls({ stageRef }: ExportControlsProps) {
  const shapes = useCanvasStore((state) => state.shapes);
  const dimensions = useCanvasStore((state) => state.dimensions);
  const backgroundImage = useCanvasStore((state) => state.backgroundImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExportPNG = () => {
    if (stageRef.current) {
      exportAsPNG(stageRef.current, `canvas-${Date.now()}.png`);
    }
  };
  
  const handleExportSVG = () => {
    exportAsSVG(shapes, dimensions, `canvas-${Date.now()}.svg`);
  };
  
  const handleExportJSON = () => {
    exportAsJSON(shapes, dimensions, backgroundImage, `canvas-${Date.now()}.json`);
  };
  
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const data = await importFromJSON(file);
      
      // Restore canvas state
      if (data.dimensions) {
        useCanvasStore.getState().setDimensions(data.dimensions);
      }
      
      if (data.shapes) {
        // Clear existing shapes and add imported ones
        useCanvasStore.getState().clearShapes();
        data.shapes.forEach((shape: any) => {
          useCanvasStore.getState().addShape(shape);
        });
      }
      
      if (data.backgroundImage) {
        useCanvasStore.getState().setBackgroundImage(data.backgroundImage);
      }
      
      alert('Canvas imported successfully!');
    } catch (error) {
      alert('Failed to import canvas: ' + (error as Error).message);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium mr-2 text-foreground">Export:</label>
      
      <button
        onClick={handleExportPNG}
        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium flex items-center gap-1"
        title="Export as PNG image"
      >
        <Download size={16} />
        PNG
      </button>
      
      <button
        onClick={handleExportSVG}
        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium flex items-center gap-1"
        title="Export as SVG vector"
      >
        <Download size={16} />
        SVG
      </button>
      
      <button
        onClick={handleExportJSON}
        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium flex items-center gap-1"
        title="Export as JSON (editable)"
      >
        <FileJson size={16} />
        JSON
      </button>
      
      <div className="h-6 w-px bg-border mx-1" />
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJSON}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded text-sm font-medium flex items-center gap-1"
        title="Import from JSON"
      >
        <Upload size={16} />
        Import JSON
      </button>
    </div>
  );
}

