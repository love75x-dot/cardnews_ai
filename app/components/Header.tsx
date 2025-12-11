import React from 'react';

export function Header() {
  return (
    <header className="h-[60px] border-b border-[#27272a] flex items-center justify-between px-6 bg-gradient-to-r from-[#0b0c15] via-[#0f1018] to-[#0b0c15]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-bold text-white">카드뉴스 생성기</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Model Information Display */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300 hover:bg-blue-500/20 transition-colors">
            <span className="font-medium">텍스트:</span> <span className="font-semibold">Gemini 2.0</span>
          </div>
          <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-300 hover:bg-purple-500/20 transition-colors">
            <span className="font-medium">이미지:</span> <span className="font-semibold">Imagen 3</span>
          </div>
        </div>

        {/* Right buttons */}
        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-[#27272a] rounded-lg text-sm text-white transition-colors">
          내보내기
        </button>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-sm text-white font-medium transition-all shadow-lg shadow-blue-500/20">
          저장하기
        </button>
      </div>
    </header>
  );
}
