import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Download a single card as PNG image
 * 
 * @param cardElement - HTML element to capture
 * @param cardNumber - Card number for filename
 * @param topic - Topic name for filename
 */
export async function downloadCard(
    cardElement: HTMLElement,
    cardNumber: number,
    topic: string
): Promise<void> {
    try {
        // Convert DOM element to canvas
        const canvas = await html2canvas(cardElement, {
            backgroundColor: '#000000',
            scale: 2, // 2x resolution for high quality
            logging: false,
            useCORS: true, // Allow cross-origin images
            allowTaint: true,
        });

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
            if (blob) {
                const fileName = `${sanitizeFileName(topic)}_카드${cardNumber}.png`;
                saveAs(blob, fileName);
            }
        }, 'image/png');
    } catch (error) {
        console.error('Card download error:', error);
        throw new Error('카드 다운로드 중 오류가 발생했습니다.');
    }
}

/**
 * Download all cards as a ZIP file
 * 
 * @param cardElements - Array of HTML elements to capture
 * @param topic - Topic name for filename
 */
export async function downloadAllCards(
    cardElements: HTMLElement[],
    topic: string
): Promise<void> {
    try {
        const zip = new JSZip();
        const promises: Promise<void>[] = [];

        // Convert each card to image and add to ZIP
        for (let i = 0; i < cardElements.length; i++) {
            const promise = html2canvas(cardElements[i], {
                backgroundColor: '#000000',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
            }).then((canvas) => {
                return new Promise<void>((resolve) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const fileName = `카드${i + 1}.png`;
                            zip.file(fileName, blob);
                        }
                        resolve();
                    }, 'image/png');
                });
            });

            promises.push(promise);
        }

        // Wait for all conversions to complete
        await Promise.all(promises);

        // Generate ZIP file and download
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipFileName = `${sanitizeFileName(topic)}_카드뉴스.zip`;
        saveAs(zipBlob, zipFileName);
    } catch (error) {
        console.error('Batch download error:', error);
        throw new Error('전체 다운로드 중 오류가 발생했습니다.');
    }
}

/**
 * Sanitize filename for safe file saving
 * Removes invalid characters and limits length
 */
function sanitizeFileName(name: string): string {
    return name
        .trim()
        .replace(/[<>:"/\\|?*]/g, '_') // Remove invalid file system characters
        .substring(0, 50); // Limit to 50 characters
}
