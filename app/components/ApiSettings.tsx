'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

interface ApiSettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (apiKey: string) => void;
}

export function ApiSettings({ open, onOpenChange, onSave }: ApiSettingsProps) {
    const [apiKey, setApiKey] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Load API key from localStorage when modal opens
    useEffect(() => {
        if (open && typeof window !== 'undefined') {
            const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            if (savedKey) {
                setApiKey(savedKey);
            }
        }
    }, [open]);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
            onSave(apiKey.trim());
            onOpenChange(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1a1b26] border-[#27272a] text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-white">API 설정</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Gemini API 키를 입력하세요. 키는 브라우저에만 저장됩니다.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key" className="text-gray-300">
                            Gemini API Key
                        </Label>
                        <div className="relative">
                            <Input
                                id="api-key"
                                type={showPassword ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="bg-white/5 border-[#27272a] text-white placeholder:text-gray-500 pr-10 focus-visible:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            API 키는 localStorage에만 저장되며 서버로 전송되지 않습니다.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                        저장
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
