'use client';

import React, { useRef, useState } from 'react';
import { Settings, Download, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadCard, downloadAllCards } from '@/lib/downloadUtils';
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
}

export function Canvas({
    cards,
    selectedIndex,
    onSceneSelect,
    onSettingsClick,
    onManualClick,
    topic = '카드뉴스'
}: CanvasProps) {
    const hasCards = cards.length > 0;
    const selectedScene = hasCards ? cards[selectedIndex] : null;
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadScene = async () => {
        if (!selectedScene) return;
        const cardElement = cardRefs.current[selectedIndex];
        if (!cardElement) return;

        try {
            const downloadButton = document.querySelector('[data-download-single]') as HTMLButtonElement;
            if (downloadButton) {
                downloadButton.disabled = true;
            }
            await downloadCard(cardElement, selectedScene.id, topic);
        } catch (error) {
            console.error('Download error:', error);
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('다운로드 중 오류가 발생했습니다.');
            }
        } finally {
            const downloadButton = document.querySelector('[data-download-single]') as HTMLButtonElement;
            if (downloadButton) {
                downloadButton.disabled = false;
            }
        }
    };

    const handleDownloadAll = async () => {
        // The refs are populated by the hidden off-screen renderer
        // so we should have all card elements here.
        const validCards = cardRefs.current.filter((el): el is HTMLElement => el !== null);
        if (validCards.length === 0) return;

        setIsDownloading(true);
        try {
            await downloadAllCards(validCards, topic);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col overflow-hidden bg-[#050505]">
            {/* Hidden container for rendering all cards for download */}
            <div 
                style={{ 
                    position: 'fixed',
                    left: '-9999px',
                    top: '-9999px',
                    width: '1024px',
                    visibility: 'hidden',
                    pointerEvents: 'none'
                }}
            >
                {cards.map((card, index) => (
                    <div
                        key={`download-${card.id}`}
                        ref={(el) => { cardRefs.current[index] = el; }}
                        style={{ 
                            width: '1024px', 
                            height: '1024px',
                            position: 'relative',
                            display: 'block',
                            margin: '0',
                            padding: '0'
                        }}
                    >
                        {/* Main Image */}
                        {card.imageUrl ? (
                            <img
                                src={card.imageUrl}
                                alt={card.headline}
                                crossOrigin="anonymous"
                                style={{
                                    position: 'absolute',
                                    inset: '0',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                            />
                        ) : (
                            <div style={{
                                position: 'absolute',
                                inset: '0',
                                background: 'linear-gradient(to bottom right, rgba(88, 28, 135, 0.3), rgba(30, 27, 102, 0.3))'
                            }} />
                        )}

                        {/* Text Overlay with Gradient */}
                        <div style={{
                            position: 'absolute',
                            inset: '0',
                            background: 'linear-gradient(to top, black, rgba(0, 0, 0, 0.6), transparent)'
                        }} />

                        {/* Text Content */}
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            padding: '64px'
                        }}>
                            <h2 style={{
                                color: 'white',
                                fontSize: '48px',
                                fontWeight: 'bold',
                                lineHeight: '1.2',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                                margin: '0'
                            }}>
                                {card.headline}
                            </h2>
                        </div>

                        {/* Page Number Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '32px',
                            right: '32px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '50%',
                            width: '80px',
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            <span style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '32px'
                            }}>
                                {card.id}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
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
                                    <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-slate-950">
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
                                    className="relative max-w-4xl w-full aspect-square"
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
