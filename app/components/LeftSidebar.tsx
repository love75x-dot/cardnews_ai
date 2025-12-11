'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RotateCcw, Maximize2 } from 'lucide-react';

interface LeftSidebarProps {
    onGenerate: () => void;
    isLoading: boolean;
    topic: string;
    onTopicChange: (value: string) => void;
    sceneCount: number;
    onSceneCountChange: (value: number) => void;
    aspectRatio: string;
    onAspectRatioChange: (value: string) => void;
}

export function LeftSidebar({
    onGenerate,
    isLoading,
    topic,
    onTopicChange,
    sceneCount,
    onSceneCountChange,
    aspectRatio,
    onAspectRatioChange,
}: LeftSidebarProps) {
    const characterCount = topic.length;

    const handleReset = () => {
        if (confirm('모든 입력 내용을 초기화하시겠습니까?')) {
            onTopicChange('');
            onSceneCountChange(4);
            onAspectRatioChange('1:1');
        }
    };

    return (
        <aside className="w-[380px] border-r border-[#27272a] bg-[#0b0c15] overflow-y-auto">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">AI 카드뉴스 생성기</h1>
                </div>

                {/* Reset Button */}
                <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full py-3 border-red-900/50 text-red-500 hover:bg-red-900/10 hover:text-red-400"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    전체 초기화
                </Button>

                {/* Content Input Section */}
                <div className="space-y-3">
                    {/* Section Header with Expand Button */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-blue-500">1. 콘텐츠 입력</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white h-7 px-2"
                        >
                            <Maximize2 className="w-3 h-3 mr-1" />
                            확대
                        </Button>
                    </div>

                    {/* Textarea with Character Counter */}
                    <div className="relative">
                        <Textarea
                            value={topic}
                            onChange={(e) => onTopicChange(e.target.value)}
                            placeholder="카드뉴스로 만들 주제나 대본을 입력하세요..."
                            className="min-h-[180px] bg-slate-800 border-none text-white resize-none focus-visible:ring-1 focus-visible:ring-blue-500"
                        />
                        {/* Character Counter */}
                        <div className="absolute bottom-2 right-3 text-xs text-gray-500">
                            {characterCount}자
                        </div>
                    </div>
                </div>

                {/* Scene Count */}
                <div className="space-y-2">
                    <Label htmlFor="scene-count" className="text-sm font-medium text-gray-300">
                        2. 장면 수
                    </Label>
                    <Input
                        id="scene-count"
                        type="number"
                        min="1"
                        max="10"
                        value={sceneCount}
                        onChange={(e) => onSceneCountChange(parseInt(e.target.value) || 1)}
                        className="bg-[#1a1b26] border-[#27272a] text-white"
                    />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                    <Label htmlFor="aspect-ratio" className="text-sm font-medium text-gray-300">
                        3. 이미지 비율
                    </Label>
                    <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
                        <SelectTrigger id="aspect-ratio" className="bg-[#1a1b26] border-[#27272a] text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1b26] border-[#27272a] text-white">
                            <SelectItem value="1:1">1:1 (정사각형)</SelectItem>
                            <SelectItem value="9:16">9:16 (세로)</SelectItem>
                            <SelectItem value="16:9">16:9 (가로)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Art Style */}
                <div className="space-y-2">
                    <Label htmlFor="art-style" className="text-sm font-medium text-gray-300">
                        4. 아트 스타일
                    </Label>
                    <Select defaultValue="modern">
                        <SelectTrigger id="art-style" className="bg-[#1a1b26] border-[#27272a] text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1b26] border-[#27272a] text-white">
                            <SelectItem value="modern">모던 미니멀</SelectItem>
                            <SelectItem value="flat">플랫 디자인</SelectItem>
                            <SelectItem value="3d">3D 렌더</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={onGenerate}
                    disabled={isLoading || !topic.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-base font-semibold"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            생성 중...
                        </>
                    ) : (
                        '카드 생성하기'
                    )}
                </Button>
            </div>
        </aside>
    );
}
