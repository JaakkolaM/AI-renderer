'use client';

import { useState, useCallback } from 'react';
import { Wand2, Loader2, Download, Image as ImageIcon, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useCanvasStore } from '@/lib/store/canvas-store';
import { lightingPresets } from '@/lib/presets';

export function AIGeneration() {
  const [prompt, setPrompt] = useState('');
  const [useCanvas, setUseCanvas] = useState(false);
  const [quality, setQuality] = useState<'preview' | 'final'>('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // New state for product rendering features
  const [selectedPreset, setSelectedPreset] = useState<string>('none');
  const [materialReference, setMaterialReference] = useState<string | null>(null);
  const [materialWeight, setMaterialWeight] = useState<number>(0.7);

  const canvasRef = useCanvasStore((state) => state.canvasRef);
  const addShape = useCanvasStore((state) => state.addShape);

  // Material reference upload handler
  const onMaterialDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setMaterialReference(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps: getMaterialRootProps, getInputProps: getMaterialInputProps, isDragActive: isMaterialDragActive } = useDropzone({
    onDrop: onMaterialDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  });

  const exportCanvasAsBase64 = (): string | null => {
    const canvas = canvasRef?.current;
    if (!canvas) {
      console.error('Canvas ref not available');
      return null;
    }

    try {
      // Export Fabric.js canvas as PNG data URL
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      });
      
      if (!dataURL) {
        console.error('Canvas export returned empty data URL');
        return null;
      }
      
      return dataURL;
    } catch (error) {
      console.error('Failed to export canvas:', error);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      let canvasImage = null;
      if (useCanvas) {
        canvasImage = exportCanvasAsBase64();
        if (!canvasImage) {
          throw new Error('Failed to export canvas');
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          canvasImage,
          useCanvas,
          quality,
          preset: selectedPreset,
          materialReference,
          materialWeight,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error('No image URL received');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCanvas = () => {
    if (!generatedImage) return;

    const id = `shape-${Date.now()}-${Math.random()}`;
    addShape({
      id,
      type: 'image',
      src: generatedImage,
      x: 100,
      y: 100,
      width: 512,
      height: 512,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      strokeColor: '',
      fillColor: '',
      strokeWidth: 0,
      opacity: 1,
    });

    setGeneratedImage(null);
  };

  return (
    <div className="w-80 border-l bg-sidebar text-sidebar-foreground p-4 flex flex-col overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Wand2 size={20} />
        AI Generation
      </h2>

      {/* Prompt Input */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm resize-none"
          rows={4}
        />
      </div>

      {/* Lighting Preset Dropdown */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">
          Lighting Preset
        </label>
        <select
          value={selectedPreset}
          onChange={(e) => setSelectedPreset(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded bg-background text-foreground text-sm cursor-pointer"
        >
          {Object.entries(lightingPresets).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.name}
            </option>
          ))}
        </select>
        {selectedPreset !== 'none' && (
          <p className="text-xs text-muted-foreground mt-1">
            {lightingPresets[selectedPreset].description}
          </p>
        )}
      </div>

      {/* Use Canvas Checkbox */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={useCanvas}
            onChange={(e) => setUseCanvas(e.target.checked)}
            className="cursor-pointer"
          />
          <span className="text-foreground">Use canvas as reference</span>
        </label>
        {useCanvas && (
          <p className="text-xs text-muted-foreground mt-1">
            The AI will use your canvas sketch as a reference
          </p>
        )}
      </div>

      {/* Material Reference Upload */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">
          Material Reference (Optional)
        </label>
        
        {!materialReference ? (
          <div {...getMaterialRootProps()} className="cursor-pointer">
            <input {...getMaterialInputProps()} />
            <div
              className={`
                w-full px-4 py-3 rounded border-2 border-dashed flex items-center justify-center gap-2 text-sm
                ${isMaterialDragActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <ImageIcon size={16} />
              <span>Upload Material Texture</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative border border-border rounded overflow-hidden">
              <img
                src={materialReference}
                alt="Material Reference"
                className="w-full h-32 object-cover"
              />
              <button
                onClick={() => setMaterialReference(null)}
                className="absolute top-2 right-2 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded"
                title="Remove material"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Material texture will be applied to the generated object
            </p>
          </div>
        )}
      </div>

      {/* Material Weight Slider */}
      {materialReference && (
        <div className="mb-4">
          <label className="text-xs font-medium block mb-2 text-foreground">
            Material Intensity: {Math.round(materialWeight * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={materialWeight}
            onChange={(e) => setMaterialWeight(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            How strongly to apply the material texture
          </p>
        </div>
      )}

      {/* Quality Selection */}
      <div className="mb-4">
        <label className="text-xs font-medium block mb-2 text-foreground">
          Quality
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setQuality('preview')}
            className={`flex-1 px-3 py-2 rounded text-xs font-medium ${
              quality === 'preview'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent text-card-foreground border border-border'
            }`}
          >
            Preview (Fast)
          </button>
          <button
            onClick={() => setQuality('final')}
            className={`flex-1 px-3 py-2 rounded text-xs font-medium ${
              quality === 'final'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-accent text-card-foreground border border-border'
            }`}
          >
            Final (HQ)
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {quality === 'preview' 
            ? 'Nano Banana: Fast generation with low latency' 
            : 'Nano Banana Pro: 4K resolution, high fidelity'}
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {isGenerating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 size={18} />
            Generate Image
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Generated Image Preview */}
      {generatedImage && (
        <div className="space-y-3">
          <div className="border border-border rounded overflow-hidden">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToCanvas}
              className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Add to Canvas
            </button>
            <a
              href={generatedImage}
              download="ai-generated-image.png"
              className="flex-1 px-3 py-2 bg-card hover:bg-accent border border-border text-card-foreground rounded text-sm font-medium flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

