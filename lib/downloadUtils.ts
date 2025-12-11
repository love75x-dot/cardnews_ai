import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Sanitize filename to remove invalid characters
 */
function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
}

/**
 * Convert element to canvas with proper CORS handling for external images
 */
async function elementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
            // Wait for images to load
            imageTimeout: 15000,
            onclone: (clonedDoc) => {
                // Ensure images are loaded in cloned document
                const images = clonedDoc.querySelectorAll('img');
                images.forEach((img) => {
                    if (img instanceof HTMLImageElement) {
                        // Force crossOrigin attribute
                        img.crossOrigin = 'anonymous';
                    }
                });
            }
        });
        return canvas;
    } catch (error) {
        console.error('Canvas conversion error:', error);
        throw new Error('이미지 변환 중 오류가 발생했습니다. 이미지가 완전히 로드되었는지 확인해주세요.');
    }
}

/**
 * Download a single card as PNG
 */
export async function downloadCard(
    cardElement: HTMLElement,
    cardId: number,
    topic: string
): Promise<void> {
    try {
        const canvas = await elementToCanvas(cardElement);

        canvas.toBlob((blob) => {
            if (!blob) {
                throw new Error('이미지 생성 실패');
            }

            const filename = `${sanitizeFilename(topic)}_카드${cardId}.png`;
            saveAs(blob, filename);
        }, 'image/png');
    } catch (error) {
        console.error('Download error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('다운로드 중 오류가 발생했습니다.');
    }
}

/**
 * Download all cards as a ZIP file
 */
export async function downloadAllCards(
    cardElements: HTMLElement[],
    topic: string
): Promise<void> {
    try {
        const zip = new JSZip();

        // Convert all cards to canvases first
        console.log(`Converting ${cardElements.length} cards to images...`);

        for (let i = 0; i < cardElements.length; i++) {
            const element = cardElements[i];
            const cardNumber = i + 1;

            console.log(`Processing card ${cardNumber}/${cardElements.length}...`);

            try {
                const canvas = await elementToCanvas(element);

                // Convert canvas to blob
                const blob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error(`카드 ${cardNumber} 변환 실패`));
                        }
                    }, 'image/png');
                });

                // Add to zip
                const filename = `카드${cardNumber}.png`;
                zip.file(filename, blob);

            } catch (error) {
                console.error(`Error processing card ${cardNumber}:`, error);
                throw new Error(`카드 ${cardNumber} 처리 중 오류 발생`);
            }
        }

        console.log('Creating ZIP file...');

        // Generate ZIP
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            }
        });

        // Download ZIP
        const zipFilename = `${sanitizeFilename(topic)}_카드뉴스.zip`;
        saveAs(zipBlob, zipFilename);

        console.log('Download complete!');

    } catch (error) {
        console.error('Batch download error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('전체 다운로드 중 오류가 발생했습니다.');
    }
}
