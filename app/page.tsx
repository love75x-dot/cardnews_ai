'use client';

import { useState } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { Canvas } from './components/Canvas';
import { RightToolbar } from './components/RightToolbar';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<Array<{ id: number; text: string }>>([]);

  const handleGenerate = () => {
    setIsLoading(true);

    // Simulate 3-second generation
    setTimeout(() => {
      setCards([
        { id: 1, text: '카드뉴스 제목: AI 기술의 미래' },
        { id: 2, text: '인공지능이 바꾸는 세상' },
        { id: 3, text: '챗봇부터 자율주행까지' },
        { id: 4, text: '우리 삶 속의 AI 혁명' },
      ]);
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0c15] text-white">
      {/* Header */}
      <Header />

      {/* Main content area with 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Settings Panel */}
        <LeftSidebar onGenerate={handleGenerate} isLoading={isLoading} />

        {/* Center Canvas - Main Workspace */}
        <Canvas cards={cards} />

        {/* Right Toolbar - Icon-based tools */}
        <RightToolbar />
      </div>
    </div>
  );
}
