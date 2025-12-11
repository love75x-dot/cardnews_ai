import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

interface ImageGenerationRequest {
    prompt: string;
    aspectRatio?: string;
    apiKey: string;
    projectId: string;
    location?: string;
    resolution?: '2k' | '4k';
    referenceImages?: Array<{ base64: string; mode: string }>;
}

/**
 * Convert aspect ratio to Imagen format
 */
function convertAspectRatio(ratio: string): string {
    switch (ratio) {
        case '1:1':
            return '1:1';
        case '9:16':
            return '9:16';
        case '16:9':
            return '16:9';
        default:
            return '1:1';
    }
}

/**
 * Enhance prompt with resolution keywords
 */
function enhancePromptWithResolution(prompt: string, resolution: '2k' | '4k'): string {
    if (resolution === '4k') {
        return `${prompt}, (4k, high resolution:1.5, ultra detailed, sharp focus, crystal clear)`;
    }
    return prompt;
}

export async function POST(request: NextRequest) {
    try {
        const body: ImageGenerationRequest = await request.json();
        const {
            prompt,
            aspectRatio = '1:1',
            apiKey,
            projectId,
            location = 'us-central1',
            resolution = '2k',
            referenceImages
        } = body;

        if (!apiKey || !projectId) {
            return NextResponse.json(
                { error: 'API key and project ID are required' },
                { status: 400 }
            );
        }

        // Initialize Vertex AI
        const vertexAI = new VertexAI({
            project: projectId,
            location: location,
        });

        // Get Imagen model
        const generativeModel = vertexAI.getGenerativeModel({
            model: 'imagen-3.0-generate-001',
        });

        const imagenRatio = convertAspectRatio(aspectRatio);
        const enhancedPrompt = enhancePromptWithResolution(prompt, resolution);

        console.log('🎨 Generating with Imagen 3...');
        console.log('Prompt:', enhancedPrompt);
        console.log('Aspect Ratio:', imagenRatio);
        console.log('Resolution:', resolution);

        // Build request
        const requestPayload: any = {
            prompt: enhancedPrompt,
            aspectRatio: imagenRatio,
            numberOfImages: 1,
        };

        // Add reference images if provided
        if (referenceImages && referenceImages.length > 0) {
            console.log(`Adding ${referenceImages.length} reference images`);
            requestPayload.imageInputs = referenceImages.map(img => ({
                image: {
                    bytesBase64Encoded: img.base64
                },
                mode: img.mode
            }));
        }

        // Generate with 30s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const result = await generativeModel.generateContent(requestPayload);
            clearTimeout(timeoutId);

            // Extract image from response
            if (result.response?.candidates?.[0]?.content?.parts?.[0]) {
                const part = result.response.candidates[0].content.parts[0];

                // Check for inline data (base64)
                if (part.inlineData) {
                    const base64Data = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    console.log('✅ Imagen 3 generation successful');
                    return NextResponse.json({
                        url: `data:${mimeType};base64,${base64Data}`,
                        fallback: false
                    });
                }

                // Check for file URI
                if (part.fileData?.fileUri) {
                    console.log('✅ Imagen 3 generation successful');
                    return NextResponse.json({
                        url: part.fileData.fileUri,
                        fallback: false
                    });
                }
            }

            throw new Error('No image data in Imagen response');
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                return NextResponse.json(
                    { error: '죄송합니다. Google Imagen 3 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.' },
                    { status: 408 }
                );
            }

            throw error;
        }

    } catch (error: any) {
        console.error('❌ Image generation error:', error);

        const errorMsg = error.message || 'Unknown error';
        const errorCode = error.code || error.status || 'UNKNOWN';

        return NextResponse.json(
            { error: `Imagen 3 실패 (${errorCode}): ${errorMsg}` },
            { status: 500 }
        );
    }
}
