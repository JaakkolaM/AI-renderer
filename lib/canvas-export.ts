import Konva from 'konva';
import { Shape } from './types';

/**
 * Export canvas as PNG image
 */
export function exportAsPNG(stage: Konva.Stage, filename: string = 'canvas.png') {
  const dataURL = stage.toDataURL({ pixelRatio: 2 });
  downloadURI(dataURL, filename);
}

/**
 * Export canvas as SVG
 * Note: This creates a simple SVG representation of the shapes
 */
export function exportAsSVG(shapes: Shape[], dimensions: { width: number; height: number }, filename: string = 'canvas.svg') {
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
`;

  shapes.forEach((shape) => {
    const opacity = shape.opacity || 1;
    const stroke = shape.strokeColor;
    const strokeWidth = shape.strokeWidth;
    const fill = shape.fillColor === 'transparent' ? 'none' : shape.fillColor;
    
    switch (shape.type) {
      case 'rectangle': {
        const transform = shape.rotation ? ` transform="rotate(${shape.rotation} ${shape.x + shape.width/2} ${shape.y + shape.height/2})"` : '';
        svgContent += `  <rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${shape.cornerRadius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"${transform}/>\n`;
        break;
      }
      
      case 'circle': {
        const transform = shape.rotation ? ` transform="rotate(${shape.rotation} ${shape.x} ${shape.y})"` : '';
        svgContent += `  <circle cx="${shape.x}" cy="${shape.y}" r="${shape.radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"${transform}/>\n`;
        break;
      }
      
      case 'ellipse': {
        const transform = shape.rotation ? ` transform="rotate(${shape.rotation} ${shape.x} ${shape.y})"` : '';
        svgContent += `  <ellipse cx="${shape.x}" cy="${shape.y}" rx="${shape.radiusX}" ry="${shape.radiusY}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"${transform}/>\n`;
        break;
      }
      
      case 'line': {
        const points = shape.points.join(' ');
        svgContent += `  <polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>\n`;
        break;
      }
      
      case 'bezier': {
        if (shape.points.length >= 4) {
          let pathData = `M ${shape.points[0]} ${shape.points[1]}`;
          for (let i = 2; i < shape.points.length; i += 2) {
            pathData += ` L ${shape.points[i]} ${shape.points[i + 1]}`;
          }
          svgContent += `  <path d="${pathData}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>\n`;
        }
        break;
      }
    }
  });

  svgContent += '</svg>';
  
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  downloadURI(url, filename);
  URL.revokeObjectURL(url);
}

/**
 * Export canvas data as JSON
 */
export function exportAsJSON(
  shapes: Shape[], 
  dimensions: { width: number; height: number },
  backgroundImage: any,
  filename: string = 'canvas.json'
) {
  const data = {
    version: '1.0',
    dimensions,
    shapes,
    backgroundImage,
    exportedAt: new Date().toISOString(),
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadURI(url, filename);
  URL.revokeObjectURL(url);
}

/**
 * Import canvas data from JSON
 */
export function importFromJSON(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Helper function to trigger download
 */
function downloadURI(uri: string, name: string) {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert stage to blob for API transmission
 */
export async function stageToBlob(stage: Konva.Stage): Promise<Blob> {
  return new Promise((resolve, reject) => {
    stage.toBlob({
      callback: (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      pixelRatio: 2,
    });
  });
}

/**
 * Convert stage to base64 string
 */
export function stageToBase64(stage: Konva.Stage): string {
  return stage.toDataURL({ pixelRatio: 2 });
}

