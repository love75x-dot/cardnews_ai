'use client';

import React from 'react';

interface ProgressBarProps {
    stage: number; // 0-4
    elapsedTime: number; // seconds
}

const STAGES = [
    { percent: 0, message: '🧠 콘텐츠 기획 중...', detail: 'Gemini 2.0 Flash가 대본 작성' },
    { percent: 30, message: '🎨 이미지 생성 요청 중...', detail: 'Google Imagen 3 연결' },
    { percent: 50, message: '🖌️ 고화질 렌더링 진행 중...', detail: '약 10초 소요 예정' },
    { percent: 80, message: '✨ 텍스트 오버레이 합성 중...', detail: '' },
    { percent: 100, message: '✅ 완료!', detail: '' }
];

export function ProgressBar({ stage, elapsedTime }: ProgressBarProps) {
    const currentStage = Math.min(stage, STAGES.length - 1);
    const current = STAGES[currentStage];

    return (
        <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="absolute h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${current.percent}%` }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
            </div>

            {/* Status Text */}
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-white font-medium text-sm">{current.message}</p>
                    {current.detail && (
                        <p className="text-gray-400 text-xs mt-0.5">{current.detail}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-mono">
                        {elapsedTime}s 경과
                    </span>
                    <span className="text-purple-400 text-sm font-bold">
                        {current.percent}%
                    </span>
                </div>
            </div>
        </div>
    );
}
