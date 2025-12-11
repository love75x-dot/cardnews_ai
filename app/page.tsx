'use client';

import { useState, useEffect, useRef } from 'react';
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

  // Progress tracking
  const [progressStage, setProgressStage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Advanced parameters
  const [resolution, setResolution] = useState('2k');
  const [artStyle, setArtStyle] = useState('modern');
  const [referenceEnabled, setReferenceEnabled] = useState(false);
  const [referenceMode, setReferenceMode] = useState('style');
  const [referenceImages, setReferenceImages] = useState<Array<{ id: string; url: string; file: File; base64?: string }>>([]);

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

  // Timer functions
  const startTimer = () => {
    setElapsedTime(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleGenerate = async () => {
    // Check if API key is set
    if (!apiKey) {
      toast({
        title: "❌ API 키 필요",
        description: "API 키를 먼저 설정해주세요",
        variant: "destructive",
      });
      setIsSettingsOpen(true);
      return;
    }

    // Check if topic is provided
    if (!topic.trim()) {
      toast({
        title: "❌ 주제 입력 필요",
        description: "주제를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    startTimer();
    let hadFallback = false;

    try {
      // Stage 1: Content Planning (0%)
      setProgressStage(0);
      const generatedContent = await generateCardNewsContent(
        apiKey,
        topic,
        sceneCount
      );

      // Stage 2: Image Generation Request (30%)
      setProgressStage(1);
      toast({
        title: "🎨 이미지 생성 시작",
        description: `${generatedContent.length}개 이미지를 ${resolution === '4k' ? '4K 고화질로' : '2K로'} 생성합니다`,
      });

      // Prepare reference images if enabled
      const refImages = referenceEnabled && referenceImages.length > 0
        ? referenceImages.map(img => ({
          base64: img.base64 || '',
          mode: referenceMode
        }))
        : undefined;

      // Stage 3: Rendering (50%)
      setProgressStage(2);
      const imageResults = await generateCardImages(
        generatedContent,
        aspectRatio,
        apiKey,
        projectId,
        'us-central1',
        resolution,
        refImages
      );

      // Check if any image used fallback
      hadFallback = imageResults.some(r => r.fallback);

      // Stage 4: Text Overlay (80%)
      setProgressStage(3);
      const newCards = generatedContent.map((content, index) => ({
        id: content.page,
        text: content.script,
        imagePrompt: content.imagePrompt,
        imageUrl: imageResults[index].url,
      }));

      // Stage 5: Complete (100%)
      setProgressStage(4);
      setCards(newCards);

      // Show completion notification
      toast({
        title: "✅ 생성 완료!",
        description: `${newCards.length}개의 카드가 ${elapsedTime}초 만에 생성되었습니다.`,
      });

      // Show fallback notification if needed
      if (hadFallback) {
        toast({
          title: "ℹ️ 무료 모델 사용",
          description: "Imagen 3를 사용할 수 없어 Pollinations AI로 생성되었습니다.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Generation error:', error);

      if (error instanceof Error) {
        // Check for timeout error
        if (error.message.includes('지연')) {
          toast({
            title: "⏱️ 시간 초과",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "❌ 생성 실패",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "❌ 생성 실패",
          description: "카드뉴스 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } finally {
      stopTimer();
      setIsLoading(false);
      setProgressStage(0);
      setElapsedTime(0);
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
        progressStage={progressStage}
        elapsedTime={elapsedTime}
        resolution={resolution}
        onResolutionChange={setResolution}
        artStyle={artStyle}
        onArtStyleChange={setArtStyle}
        referenceEnabled={referenceEnabled}
        onReferenceEnabledChange={setReferenceEnabled}
        referenceMode={referenceMode}
        onReferenceModeChange={setReferenceMode}
        referenceImages={referenceImages}
        onReferenceImagesChange={setReferenceImages}
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
