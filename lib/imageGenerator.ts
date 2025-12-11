/**
 * Image Generation Abstraction Layer
 * 
 * This module provides an abstraction for image generation.
 * Currently uses placeholder images, but designed to be easily
 * replaced with real image generation APIs (DALL-E 3, Stable Diffusion, etc.)
 */

export interface ImageGenerationOptions {
    prompt: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
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
 * Generate a single card image URL
 * 
 * Phase 1: Returns placeholder image with encoded prompt
 * Phase 2: Will integrate with DALL-E 3 or other image generation API
 * 
 * @param options - Image generation options
 * @returns Promise<string> - Image URL
 */
export async function generateCardImage(
    options: ImageGenerationOptions
): Promise<string> {
    const { prompt, aspectRatio = '1:1' } = options;
    const [width, height] = getAspectRatioDimensions(aspectRatio);

    // Phase 1: Placeholder implementation
    // Use a gradient placeholder with subtle text
    const colors = [
        '667eea/ffffff', // Purple gradient
        '764ba2/667eea', // Purple to blue
        'f093fb/f5576c', // Pink gradient
        '4facfe/00f2fe', // Blue gradient
        'fa709a/fee140', // Pink to yellow
    ];

    // Pick color based on prompt hash for consistency
    const colorIndex = Math.abs(hashString(prompt)) % colors.length;
    const color = colors[colorIndex];

    // Encode first 30 chars of prompt for placeholder text
    const displayText = encodeURIComponent(
        prompt.substring(0, 30).replace(/[^a-zA-Z0-9 ]/g, '')
    );

    return `https://via.placeholder.com/${width}x${height}/${color}?text=${displayText}`;

    // Phase 2: DALL-E 3 integration (example - commented out)
    /*
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width, height }),
      });
      
      if (!response.ok) {
        throw new Error('Image generation failed');
      }
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Image generation error:', error);
      // Fallback to placeholder
      return `https://via.placeholder.com/${width}x${height}`;
    }
    */
}

/**
 * Generate images for multiple cards
 * 
 * @param cards - Array of cards with imagePrompt
 * @param aspectRatio - Aspect ratio for all images
 * @returns Promise<string[]> - Array of image URLs
 */
export async function generateCardImages(
    cards: Array<{ imagePrompt: string }>,
    aspectRatio: string = '1:1'
): Promise<string[]> {
    const imagePromises = cards.map(card =>
        generateCardImage({
            prompt: card.imagePrompt,
            aspectRatio,
        })
    );

    return Promise.all(imagePromises);
}

/**
 * Simple string hash function for consistent color selection
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
