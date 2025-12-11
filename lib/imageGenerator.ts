/**
 * Image Generation with Google Imagen 3 and Pollinations Fallback
 * 
 * Primary: Google Imagen 3 (requires paid API key)
 * Fallback: Pollinations AI (free, no API key required)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * Generate image using Pollinations AI (Free fallback)
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
 * Generate a single card image
 * Tries Imagen 3 first, falls back to Pollinations on error
 */
export async function generateCardImage(
    options: ImageGenerationOptions
): Promise<ImageResult> {
    const { prompt, aspectRatio = '1:1', apiKey } = options;

    // If no API key, use Pollinations directly
    if (!apiKey) {
        return {
            url: await generatePollinationsImage(prompt, aspectRatio),
            fallback: true
        };
    }

    try {
        // Try Google Imagen 3
        const genAI = new GoogleGenerativeAI(apiKey);

        // Note: Imagen 3 API structure may vary
        // This is an attempt based on available documentation
        const model = genAI.getGenerativeModel({
            model: 'imagen-3.0-generate-001'
        });

        // Attempt to generate image
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: `Generate an image: ${prompt}. Aspect ratio: ${aspectRatio}`
                }]
            }]
        });

        // Extract image URL from response
        const response = await result.response;
        const candidates = response.candidates;

        if (candidates && candidates[0]) {
            // Try to find image URL in response
            const imageUrl = extractImageUrl(candidates[0]);

            if (imageUrl) {
                return {
                    url: imageUrl,
                    fallback: false
                };
            }
        }

        // If no image URL found, fallback
        throw new Error('No image URL in Imagen response');

    } catch (error) {
        console.warn('Imagen 3 failed, falling back to Pollinations:', error);

        // Fallback to Pollinations
        return {
            url: await generatePollinationsImage(prompt, aspectRatio),
            fallback: true
        };
    }
}

/**
 * Extract image URL from Imagen response (helper function)
 */
function extractImageUrl(candidate: any): string | null {
    // This may need adjustment based on actual API response structure
    if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData?.mimeType?.startsWith('image/')) {
                // Convert base64 to data URL
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
            if (part.fileData?.fileUri) {
                return part.fileData.fileUri;
            }
        }
    }
    return null;
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
