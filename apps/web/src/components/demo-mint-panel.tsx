'use client';

import { useState, useMemo } from 'react';
import { Sparkles, Wand2, Heart, Zap, Palette, RotateCw } from 'lucide-react';
import { cn } from '@/lib/erc721-stylus/src/cn';
import {
  generateDemoNFT,
  generateDemoNFTMetadata,
  generateDemoNFTImage,
  AVAILABLE_MOODS,
  type DemoMode,
  type GeneratedNFT,
} from '@/lib/erc721-stylus/src/demo-generators';

interface DemoMintPanelProps {
  onMintWithMetadata?: (metadata: object) => Promise<void>;
  isLoading?: boolean;
}

const DEMO_MODES = [
  {
    id: 'random',
    name: 'Random Magic',
    icon: Sparkles,
    description: 'Completely random NFT',
    color: 'from-cyan-500 to-blue-500',
    emoji: '🎲',
  },
  {
    id: 'girly',
    name: 'Girly Vibes',
    icon: Heart,
    description: 'Fabulous and iconic',
    color: 'from-pink-500 to-rose-500',
    emoji: '👑',
  },
  {
    id: 'emoji',
    name: 'Emoji Art',
    icon: Palette,
    description: 'Emoji-based creativity',
    color: 'from-purple-500 to-pink-500',
    emoji: '🎨',
  },
  {
    id: 'mood',
    name: 'Mood Vibes',
    icon: Zap,
    description: 'Choose your mood',
    color: 'from-amber-500 to-orange-500',
    emoji: '🎭',
  },
];

