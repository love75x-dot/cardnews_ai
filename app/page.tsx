'use client';

import { useState, useEffect } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { Canvas } from './components/Canvas';
import { ApiSettings } from './components/ApiSettings';
import { ManualDialog } from './components/ManualDialog';
import { generateCardNewsContent } from '@/lib/gemini';
import { generateCardImages } from '@/lib/imageGenerator';
import { useToast } from '@/hooks/use-toast';

const API_KEY_STORAGE_KEY = 'gemini_api_key';
const PROJECT_ID_STORAGE_KEY = 'gcp_project_id';

export default function Home() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<Array<{ id: number; text: string; imagePrompt?: string; imageUrl?: string }>>([]);
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);

  // Form state
  const [topic, setTopic] = useState('');
  const [sceneCount, setSceneCount] = useState(4);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Load API key and Project ID from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      const savedProject = localStorage.getItem(PROJECT_ID_STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
      }
      if (savedProject) {
        setProjectId(savedProject);
      }
    }
  }, []);

  // Auto-select first scene when cards change
  useEffect(() => {
    if (cards.length > 0) {
      setSelectedSceneIndex(0);
    }
  }, [cards]);

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
    let hadFallback = false;

    try {
      // Step 1: Generate card news content with Gemini API
      const generatedContent = await generateCardNewsContent(
        apiKey,
        topic,
        sceneCount
      );

      // Step 2: Generate images with Imagen 3 (Vertex AI) or Pollinations fallback
      const imageResults = await generateCardImages(
        generatedContent,
        aspectRatio,
        apiKey,
        projectId,
        'us-central1' // Vertex AI location
      );

      // Check if any image used fallback
      hadFallback = imageResults.some(r => r.fallback);

      // Step 3: Combine content with image URLs
      const newCards = generatedContent.map((content, index) => ({
        id: content.page,
        text: content.script,
        imagePrompt: content.imagePrompt,
        imageUrl: imageResults[index].url,
      }));

      setCards(newCards);

      // Show fallback notification if needed
      if (hadFallback) {
        toast({
          title: "무료 모델로 생성됨",
          description: "고급 모델 권한이 없어 무료 모델(Pollinations AI)로 생성되었습니다.",
          variant: "default",
        });
      }
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

  const handleApiKeySave = (key: string, project: string) => {
    setApiKey(key);
    setProjectId(project);
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

      {/* Main Canvas - 3-Panel Editor */}
      <Canvas
        cards={cards}
        selectedIndex={selectedSceneIndex}
        onSceneSelect={setSelectedSceneIndex}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onManualClick={() => setIsManualOpen(true)}
        topic={topic}
      />

      {/* API Settings Modal */}
      <ApiSettings
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onSave={handleApiKeySave}
      />

      {/* Manual Dialog */}
      <ManualDialog
        open={isManualOpen}
        onOpenChange={setIsManualOpen}
      />
    </div>
  );
}
