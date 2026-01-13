'use client';

import React, { useState } from 'react';
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
                                    onContextMenu={(e) => {
                                        if (selectedScene.imageUrl) {
                                            e.preventDefault();
                                            const fileName = `${topic}_${selectedScene.id}.png`;
                                            downloadImageDirect(selectedScene.imageUrl, fileName);
                                        }
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
                                        data-download-single
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        이 장면만 다운로드
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
