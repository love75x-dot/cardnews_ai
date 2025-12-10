import React from 'react';
import { Save, Download, MousePointer2 } from 'lucide-react';

export function RightToolbar() {
    return (
        <aside className="w-[60px] border-l border-[#27272a] flex flex-col justify-between py-6 bg-[#0b0c15]">
            {/* Top Icons */}
            <div className="flex flex-col items-center gap-3">
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    title="저장"
                >
                    <Save size={20} />
                </button>
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    title="다운로드"
                >
                    <Download size={20} />
                </button>
            </div>

            {/* Bottom Section - Mouse Cursor Icon with Tooltip */}
            <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600">
                        <MousePointer2 size={20} />
                    </div>
                    {/* Tooltip Text */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <div className="bg-gray-900 text-gray-300 text-xs px-3 py-2 rounded-md border border-[#27272a]">
                            다운로드할 장면을 선택해주세요
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
