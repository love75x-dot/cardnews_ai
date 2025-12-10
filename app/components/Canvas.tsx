import React from 'react';
import { ImageIcon } from 'lucide-react';

interface CanvasProps {
    cards: Array<{ id: number; text: string }>;
}

export function Canvas({ cards }: CanvasProps) {
    const hasCards = cards.length > 0;

    return (
        <main className="flex-1 p-8 overflow-auto bg-[#050505]">
            {!hasCards ? (
                // Empty State
                <div className="h-full border border-[#27272a] rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                        {/* Large Image Icon */}
                        <div className="flex justify-center">
                            <ImageIcon className="w-24 h-24 text-gray-700" strokeWidth={1.5} />
                        </div>

                        {/* Placeholder Text */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-500">
                                생성된 카드뉴스가 없습니다
                            </h3>
                            <p className="text-sm text-gray-600">
                                좌측 패널에서 콘텐츠를 입력하고 생성 버튼을 눌러주세요
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // 2x2 Grid of Cards
                <div className="h-full flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-6 max-w-4xl">
                        {cards.map((card) => (
                            <div key={card.id} className="space-y-3">
                                {/* Placeholder Image */}
                                <div className="aspect-square bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-[#27272a] rounded-lg flex items-center justify-center">
                                    <div className="text-center space-y-2">
                                        <ImageIcon className="w-16 h-16 text-gray-600 mx-auto" strokeWidth={1.5} />
                                        <p className="text-sm text-gray-500">카드뉴스 {card.id}</p>
                                    </div>
                                </div>
                                {/* Caption Text */}
                                <p className="text-sm text-gray-300 text-center font-medium">
                                    {card.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
