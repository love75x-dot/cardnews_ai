import { NextRequest, NextResponse } from 'next/server';

interface ImageGenerationRequest {
    prompt: string;
    aspectRatio?: string;
    apiKey: string;
    resolution?: '2k' | '4k';
}

/**
 * Convert aspect ratio to DALL-E size
 */
function convertAspectRatioToSize(ratio: string, resolution: '2k' | '4k'): string {
    // DALL-E 3 supports: 1024x1024, 1024x1792, 1792x1024
    switch (ratio) {
        case '1:1':
            return '1024x1024';
        case '9:16':
            return '1024x1792';
        case '16:9':
            return '1792x1024';
        default:
            return '1024x1024';
    }
}

/**
 * Enhance prompt for better results
 */
function enhancePrompt(prompt: string, resolution: '2k' | '4k'): string {
    const qualityPrefix = resolution === '4k'
        ? 'High quality, detailed, professional photography, 4k resolution, '
        : 'High quality, detailed, ';

    return `${qualityPrefix}${prompt}`;
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
                { error: 'OpenAI API key is required' },
                { status: 400 }
            );
        }

        const size = convertAspectRatioToSize(aspectRatio, resolution);
        const enhancedPrompt = enhancePrompt(prompt, resolution);

        console.log('🎨 Generating with DALL-E 3...');
        console.log('Prompt:', enhancedPrompt);
        console.log('Size:', size);

        // OpenAI DALL-E 3 API endpoint
        const endpoint = 'https://api.openai.com/v1/images/generations';

        const requestPayload = {
            model: 'dall-e-3',
            prompt: enhancedPrompt,
            n: 1,
            size: size,
            quality: 'standard', // or 'hd' for higher quality (more expensive)
            response_format: 'url', // or 'b64_json' for base64
        };

        console.log('📡 Calling OpenAI DALL-E 3 API...');

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ OpenAI Error Response:', errorText);

            // Parse error for better messages
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: { message: errorText } };
            }

            if (response.status === 401) {
                return NextResponse.json(
                    {
                        error: 'OpenAI API 인증에 실패했습니다 (Error 401). API Key가 올바른지 확인해주세요.',
                        details: errorData.error?.message || errorText
                    },
                    { status: 401 }
                );
            }

            if (response.status === 429) {
                return NextResponse.json(
                    {
                        error: 'OpenAI API 호출 한도를 초과했습니다 (Error 429). 요금제를 확인하거나 잠시 후 다시 시도해주세요.',
                        details: errorData.error?.message || errorText
                    },
                    { status: 429 }
                );
            }

            if (response.status === 400) {
                return NextResponse.json(
                    {
                        error: '이미지 생성 요청이 거부되었습니다. 프롬프트 내용을 확인해주세요.',
                        details: errorData.error?.message || errorText
                    },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                {
                    error: `OpenAI DALL-E 3 API 호출 실패 (HTTP ${response.status})`,
                    details: errorData.error?.message || errorText
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log('✅ DALL-E 3 Response received');

        // Extract image URL from response
        if (result.data && result.data.length > 0) {
            const imageUrl = result.data[0].url;

            console.log('✅ DALL-E 3 generation successful');

            // Convert URL to base64 for consistent handling
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64 = Buffer.from(imageBuffer).toString('base64');

            return NextResponse.json({
                url: `data:image/png;base64,${base64}`,
                fallback: false
            });
        }

        throw new Error('No image data in OpenAI response');

    } catch (error: any) {
        console.error('❌ Image generation error:', error);

        const errorMsg = error.message || 'Unknown error';

        return NextResponse.json(
            {
                error: `DALL-E 3 호출 중 오류 발생: ${errorMsg}`,
                details: error.stack
            },
            { status: 500 }
        );
    }
}
