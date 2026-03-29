import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { Sentence, ViewMode, Word } from '../types';
import { cn } from '../lib/utils';
import { textToSpeech, playPCM, speakWithBrowser } from '../lib/gemini';

interface SentenceBlockProps {
  sentence: Sentence;
  viewMode: ViewMode;
  onWordClick: (word: Word, rect: DOMRect, isJapanese: boolean) => void;
}

export const SentenceBlock: React.FC<SentenceBlockProps> = ({ sentence, viewMode, onWordClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      const base64Data = await textToSpeech(sentence.ja_sentence);
      if (base64Data) {
        await playPCM(base64Data);
      } else {
        // Fallback to browser TTS
        await speakWithBrowser(sentence.ja_sentence);
      }
    } catch (err) {
      console.error("Failed to play audio", err);
      // Try fallback on error too
      try {
        await speakWithBrowser(sentence.ja_sentence);
      } catch (fallbackErr) {
        console.error("Fallback audio failed", fallbackErr);
      }
    } finally {
      setIsPlaying(false);
    }
  };

  const renderWords = (words: Word[], isJapanese: boolean) => {
    return words.map((word, idx) => (
      <span
        key={`${sentence.id}-${idx}-${isJapanese ? 'ja' : 'en'}`}
        onClick={(e) => {
          e.stopPropagation();
          onWordClick(word, (e.target as HTMLElement).getBoundingClientRect(), isJapanese);
        }}
        className={cn(
          "inline-block cursor-pointer transition-all duration-200 rounded px-0.5",
          "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-105",
          isJapanese ? "mx-0.5" : "mx-1"
        )}
      >
        {isJapanese ? word.ja : word.en}
      </span>
    ));
  };

  if (viewMode === 'side-by-side') {
    return (
      <div className="grid grid-cols-2 gap-8 py-8 border-b border-gray-50 dark:border-gray-800 items-start group relative">
        <div className="absolute right-0 top-6 opacity-40 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition-colors"
            title="Read aloud"
          >
            {isPlaying ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
          </button>
        </div>
        <div className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 font-japanese pr-8">
          {renderWords(sentence.words, true)}
        </div>
        <div className="text-lg leading-relaxed text-gray-600 dark:text-gray-400 font-sans">
          {renderWords(sentence.words, false)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-8 border-b border-gray-50 dark:border-gray-800 group relative">
      <div className="absolute right-0 top-6 opacity-40 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handlePlayAudio}
          disabled={isPlaying}
          className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition-colors"
          title="Read aloud"
        >
          {isPlaying ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
        </button>
      </div>
      <div className="text-2xl leading-relaxed text-gray-900 dark:text-gray-100 font-japanese pr-12">
        {renderWords(sentence.words, true)}
      </div>
      <div className="text-lg leading-relaxed text-gray-500 dark:text-gray-400 font-sans italic">
        {renderWords(sentence.words, false)}
      </div>
    </div>
  );
};
