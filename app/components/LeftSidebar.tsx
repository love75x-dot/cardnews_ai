'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';

interface LeftSidebarProps {
    onGenerate: () => void;
    isLoading: boolean;
    topic: string;
    onTopicChange: (topic: string) => void;
    sceneCount: number;
    onSceneCountChange: (count: number) => void;
    aspectRatio: string;
    onAspectRatioChange: (ratio: string) => void;
}

export function LeftSidebar({
    onGenerate,
    isLoading,
    topic,
    onTopicChange,
    sceneCount,
    onSceneCountChange,
    aspectRatio,
    onAspectRatioChange
}: LeftSidebarProps) {
    const [artStyle, setArtStyle] = React.useState('modern-minimal');

    return (
        <aside className="w-[380px] border-r border-[#27272a] flex flex-col bg-[#0b0c15]">
            {/* Title */}
            <div className="p-6 border-b border-[#27272a]">
                <h1 className="text-2xl font-bold text-white">AI 카드뉴스 생성기</h1>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Topic Input */}
                <div className="space-y-2">
                    <Label className="text-sm text-gray-300">주제 입력</Label>
                    <Textarea
                        value={topic}
                        onChange={(e) => onTopicChange(e.target.value)}
                        placeholder="카드뉴스로 만들 주제나 대본을 입력하세요..."
                        className="min-h-[150px] bg-white/5 border-[#27272a] text-white placeholder:text-gray-500 resize-none focus-visible:ring-blue-500"
                    />
                </div>

                {/* Scene Count */}
                <div className="space-y-2">
                    <Label className="text-sm text-gray-300">장면 수</Label>
                    <Input
                        type="number"
                        value={sceneCount}
                        onChange={(e) => onSceneCountChange(Number(e.target.value))}
                        className="bg-white/5 border-[#27272a] text-white focus-visible:ring-blue-500"
                        min={1}
                        max={10}
                    />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                    <Label className="text-sm text-gray-300">이미지 비율</Label>
                    <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
                        <SelectTrigger className="bg-white/5 border-[#27272a] text-white focus:ring-blue-500">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1b26] border-[#27272a]">
                            <SelectItem value="1:1" className="text-white focus:bg-white/10 focus:text-white">
                                1:1 정사각
                            </SelectItem>
                            <SelectItem value="9:16" className="text-white focus:bg-white/10 focus:text-white">
                                9:16 세로형
                            </SelectItem>
                            <SelectItem value="16:9" className="text-white focus:bg-white/10 focus:text-white">
                                16:9 가로형
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Art Style */}
                <div className="space-y-2">
                    <Label className="text-sm text-gray-300">아트 스타일</Label>
                    <Select value={artStyle} onValueChange={setArtStyle}>
                        <SelectTrigger className="bg-white/5 border-[#27272a] text-white focus:ring-blue-500">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1b26] border-[#27272a]">
                            <SelectItem value="modern-minimal" className="text-white focus:bg-white/10 focus:text-white">
                                모던 미니멀
                            </SelectItem>
                            <SelectItem value="watercolor" className="text-white focus:bg-white/10 focus:text-white">
                                수채화
                            </SelectItem>
                            <SelectItem value="3d-render" className="text-white focus:bg-white/10 focus:text-white">
                                3D 렌더링
                            </SelectItem>
                            <SelectItem value="illustration" className="text-white focus:bg-white/10 focus:text-white">
                                일러스트
                            </SelectItem>
                            <SelectItem value="realistic" className="text-white focus:bg-white/10 focus:text-white">
                                실사
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="p-6 border-t border-[#27272a]">
                <Button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            생성 중...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            생성하기
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}
