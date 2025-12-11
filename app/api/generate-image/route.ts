import { NextRequest, NextResponse } from 'next/server';

interface ImageGenerationRequest {
    prompt: string;
    aspectRatio?: string;
    apiKey: string;
    projectId: string;
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

/**
 * Get OAuth2 access token from API key
 */
async function getAccessToken(apiKey: string): Promise<string> {
    // For Vertex AI, we'll use the API key directly in the authorization header
    // Note: This might need adjustment based on your actual auth setup
    return apiKey;
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
        } = body;

        if (!apiKey || !projectId) {
            return NextResponse.json(
                { error: 'API key and project ID are required' },
                { status: 400 }
            );
        }

        const imagenRatio = convertAspectRatio(aspectRatio);
        const enhancedPrompt = enhancePromptWithResolution(prompt, resolution);

        console.log('🎨 Generating with Vertex AI Imagen 3...');
        console.log('Project:', projectId);
        console.log('Prompt:', enhancedPrompt);
        console.log('Aspect Ratio:', imagenRatio);
        console.log('Resolution:', resolution);

        // Vertex AI Imagen 3 API endpoint
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

        // Prepare request payload for Imagen 3
        const requestPayload = {
            instances: [
                {
                    prompt: enhancedPrompt,
                }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: imagenRatio,
                safetyFilterLevel: "block_few",
                personGeneration: "allow_adult",
            }
        };

        console.log('📡 Calling Vertex AI endpoint:', endpoint);

        // Make request to Vertex AI
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Vertex AI Error Response:', errorText);

            // Handle specific error codes
            if (response.status === 403) {
                return NextResponse.json(
                    {
                        error: 'Google Cloud Billing이 활성화되지 않았거나 권한이 없습니다 (Error 403). GCP 콘솔에서 Vertex AI API 활성화 및 결제 계정 연결을 확인해주세요.',
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
                    error: `Vertex AI Imagen 3 API 호출 실패 (HTTP ${response.status})`,
                    details: errorText
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log('✅ Vertex AI Response received');

        // Extract image from response
        if (result.predictions && result.predictions.length > 0) {
            const prediction = result.predictions[0];

            // Imagen 3 returns base64 encoded image in bytesBase64Encoded field
            if (prediction.bytesBase64Encoded) {
                const base64Data = prediction.bytesBase64Encoded;
                const mimeType = prediction.mimeType || 'image/png';

                console.log('✅ Imagen 3 generation successful');
                return NextResponse.json({
                    url: `data:${mimeType};base64,${base64Data}`,
                    fallback: false
                });
            }
        }

        throw new Error('No image data in Vertex AI response');

    } catch (error: any) {
        console.error('❌ Image generation error:', error);

        const errorMsg = error.message || 'Unknown error';

        return NextResponse.json(
            {
                error: `Vertex AI Imagen 3 호출 중 오류 발생: ${errorMsg}`,
                details: error.stack
            },
            { status: 500 }
        );
    }
}
