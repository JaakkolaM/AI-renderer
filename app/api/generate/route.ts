import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { lightingPresets } from '@/lib/presets';

export async function POST(request: NextRequest) {
  try {
    const { prompt, canvasImage, useCanvas, quality, preset, materialReference, materialWeight } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Google Gemini API key not configured. Please add GOOGLE_GEMINI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Select Gemini image generation model based on quality
    // Preview: gemini-2.5-flash-image (Nano Banana - fast)
    // Final: gemini-3-pro-image-preview (Nano Banana Pro - high quality, 4K)
    const modelName = quality === 'final' 
      ? 'gemini-3-pro-image-preview'
      : 'gemini-2.5-flash-image';
    
    let finalPrompt = prompt;
    
    // Add lighting preset to prompt if selected
    if (preset && preset !== 'none' && lightingPresets[preset]) {
      const presetPrompt = lightingPresets[preset].prompt;
      finalPrompt = `${prompt}. Environment: ${presetPrompt}.`;
    }
    
    // If canvas is provided, analyze it first to enhance the prompt
    if (useCanvas && canvasImage) {
      try {
        const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const base64Data = canvasImage.replace(/^data:image\/\w+;base64,/, '');
        
        const visionPrompt = `Analyze this sketch/image and enhance the following prompt for AI image generation: "${prompt}". 
Combine the visual elements from the sketch with the text description to create a detailed, comprehensive prompt.
Focus on: style, composition, colors, mood, and key elements.
Respond ONLY with the enhanced prompt, no other text.`;
        
        const visionResult = await visionModel.generateContent([
          { text: visionPrompt },
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          },
        ]);
        
        const visionResponse = await visionResult.response;
        finalPrompt = visionResponse.text().trim();
        console.log('Gemini enhanced prompt with canvas:', finalPrompt);
      } catch (visionError) {
        console.error('Vision analysis error:', visionError);
        // Continue with original prompt if vision fails
      }
    }
    
    // Generate image using Gemini image generation model
    const imageModel = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: "You are a specialized Product Visualization Engine. Your task is to interpret sketches or CAD drawings and render them as finished physical products. Always prioritize physical accuracy and realistic materials. When provided with a material reference image, carefully analyze its color, grain, texture, and reflectivity, and apply those exact properties to the primary object in the sketch. Maintain photorealistic quality and professional lighting."
    });
    
    const generationConfig: any = {
      temperature: 0.4,
      topP: 0.95,
      topK: 40,
    };
    
    // Build request parts - order matters for multi-image input
    const parts: any[] = [];
    
    // Add material reference instruction and image first (if provided)
    if (materialReference) {
      const materialIntensity = Math.round((materialWeight || 0.7) * 100);
      parts.push({ 
        text: `Apply the material texture from this reference image with ${materialIntensity}% intensity. Analyze the color, surface properties, reflectivity, and grain pattern:` 
      });
      
      const materialBase64 = materialReference.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: materialBase64,
        },
      });
    }
    
    // Add the main prompt
    parts.push({ text: finalPrompt });
    
    // Add canvas sketch reference if provided
    if (useCanvas && canvasImage) {
      const base64Data = canvasImage.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Data,
        },
      });
    }
    
    const result = await imageModel.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig,
    });
    
    const response = await result.response;
    
    // Extract generated image from response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No image generated');
    }
    
    const imagePart = candidates[0].content.parts.find((part: any) => part.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image data in response');
    }
    
    const imageBase64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const imageUrl = `data:${mimeType};base64,${imageBase64}`;
    
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      model: modelName,
      enhancedPrompt: finalPrompt !== prompt ? finalPrompt : undefined,
    });
    
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

