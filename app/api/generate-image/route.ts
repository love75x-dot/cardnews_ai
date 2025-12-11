import { NextRequest, NextResponse } from 'next/server';

interface ImageGenerationRequest {
    prompt: string;
    aspectRatio?: string;
    apiKey: string;
    projectId?: string;
    resolution?: '2k' | '4k';
}

export async function POST(request: NextRequest) {
    try {
        const body: ImageGenerationRequest = await request.json();
        const {
            prompt,
            apiKey,
        } = body;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key is required' },
                { status: 400 }
            );
        }

        console.log('🎨 Generating with Gemini (Nano Banana Pro)...');
        console.log('Prompt:', prompt);

        // Gemini API endpoint for image generation
        // Using gemini-3-pro-image model (Nano Banana Pro)
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent';

        const requestPayload = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseModalities: ["IMAGE"]
            }
        };

        console.log('📡 Calling Gemini API...');

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'x-goog-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API Error Response:', errorText);

            if (response.status === 401) {
                return NextResponse.json(
                    {
                        error: 'API 인증에 실패했습니다 (Error 401). Gemini API Key가 올바른지 확인해주세요.',
                        details: errorText
                    },
                    { status: 401 }
                );
            }

            if (response.status === 429) {
                return NextResponse.json(
                    {
                        error: 'API 호출 한도를 초과했습니다 (Error 429). 잠시 후 다시 시도해주세요.',
                        details: errorText
                    },
                    { status: 429 }
                );
            }

            if (response.status === 400) {
                return NextResponse.json(
                    {
                        error: '이미지 생성 요청이 거부되었습니다. 프롬프트 내용을 확인해주세요.',
                        details: errorText
                    },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                {
                    error: `Gemini API 호출 실패 (HTTP ${response.status})`,
                    details: errorText
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log('✅ Gemini Response received');

        // Extract image from response
        // Gemini returns base64 image in candidates[0].content.parts[0].inlineData.data
        if (result.candidates && result.candidates.length > 0) {
            const candidate = result.candidates[0];
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        const base64Data = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';

                        console.log('✅ Gemini (Nano Banana Pro) generation successful');
                        return NextResponse.json({
                            url: `data:${mimeType};base64,${base64Data}`,
                            fallback: false
                        });
                    }
                }
            }
        }

        throw new Error('No image data in Gemini response');

    } catch (error: any) {
        console.error('❌ Image generation error:', error);

        const errorMsg = error.message || 'Unknown error';

        return NextResponse.json(
            {
                error: `Gemini (Nano Banana Pro) 호출 중 오류 발생: ${errorMsg}`,
                details: error.stack
            },
            { status: 500 }
        );
    }
}
