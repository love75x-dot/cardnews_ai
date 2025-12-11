/**
 * Image Generation with Pollinations AI
 * 
 * Using Pollinations as primary image generator (free, fast, no API key needed)
 */

export interface ImageGenerationOptions {
    prompt: string;
    aspectRatio?: string;
    apiKey?: string;
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
 * Generate image using Pollinations AI
 */
async function generatePollinationsImage(
    prompt: string,
    aspectRatio: string
): Promise<string> {
    const [width, height] = getAspectRatioDimensions(aspectRatio);

    // Pollinations API - free, instant generation
    const pollinationsUrl = new URL('https://image.pollinations.ai/prompt');
    pollinationsUrl.pathname = `/prompt/${encodeURIComponent(prompt)}`;
    pollinationsUrl.searchParams.set('width', width.toString());
    pollinationsUrl.searchParams.set('height', height.toString());
    pollinationsUrl.searchParams.set('nologo', 'true');
    pollinationsUrl.searchParams.set('enhance', 'true');

    return pollinationsUrl.toString();
}

/**
 * Generate a single card image using Pollinations AI
 */
export async function generateCardImage(
    options: ImageGenerationOptions
): Promise<ImageResult> {
    const { prompt, aspectRatio = '1:1' } = options;

    try {
        console.log('🎨 Generating image with Pollinations AI...');
        console.log('Prompt:', prompt);
        console.log('Aspect Ratio:', aspectRatio);

        const imageUrl = await generatePollinationsImage(prompt, aspectRatio);

        console.log('✅ Image generated successfully');

        return {
            url: imageUrl,
            fallback: false
        };
    } catch (error) {
        console.error('❌ Image generation failed:', error);
        throw error;
    }
}

/**
 * Generate images for multiple cards in parallel (much faster!)
 */
export async function generateCardImages(
    cards: Array<{ imagePrompt: string }>,
    aspectRatio: string = '1:1',
    apiKey?: string
): Promise<ImageResult[]> {
    // Create all image generation promises at once
    const imagePromises = cards.map((card, index) =>
        generateCardImage({
            prompt: card.imagePrompt,
            aspectRatio,
            apiKey
        })
    );

    // Execute all promises in parallel using Promise.all
    // This is MUCH faster than sequential generation
    return Promise.all(imagePromises);
}
