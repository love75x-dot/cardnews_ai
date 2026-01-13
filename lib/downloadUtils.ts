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
            imageTimeout: 20000,
            onclone: (clonedDoc) => {
                // Ensure images are loaded in cloned document
                const images = clonedDoc.querySelectorAll('img');
                images.forEach((img) => {
                    if (img instanceof HTMLImageElement) {
                        // Force crossOrigin attribute
                        img.crossOrigin = 'anonymous';
                        // Remove any transform styles that might cause issues
                        img.style.transform = 'none';
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
        console.log(`Downloading card ${cardId}...`);
        
        const canvas = await elementToCanvas(cardElement);
        console.log('Canvas created, converting to blob...');

        // Promise로 toBlob을 래핑
        const blob = await new Promise<Blob | null>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Blob 변환 시간 초과'));
            }, 10000);

            canvas.toBlob(
                (blob) => {
                    clearTimeout(timeout);
                    resolve(blob);
                },
                'image/png',
                0.95
            );
        });

        if (!blob) {
            throw new Error('이미지 생성 실패 - Blob이 null입니다');
        }

        console.log(`Blob created: ${blob.size} bytes`);
        
        const filename = `${sanitizeFilename(topic)}_카드_${String(cardId).padStart(2, '0')}.png`;
        console.log(`Saving as: ${filename}`);
        
        saveAs(blob, filename);
        console.log('Download initiated');
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
        console.log(`Converting ${cardElements.length} cards to images...`);

        let i = 0;
        for (const element of cardElements) {
            const cardNumber = i + 1;
            console.log(`Processing card ${cardNumber}/${cardElements.length}...`);
            try {
                const canvas = await elementToCanvas(element);
                
                const blob = await new Promise<Blob | null>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error(`Card ${cardNumber} Blob 변환 시간 초과`));
                    }, 10000);

                    canvas.toBlob(
                        (blob) => {
                            clearTimeout(timeout);
                            resolve(blob);
                        },
                        'image/png',
                        0.95
                    );
                });

                if (blob) {
                    const filename = `카드_${String(cardNumber).padStart(2, '0')}.png`;
                    zip.file(filename, blob);
                    console.log(`Card ${cardNumber} added to ZIP`);
                } else {
                    console.warn(`Skipping card ${cardNumber} due to blob creation failure.`);
                }
            } catch (error) {
                console.error(`Error processing card ${cardNumber}:`, error);
                // Continue to next card
            }
            i++;
        }

        if (Object.keys(zip.files).length === 0) {
            throw new Error("모든 카드 이미지 변환에 실패했습니다.");
        }

        console.log(`ZIP 파일 생성 중... (${Object.keys(zip.files).length} 파일)`);
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            }
        });

        console.log(`ZIP created: ${zipBlob.size} bytes`);

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
