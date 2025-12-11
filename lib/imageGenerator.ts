/**
 * Image Generation with Google Imagen 3 (Vertex AI)
 * 
 * Requires: Billing enabled Google Cloud project
 */

import { VertexAI } from '@google-cloud/vertexai';

export interface ImageGenerationOptions {
    prompt: string;
    aspectRatio?: string;
    apiKey?: string;
    projectId?: string;
    location?: string;
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
 * Generate image using Google Imagen 3 (Vertex AI)
 */
async function generateImagenImage(
    prompt: string,
    aspectRatio: string,
    apiKey: string,
    projectId: string = 'your-project-id',
    location: string = 'us-central1'
): Promise<string> {
    try {
        // Initialize Vertex AI
        const vertexAI = new VertexAI({
            project: projectId,
            location: location,
        });

        // Get Imagen model
        const generativeModel = vertexAI.getGenerativeModel({
            model: 'imagen-3.0-generate-001',
        });

        const imagenRatio = convertAspectRatio(aspectRatio);

        // Generate image
        const request = {
            prompt: prompt,
            aspectRatio: imagenRatio,
            numberOfImages: 1,
            // Optional parameters
            // sampleCount: 1,
        };

        console.log('🎨 Generating with Imagen 3...', request);

        const result = await generativeModel.generateContent(request);

        // Extract image from response
        if (result.response?.candidates?.[0]?.content?.parts?.[0]) {
            const part = result.response.candidates[0].content.parts[0];

            // Check for inline data (base64)
            if (part.inlineData) {
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${base64Data}`;
            }

            // Check for file URI
            if (part.fileData?.fileUri) {
                return part.fileData.fileUri;
            }
        }

        throw new Error('No image data in Imagen response');

    } catch (error: any) {
        console.error('❌ Imagen 3 error:', error);

        // Provide detailed error
        const errorMsg = error.message || 'Unknown error';
        const errorCode = error.code || error.status || 'UNKNOWN';

        throw new Error(`Imagen 3 실패 (${errorCode}): ${errorMsg}`);
    }
}

/**
 * Fallback: Generate image using Pollinations AI (free)
 */
async function generatePollinationsImage(
    prompt: string,
    aspectRatio: string
): Promise<string> {
    const [width, height] = getAspectRatioDimensions(aspectRatio);

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
    const { prompt, aspectRatio = '1:1', apiKey, projectId, location } = options;

    // Try Imagen 3 if API key is provided
    if (apiKey && projectId) {
        try {
            console.log('🚀 Using Google Imagen 3 (Vertex AI)');
            const imageUrl = await generateImagenImage(
                prompt,
                aspectRatio,
                apiKey,
                projectId,
                location
            );

            console.log('✅ Imagen 3 generation successful');

            return {
                url: imageUrl,
                fallback: false
            };
        } catch (error) {
            console.warn('⚠️ Imagen 3 failed, falling back to Pollinations:', error);

            // Fallback to Pollinations
            const fallbackUrl = await generatePollinationsImage(prompt, aspectRatio);
            return {
                url: fallbackUrl,
                fallback: true
            };
        }
    }

    // Use Pollinations if no API key
    console.log('📦 Using Pollinations AI (free)');
    const imageUrl = await generatePollinationsImage(prompt, aspectRatio);
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
    location?: string
): Promise<ImageResult[]> {
    const imagePromises = cards.map((card) =>
        generateCardImage({
            prompt: card.imagePrompt,
            aspectRatio,
            apiKey,
            projectId,
            location
        })
    );

    return Promise.all(imagePromises);
}
