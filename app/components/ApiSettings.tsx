'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiSettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (apiKey: string, projectId: string) => void;
}

const API_KEY_STORAGE_KEY = 'gemini_api_key';
const PROJECT_ID_STORAGE_KEY = 'gcp_project_id';

export function ApiSettings({ open, onOpenChange, onSave }: ApiSettingsProps) {
    const { toast } = useToast();
    const [apiKey, setApiKey] = useState('');
    const [projectId, setProjectId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            const savedProject = localStorage.getItem(PROJECT_ID_STORAGE_KEY);
            if (savedKey) {
                setApiKey(savedKey);
            }
            if (savedProject) {
                setProjectId(savedProject);
                setIsSaved(true);
            }
        }
    }, [open]);

    const handleSave = () => {
        if (!apiKey.trim()) {
            toast({
                title: "오류",
                description: "API Key를 입력해주세요.",
                variant: "destructive",
            });
            return;
        }

        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        localStorage.setItem(PROJECT_ID_STORAGE_KEY, projectId); // Keep for backward compatibility
        onSave(apiKey, projectId);
        setIsSaved(true);

        toast({
            title: "✅ 설정이 저장되었습니다",
            description: "AI 카드뉴스 생성을 시작할 수 있습니다.",
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        ⚙️ API 설정
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Privacy Notice */}
                    <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-blue-100">
                                    모든 API Key는 <strong>브라우저 LocalStorage</strong>에만 저장됩니다.
                                    서버나 데이터베이스에 전송되지 않으며, 귀하의 컴퓨터에만 안전하게 보관됩니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Model Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Text Analysis AI Card */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                ⭐ 텍스트 분석 AI
                            </h3>
                            <p className="text-base font-medium text-gray-200">Gemini 2.0 Flash</p>
                            <div className="inline-block">
                                <span className="text-xs font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded">
                                    ✨ 무료
                                </span>
                            </div>
                            <ul className="text-sm text-gray-400 space-y-1 mt-2">
                                <li>• 입력/출력: 무료</li>
                                <li>• 제한: 15 RPM</li>
                            </ul>
                        </div>

                        {/* Image Generation AI Card */}
                        <div className="bg-slate-800 border border-purple-900/50 rounded-lg p-4 space-y-2">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                🖌️ 이미지 생성 AI
                            </h3>
                            <p className="text-base font-medium text-gray-200">Pollinations AI</p>
                            <div className="inline-block">
                                <span className="text-xs font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded">
                                    ✨ 무료
                                </span>
                            </div>
                            <ul className="text-sm text-gray-400 space-y-1 mt-2">
                                <li>• 완전 무료</li>
                                <li>• API Key 불필요</li>
                                <li>• 고품질 이미지 생성</li>
                            </ul>
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="api-key" className="text-sm font-medium text-gray-200">
                                🔑 Gemini API Key
                            </Label>
                            {isSaved && (
                                <span className="text-xs font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded">
                                    ✅ 저장됨
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <Input
                                id="api-key"
                                type={showPassword ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="bg-slate-800 border-slate-700 text-white pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Gemini API Key 발급받기
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Info Notice */}
                    <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-green-500 text-xl flex-shrink-0">ℹ️</span>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-green-200">
                                    간단한 설정
                                </p>
                                <ul className="text-xs text-green-300/80 space-y-1">
                                    <li>• Gemini API Key만 있으면 사용 가능</li>
                                    <li>• 이미지는 무료 AI로 자동 생성</li>
                                    <li>• 추가 설정이나 결제 불필요</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        className="flex-1 bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700 hover:text-white"
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                        저장하기
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
