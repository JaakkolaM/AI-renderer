import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { lightingPresets } from '@/lib/presets';
import sharp from 'sharp';
import { ASPECT_RATIOS, computeTargetFromLongEdge, makeEvenDimensions } from '@/lib/sizing';
import { getModel, type AIModel } from '@/lib/models';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      canvasImage,
      useCanvas,
      quality,
      preset,
      materialReference,
      materialWeight,
      materialReferences,
      outputMode = 'canvas',
      outputLongEdge = 2048,
      outputAspectRatio = '1:1',
      outputWidth,
      outputHeight,
      model,
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let modelId = model;
    if (!modelId) {
      modelId = quality === 'final' ? 'nano-banana-pro' : 'nano-banana';
    }
    const selectedModel = getModel(modelId);

    console.log('[DEBUG] Selected model:', {
      requestedModel: model,
      fallbackModel: quality === 'final' ? 'nano-banana-pro' : 'nano-banana',
      finalSelected: selectedModel.id,
      provider: selectedModel.provider,
      apiModelId: selectedModel.apiModelId
    });

    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    let genAI: GoogleGenerativeAI | null = null;
    if (selectedModel.provider === 'gemini') {
      if (!geminiApiKey) {
        return NextResponse.json(
          { error: 'Google Gemini API key not configured. Please add GOOGLE_GEMINI_API_KEY to your .env.local file.' },
          { status: 500 }
        );
      }
      genAI = new GoogleGenerativeAI(geminiApiKey);
    } else if (selectedModel.provider === 'openrouter') {
      if (!openRouterApiKey) {
        return NextResponse.json(
          { error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your .env.local file.' },
          { status: 500 }
        );
      }
    }
    
    let finalPrompt = prompt;
    
    // Add lighting preset to prompt if selected
    if (preset && preset !== 'none' && lightingPresets[preset]) {
      const presetPrompt = lightingPresets[preset].prompt;
      finalPrompt = `${prompt}. Environment: ${presetPrompt}.`;
    }
    
    // If canvas is provided and using Gemini, analyze it first to enhance the prompt
    if (useCanvas && canvasImage && genAI && selectedModel.provider === 'gemini') {
      try {
        console.log('[DEBUG] Gemini vision analysis running');
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
    } else {
      console.log('[DEBUG] Gemini vision skipped:', {
        useCanvas,
        hasCanvasImage: !!canvasImage,
        hasGenAI: !!genAI,
        provider: selectedModel.provider
      });
    }

    // Determine target output size
    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
    const maxLongEdge = 4096;
    const minEdge = 64;

    let targetWidth: number;
    let targetHeight: number;

    if (outputMode === 'canvas' && Number.isFinite(outputWidth) && Number.isFinite(outputHeight)) {
      targetWidth = Math.round(Number(outputWidth));
      targetHeight = Math.round(Number(outputHeight));
    } else {
      const longEdge = clamp(Math.round(Number(outputLongEdge) || 2048), minEdge, maxLongEdge);
      const aspect = (ASPECT_RATIOS as readonly string[]).includes(outputAspectRatio)
        ? (outputAspectRatio as any)
        : '1:1';
      const t = computeTargetFromLongEdge(longEdge, aspect);
      targetWidth = t.width;
      targetHeight = t.height;
    }

    // Cap "use canvas size" to maxLongEdge while preserving aspect
    const currentLongEdge = Math.max(targetWidth, targetHeight);
    if (currentLongEdge > maxLongEdge) {
      const scale = maxLongEdge / currentLongEdge;
      targetWidth = Math.max(minEdge, Math.round(targetWidth * scale));
      targetHeight = Math.max(minEdge, Math.round(targetHeight * scale));
    }

    // Make even for better compatibility in some pipelines
    ({ width: targetWidth, height: targetHeight } = makeEvenDimensions({ width: targetWidth, height: targetHeight }));

    const promptBeforeConstraints = finalPrompt;
    // Add output constraints to prompt as a hint (server still enforces exact size via resizing)
    finalPrompt = `${finalPrompt}\n\nOutput constraints: ${targetWidth}x${targetHeight}px. Fill the frame edge-to-edge. No borders.`;
    
    // Generate image based on the selected provider
    let imageBase64: string;
    let mimeType: string;

    if (selectedModel.provider === 'gemini' && genAI) {
      // Gemini API path
      const imageModel = genAI.getGenerativeModel({
        model: selectedModel.apiModelId,
        systemInstruction: "You are a specialized Product Visualization Engine. Your task is to interpret sketches or CAD drawings and render them as finished physical products. Always prioritize physical accuracy and realistic materials. When provided with a material reference image, carefully analyze its color, grain, texture, and reflectivity, and apply those exact properties to the primary object in the sketch. Maintain photorealistic quality and professional lighting."
      });

      const generationConfig: any = {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
      };

      const parts: any[] = [];

      const normalizedMaterialRefs: Array<{ dataUrl: string; weight?: number }> = Array.isArray(materialReferences)
        ? materialReferences
        : materialReference
          ? [{ dataUrl: materialReference, weight: materialWeight }]
          : [];

      for (const ref of normalizedMaterialRefs.slice(0, 8)) {
        if (!ref?.dataUrl) continue;
        const intensity = Math.round(((ref.weight ?? 0.7) as number) * 100);
        parts.push({
          text: `Material reference (${intensity}%): analyze color, surface properties, reflectivity, and grain pattern, then apply these properties to the product surface:`,
        });

        const mimeMatch = ref.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
        const mimeType = mimeMatch?.[1] || 'image/png';
        const materialBase64 = ref.dataUrl.replace(/^data:image\/\w+;base64,/, '').replace(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/, '');

        parts.push({
          inlineData: {
            mimeType,
            data: materialBase64,
          },
        });
      }

      parts.push({ text: finalPrompt });

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
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No image generated');
      }

      const imagePart = candidates[0].content.parts.find((part: any) => part.inlineData);
      if (!imagePart || !imagePart.inlineData) {
        throw new Error('No image data in response');
      }

      imageBase64 = imagePart.inlineData.data;
      mimeType = imagePart.inlineData.mimeType || 'image/png';
    } else if (selectedModel.provider === 'openrouter' && openRouterApiKey) {
      console.log('[DEBUG] OpenRouter path entered');
      const normalizedMaterialRefs: Array<{ dataUrl: string; weight?: number }> = Array.isArray(materialReferences)
        ? materialReferences
        : materialReference
          ? [{ dataUrl: materialReference, weight: materialWeight }]
          : [];

      console.log('[DEBUG] Material references count:', normalizedMaterialRefs.length);
      console.log('[DEBUG] Canvas provided:', useCanvas && canvasImage);

      const materialDescriptions: string[] = [];
      for (const ref of normalizedMaterialRefs.slice(0, 8)) {
        if (!ref?.dataUrl) continue;
        const intensity = Math.round(((ref.weight ?? 0.7) as number) * 100);
        materialDescriptions.push(`${intensity}%`);
      }

      let promptWithMaterials = finalPrompt;
      if (materialDescriptions.length > 0) {
        promptWithMaterials = `${finalPrompt}\n\nMaterial References: ${materialDescriptions.join(', ')} influence. Analyze colors, surfaces, reflectivity, and apply these properties to the product.`;
      }

      console.log('[DEBUG] Prompt with materials:', promptWithMaterials.substring(0, 200) + '...');

      const content: any[] = [
        {
          type: 'text',
          text: promptWithMaterials,
        }
      ];

      for (const ref of normalizedMaterialRefs.slice(0, 8)) {
        if (!ref?.dataUrl) continue;
        content.push({
          type: 'image_url',
          image_url: {
            url: ref.dataUrl,
          },
        });
      }

      if (useCanvas && canvasImage) {
        content.push({
          type: 'image_url',
          image_url: {
            url: canvasImage,
          },
        });
      }

      console.log('[DEBUG] OpenRouter content array structure:', {
        textFirst: content[0]?.type === 'text',
        materialImages: content.filter(c => c.type === 'image_url').slice(0, materialDescriptions.length).length,
        canvasImage: !!canvasImage,
        totalItems: content.length
      });

      const requestBody = {
        model: selectedModel.apiModelId,
        modalities: ['image'],
        messages: [
          {
            role: 'system',
            content: 'You are a specialized Product Visualization Engine. Your task is to interpret sketches or CAD drawings and render them as finished physical products. Always prioritize physical accuracy and realistic materials. When provided with material reference images, carefully analyze their color, grain, texture, and reflectivity, and apply those exact properties to the primary object in the sketch. Maintain photorealistic quality and professional lighting.',
          },
          {
            role: 'user',
            content,
          },
        ],
        max_tokens: 4096,
      };

      console.log('[DEBUG] OpenRouter request:', {
        model: requestBody.model,
        modalities: requestBody.modalities,
        messageCount: requestBody.messages.length,
        userContentItems: requestBody.messages[1].content.length
      });

      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`);
      }

      const openRouterData = await openRouterResponse.json();
      const choices = openRouterData.choices;
      console.log('[DEBUG] OpenRouter response structure:', {
        hasChoices: !!openRouterData.choices,
        choiceCount: openRouterData.choices?.length,
        firstChoiceKeys: openRouterData.choices?.[0] ? Object.keys(openRouterData.choices[0]) : null,
        messageKeys: openRouterData.choices?.[0]?.message ? Object.keys(openRouterData.choices[0].message) : null,
        hasImages: !!openRouterData.choices?.[0]?.message?.images,
        imageCount: openRouterData.choices?.[0]?.message?.images?.length,
        hasContent: !!openRouterData.choices?.[0]?.message?.content
      });
      if (!choices || choices.length === 0) {
        throw new Error('No response from OpenRouter');
      }

      const message = choices[0].message;
      if (!message.images || message.images.length === 0) {
        throw new Error('No images in OpenRouter response');
      }

      const imageUrl = message.images[0].image_url.url;
      console.log('[DEBUG] Extracted image URL:', {
        urlPreview: imageUrl.substring(0, 100) + '...',
        isDataUrl: imageUrl.startsWith('data:'),
        urlLength: imageUrl.length
      });

      const base64Match = imageUrl.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
      console.log('[DEBUG] Base64 match result:', {
        matched: !!base64Match,
        matchGroups: base64Match ? { mimeType: base64Match[1], dataLength: base64Match[2]?.length } : null
      });
      if (!base64Match) {
        throw new Error('Invalid image URL format from OpenRouter');
      }

      imageBase64 = base64Match[2];
      mimeType = `image/${base64Match[1]}`;
    } else {
      throw new Error(`Unsupported model provider: ${selectedModel.provider}`);
    }

    // Enforce exact output size (cover/crop)
    const inputBuffer = Buffer.from(imageBase64, 'base64');
    const resizedBuffer = await sharp(inputBuffer)
      .resize(targetWidth, targetHeight, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer();

    const resizedBase64 = resizedBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${resizedBase64}`;

    console.log('[DEBUG] Response returned:', {
      modelReturned: selectedModel.apiModelId,
      imageMimeType: mimeType,
      imageSize: { width: targetWidth, height: targetHeight }
    });

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      model: selectedModel.apiModelId,
      enhancedPrompt: promptBeforeConstraints !== prompt ? promptBeforeConstraints : undefined,
      outputWidth: targetWidth,
      outputHeight: targetHeight,
      sourceMimeType: mimeType,
    });

  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

