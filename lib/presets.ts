export interface LightingPreset {
  name: string;
  prompt: string;
  description: string;
}

export const lightingPresets: Record<string, LightingPreset> = {
  none: {
    name: "None",
    prompt: "",
    description: "No lighting preset applied"
  },
  studio_gradient: {
    name: "Studio (Gradient)",
    prompt: "studio photography quality lighting, soft even illumination with subtle shadows, clean gradient background (white to light gray fade), sharp focus, high contrast product photography, commercial aesthetic, 8K resolution",
    description: "Professional studio with gradient background"
  },
  studio_cyclorama: {
    name: "Studio (Cyclorama)",
    prompt: "studio photography quality lighting, soft even illumination with subtle shadows, clean cyclorama background, sharp focus, high contrast product photography, commercial aesthetic, 8K resolution",
    description: "Professional studio with cyclorama background"
  },
  outdoor: {
    name: "Outdoor/Natural",
    prompt: "natural golden hour sunlight, soft lens flare, outdoor lifestyle setting, realistic depth of field, 35mm lens style",
    description: "Natural outdoor lighting"
  },
  ecommerce: {
    name: "E-commerce",
    prompt: "pure white background, high-contrast rim lighting to define edges, product-focused, shadow-less background, sharp details",
    description: "Clean white background for product shots"
  },
  moody: {
    name: "Moody/Dramatic",
    prompt: "dramatic low-key lighting, deep shadows, high contrast, cinematic mood, selective focus, artistic lighting",
    description: "Dramatic mood lighting"
  },
  cad_line: {
    name: "CAD Line Drawing",
    prompt: "technical CAD line drawing, clean vector-style lines, black lines on white background, precise geometric shapes, architectural drafting style, no shading or color, high contrast, sharp edges",
    description: "Technical line drawing style"
  },
  concept_sketch: {
    name: "Concept Sketch",
    prompt: "hand-drawn concept sketch style, loose pencil strokes, creative and expressive, rough outlines, artistic interpretation, sketchbook aesthetic, grayscale, creative freedom",
    description: "Free-form concept sketch style"
  }
};




