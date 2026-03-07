export type ModelProvider = 'gemini' | 'openrouter';

export interface AIModel {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  apiModelId: string;
}

export const MODELS: Record<string, AIModel> = {
  'nano-banana': {
    id: 'nano-banana',
    name: 'Nano Banana',
    provider: 'gemini',
    description: 'Fast generation with low latency',
    apiModelId: 'gemini-2.5-flash-image',
  },
  'nano-banana-pro': {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    provider: 'gemini',
    description: '4K resolution, high fidelity',
    apiModelId: 'gemini-3-pro-image-preview',
  },
  'flux2-pro': {
    id: 'flux2-pro',
    name: 'Flux2 Pro',
    provider: 'openrouter',
    description: 'High quality via OpenRouter',
    apiModelId: 'black-forest-labs/flux.2-pro',
  },
};

export const DEFAULT_MODEL = 'nano-banana';

export function getModel(modelId: string): AIModel {
  return MODELS[modelId] || MODELS[DEFAULT_MODEL];
}
