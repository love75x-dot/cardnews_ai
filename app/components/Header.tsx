import React from 'react';

export function Header() {
  return (
    <header className="h-[60px] border-b border-[#27272a] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white">AI 카드뉴스 메이커</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Model selection dropdown placeholder */}
        <div className="px-4 py-2 bg-white/5 border border-[#27272a] rounded-md text-sm text-white">
          고급 모드
        </div>

        {/* Right buttons placeholder */}
        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-[#27272a] rounded-md text-sm text-white transition-colors">
          내보내기
        </button>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm text-white transition-colors">
          저장하기
        </button>
      </div>
    </header>
  );
}
