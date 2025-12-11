import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CardContent {
    page: number;
    headline: string;  // Short impactful text for image overlay (15-25 chars)
    script: string;    // Detailed description for property panel
    imagePrompt: string;
}

/**
 * Generate card news content using Gemini API
 * @param apiKey - Google Gemini API key
 * @param topic - Topic for the card news
 * @param sceneCount - Number of scenes/pages to generate
 * @returns Array of card content with headline, script and image prompts
 */
export async function generateCardNewsContent(
    apiKey: string,
    topic: string,
    sceneCount: number
): Promise<CardContent[]> {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create prompt with headline/script separation
    const prompt = `당신은 카드뉴스 기획 전문가입니다.

중요한 가이드라인:
1. 각 장면은 **headline**과 **script** 두 가지 텍스트가 필요합니다:

   **headline** (핵심 문구):
   - 이미지 중앙에 크게 표시될 텍스트입니다
   - 반드시 **15자~25자 이내**로 짧고 강렬하게 요약하세요
   - 줄바꿈은 최대 2줄까지만 허용됩니다
   - 임팩트 있고 기억에 남는 표현을 사용하세요
   - 예시: "체온 1도, 면역력의 핵심!"
   
   **script** (상세 대본):
   - 우측 패널에 표시될 상세 설명입니다
   - 길어도 괜찮습니다 (2-3문장)
   - 해당 장면의 핵심 정보를 충분히 설명하세요
   - 예시: "우리 몸의 체온이 1도만 낮아져도 면역력은 30%나 떨어진다는 사실, 알고 계셨나요? 체온 관리가 건강의 시작입니다."

2. **이미지 스타일 강제 지침 (매우 중요):**
   - 모든 이미지는 "Modern Minimalist Vector Art style"로 생성
   - "Flat Design Infographic" 스타일 적용
   - "Soft pastel colors with clean white or gradient background" 사용
   - "No text or letters in the image" (텍스트는 절대 포함하지 말 것)
   - "Simple, clean, professional illustration"
   - 사진처럼 보이는 realistic/photorealistic style은 절대 사용하지 말 것

3. 이미지는 시각적 요소(아이콘, 심볼, 일러스트)로만 구성
4. imagePrompt는 영문으로 작성

주제: ${topic}
장면 수: ${sceneCount}

위 주제로 ${sceneCount}개의 카드뉴스 장면을 기획해주세요.
각 장면의 imagePrompt는 반드시 다음 키워드를 모두 포함해야 합니다:
- "Modern Minimalist Vector Art style"
- "Flat Design Infographic"  
- "Soft pastel colors with clean background"
- "No text or letters"
- "Simple illustration"

출력 형식 (JSON 배열만 응답):
[
  {
    "page": 1,
    "headline": "짧고 강렬한 핵심 문구 (15-25자)",
    "script": "상세한 설명이 포함된 대본 텍스트...",
    "imagePrompt": "Modern minimalist vector art illustration of... (영문)"
  },
  ...
]

JSON 배열 형식으로만 응답하세요. 다른 설명은 포함하지 마세요.`;

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
                typeof card.headline !== 'string' ||
                typeof card.script !== 'string' ||
                typeof card.imagePrompt !== 'string') {
                throw new Error('Invalid card structure - missing headline or script');
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
