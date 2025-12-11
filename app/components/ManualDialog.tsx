'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ManualDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManualDialog({ open, onOpenChange }: ManualDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[#1a1b26] border-[#27272a] text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        📘 사용 매뉴얼 & 가격 안내
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        AI 카드뉴스 생성기를 효과적으로 사용하는 방법을 안내합니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Section 1: Pricing Info */}
                    <section className="space-y-3">
                        <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                            💲 AI 모델별 가격 정보
                        </h3>

                        <div className="space-y-4 pl-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-blue-300">📄 텍스트 분석 AI</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm pl-4">
                                    <li><strong>Gemini 2.0 Flash</strong> (Google의 최신 무료 모델)</li>
                                    <li>상태: ✨ <span className="text-green-400 font-semibold">무료</span></li>
                                    <li>입력/출력: 무료 / 제한: 15 RPM (무료 Tier)</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-blue-300">🎨 이미지 생성 AI</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm pl-4">
                                    <li><strong>Nano Banana Pro</strong> (Gemini 3 Pro 기반)</li>
                                    <li>상태: <span className="text-yellow-400 font-semibold">유료 (결제 필요)</span></li>
                                    <li>가격: 2K($0.134/장), 4K($0.24/장)</li>
                                    <li>특징: ✨ 텍스트 렌더링 지원, 참조 이미지 최대 14개</li>
                                </ul>
                            </div>

                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                                <p className="text-sm font-semibold text-purple-300 mb-2">💰 예상 비용 계산 (8장면 기준)</p>
                                <ul className="text-sm text-gray-300 space-y-1 pl-4">
                                    <li>• 2K 해상도: 약 $1.07 (약 1,440원)</li>
                                    <li>• 4K 해상도: 약 $1.92 (약 2,560원)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-[#27272a]" />

                    {/* Section 2: Usage Guide */}
                    <section className="space-y-3">
                        <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                            💡 사용 방법
                        </h3>

                        <div className="space-y-4 pl-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-blue-300">1️⃣ AI 설정 (최초 1회)</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm pl-4">
                                    <li>상단 <strong>[⚙️ AI 설정]</strong> 버튼 클릭</li>
                                    <li>사용할 AI 모델 선택 (텍스트 분석 + 이미지 생성)</li>
                                    <li>API Key 입력 (브라우저 LocalStorage에만 저장됨)</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-blue-300">2️⃣ 콘텐츠 입력</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm pl-4">
                                    <li>좌측 콘텐츠 입력 영역에 대본 작성</li>
                                    <li>장면 수: 1~10개 선택 (기본값 8개)</li>
                                    <li>비율: 1:1 (정사각), 9:16 (세로), 16:9 (가로)</li>
                                    <li>아트 스타일: 모던 미니멀, 플랫 디자인, 3D 렌더 등</li>
                                </ul>

                                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mt-2">
                                    <p className="text-sm font-semibold text-blue-300 mb-1">📺 유튜브 대본 활용 팁</p>
                                    <ul className="text-xs text-gray-300 space-y-1 pl-4">
                                        <li>• Chrome 확장 프로그램 &apos;YouTube Summary with ChatGPT&apos; 설치</li>
                                        <li>• 유튜브 영상에서 대본 추출 → 복사</li>
                                        <li>• 생성된 대본을 콘텐츠 입력란에 붙여넣기</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-blue-300">3️⃣ 참조 이미지 (선택사항)</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm pl-4">
                                    <li>참조 이미지 토글 활성화</li>
                                    <li>참조 모드 선택: 스타일 전이, 캐릭터 일관성 유지 등</li>
                                    <li>최대 14개 이미지 업로드 가능</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-blue-300">4️⃣ 생성</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm pl-4">
                                    <li><strong>[장면 생성하기]</strong> 버튼 클릭</li>
                                    <li>AI가 자동으로 텍스트 분석 → 이미지 생성 (병렬 처리로 빠름!)</li>
                                    <li>이미지 내 텍스트 자동 렌더링 포함</li>
                                    <li>중앙 타임라인에서 원하는 씬 선택하여 미리보기</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-blue-300">5️⃣ 다운로드</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm pl-4">
                                    <li>개별 다운로드: 우측 하단 [이 장면 다운로드]</li>
                                    <li>전체 다운로드: 상단 [전체 다운로드] → ZIP 파일로 저장</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-[#27272a]" />

                    {/* Section 3: Tips */}
                    <section className="space-y-3">
                        <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                            📍 유용한 팁
                        </h3>

                        <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm pl-4">
                            <li><strong>고품질 이미지:</strong> Nano Banana Pro (Gemini 3 Pro)는 2K/4K 해상도 지원</li>
                            <li><strong>빠른 생성:</strong> 일괄 모드 활성화 시 모든 이미지 동시 생성 (75% 빠름)</li>
                            <li><strong>텍스트 렌더링:</strong> 이미지 내 한글 텍스트 자동 렌더링 가능</li>
                            <li><strong>개인정보 보호:</strong> 모든 API Key는 브라우저에만 저장되며 서버 전송 없음</li>
                        </ul>
                    </section>
                </div>

                {/* Footer Action */}
                <div className="flex justify-center pt-4 border-t border-[#27272a]">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
                    >
                        확인
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
