/**
 * Image Generation with Vertex AI Imagen 3 (Nano Banana Pro)
 * Requires Google Cloud Project ID and API Key
 * High quality image generation with Vertex AI
 */

export interface ImageGenerationOptions {
    prompt: string;
    aspectRatio?: string;
    apiKey: string;  // Required - Gemini API Key
    projectId: string;  // Required - GCP Project ID
    location?: string;
    resolution?: '2k' | '4k';
}

export interface ImageResult {
    url: string;
    fallback: boolean;
}

/**
 * Generate image using Google Vertex AI Imagen 3 via API route
 * NO FALLBACK - throws error if Vertex AI fails
 */
async function generateImagenImage(
    prompt: string,
    aspectRatio: string,
    apiKey: string,
    projectId: string,
    location: string,
    resolution: '2k' | '4k'
): Promise<string> {
    console.log('🎨 Generating with Vertex AI Imagen 3...');
    console.log('Project:', projectId);
    console.log('Location:', location);

    const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            aspectRatio,
            apiKey,
            projectId,
            location,
            resolution,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();

        // Throw detailed error - DO NOT fallback to free service
        if (response.status === 403) {
            throw new Error(errorData.error || 'Google Cloud Billing이 활성화되지 않았거나 권한이 없습니다 (Error 403)');
        }

        if (response.status === 401) {
            throw new Error(errorData.error || 'API 인증에 실패했습니다 (Error 401). API Key를 확인해주세요.');
        }

        throw new Error(errorData.error || `HTTP ${response.status}: Vertex AI 호출 실패`);
    }

    const data = await response.json();
    console.log('✅ Vertex AI Imagen 3 generation successful');
    return data.url;
}

/**
 * Generate a single card image using Vertex AI Imagen 3 (Nano Banana Pro)
 * Requires valid API key and Project ID
 */
export async function generateCardImage(
    options: ImageGenerationOptions
): Promise<ImageResult> {
    const {
        prompt,
        aspectRatio = '1:1',
        apiKey,
        projectId,
        location = 'us-central1',
        resolution = '2k',
    } = options;

    // Validate required parameters
    if (!apiKey) {
        throw new Error('API Key가 필요합니다. 설정에서 입력해주세요.');
    }

    if (!projectId) {
        throw new Error('Google Cloud Project ID가 필요합니다. 설정에서 입력해주세요.');
    }

    console.log('🚀 Using Vertex AI Imagen 3 (Nano Banana Pro)');
    console.log('💰 Google Cloud billing will apply');
    console.log('Project ID:', projectId);

    // Call Vertex AI Imagen 3
    const imageUrl = await generateImagenImage(
        prompt,
        aspectRatio,
        apiKey,
        projectId,
        location,
        resolution
    );

    return {
        url: imageUrl,
        fallback: false
    };
}

/**
 * Generate images for multiple cards in parallel
 * All using Vertex AI Imagen 3 (Nano Banana Pro)
 */
export async function generateCardImages(
    cards: Array<{ imagePrompt: string }>,
    aspectRatio: string = '1:1',
    apiKey?: string,
    projectId?: string,
    location?: string,
    resolution: '2k' | '4k' = '2k'
): Promise<ImageResult[]> {
    // Validate required parameters
    if (!apiKey || !projectId) {
        throw new Error('API Key와 Google Cloud Project ID가 모두 필요합니다. 설정에서 입력해주세요.');
    }

    // After validation, both are guaranteed to be strings
    const validatedApiKey: string = apiKey;
    const validatedProjectId: string = projectId;

    const imagePromises = cards.map((card) =>
        generateCardImage({
            prompt: card.imagePrompt,
            aspectRatio,
            apiKey: validatedApiKey,
            projectId: validatedProjectId,
            location,
            resolution,
        })
    );

    return Promise.all(imagePromises);
}

