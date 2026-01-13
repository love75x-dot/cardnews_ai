/**
 * Background processor for removing and replacing product backgrounds
 */

export interface BackgroundProcessResult {
    originalImage: string;
    backgroundRemovedImage: string;
    backgroundDescription: string;
}

/**
 * Remove background from image using Remove.bg API
 * @param imageUrl - URL of the image to process
 * @param removeBgApiKey - Remove.bg API key
 * @returns Image with transparent background as base64 data URL
 */
export async function removeBackground(
    imageUrl: string,
    removeBgApiKey: string
): Promise<string> {
    try {
        console.log('🖼️ Remove.bg API로 배경 제거 시작...');

        const formData = new FormData();
        
        // Fetch the image and convert to blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        formData.append('image_file', blob);
        formData.append('format', 'PNG');
        formData.append('type', 'product');

        const result = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-API-Key': removeBgApiKey,
            },
            body: formData,
        });

        if (!result.ok) {
            const error = await result.json();
            console.error('❌ Remove.bg API 오류:', error);
            throw new Error(`Remove.bg API 오류: ${error.errors?.[0]?.title || 'Unknown error'}`);
        }

        const outputBlob = await result.blob();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                const base64 = reader.result as string;
                console.log('✅ 배경 제거 완료');
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(outputBlob);
        });
    } catch (error) {
        console.error('❌ 배경 제거 실패:', error);
        throw error;
    }
}

/**
 * Get background style description for Imagen prompt
 * @param backgroundStyle - Selected background style
 * @returns Description to include in image generation prompt
 */
export function getBackgroundStylePrompt(backgroundStyle: string): string {
    const backgroundPrompts: { [key: string]: string } = {
        studio: "Clean white or neutral studio background, professional product photography lighting, soft shadows",
        cafe: "Cozy cafe environment, wooden table, warm lighting, cafe ambiance, plants, coffee accessories in background",
        nature: "Natural outdoor setting, green nature background, garden environment, soft natural lighting, flowers or plants",
        modern: "Modern minimalist setting, sleek surfaces, contemporary interior design, clean lines, modern decor",
        minimal: "Extremely minimal background, single solid color or very subtle texture, focus entirely on product",
        luxury: "Luxurious upscale setting, elegant background, premium materials visible, sophisticated atmosphere, gold accents",
        vintage: "Vintage or retro setting, antique furniture, warm nostalgic colors, vintage decor, rustic aesthetic",
        realistic: "Photorealistic background, realistic lighting and shadows, professional product photography style, detailed textures, natural colors"
    };

    return backgroundPrompts[backgroundStyle] || backgroundPrompts['studio'];
}

/**
 * Merge product image with background
 * This is handled by Imagen's text-to-image generation,
 * but this function provides the merged prompt
 */
export function createProductWithBackgroundPrompt(
    productDescription: string,
    backgroundStyle: string,
    artStyle: string
): string {
    const backgroundPrompt = getBackgroundStylePrompt(backgroundStyle);
    
    return `${artStyle} illustration: ${productDescription} placed on ${backgroundPrompt}. Professional product showcase. High quality product photography style. No text or watermarks. Clean, polished appearance.`;
}
