import React from 'react';
import { Sentence, ViewMode, Word } from '../types';
import { cn } from '../lib/utils';

interface SentenceBlockProps {
  sentence: Sentence;
  viewMode: ViewMode;
  onWordClick: (word: Word, rect: DOMRect, isJapanese: boolean) => void;
}

export const SentenceBlock: React.FC<SentenceBlockProps> = ({ sentence, viewMode, onWordClick }) => {
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
      <div className="grid grid-cols-2 gap-8 py-8 border-b border-gray-50 dark:border-gray-800 items-start group">
        <div className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 font-japanese">
          {renderWords(sentence.words, true)}
        </div>
        <div className="text-lg leading-relaxed text-gray-600 dark:text-gray-400 font-sans">
          {renderWords(sentence.words, false)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-8 border-b border-gray-50 dark:border-gray-800 group">
      <div className="text-2xl leading-relaxed text-gray-900 dark:text-gray-100 font-japanese">
        {renderWords(sentence.words, true)}
      </div>
      <div className="text-lg leading-relaxed text-gray-500 dark:text-gray-400 font-sans italic">
        {renderWords(sentence.words, false)}
      </div>
    </div>
  );
};
