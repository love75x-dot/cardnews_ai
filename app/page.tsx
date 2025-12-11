'use client';

import { useState, useEffect } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { Canvas } from './components/Canvas';
import { ApiSettings } from './components/ApiSettings';
import { generateCardNewsContent } from '@/lib/gemini';
import { generateCardImages } from '@/lib/imageGenerator';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<Array<{ id: number; text: string; imagePrompt?: string; imageUrl?: string }>>([]);
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Form state
  const [topic, setTopic] = useState('');
  const [sceneCount, setSceneCount] = useState(4);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Load API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, []);

  const handleGenerate = async () => {
    // Check if API key is set
    if (!apiKey) {
      alert('API 키를 먼저 설정해주세요');
      setIsSettingsOpen(true);
      return;
    }

    // Check if topic is provided
    if (!topic.trim()) {
      alert('주제를 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Generate card news content with Gemini API
      const generatedContent = await generateCardNewsContent(
        apiKey,
        topic,
        sceneCount
      );

      // Step 2: Generate images for each card
      const imageUrls = await generateCardImages(
        generatedContent,
        aspectRatio
      );

      // Step 3: Combine content with image URLs
      const newCards = generatedContent.map((content, index) => ({
        id: content.page,
        text: content.script,
        imagePrompt: content.imagePrompt,
        imageUrl: imageUrls[index],
      }));

      setCards(newCards);
    } catch (error) {
      console.error('Generation error:', error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('카드뉴스 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
  };

  return (
    <div className="h-screen flex bg-[#0b0c15] text-white overflow-hidden">
      {/* Left Sidebar - Settings Panel */}
      <LeftSidebar
        onGenerate={handleGenerate}
        isLoading={isLoading}
        topic={topic}
        onTopicChange={setTopic}
        sceneCount={sceneCount}
        onSceneCountChange={setSceneCount}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
      />

      {/* Main Canvas - Result Viewer */}
      <Canvas
        cards={cards}
        onSettingsClick={() => setIsSettingsOpen(true)}
        topic={topic}
      />

      {/* API Settings Modal */}
      <ApiSettings
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onSave={handleApiKeySave}
      />
    </div>
  );
}
