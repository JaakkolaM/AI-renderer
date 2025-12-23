'use client';

import { useCanvasStore } from '@/lib/store/canvas-store';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export function ShapeProperties() {
  const shapes = useCanvasStore((state) => state.shapes);
  const selectedShapeId = useCanvasStore((state) => state.selectedShapeId);
  const updateShape = useCanvasStore((state) => state.updateShape);
  const deleteShape = useCanvasStore((state) => state.deleteShape);
  const bringToFront = useCanvasStore((state) => state.bringToFront);
  const sendToBack = useCanvasStore((state) => state.sendToBack);
  
  const selectedShape = shapes.find((s) => s.id === selectedShapeId);
  
  if (!selectedShape) {
    return (
      <div className="w-64 bg-muted border-l-2 border-border p-4">
        <div className="text-center text-muted-foreground text-sm mt-8">
          <p>No shape selected</p>
          <p className="text-xs mt-2">Select a shape to edit its properties</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-64 bg-muted border-l-2 border-border p-4 overflow-y-auto">
      <h3 className="font-bold text-lg mb-4 text-foreground">Shape Properties</h3>
      
      {/* Shape Type */}
      <div className="mb-4 p-2 bg-accent rounded">
        <p className="text-xs font-medium text-accent-foreground uppercase">
          {selectedShape.type}
        </p>
      </div>
      
      {/* Position */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">X</label>
            <input
              type="number"
              value={Math.round(selectedShape.x)}
              onChange={(e) => updateShape(selectedShape.id, { x: Number(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Y</label>
            <input
              type="number"
              value={Math.round(selectedShape.y)}
              onChange={(e) => updateShape(selectedShape.id, { y: Number(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
            />
          </div>
        </div>
      </div>
      
      {/* Dimensions */}
      {selectedShape.type === 'rectangle' && (
        <div className="mb-4">
          <label className="text-xs font-medium block mb-2 text-foreground">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Width</label>
              <input
                type="number"
                value={Math.round(selectedShape.width)}
                onChange={(e) => updateShape(selectedShape.id, { width: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Height</label>
              <input
                type="number"
                value={Math.round(selectedShape.height)}
                onChange={(e) => updateShape(selectedShape.id, { height: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      )}
      
      {selectedShape.type === 'circle' && (
        <div className="mb-4">
          <label className="text-xs font-medium block mb-2 text-foreground">Radius</label>
          <input
            type="number"
            value={Math.round(selectedShape.radius)}
            onChange={(e) => updateShape(selectedShape.id, { radius: Number(e.target.value) })}
            className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
          />
        </div>
      )}
      
      {selectedShape.type === 'ellipse' && (
        <div className="mb-4">
          <label className="text-xs font-medium block mb-2 text-foreground">Radii</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Radius X</label>
              <input
                type="number"
                value={Math.round(selectedShape.radiusX)}
                onChange={(e) => updateShape(selectedShape.id, { radiusX: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Radius Y</label>
              <input
                type="number"
                value={Math.round(selectedShape.radiusY)}
                onChange={(e) => updateShape(selectedShape.id, { radiusY: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Rotation */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">
          Rotation: {Math.round(selectedShape.rotation)}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={selectedShape.rotation}
          onChange={(e) => updateShape(selectedShape.id, { rotation: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      
      {/* Colors */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">Stroke Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedShape.strokeColor}
            onChange={(e) => updateShape(selectedShape.id, { strokeColor: e.target.value })}
            className="w-12 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={selectedShape.strokeColor}
            onChange={(e) => updateShape(selectedShape.id, { strokeColor: e.target.value })}
            className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">Fill Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedShape.fillColor === 'transparent' ? '#ffffff' : selectedShape.fillColor}
            onChange={(e) => updateShape(selectedShape.id, { fillColor: e.target.value })}
            className="w-12 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={selectedShape.fillColor}
            onChange={(e) => updateShape(selectedShape.id, { fillColor: e.target.value })}
            className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
            placeholder="transparent"
          />
        </div>
      </div>
      
      {/* Stroke Width */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">
          Stroke Width: {selectedShape.strokeWidth}px {selectedShape.strokeWidth === 0 && '(No stroke)'}
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={selectedShape.strokeWidth}
          onChange={(e) => updateShape(selectedShape.id, { strokeWidth: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      
      {/* Corner Radius (for rectangles) */}
      {selectedShape.type === 'rectangle' && (
        <div className="mb-4">
          <label className="text-xs font-medium block mb-2 text-foreground">
            Corner Radius: {selectedShape.cornerRadius}px
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={selectedShape.cornerRadius}
            onChange={(e) => updateShape(selectedShape.id, { cornerRadius: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      )}
      
      {/* Opacity */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">
          Opacity: {Math.round(selectedShape.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={selectedShape.opacity}
          onChange={(e) => updateShape(selectedShape.id, { opacity: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      
      {/* Shadow */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 flex items-center justify-between text-foreground">
          <span>Shadow</span>
          <input
            type="checkbox"
            checked={selectedShape.shadow?.enabled || false}
            onChange={(e) => updateShape(selectedShape.id, { 
              shadow: { 
                color: selectedShape.shadow?.color || '#000000',
                blur: selectedShape.shadow?.blur || 10,
                offsetX: selectedShape.shadow?.offsetX || 5,
                offsetY: selectedShape.shadow?.offsetY || 5,
                opacity: selectedShape.shadow?.opacity || 0.5,
                enabled: e.target.checked 
              } 
            })}
            className="cursor-pointer"
          />
        </label>
        
        {selectedShape.shadow?.enabled && (
          <div className="space-y-2 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Shadow Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedShape.shadow.color}
                  onChange={(e) => updateShape(selectedShape.id, { 
                    shadow: { ...selectedShape.shadow!, color: e.target.value } 
                  })}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedShape.shadow.color}
                  onChange={(e) => updateShape(selectedShape.id, { 
                    shadow: { ...selectedShape.shadow!, color: e.target.value } 
                  })}
                  className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">
                Opacity: {Math.round((selectedShape.shadow.opacity || 1) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedShape.shadow.opacity || 1}
                onChange={(e) => updateShape(selectedShape.id, { 
                  shadow: { ...selectedShape.shadow!, opacity: Number(e.target.value) } 
                })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">
                Blur: {selectedShape.shadow.blur}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={selectedShape.shadow.blur}
                onChange={(e) => updateShape(selectedShape.id, { 
                  shadow: { ...selectedShape.shadow!, blur: Number(e.target.value) } 
                })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">
                Offset X: {selectedShape.shadow.offsetX}px
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={selectedShape.shadow.offsetX}
                onChange={(e) => updateShape(selectedShape.id, { 
                  shadow: { ...selectedShape.shadow!, offsetX: Number(e.target.value) } 
                })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">
                Offset Y: {selectedShape.shadow.offsetY}px
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={selectedShape.shadow.offsetY}
                onChange={(e) => updateShape(selectedShape.id, { 
                  shadow: { ...selectedShape.shadow!, offsetY: Number(e.target.value) } 
                })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Layer Actions */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">Layer Order</label>
        <div className="flex gap-2">
          <button
            onClick={() => bringToFront(selectedShape.id)}
            className="flex-1 px-3 py-2 bg-card hover:bg-accent border border-border rounded text-xs font-medium flex items-center justify-center gap-1 text-card-foreground"
          >
            <ArrowUp size={14} />
            Bring to Front
          </button>
          <button
            onClick={() => sendToBack(selectedShape.id)}
            className="flex-1 px-3 py-2 bg-card hover:bg-accent border border-border rounded text-xs font-medium flex items-center justify-center gap-1 text-card-foreground"
          >
            <ArrowDown size={14} />
            Send to Back
          </button>
        </div>
      </div>
      
      {/* Delete Button */}
      <button
        onClick={() => deleteShape(selectedShape.id)}
        className="w-full px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded font-medium flex items-center justify-center gap-2"
      >
        <Trash2 size={16} />
        Delete Shape
      </button>
    </div>
  );
}

