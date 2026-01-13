'use client';

import React, { useState, useRef } from 'react';
import { Settings, Download, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CardData {
    id: number;
    headline: string;
    text: string;
    imagePrompt?: string;
    imageUrl?: string;
}

interface CanvasProps {
    cards: CardData[];
    selectedIndex: number;
    onSceneSelect: (index: number) => void;
    onSettingsClick: () => void;
    onManualClick: () => void;
    topic?: string;
    aspectRatio?: string;
}

export function Canvas({
    cards,
    selectedIndex,
    onSceneSelect,
    onSettingsClick,
    onManualClick,
    topic = '카드뉴스',
    aspectRatio = '1:1'
}: CanvasProps) {
    const hasCards = cards.length > 0;
    const selectedScene = hasCards ? cards[selectedIndex] : null;
    const [isDownloading, setIsDownloading] = useState(false);

    // 비율에 따른 이미지 크기 계산
    const getImageDimensions = (ratio: string): { width: number; height: number } => {
        const baseSize = 1024;
        switch (ratio) {
            case '1:1':
                return { width: baseSize, height: baseSize };
            case '9:16':
                return { width: Math.round(baseSize * 9 / 16), height: baseSize }; // 576x1024
            case '16:9':
                return { width: baseSize, height: Math.round(baseSize * 9 / 16) }; // 1024x576
            default:
                return { width: baseSize, height: baseSize };
        }
    };

    const imageDimensions = getImageDimensions(aspectRatio);

    // 이미지를 다운로드하는 간단한 함수
    const downloadImageDirect = (imageUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadScene = () => {
        if (!selectedScene || !selectedScene.imageUrl) {
            alert('다운로드할 이미지가 없습니다.');
            return;
        }

        const fileName = `${topic}_${selectedScene.id}.png`;
        downloadImageDirect(selectedScene.imageUrl, fileName);
    };

    const handleDownloadCardImage = async () => {
        if (!selectedScene || !selectedScene.imageUrl) {
            alert('다운로드할 이미지가 없습니다.');
            return;
        }

        setIsDownloading(true);
        try {
            console.log('🖼️ 텍스트가 포함된 이미지 생성 시작...');

            // 이미지 로드
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log('✅ 이미지 로드 완료:', img.width, 'x', img.height);
                    resolve(null);
                };
                img.onerror = () => {
                    console.error('❌ 이미지 로드 실패');
                    reject(new Error('이미지를 로드할 수 없습니다.'));
                };
                img.src = selectedScene.imageUrl!;
            });

            // Canvas 생성
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context를 생성할 수 없습니다.');

            // 사용자가 선택한 비율
            const canvasWidth = imageDimensions.width;
            const canvasHeight = imageDimensions.height;
            const targetRatio = canvasWidth / canvasHeight;
            
            // 원본 이미지 비율
            const originalWidth = img.naturalWidth;
            const originalHeight = img.naturalHeight;
            const originalRatio = originalWidth / originalHeight;
            
            // 이미지를 선택된 비율에 맞춰서 센터 크롭
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = originalWidth;
            let sourceHeight = originalHeight;
            
            if (originalRatio > targetRatio) {
                // 원본이 더 넓음 (좌우 자르기)
                sourceWidth = Math.round(originalHeight * targetRatio);
                sourceX = Math.round((originalWidth - sourceWidth) / 2);
            } else if (originalRatio < targetRatio) {
                // 원본이 더 좁음 (위아래 자르기)
                sourceHeight = Math.round(originalWidth / targetRatio);
                sourceY = Math.round((originalHeight - sourceHeight) / 2);
            }
            
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            console.log(`📏 Canvas 크기: ${canvasWidth}x${canvasHeight}, 비율: ${targetRatio.toFixed(2)}`);
            console.log(`🖼️ 원본 이미지: ${originalWidth}x${originalHeight}, 비율: ${originalRatio.toFixed(2)}`);
            console.log(`✂️ 크롭 영역: x=${sourceX}, y=${sourceY}, w=${sourceWidth}, h=${sourceHeight}`);

            // 배경색 설정
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // 이미지 크롭해서 그리기
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasWidth, canvasHeight);

            // 그라데이션 오버레이 (위에서 투명, 아래로 검은색)
            const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // 텍스트 설정
            const fontSize = Math.floor(canvasWidth / 12); // 반응형 폰트 크기
            ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'bottom';

            // 텍스트 레이아웃 (아래 부분)
            const padding = canvasWidth / 16;
            const maxWidth = canvasWidth - padding * 2;

            // 텍스트 줄바꿈 처리
            const lines = selectedScene.headline.split('\n');
            const lineHeight = fontSize * 1.4;
            let y = canvasHeight - padding - lineHeight * (lines.length - 1);

            // 그림자 처리
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            lines.forEach((line) => {
                // 긴 텍스트는 자동 줄바꿈
                const wrappedLines = wrapText(ctx, line, maxWidth, fontSize);
                wrappedLines.forEach((wrappedLine) => {
                    ctx.fillText(wrappedLine, padding, y);
                    y += lineHeight;
                });
            });

            console.log('✅ Canvas 텍스트 그리기 완료');

            // Blob으로 변환
            canvas.toBlob((blob) => {
                try {
                    if (!blob) {
                        throw new Error('Blob 생성 실패');
                    }

                    console.log('✅ Blob 생성 완료:', blob.size, 'bytes');

                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.href = url;
                    link.download = `${topic}_카드뉴스_${selectedScene.id}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    console.log('✅ 다운로드 완료');
                    alert('카드뉴스가 저장되었습니다.');
                } catch (blobError) {
                    console.error('❌ Blob 처리 오류:', blobError);
                    alert('이미지 저장에 실패했습니다.');
                } finally {
                    setIsDownloading(false);
                }
            }, 'image/png');
        } catch (error) {
            console.error('❌ 이미지 생성 실패:', error);
            if (error instanceof Error) {
                console.error('오류 메시지:', error.message);
            }
            setIsDownloading(false);
            alert('카드뉴스 생성 중 오류가 발생했습니다.');
        }
    };

    // 텍스트 줄바꿈 헬퍼 함수
    const wrapText = (
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number,
        fontSize: number
    ): string[] => {
        const words = text.split('');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine !== '') {
            lines.push(currentLine);
        }

        return lines.length > 0 ? lines : [text];
    };

    const handleDownloadAll = async () => {
        if (cards.length === 0) return;

        setIsDownloading(true);
        try {
            const JSZip = (await import('jszip')).default;
            const { saveAs } = await import('file-saver');
            
            const zip = new JSZip();
            let successCount = 0;
            let failedCount = 0;

            for (const card of cards) {
                try {
                    if (card.imageUrl) {
                        const response = await fetch(card.imageUrl);
                        const blob = await response.blob();
                        zip.file(`${topic}_${card.id}.png`, blob);
                        successCount++;
                    } else {
                        failedCount++;
                    }
                } catch (error) {
                    console.error(`카드 ${card.id} 다운로드 실패:`, error);
                    failedCount++;
                }
            }

            if (successCount === 0) {
                alert('다운로드할 이미지가 없습니다.');
                return;
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `${topic}_카드뉴스.zip`);
            
            const message = failedCount === 0 
                ? `${successCount}개 이미지가 다운로드되었습니다.`
                : `${successCount}개 이미지가 다운로드되었습니다. (실패: ${failedCount}개)`;
            alert(message);
        } catch (error) {
            console.error('ZIP 생성 중 오류:', error);
            alert('다운로드 중 오류가 발생했습니다.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col overflow-hidden bg-[#050505]">
            {/* Header with Download and Settings Buttons */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
                {/* Left: Download All Button (visible when cards exist) */}
                {hasCards && (
                    <Button
                        onClick={handleDownloadAll}
                        disabled={isDownloading}
                        variant="outline"
                        className="border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                다운로드 중...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                전체 다운로드
                            </>
                        )}
                    </Button>
                )}

                {/* Right: Manual and Settings Buttons */}
                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        onClick={onManualClick}
                        variant="ghost"
                        className="text-gray-300 hover:text-white hover:bg-white/5"
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        매뉴얼
                    </Button>

                    <Button
                        onClick={onSettingsClick}
                        variant="ghost"
                        className="text-gray-300 hover:text-white hover:bg-white/5"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        설정(API)
                    </Button>
                </div>
            </div>

            {/* 3-Column Editor Layout */}
            <div className="flex-1 flex overflow-hidden">
                {!hasCards ? (
                    // Empty State - Full Width
                    <div className="flex-1 flex items-center justify-center bg-slate-950">
                        <div className="text-center space-y-4">
                            <div className="text-6xl">📝</div>
                            <p className="text-xl text-gray-400">
                                콘텐츠를 입력하여 카드뉴스를 생성하세요
                            </p>
                            <p className="text-sm text-gray-500">
                                좌측 패널에서 주제와 장면 수를 입력하고<br />
                                &apos;카드 생성하기&apos; 버튼을 클릭하세요
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Left Panel - Scene List */}
                        <div className="w-60 border-r border-slate-800 overflow-y-auto bg-slate-900">
                            {cards.map((card, index) => (
                                <div
                                    key={card.id}
                                    onClick={() => onSceneSelect(index)}
                                    className={cn(
                                        "p-4 cursor-pointer hover:bg-slate-800/50 transition-colors border-b border-slate-800",
                                        selectedIndex === index && "bg-slate-800 ring-2 ring-blue-500 ring-inset"
                                    )}
                                >
                                    {/* Thumbnail */}
                                    <div 
                                        className="rounded-lg overflow-hidden mb-2 bg-slate-950"
                                        style={{
                                            aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`
                                        }}
                                    >
                                        {card.imageUrl && (
                                            <img
                                                src={card.imageUrl} // Using imageUrl for thumbnail
                                                alt={`Scene ${card.id}`}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Scene Info */}
                                    <div className="text-xs text-gray-400">Scene {card.id}</div>
                                    <div className="text-sm text-white line-clamp-2 mt-1">{card.headline}</div>
                                </div>
                            ))}
                        </div>

                        {/* Center Panel - Main Canvas */}
                        <div className="flex-1 bg-slate-950 flex items-center justify-center p-8 overflow-auto">
                            {selectedScene && (
                                <div
                                    style={{
                                        position: 'relative',
                                        maxWidth: '100%',
                                        width: `${Math.min(imageDimensions.width, 400)}px`,
                                        aspectRatio: imageDimensions.width / imageDimensions.height
                                    }}
                                >
                                    {/* Main Image */}
                                    {selectedScene.imageUrl ? (
                                        <img
                                            src={selectedScene.imageUrl}
                                            alt={selectedScene.headline}
                                            className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-2xl"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl" />
                                    )}

                                    {/* Text Overlay with Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent rounded-xl" />

                                    {/* Text Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8">
                                        <h2 className="text-white text-4xl font-bold leading-tight drop-shadow-lg">
                                            {selectedScene.headline}
                                        </h2>
                                    </div>

                                    {/* Page Number Badge */}
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center border border-white/30">
                                        <span className="text-white font-bold text-lg">{selectedScene.id}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Property Panel */}
                        <div className="w-[300px] border-l border-slate-800 overflow-y-auto p-6 bg-slate-900">
                            {selectedScene && (
                                <div className="space-y-6">
                                    {/* Script Section */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                                            📄 스크립트
                                        </h3>
                                        <div className="bg-slate-800 rounded-lg p-3 text-sm text-gray-300 leading-relaxed">
                                            {selectedScene.text}
                                        </div>
                                    </div>

                                    {/* Prompt Info */}
                                    {selectedScene.imagePrompt && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                                                🎨 프롬프트 정보
                                            </h3>
                                            <div className="bg-slate-800 rounded-lg p-3 text-xs text-gray-400 leading-relaxed">
                                                {selectedScene.imagePrompt}
                                            </div>
                                        </div>
                                    )}

                                    {/* Download Button */}
                                    <Button
                                        onClick={handleDownloadScene}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        이미지만 다운로드
                                    </Button>

                                    {/* Download Card Image Button */}
                                    <Button
                                        onClick={handleDownloadCardImage}
                                        disabled={isDownloading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                저장 중...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4 mr-2" />
                                                카드뉴스 저장
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
