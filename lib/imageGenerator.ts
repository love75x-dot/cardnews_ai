/**
 * Image Generation with Pollinations AI
 * Free, no API key required
 * With resolution support and aspect ratio control
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
 * Generate image using Pollinations AI (Free, no API key needed)
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
 * Generate a single card image
 * Uses Pollinations AI - free and no authentication required
 */
export async function generateCardImage(
    options: ImageGenerationOptions
): Promise<ImageResult> {
    const {
        prompt,
        aspectRatio = '1:1',
        resolution = '2k',
    } = options;

    console.log('🎨 Generating image with Pollinations AI (free)');
    console.log('Prompt:', prompt);
    console.log('Aspect Ratio:', aspectRatio);
    console.log('Resolution:', resolution);

    const imageUrl = await generatePollinationsImage(prompt, aspectRatio, resolution);

    return {
        url: imageUrl,
        fallback: false  // No fallback needed, this is the primary method
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

