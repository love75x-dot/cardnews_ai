/**
 * Image Generation with Google Imagen 3 (Vertex AI)
 * With 30s timeout, resolution support, and reference images
 */

import { VertexAI } from '@google-cloud/vertexai';

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
 * Timeout wrapper - rejects if promise takes longer than timeoutMs
 */
async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 30000,
    errorMessage: string = '죄송합니다. Google 클라우드 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new Error(errorMessage));
        }, timeoutMs);
    });

    return Promise.race([promise, timeout]);
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
 * Enhance prompt with resolution keywords
 */
function enhancePromptWithResolution(prompt: string, resolution: '2k' | '4k'): string {
    if (resolution === '4k') {
        return `${prompt}, (4k, high resolution:1.5, ultra detailed, sharp focus, crystal clear)`;
    }
    return prompt; // 2k is default, no enhancement needed
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
 * Generate image using Google Imagen 3 (Vertex AI)
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
        const enhancedPrompt = enhancePromptWithResolution(prompt, resolution);

        console.log('🎨 Generating with Imagen 3...');
        console.log('Prompt:', enhancedPrompt);
        console.log('Aspect Ratio:', imagenRatio);
        console.log('Resolution:', resolution);

        // Build request
        const request: any = {
            prompt: enhancedPrompt,
            aspectRatio: imagenRatio,
            numberOfImages: 1,
        };

        // Add reference images if provided
        if (referenceImages && referenceImages.length > 0) {
            console.log(`Adding ${referenceImages.length} reference images`);
            request.imageInputs = referenceImages.map(img => ({
                image: {
                    bytesBase64Encoded: img.base64
                },
                mode: img.mode
            }));
        }

        // Generate with timeout
        const result = await withTimeout(
            generativeModel.generateContent(request),
            30000,
            '죄송합니다. Google Imagen 3 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.'
        );

        // Extract image from response
        if (result.response?.candidates?.[0]?.content?.parts?.[0]) {
            const part = result.response.candidates[0].content.parts[0];

            // Check for inline data (base64)
            if (part.inlineData) {
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                console.log('✅ Imagen 3 generation successful');
                return `data:${mimeType};base64,${base64Data}`;
            }

            // Check for file URI
            if (part.fileData?.fileUri) {
                console.log('✅ Imagen 3 generation successful');
                return part.fileData.fileUri;
            }
        }

        throw new Error('No image data in Imagen response');

    } catch (error: any) {
        console.error('❌ Imagen 3 error:', error);

        // Re-throw timeout errors
        if (error.message?.includes('지연')) {
            throw error;
        }

        // For other errors, provide detailed message
        const errorMsg = error.message || 'Unknown error';
        const errorCode = error.code || error.status || 'UNKNOWN';
        throw new Error(`Imagen 3 실패 (${errorCode}): ${errorMsg}`);
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
