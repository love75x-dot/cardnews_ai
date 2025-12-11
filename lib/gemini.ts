import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CardContent {
    page: number;
    script: string;
    imagePrompt: string;
}

/**
 * Generate card news content using Gemini API
 * @param apiKey - Google Gemini API key
 * @param topic - Topic for the card news
 * @param sceneCount - Number of scenes/pages to generate
 * @returns Array of card content with script and image prompts
 */
export async function generateCardNewsContent(
    apiKey: string,
    topic: string,
    sceneCount: number
): Promise<CardContent[]> {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create prompt
    const prompt = `사용자의 주제를 바탕으로 ${sceneCount}개의 카드뉴스 내용을 기획해줘.
각 장면은 다음 정보를 포함해야 해:
1. page: 페이지 번호 (1부터 시작)
2. script: 카드뉴스에 들어갈 핵심 문구 (한국어, 간결하고 임팩트 있게)
3. imagePrompt: 이 장면에 어울리는 이미지 생성용 프롬프트 (영어, 구체적이고 상세하게)

주제: ${topic}

결과는 반드시 다음과 같은 JSON Array 형식으로 작성해줘:
[
  {
    "page": 1,
    "script": "카드뉴스 문구",
    "imagePrompt": "Detailed English prompt for image generation"
  }
]

JSON만 출력하고 다른 설명은 포함하지 마.`;

    try {
        // Generate content
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = text.trim();

        // Remove markdown code blocks if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
        }

        // Parse JSON
        const cards: CardContent[] = JSON.parse(jsonText);

        // Validate response
        if (!Array.isArray(cards)) {
            throw new Error('Response is not an array');
        }

        // Validate each card has required fields
        for (const card of cards) {
            if (typeof card.page !== 'number' ||
                typeof card.script !== 'string' ||
                typeof card.imagePrompt !== 'string') {
                throw new Error('Invalid card structure');
            }
        }

        return cards;
    } catch (error) {
        console.error('Gemini API error:', error);

        if (error instanceof Error) {
            // Check for specific error types
            if (error.message.includes('API key')) {
                throw new Error('유효하지 않은 API 키입니다. 설정에서 확인해주세요.');
            } else if (error.message.includes('quota')) {
                throw new Error('API 할당량이 초과되었습니다.');
            } else if (error.message.includes('JSON')) {
                throw new Error('응답 파싱 중 오류가 발생했습니다.');
            }
        }

        throw new Error('카드뉴스 생성 중 오류가 발생했습니다.');
    }
}
