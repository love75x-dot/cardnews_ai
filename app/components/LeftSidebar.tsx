'use client';

import React, { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, RotateCcw, Maximize2, Wand2, Upload, X } from 'lucide-react';

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
    const [resolution, setResolution] = useState('2k');
    const [artStyle, setArtStyle] = useState('modern');
    const [sequentialMode, setSequentialMode] = useState(false);
    const [referenceEnabled, setReferenceEnabled] = useState(false);
    const [referenceMode, setReferenceMode] = useState('style');
    const [referenceImages, setReferenceImages] = useState<Array<{ id: string; url: string; file: File }>>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleReset = () => {
        if (confirm('모든 입력 내용을 초기화하시겠습니까?')) {
            onTopicChange('');
            onSceneCountChange(4);
            onAspectRatioChange('1:1');
            setResolution('2k');
            setArtStyle('modern');
            setSequentialMode(false);
            setReferenceEnabled(false);
            setReferenceMode('style');
            setReferenceImages([]);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages = Array.from(files).slice(0, 14 - referenceImages.length).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            file
        }));

        setReferenceImages(prev => [...prev, ...newImages].slice(0, 14));
    };

    const handleRemoveImage = (id: string) => {
        setReferenceImages(prev => {
            const image = prev.find(img => img.id === id);
            if (image) {
                URL.revokeObjectURL(image.url);
            }
            return prev.filter(img => img.id !== id);
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
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

                {/* Generation Settings Section */}
                <div className="space-y-4">
                    <h2 className="text-base font-bold text-blue-500">2. ⚙️ 생성 설정</h2>

                    {/* Scene Count */}
                    <div className="space-y-2">
                        <Label htmlFor="scene-count" className="text-sm font-medium text-gray-300">
                            장면 수
                        </Label>
                        <Input
                            id="scene-count"
                            type="number"
                            min="1"
                            max="10"
                            value={sceneCount}
                            onChange={(e) => onSceneCountChange(parseInt(e.target.value) || 1)}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                    </div>

                    {/* Aspect Ratio & Resolution - 2 Column Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Aspect Ratio */}
                        <div className="space-y-2">
                            <Label htmlFor="aspect-ratio" className="text-sm font-medium text-gray-300">
                                비율
                            </Label>
                            <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
                                <SelectTrigger id="aspect-ratio" className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1b26] border-[#27272a] text-white">
                                    <SelectItem value="1:1">1:1 정사각</SelectItem>
                                    <SelectItem value="9:16">9:16 세로</SelectItem>
                                    <SelectItem value="16:9">16:9 가로</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Resolution */}
                        <div className="space-y-2">
                            <Label htmlFor="resolution" className="text-sm font-medium text-gray-300">
                                해상도
                            </Label>
                            <Select value={resolution} onValueChange={setResolution}>
                                <SelectTrigger id="resolution" className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1b26] border-[#27272a] text-white">
                                    <SelectItem value="2k">2K (기본)</SelectItem>
                                    <SelectItem value="4k">4K (고화질)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Art Style & Mode Section */}
                <div className="space-y-4">
                    <h2 className="text-base font-bold text-blue-500">3. 🎨 아트 스타일 & 모드</h2>

                    {/* Art Style */}
                    <div className="space-y-2">
                        <Label htmlFor="art-style" className="text-sm font-medium text-gray-300">
                            아트 스타일
                        </Label>
                        <Select value={artStyle} onValueChange={setArtStyle}>
                            <SelectTrigger id="art-style" className="bg-slate-800 border-slate-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1b26] border-[#27272a] text-white">
                                <SelectItem value="modern">모던 미니멀</SelectItem>
                                <SelectItem value="flat">플랫 디자인</SelectItem>
                                <SelectItem value="3d">3D 렌더</SelectItem>
                                <SelectItem value="watercolor">수채화</SelectItem>
                                <SelectItem value="illustration">일러스트</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Generation Mode Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <div className="flex-1">
                            <Label htmlFor="sequential-mode" className="text-sm font-medium text-gray-300 cursor-pointer">
                                생성 모드
                            </Label>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {sequentialMode ? '순차 (안정적)' : '병렬 (빠름)'}
                            </p>
                        </div>
                        <Switch
                            id="sequential-mode"
                            checked={sequentialMode}
                            onCheckedChange={setSequentialMode}
                        />
                    </div>
                </div>

                {/* AI Text Rendering Info Box */}
                <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <Wand2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-purple-400 mb-1">
                                🔮 AI 텍스트 렌더링
                            </h3>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                Nano Banana Pro가 이미지 내 텍스트를 자동 생성합니다
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reference Image Section */}
                <div className="space-y-3">
                    {/* Header with Toggle */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-blue-500">4. 🖼️ 참조 이미지 (선택)</h2>
                        <Switch
                            id="reference-toggle"
                            checked={referenceEnabled}
                            onCheckedChange={setReferenceEnabled}
                            className="data-[state=checked]:bg-green-600"
                        />
                    </div>

                    {/* Reference Content (shown when enabled) */}
                    {referenceEnabled && (
                        <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
                            {/* Reference Mode */}
                            <div className="space-y-2">
                                <Label htmlFor="reference-mode" className="text-sm font-medium text-gray-300">
                                    참조 모드
                                </Label>
                                <Select value={referenceMode} onValueChange={setReferenceMode}>
                                    <SelectTrigger id="reference-mode" className="bg-slate-800 border-slate-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1b26] border-[#27272a] text-white">
                                        <SelectItem value="style">스타일 전이</SelectItem>
                                        <SelectItem value="character">캐릭터 일관성</SelectItem>
                                        <SelectItem value="composition">구도 참조</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Upload Button */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <Button
                                onClick={handleUploadClick}
                                variant="outline"
                                className="w-full border-green-600/50 text-green-500 bg-green-900/10 hover:bg-green-900/20 hover:text-green-400"
                                disabled={referenceImages.length >= 14}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                📤 이미지 선택 (최대 14개)
                                {referenceImages.length > 0 && ` - ${referenceImages.length}/14`}
                            </Button>

                            {/* Thumbnail Preview */}
                            {referenceImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {referenceImages.map((image) => (
                                        <div key={image.id} className="relative aspect-square group">
                                            <img
                                                src={image.url}
                                                alt="Reference"
                                                className="w-full h-full object-cover rounded-lg border border-slate-700"
                                            />
                                            <button
                                                onClick={() => handleRemoveImage(image.id)}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
