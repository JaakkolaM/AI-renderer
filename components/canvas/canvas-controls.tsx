'use client';

import { useCanvasStore } from '@/lib/store/canvas-store';
import { 
  Undo2, 
  Redo2, 
  Trash2, 
  Download,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function CanvasControls() {
  const dimensions = useCanvasStore((state) => state.dimensions);
  const setDimensions = useCanvasStore((state) => state.setDimensions);
  const backgroundImage = useCanvasStore((state) => state.backgroundImage);
  const setBackgroundImage = useCanvasStore((state) => state.setBackgroundImage);
  const updateBackgroundOpacity = useCanvasStore((state) => state.updateBackgroundOpacity);
  const clearShapes = useCanvasStore((state) => state.clearShapes);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const canUndo = useCanvasStore((state) => state.canUndo());
  const canRedo = useCanvasStore((state) => state.canRedo());
  const shapes = useCanvasStore((state) => state.shapes);
  
  // Canvas size presets
  const sizePresets = [
    { label: '512×512', width: 512, height: 512 },
    { label: '768×768', width: 768, height: 768 },
    { label: '1024×768', width: 1024, height: 768 },
    { label: '768×1024', width: 768, height: 1024 },
    { label: '1024×1024', width: 1024, height: 1024 },
  ];
  
  // Handle background image upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setBackgroundImage({
            url,
            width: img.width,
            height: img.height,
            opacity: 0.5,
          });
        };
        img.src = url;
      };
      
      reader.readAsDataURL(file);
    }
  }, [setBackgroundImage]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false,
  });
  
  return (
    <div className="bg-card border-t-2 border-border p-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Canvas Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Canvas Size:</label>
          <select
            value={`${dimensions.width}x${dimensions.height}`}
            onChange={(e) => {
              const [width, height] = e.target.value.split('x').map(Number);
              setDimensions({ width, height });
            }}
            className="px-3 py-1.5 border border-border rounded text-sm bg-background text-foreground"
          >
            {sizePresets.map((preset) => (
              <option key={preset.label} value={`${preset.width}x${preset.height}`}>
                {preset.label}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
          
          {/* Custom Size Inputs */}
          <input
            type="number"
            value={dimensions.width}
            onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
            className="w-20 px-2 py-1.5 border border-border rounded text-sm bg-background text-foreground"
            placeholder="Width"
          />
          <span className="text-muted-foreground">×</span>
          <input
            type="number"
            value={dimensions.height}
            onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
            className="w-20 px-2 py-1.5 border border-border rounded text-sm bg-background text-foreground"
            placeholder="Height"
          />
        </div>
        
        {/* Divider */}
        <div className="h-8 w-px bg-border" />
        
        {/* Background Image Upload */}
        <div className="flex items-center gap-2">
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <button
              className={`
                px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2
                ${isDragActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                }
              `}
            >
              <Upload size={16} />
              Upload Background
            </button>
          </div>
          
          {backgroundImage && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-foreground">Opacity:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={backgroundImage.opacity}
                  onChange={(e) => updateBackgroundOpacity(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round(backgroundImage.opacity * 100)}%
                </span>
              </div>
              <button
                onClick={() => setBackgroundImage(null)}
                className="p-1.5 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded"
                title="Remove background"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
        
        {/* Divider */}
        <div className="h-8 w-px bg-border" />
        
        {/* History Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium flex items-center gap-1 text-secondary-foreground"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium flex items-center gap-1 text-secondary-foreground"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} />
            Redo
          </button>
        </div>
        
        {/* Divider */}
        <div className="h-8 w-px bg-border" />
        
        {/* Clear All */}
        <button
          onClick={() => {
            if (confirm('Clear all shapes? This cannot be undone.')) {
              clearShapes();
            }
          }}
          className="px-3 py-1.5 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded text-sm font-medium flex items-center gap-1"
        >
          <Trash2 size={16} />
          Clear All
        </button>
        
        {/* Shape Count */}
        <div className="ml-auto text-sm text-muted-foreground">
          {shapes.length} shape{shapes.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

