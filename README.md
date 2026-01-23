# AI Renderer

A Next.js application for creating AI visualizations with vector drawing tools and AI image generation powered by **Google Gemini and OpenRouter**.

## Features

### ✅ Vector Canvas Editor
- **Shape Tools**: Rectangle (with corner radius), Circle, Ellipse, Line, Bezier curves, Polyline
- **Image Upload**: Add and manipulate images on canvas
- **Advanced Controls**: Shadow effects with opacity, layer ordering (bring to front/send to back)
- **Transformations**: Move, resize, rotate, scale all shapes
- **Styling**: Custom colors, stroke width, fill, opacity
- **Canvas Management**: Adjustable canvas size, background images
- **History**: Full undo/redo support
- **Export**: PNG, SVG, or JSON formats
- **Theme**: Dark/light mode with OKLCH color system

### ✅ AI Image Generation (Powered by Google Gemini & OpenRouter)
- **Text-to-Image**: Generate images from text prompts using Gemini and OpenRouter models
- **Sketch-to-Image**: Use canvas drawings as reference for AI generation
- **Smart Canvas Analysis**: Gemini vision analyzes your sketches to enhance generation
- **Model Selection**:
  - **Nano Banana** (Gemini 2.5 Flash Image) - Fast, low latency
  - **Nano Banana Pro** (Gemini 3 Pro Image) - 4K resolution, high fidelity
  - **Flux2 Pro** (OpenRouter) - High quality via OpenRouter
- **Flexible Integration**: Add generated images directly to canvas
- **Multi-Provider Support**: Seamlessly switch between Gemini and OpenRouter APIs
- **Comprehensive Debug Logging**: Full trace of generation flow for troubleshooting

### ✅ Lighting Presets
Choose from 8 lighting presets to control style and atmosphere:
- **None**: No lighting modifications
- **Studio (Gradient)**: Professional studio with seamless gradient background (white to light gray fade)
- **Studio (Cyclorama)**: Professional studio with cyclorama (curved) background
- **Outdoor/Natural**: Natural golden hour sunlight and outdoor settings
- **E-commerce**: Pure white background, shadow-free for product shots
- **Moody/Dramatic**: High contrast, deep shadows, cinematic mood
- **CAD Line Drawing**: Technical black lines on white, vector-style, precise geometry
- **Concept Sketch**: Hand-drawn, loose pencil strokes, grayscale, creative freedom

**Powered by:**
- 🎨 **Nano Banana** (Gemini 2.5 Flash Image) - Fast, low latency
- 🎨 **Nano Banana Pro** (Gemini 3 Pro Image) - 4K resolution, high fidelity
- 🎨 **Flux2 Pro** (OpenRouter) - High quality via OpenRouter

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up API Keys

Create a `.env.local` file in the root directory:

```env
# Google Gemini API Key (REQUIRED)
# Get it from: https://aistudio.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# OpenRouter API Key (REQUIRED)
# Get it from: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Get your API keys:**

#### Google Gemini API Key (FREE):
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "**Get API Key**" or "**Create API Key**"
3. Copy your API key (starts with `AIza...`)
4. Paste it as `GOOGLE_GEMINI_API_KEY` in `.env.local`

#### OpenRouter API Key:
1. Go to [OpenRouter Dashboard](https://openrouter.ai/keys)
2. Sign up or log in to your account
3. Click "**Create Key**" or use an existing key
4. Copy your API key
5. Paste it as `OPENROUTER_API_KEY` in `.env.local`

Both keys required for full functionality. 🎉

### 3. Run the development server
```bash
npm run dev
```

### 4. Open the app
Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Drawing Tools
1. Select a tool from the left sidebar
2. Draw shapes on the canvas
3. Select shapes to edit properties in the right panel
4. Use keyboard shortcuts: `Ctrl+Z` (undo), `Ctrl+Y` (redo), `Del` (delete), `Esc` (deselect)

### AI Generation
1. Click **"AI Generate"** button in the header
2. Enter a text prompt describing your desired image
3. Optionally check **"Use canvas as reference"** to incorporate your drawing
4. Select a model:
   - **Nano Banana**: Fast generation with low latency
   - **Nano Banana Pro**: 4K resolution, high fidelity
   - **Flux2 Pro**: High quality via OpenRouter
5. Choose a lighting preset from dropdown (None, Studio Gradient/Cyclorama, Outdoor, E-commerce, Moody, CAD Line Drawing, Concept Sketch)
6. Optionally add material reference images with intensity control
7. Click **"Generate Image"**
8. Add result to your canvas or download it

## Tech Stack

- **Framework**: Next.js 15+ with App Router & TypeScript
- **Canvas**: Fabric.js for vector graphics
- **State Management**: Zustand
- **Styling**: Tailwind CSS with OKLCH colors
- **AI Image Generation**: Google Gemini API (Nano Banana) & OpenRouter API (Flux2 Pro)
- **Icons**: Lucide React
- **File Upload**: React Dropzone

## Project Structure

```
├── app/
│   ├── api/generate/     # AI generation API route
│   ├── globals.css       # Global styles & theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   └── canvas/
│       ├── ai-generation.tsx      # AI generation panel
│       ├── canvas-controls.tsx    # Canvas controls
│       ├── drawing-tools.tsx      # Drawing tools sidebar
│       ├── export-controls.tsx    # Export functionality
│       ├── fabric-canvas.tsx      # Main canvas component
│       ├── shape-properties.tsx   # Shape properties panel
│       └── canvas-app.tsx    # Main app component
├── lib/
│   ├── store/
│   │   └── canvas-store.ts    # Zustand store
│   ├── models.ts               # AI model configurations
│   ├── presets.ts              # Lighting presets
│   ├── canvas-export.ts       # Export utilities
│   └── types.ts               # TypeScript types
└── .env.local            # Environment variables (create this)
```

## Debug Mode

The application includes comprehensive debug logging to help troubleshoot AI generation issues. When running in development mode, check the browser console for detailed logs prefixed with:
- `[DEBUG]` - Backend API logs showing model selection, request structure, response parsing
- `[FRONTEND DEBUG]` - Frontend logs showing generation completion

These logs help identify issues like:
- Which model is being used
- Provider routing (Gemini vs OpenRouter)
- Request/response structure validation
- Image extraction and parsing

Common issues revealed by debug logs:
- **Model fallback**: If wrong model selected, check model parameter from frontend
- **Provider errors**: API key missing or incorrect endpoint
- **Response parsing**: Invalid response format from API
- **No images**: Model returned empty image array

## License

This project is licensed under the MIT License.
