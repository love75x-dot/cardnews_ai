'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
}

export function LeftSidebar({ onGenerate, isLoading }: LeftSidebarProps) {
    const [sceneCount, setSceneCount] = useState(8);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [resolution, setResolution] = useState('2K');
    const [artStyle, setArtStyle] = useState('modern-minimal');
    const [generationMode, setGenerationMode] = useState(false);
    const [referenceImage, setReferenceImage] = useState(false);

    return (
        <aside className="w-[360px] border-r border-[#27272a] flex flex-col bg-[#0b0c15]">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. Main Textarea */}
                <div className="space-y-2">
                    <Label className="text-sm text-gray-300">1. 주제 입력</Label>
                    <Textarea
                        placeholder="카드뉴스로 만들 주제나 대본을 입력하세요..."
                        className="min-h-[150px] bg-white/5 border-[#27272a] text-white placeholder:text-gray-500 resize-none focus-visible:ring-blue-500"
                    />
                </div>

                {/* 2. Generation Settings Header */}
                <div>
                    <h3 className="text-blue-400 font-semibold text-sm mb-4">2. 생성 설정</h3>

                    <div className="space-y-5">
                        {/* Scene Count */}
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-300">장면 수</Label>
                            <Input
                                type="number"
                                value={sceneCount}
                                onChange={(e) => setSceneCount(Number(e.target.value))}
                                className="bg-white/5 border-[#27272a] text-white focus-visible:ring-blue-500"
                                min={1}
                                max={20}
                            />
                        </div>

                        {/* Aspect Ratio & Resolution (side by side) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">비율</Label>
                                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                    <SelectTrigger className="bg-white/5 border-[#27272a] text-white focus:ring-blue-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1b26] border-[#27272a]">
                                        <SelectItem value="1:1" className="text-white focus:bg-white/10 focus:text-white">
                                            1:1 정사각
                                        </SelectItem>
                                        <SelectItem value="16:9" className="text-white focus:bg-white/10 focus:text-white">
                                            16:9 가로
                                        </SelectItem>
                                        <SelectItem value="9:16" className="text-white focus:bg-white/10 focus:text-white">
                                            9:16 세로
                                        </SelectItem>
                                        <SelectItem value="4:3" className="text-white focus:bg-white/10 focus:text-white">
                                            4:3 표준
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">해상도</Label>
                                <Select value={resolution} onValueChange={setResolution}>
                                    <SelectTrigger className="bg-white/5 border-[#27272a] text-white focus:ring-blue-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1b26] border-[#27272a]">
                                        <SelectItem value="2K" className="text-white focus:bg-white/10 focus:text-white">
                                            2K
                                        </SelectItem>
                                        <SelectItem value="4K" className="text-white focus:bg-white/10 focus:text-white">
                                            4K
                                        </SelectItem>
                                        <SelectItem value="HD" className="text-white focus:bg-white/10 focus:text-white">
                                            HD
                                        </SelectItem>
                                        <SelectItem value="FHD" className="text-white focus:bg-white/10 focus:text-white">
                                            FHD
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                                    <SelectItem value="vibrant" className="text-white focus:bg-white/10 focus:text-white">
                                        생동감 있는
                                    </SelectItem>
                                    <SelectItem value="professional" className="text-white focus:bg-white/10 focus:text-white">
                                        프로페셔널
                                    </SelectItem>
                                    <SelectItem value="playful" className="text-white focus:bg-white/10 focus:text-white">
                                        경쾌한
                                    </SelectItem>
                                    <SelectItem value="elegant" className="text-white focus:bg-white/10 focus:text-white">
                                        우아한
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Toggle Switches */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm text-gray-300">생성 모드</Label>
                                    <p className="text-xs text-gray-500">
                                        {generationMode ? '순차 생성' : '안정적 생성'}
                                    </p>
                                </div>
                                <Switch
                                    checked={generationMode}
                                    onCheckedChange={setGenerationMode}
                                    className="data-[state=checked]:bg-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm text-gray-300">참조 이미지</Label>
                                    <p className="text-xs text-gray-500">
                                        {referenceImage ? '사용' : '선택'}
                                    </p>
                                </div>
                                <Switch
                                    checked={referenceImage}
                                    onCheckedChange={setReferenceImage}
                                    className="data-[state=checked]:bg-blue-500"
                                />
                            </div>
                        </div>
                    </div>
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
                            장면 생성하기
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}
