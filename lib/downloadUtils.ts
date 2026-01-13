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
        console.log('Starting canvas conversion...');
        
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true,
            imageTimeout: 30000,
            windowHeight: element.scrollHeight,
            windowWidth: element.scrollWidth,
            onclone: (clonedDoc) => {
                console.log('Cloned document ready, setting up images...');
                const images = clonedDoc.querySelectorAll('img');
                console.log(`Found ${images.length} images to process`);
                
                images.forEach((img, index) => {
                    if (img instanceof HTMLImageElement) {
                        img.crossOrigin = 'anonymous';
                        img.style.transform = 'none';
                        console.log(`Image ${index}: ${img.src?.substring(0, 50)}...`);
                    }
                });
            }
        });
        
        console.log(`Canvas created successfully: ${canvas.width}x${canvas.height}`);
        return canvas;
    } catch (error) {
        console.error('Canvas conversion error details:', error);
        // 에러가 발생해도 계속 진행하도록 시도
        try {
            const fallbackCanvas = await html2canvas(element, {
                scale: 1,
                useCORS: false,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 5000,
            });
            console.log('Using fallback canvas conversion');
            return fallbackCanvas;
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            throw new Error('이미지를 그려낼 수 없습니다. 페이지를 새로고침하고 다시 시도해주세요.');
        }
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
        
        // 요소 존재 확인
        if (!cardElement || !cardElement.parentElement) {
            throw new Error('카드 요소를 찾을 수 없습니다');
        }

        const canvas = await elementToCanvas(cardElement);
        console.log('Canvas created, converting to blob...');

        // Promise로 toBlob을 래핑
        const blob = await new Promise<Blob | null>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Blob 변환 시간 초과'));
            }, 15000);

            try {
                canvas.toBlob(
                    (blob) => {
                        clearTimeout(timeout);
                        resolve(blob);
                    },
                    'image/png',
                    0.85  // 품질 낮춤
                );
            } catch (e) {
                clearTimeout(timeout);
                reject(e);
            }
        });

        if (!blob || blob.size === 0) {
            throw new Error('이미지 생성 실패 - Blob이 비어있습니다');
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

        let successCount = 0;
        let i = 0;
        
        for (const element of cardElements) {
            const cardNumber = i + 1;
            console.log(`Processing card ${cardNumber}/${cardElements.length}...`);
            
            try {
                // 요소가 실제로 존재하는지 확인
                if (!element || !element.parentElement) {
                    console.warn(`Card ${cardNumber} element not found or not in DOM`);
                    i++;
                    continue;
                }

                console.log(`Card ${cardNumber} element size: ${element.offsetWidth}x${element.offsetHeight}`);
                
                const canvas = await elementToCanvas(element);
                console.log(`Canvas created for card ${cardNumber}`);
                
                const blob = await new Promise<Blob | null>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        console.warn(`Card ${cardNumber} blob timeout, retrying...`);
                        reject(new Error(`Card ${cardNumber} Blob 변환 시간 초과`));
                    }, 15000);

                    try {
                        canvas.toBlob(
                            (blob) => {
                                clearTimeout(timeout);
                                if (blob) {
                                    console.log(`Card ${cardNumber} blob created: ${blob.size} bytes`);
                                    resolve(blob);
                                } else {
                                    console.warn(`Card ${cardNumber} blob is null`);
                                    resolve(null);
                                }
                            },
                            'image/png',
                            0.85  // 품질 낮춤
                        );
                    } catch (e) {
                        clearTimeout(timeout);
                        reject(e);
                    }
                });

                if (blob && blob.size > 0) {
                    const filename = `카드_${String(cardNumber).padStart(2, '0')}.png`;
                    zip.file(filename, blob);
                    successCount++;
                    console.log(`✓ Card ${cardNumber} added to ZIP (${blob.size} bytes)`);
                } else {
                    console.warn(`Card ${cardNumber}: blob is empty or null`);
                }
            } catch (error) {
                console.error(`Error processing card ${cardNumber}:`, error);
                console.error(`Error details:`, error instanceof Error ? error.message : String(error));
                // 계속 진행
            }
            i++;
        }

        console.log(`Successfully processed ${successCount}/${cardElements.length} cards`);

        if (successCount === 0) {
            throw new Error("카드를 이미지로 변환할 수 없었습니다. 페이지를 새로고침하고 다시 시도해주세요.");
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
