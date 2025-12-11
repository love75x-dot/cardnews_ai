'use client';

import React, { useRef, useState } from 'react';
import { Settings, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadCard, downloadAllCards } from '@/lib/downloadUtils';

interface CanvasProps {
    cards: Array<{
        id: number;
        text: string;
        imagePrompt?: string;
        imageUrl?: string;
    }>;
    onSettingsClick: () => void;
    onManualClick: () => void;
    topic?: string;
}

export function Canvas({ cards, onSettingsClick, onManualClick, topic = '카드뉴스' }: CanvasProps) {
    const hasCards = cards.length > 0;
    const cardRefs = useRef<(HTMLElement | null)[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadCard = async (index: number) => {
        const cardElement = cardRefs.current[index];
        if (!cardElement) return;

        try {
            await downloadCard(cardElement, index + 1, topic);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        }
    };

    const handleDownloadAll = async () => {
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
            {/* Header with Download and Settings Buttons */}
            <div className="h-16 border-b border-[#27272a] flex items-center justify-between px-6">
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
                        📘 매뉴얼
                    </Button>

                    <Button
                        onClick={onSettingsClick}
                        variant="ghost"
                        className="text-gray-300 hover:text-white hover:bg-white/5"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        ⚙️ 설정(API)
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-auto">
                {!hasCards ? (
                    // Empty State
                    <div className="h-full border border-[#27272a] rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <p className="text-base text-gray-500">
                                좌측 패널에서 콘텐츠를 입력하고 생성 버튼을 눌러주세요
                            </p>
                        </div>
                    </div>
                ) : (
                    // Cards Grid with Images
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {cards.map((card, index) => (
                                <div
                                    key={card.id}
                                    ref={(el) => { cardRefs.current[index] = el; }}
                                    className="relative aspect-square rounded-xl overflow-hidden shadow-2xl group hover:shadow-purple-500/20 transition-all duration-300"
                                >
                                    {/* Background Image */}
                                    {card.imageUrl ? (
                                        <img
                                            src={card.imageUrl}
                                            alt={card.text}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30" />
                                    )}

                                    {/* Gradient Overlay for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                                    {/* Text Overlay */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                                        <h2 className="text-white text-3xl font-bold leading-tight drop-shadow-lg">
                                            {card.text}
                                        </h2>
                                    </div>

                                    {/* Page Number Badge */}
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center border border-white/30">
                                        <span className="text-white font-bold text-lg">{card.id}</span>
                                    </div>

                                    {/* Download Button - Visible on Hover */}
                                    <button
                                        onClick={() => handleDownloadCard(index)}
                                        className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 border border-white/30"
                                        aria-label={`카드 ${card.id} 다운로드`}
                                        title="이 카드 다운로드"
                                    >
                                        <Download className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
