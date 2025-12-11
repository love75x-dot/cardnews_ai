import { NextRequest, NextResponse } from 'next/server';

interface ImageGenerationRequest {
    prompt: string;
    aspectRatio?: string;
    apiKey: string;
    projectId?: string;
    location?: string;
    resolution?: '2k' | '4k';
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
            resolution = '2k',
        } = body;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is required' },
                { status: 400 }
            );
        }

        const imagenRatio = convertAspectRatio(aspectRatio);
        const enhancedPrompt = enhancePromptWithResolution(prompt, resolution);

        console.log('🎨 Generating with Google AI Imagen...');
        console.log('Prompt:', enhancedPrompt);
        console.log('Aspect Ratio:', imagenRatio);
        console.log('Resolution:', resolution);

        // Google AI Imagen API endpoint (uses API Key directly)
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generate`;

        // Prepare request payload for Imagen
        const requestPayload = {
            prompt: enhancedPrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: imagenRatio,
                negativePrompt: "",
            }
        };

        console.log('📡 Calling Google AI Imagen API...');

        // Make request to Google AI
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Google AI Error Response:', errorText);

            // Handle specific error codes
            if (response.status === 403) {
                return NextResponse.json(
                    {
                        error: 'Google AI API 권한이 없습니다 (Error 403). API Key의 권한을 확인해주세요.',
                        details: errorText
                    },
                    { status: 403 }
                );
            }

            if (response.status === 401) {
                return NextResponse.json(
                    {
                        error: 'API 인증에 실패했습니다 (Error 401). API Key가 올바른지 확인해주세요.',
                        details: errorText
                    },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                {
                    error: `Google AI Imagen API 호출 실패 (HTTP ${response.status})`,
                    details: errorText
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log('✅ Google AI Response received');

        // Extract image from response
        if (result.images && result.images.length > 0) {
            const imageData = result.images[0];

            // Google AI returns base64 encoded image
            if (imageData.image) {
                const base64Data = imageData.image;
                const mimeType = imageData.mimeType || 'image/png';

                console.log('✅ Imagen generation successful');
                return NextResponse.json({
                    url: `data:${mimeType};base64,${base64Data}`,
                    fallback: false
                });
            }
        }

        throw new Error('No image data in Google AI response');

    } catch (error: any) {
        console.error('❌ Image generation error:', error);

        const errorMsg = error.message || 'Unknown error';

        return NextResponse.json(
            {
                error: `Google AI Imagen 호출 중 오류 발생: ${errorMsg}`,
                details: error.stack
            },
            { status: 500 }
        );
    }
}