export function DemoMintPanel({ onMintWithMetadata, isLoading = false }: DemoMintPanelProps) {
  const [selectedMode, setSelectedMode] = useState<DemoMode | null>(null);
  const [previewNFT, setPreviewNFT] = useState<GeneratedNFT | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('confident');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePreview = async (mode: DemoMode) => {
    setIsGenerating(true);
    setSelectedMode(mode);

    // Simulate generation delay for fun
    await new Promise((resolve) => setTimeout(resolve, 300));

    const generated = generateDemoNFT(mode, {
      moodKey: mode === 'mood' ? selectedMood : undefined,
    });
    setPreviewNFT(generated);
    setIsGenerating(false);
  };

  const handleModeSelect = (mode: DemoMode) => {
    setSelectedMode(mode);
    setPreviewNFT(null);
  };

  const handleMintDemo = async () => {
    if (!previewNFT || !onMintWithMetadata) return;

    const metadata = generateDemoNFTMetadata(previewNFT);
    await onMintWithMetadata(metadata);
  };

  const handleRegeneratePreview = async () => {
    if (!selectedMode) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const generated = generateDemoNFT(selectedMode, {
      moodKey: selectedMode === 'mood' ? selectedMood : undefined,
    });
    setPreviewNFT(generated);
    setIsGenerating(false);
  };

  const previewImage = useMemo(() => {
    if (!previewNFT) return null;
    return generateDemoNFTImage(previewNFT);
  }, [previewNFT]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Wand2 className="w-5 h-5 text-accent-magenta" />
        <h2 className="text-lg font-bold text-forge-text">Mint Demo Modes</h2>
        <span className="text-xs text-forge-muted ml-auto">Try before you deploy</span>
      </div>

      {!previewNFT ? (
        <>
          {/* Mode Selection Grid */}
          <div className="grid grid-cols-2 gap-2">
            {DEMO_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id as DemoMode)}
                  disabled={isGenerating || isLoading}
                  className={cn(
                    'group relative overflow-hidden rounded-lg border p-3 transition-all duration-300',
                    'hover:border-accent-cyan/60 hover:shadow-lg hover:-translate-y-0.5',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    selectedMode === mode.id
                      ? 'border-accent-cyan/60 bg-accent-cyan/10'
                      : 'border-forge-border/50 bg-forge-surface/50'
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" />

                  <div className="relative space-y-2">
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4 text-accent-cyan" />
                      <span className="text-lg">{mode.emoji}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-forge-text">{mode.name}</p>
                      <p className="text-[10px] text-forge-muted leading-tight">{mode.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mood Selection (if applicable) */}
          {selectedMode === 'mood' && (
            <div className="space-y-2 p-3 bg-forge-surface/50 rounded-lg border border-forge-border/40">
              <p className="text-xs font-medium text-forge-muted">Select a mood:</p>
              <div className="grid grid-cols-3 gap-1">
                {AVAILABLE_MOODS.map((mood) => (
                  <button
                    key={mood.key}
                    onClick={() => setSelectedMood(mood.key)}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-all',
                      selectedMood === mood.key
                        ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/60'
                        : 'bg-forge-surface/60 text-forge-text/70 border border-forge-border/30'
                    )}
                  >
                    {mood.emoji} {mood.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={async () => {
              await handleGeneratePreview(selectedMode || 'random');
            }}
            disabled={isGenerating || isLoading}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-medium text-sm transition-all',
              'bg-gradient-to-r from-accent-cyan to-accent-magenta',
              'hover:shadow-lg hover:shadow-accent-cyan/50 disabled:opacity-50',
              'flex items-center justify-center gap-2'
            )}
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {selectedMode === 'mood' ? 'Generate Mood Preview' : 'Generate NFT Preview'}
              </>
            )}
          </button>
        </>
      ) : (
        // Preview Section
        <div className="space-y-3">
          {/* Preview Image */}
          <div className="relative rounded-lg overflow-hidden bg-forge-surface/50 border border-forge-border/60 aspect-square">
            {previewImage && (
              <img src={previewImage} alt={previewNFT.name} className="w-full h-full object-cover" />
            )}

            {/* Badge */}
            <div className="absolute top-2 left-2 bg-black/60 px-3 py-1 rounded-full">
              <span className="text-xs font-semibold text-white">{previewNFT.emoji} Demo</span>
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-2 p-3 bg-forge-surface/50 rounded-lg border border-forge-border/40">
            <div>
              <p className="text-xs text-forge-muted">Name</p>
              <p className="text-sm font-semibold text-forge-text">{previewNFT.name}</p>
            </div>

            <div>
              <p className="text-xs text-forge-muted">Description</p>
              <p className="text-xs text-forge-text/80 leading-snug">{previewNFT.description}</p>
            </div>

            {previewNFT.metadata.mood && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs bg-accent-cyan/20 text-accent-cyan px-2 py-1 rounded">
                  {previewNFT.metadata.mood}
                </span>
                {previewNFT.metadata.vibes &&
                  previewNFT.metadata.vibes.slice(0, 2).map((vibe) => (
                    <span key={vibe} className="text-xs bg-forge-surface/80 text-forge-text/70 px-2 py-1 rounded">
                      {vibe}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRegeneratePreview}
              disabled={isGenerating || isLoading}
              className={cn(
                'py-2 px-3 rounded-lg font-medium text-sm transition-all',
                'border border-forge-border/60 hover:border-accent-cyan/60',
                'bg-forge-surface/50 hover:bg-forge-surface/80',
                'disabled:opacity-50 flex items-center justify-center gap-1'
              )}
            >
              {isGenerating ? (
                <RotateCw className="w-3 h-3 animate-spin" />
              ) : (
                <RotateCw className="w-3 h-3" />
              )}
              <span className="text-xs">Regenerate</span>
            </button>

            <button
              onClick={handleMintDemo}
              disabled={isLoading || isGenerating}
              className={cn(
                'py-2 px-3 rounded-lg font-medium text-sm transition-all',
                'bg-gradient-to-r from-accent-cyan to-accent-magenta',
                'hover:shadow-lg hover:shadow-accent-cyan/50',
                'disabled:opacity-50',
                'flex items-center justify-center gap-1'
              )}
            >
              <Sparkles className="w-3 h-3" />
              <span className="text-xs">Mint This</span>
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={() => {
              setPreviewNFT(null);
              setSelectedMode(null);
            }}
            className="w-full py-1 text-xs text-forge-muted hover:text-forge-text transition-colors"
          >
            {'<- Back to modes'}
          </button>
        </div>
      )}
    </div>
  );
}
