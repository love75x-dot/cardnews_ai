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
 * Wait for all images in an element to load
 */
async function waitForImages(element: HTMLElement, timeout: number = 15000): Promise<void> {
    const images = element.querySelectorAll('img');
    if (images.length === 0) {
        console.log('No images found in element');
        return;
    }

    console.log(`Waiting for ${images.length} images to load...`);
    
    const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
        return new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Image timeout: ${img.src}`));
            }, timeout);

            if (img.complete) {
                clearTimeout(timer);
                resolve();
            } else {
                img.onload = () => {
                    clearTimeout(timer);
                    console.log(`✓ Image loaded: ${img.src?.substring(0, 50)}...`);
                    resolve();
                };
                img.onerror = () => {
                    clearTimeout(timer);
                    console.warn(`✗ Image failed to load: ${img.src}`);
                    resolve(); // 이미지 로드 실패해도 계속 진행
                };
            }
        });
    });

    try {
        await Promise.race([
            Promise.all(imagePromises),
            new Promise<void>((_, reject) => 
                setTimeout(() => reject(new Error('All images timeout')), timeout)
            )
        ]);
        console.log('All images loaded');
    } catch (error) {
        console.warn('Image loading warning:', error);
        // 일부 이미지 로드 실패해도 계속 진행
    }
}

/**
 * Convert element to canvas with proper CORS handling for external images
 */
async function elementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    try {
        console.log('Starting canvas conversion...');
        console.log(`Element dimensions: ${element.offsetWidth}x${element.offsetHeight}`);
        
        // 이미지 로드 대기
        await waitForImages(element, 15000);
        
        // 약간의 지연을 추가해서 이미지가 DOM에 제대로 렌더링되도록 함
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            imageTimeout: 30000,
            windowHeight: element.scrollHeight || element.offsetHeight,
            windowWidth: element.scrollWidth || element.offsetWidth,
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.querySelector('[data-card-download]') as HTMLElement;
                if (clonedElement) {
                    clonedElement.style.display = 'block';
                    clonedElement.style.visibility = 'visible';
                }
            }
        });
        
        console.log(`✓ Canvas created successfully: ${canvas.width}x${canvas.height}`);
        return canvas;
    } catch (error) {
        console.error('Canvas conversion error details:', error);
        // 폴백: 조금 더 단순한 설정으로 재시도
        try {
            console.log('Attempting fallback canvas conversion...');
            const fallbackCanvas = await html2canvas(element, {
                scale: 1,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 10000,
            });
            console.log('✓ Fallback canvas created successfully');
            return fallbackCanvas;
        } catch (fallbackError) {
            console.error('Fallback conversion also failed:', fallbackError);
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
        console.log(`\n=== Starting batch download for ${cardElements.length} cards ===`);

        let successCount = 0;
        let i = 0;
        
        for (const element of cardElements) {
            const cardNumber = i + 1;
            console.log(`\n📌 Processing card ${cardNumber}/${cardElements.length}...`);
            
            try {
                // 요소가 실제로 존재하는지 확인
                if (!element) {
                    console.warn(`⚠️ Card ${cardNumber} element is null`);
                    i++;
                    continue;
                }

                console.log(`✓ Element found, size: ${element.offsetWidth}x${element.offsetHeight}`);
                
                // 요소의 모든 이미지가 로드되었는지 확인
                console.log(`🖼️ Checking images in card ${cardNumber}...`);
                const images = element.querySelectorAll('img');
                console.log(`Found ${images.length} image(s)`);
                
                for (let j = 0; j < images.length; j++) {
                    const img = images[j] as HTMLImageElement;
                    console.log(`  Image ${j + 1}: src="${img.src}"`);
                    console.log(`  - Complete: ${img.complete}, Natural size: ${img.naturalWidth}x${img.naturalHeight}`);
                }
                
                const canvas = await elementToCanvas(element);
                console.log(`✓ Canvas created for card ${cardNumber}: ${canvas.width}x${canvas.height}`);
                
                const blob = await new Promise<Blob | null>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        console.warn(`⏱️ Card ${cardNumber} blob timeout`);
                        reject(new Error(`Card ${cardNumber} Blob 변환 시간 초과`));
                    }, 20000);

                    try {
                        canvas.toBlob(
                            (blob) => {
                                clearTimeout(timeout);
                                if (blob && blob.size > 0) {
                                    console.log(`✓ Blob created for card ${cardNumber}: ${blob.size} bytes`);
                                    resolve(blob);
                                } else {
                                    console.warn(`⚠️ Card ${cardNumber} blob is empty`);
                                    resolve(null);
                                }
                            },
                            'image/png',
                            0.85
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
                    console.log(`✓ Card ${cardNumber} added to ZIP`);
                } else {
                    console.warn(`⚠️ Card ${cardNumber}: blob is empty or null, skipping`);
                }
            } catch (error) {
                console.error(`❌ Error processing card ${cardNumber}:`, error instanceof Error ? error.message : String(error));
                // 계속 진행
            }
            i++;
        }

        console.log(`\n=== Batch processing complete ===`);
        console.log(`✓ Successfully processed ${successCount}/${cardElements.length} cards`);

        if (successCount === 0) {
            console.error('❌ No cards were successfully converted');
            throw new Error("카드를 이미지로 변환할 수 없었습니다. 페이지를 새로고침하고 다시 시도해주세요.");
        }

        console.log(`📦 Creating ZIP file with ${successCount} images...`);
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            }
        });

        console.log(`✓ ZIP created: ${zipBlob.size} bytes`);

        const zipFilename = `${sanitizeFilename(topic)}_카드뉴스.zip`;
        console.log(`💾 Saving as: ${zipFilename}`);
        saveAs(zipBlob, zipFilename);

        console.log(`✅ Download complete!\n`);

    } catch (error) {
        console.error('❌ Batch download error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('전체 다운로드 중 오류가 발생했습니다.');
    }
}
