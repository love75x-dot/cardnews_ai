/**
 * Image Generation with Google Imagen 3 (Vertex AI)
 * Client-side wrapper that calls server API routes
 * With 30s timeout, resolution support, and reference images
 */

export interface ImageGenerationOptions {
    prompt: string;
    aspectRatio?: string;
    apiKey?: string;
    projectId?: string;
    location?: string;
    resolution?: '2k' | '4k';
    referenceImages?: Array<{ base64: string; mode: string }>;
}

export interface ImageResult {
    url: string;
    fallback: boolean;
}

/**
 * Get dimensions based on aspect ratio
 */
function getAspectRatioDimensions(ratio: string): [number, number] {
    switch (ratio) {
        case '1:1':
            return [1024, 1024];
        case '9:16':
            return [720, 1280];
        case '16:9':
            return [1280, 720];
        default:
            return [1024, 1024];
    }
}

/**
 * Generate image using Pollinations AI (Free fallback)
 */
async function generatePollinationsImage(
    prompt: string,
    aspectRatio: string,
    resolution: '2k' | '4k' = '2k'
): Promise<string> {
    const [width, height] = getAspectRatioDimensions(aspectRatio);

    // Apply resolution multiplier for 4k
    const scale = resolution === '4k' ? 2 : 1;
    const finalWidth = width * scale;
    const finalHeight = height * scale;

    const pollinationsUrl = new URL('https://image.pollinations.ai/prompt');
    pollinationsUrl.pathname = `/prompt/${encodeURIComponent(prompt)}`;
    pollinationsUrl.searchParams.set('width', finalWidth.toString());
    pollinationsUrl.searchParams.set('height', finalHeight.toString());
    pollinationsUrl.searchParams.set('nologo', 'true');
    pollinationsUrl.searchParams.set('enhance', 'true');

    return pollinationsUrl.toString();
}

/**
 * Generate image using Google Imagen 3 via API route
 */
async function generateImagenImage(
    prompt: string,
    aspectRatio: string,
    apiKey: string,
    projectId: string,
    location: string,
    resolution: '2k' | '4k',
    referenceImages?: Array<{ base64: string; mode: string }>
): Promise<string> {
    try {
        console.log('🎨 Generating with Imagen 3 via API...');

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
                referenceImages
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Imagen 3 generation successful');
        return data.url;

    } catch (error: any) {
        console.error('❌ Imagen 3 error:', error);

        // Re-throw timeout errors
        if (error.message?.includes('지연')) {
            throw error;
        }

        // For other errors, provide detailed message
        const errorMsg = error.message || 'Unknown error';
        throw new Error(`Imagen 3 실패: ${errorMsg}`);
    }
}

/**
 * Generate a single card image
 * Tries Imagen 3 first, falls back to Pollinations on error
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
        referenceImages
    } = options;

    // Try Imagen 3 if API key and project ID are provided
    if (apiKey && projectId) {
        try {
            console.log('🚀 Using Google Imagen 3 (Vertex AI)');
            const imageUrl = await generateImagenImage(
                prompt,
                aspectRatio,
                apiKey,
                projectId,
                location,
                resolution,
                referenceImages
            );

            return {
                url: imageUrl,
                fallback: false
            };
        } catch (error) {
            console.warn('⚠️ Imagen 3 failed, falling back to Pollinations:', error);

            // Don't fallback on timeout - throw error
            if (error instanceof Error && error.message.includes('지연')) {
                throw error;
            }

            // Fallback to Pollinations for other errors
            const fallbackUrl = await generatePollinationsImage(
                prompt,
                aspectRatio,
                resolution
            );
            return {
                url: fallbackUrl,
                fallback: true
            };
        }
    }

    // Use Pollinations if no API key
    console.log('📦 Using Pollinations AI (free)');
    const imageUrl = await generatePollinationsImage(prompt, aspectRatio, resolution);
    return {
        url: imageUrl,
        fallback: true
    };
}

/**
 * Generate images for multiple cards in parallel
 */
export async function generateCardImages(
    cards: Array<{ imagePrompt: string }>,
    aspectRatio: string = '1:1',
    apiKey?: string,
    projectId?: string,
    location?: string,
    resolution: '2k' | '4k' = '2k',
    referenceImages?: Array<{ base64: string; mode: string }>
): Promise<ImageResult[]> {
    const imagePromises = cards.map((card) =>
        generateCardImage({
            prompt: card.imagePrompt,
            aspectRatio,
            apiKey,
            projectId,
            location,
            resolution,
            referenceImages
        })
    );

    return Promise.all(imagePromises);
}
