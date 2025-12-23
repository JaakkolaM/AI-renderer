# AI Renderer

A Next.js application for creating AI visualizations with vector drawing tools and Gemini AI integration.

## Features

### Phase 1: Vector Canvas Editor
- Rectangle with adjustable corner radius
- Circle and ellipse tools
- Straight lines and Bezier curves
- Canvas resizing with presets
- Background image upload
- Shape selection, move, resize, rotate
- Undo/redo functionality
- Export as PNG, SVG, or JSON

### Phase 2: AI Generation (Coming Soon)
- Preview mode with Gemini 2.5 Flash
- Final render with Gemini 3 Pro Image
- Text-to-image, image-to-image, sketch-to-image
- Inpainting capabilities
- Cost tracking

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (copy from `.env.local.example`) and add your API keys

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 15+ with App Router
- React Konva for vector canvas
- Zustand for state management
- Tailwind CSS for styling
- Google Gemini API for AI generation

