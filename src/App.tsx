/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  Rows, 
  Plus, 
  Download, 
  Upload, 
  Languages,
  Loader2,
  BookOpen,
  FileText,
  X,
  Moon,
  Sun,
  Sparkles,
  Volume2
} from 'lucide-react';
import { Sentence, ViewMode, Word } from './types';
import { MOCK_DATA } from './constants';
import { SentenceBlock } from './components/SentenceBlock';
import { Tooltip } from './components/Tooltip';
import { translateAndParse, generateStory, textToSpeech, playPCM } from './lib/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [sentences, setSentences] = useState<Sentence[]>(MOCK_DATA);
  const [viewMode, setViewMode] = useState<ViewMode>('over-under');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{ word: Word; rect: DOMRect; isJapanese: boolean } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [storyTopic, setStoryTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceLang, setSourceLang] = useState<'ja' | 'en'>('ja');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close tooltip on scroll or click outside
  useEffect(() => {
    const handleScroll = () => setActiveTooltip(null);
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tooltip-trigger')) {
        // setActiveTooltip(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleWordClick = (word: Word, rect: DOMRect, isJapanese: boolean) => {
    setActiveTooltip({ word, rect, isJapanese });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(sentences, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'komorebi-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setSentences(json);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleAITranslate = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const newSentences = await translateAndParse(inputText, sourceLang);
      if (newSentences.length > 0) {
        setSentences(newSentences);
        setIsImportModalOpen(false);
        setInputText('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process text with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!storyTopic.trim()) return;
    setIsProcessing(true);
    try {
      const newSentences = await generateStory(storyTopic);
      if (newSentences.length > 0) {
        setSentences(newSentences);
        setIsGenerateModalOpen(false);
        setStoryTopic('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate story with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAll = async () => {
    if (isPlayingAll || sentences.length === 0) return;
    setIsPlayingAll(true);
    
    try {
      const fullText = sentences.map(s => s.ja_sentence).join(' ');
      const base64Data = await textToSpeech(fullText);
      if (base64Data) {
        await playPCM(base64Data);
      }
    } catch (err) {
      console.error("Failed to play all audio", err);
    } finally {
      setIsPlayingAll(false);
    }
  };

  return (
    <div className={cn("min-h-screen pb-24 transition-colors duration-300", isDarkMode ? "dark" : "")} onClick={() => setActiveTooltip(null)}>
      {/* Sticky Toolbar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/20">
              <BookOpen size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 hidden sm:block">Komorebi Reader</h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); handlePlayAll(); }}
              disabled={isPlayingAll || sentences.length === 0}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isPlayingAll ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              title="Play all sentences"
            >
              {isPlayingAll ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setIsDarkMode(!isDarkMode); }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Night Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={(e) => { e.stopPropagation(); setViewMode('over-under'); }}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === 'over-under' ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
                title="Over/Under Mode"
              >
                <Rows size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setViewMode('side-by-side'); }}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === 'side-by-side' ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
                title="Side-by-Side Mode"
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsGenerateModalOpen(true); }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              >
                <Sparkles size={16} />
                <span className="hidden sm:inline">AI Story</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsImportModalOpen(true); }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New Text</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleExport(); }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Export JSON"
              >
                <Download size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Import JSON"
              >
                <Upload size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                className="hidden" 
                accept=".json"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: viewMode === 'side-by-side' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: viewMode === 'side-by-side' ? -20 : 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-4"
          >
            {sentences.length > 0 ? (
              sentences.map((sentence) => (
                <SentenceBlock
                  key={sentence.id}
                  sentence={sentence}
                  viewMode={viewMode}
                  onWordClick={handleWordClick}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="text-lg">No text loaded. Click "New Text" to start.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Tooltip */}
      {activeTooltip && (
        <Tooltip
          word={activeTooltip.word}
          targetRect={activeTooltip.rect}
          isJapanese={activeTooltip.isJapanese}
          onClose={() => setActiveTooltip(null)}
        />
      )}

      {/* Import/AI Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
                    <Languages size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Import New Text</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Paste text and let AI handle the translation and parsing.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setSourceLang('ja')}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                      sourceLang === 'ja' ? "bg-orange-500 text-white shadow-md shadow-orange-100 dark:shadow-orange-900/20" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    Japanese → English
                  </button>
                  <button
                    onClick={() => setSourceLang('en')}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                      sourceLang === 'en' ? "bg-orange-500 text-white shadow-md shadow-orange-100 dark:shadow-orange-900/20" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    English → Japanese
                  </button>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={sourceLang === 'ja' ? "Paste Japanese text here..." : "Paste English text here..."}
                  className="w-full h-64 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none font-japanese text-lg text-gray-900 dark:text-gray-100"
                />

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Powered by Gemini 3.1 Pro
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAITranslate}
                      disabled={isProcessing || !inputText.trim()}
                      className={cn(
                        "px-8 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-lg transition-all flex items-center gap-2",
                        (isProcessing || !inputText.trim()) ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800 dark:hover:bg-white active:scale-95"
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Process Text
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Generate Modal */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGenerateModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Story Generator</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter a topic to generate a story.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <input
                  type="text"
                  value={storyTopic}
                  onChange={(e) => setStoryTopic(e.target.value)}
                  placeholder="e.g., A robot learning to cook"
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateStory()}
                />

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Gemini 3.1 Pro
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsGenerateModalOpen(false)}
                      className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateStory}
                      disabled={isProcessing || !storyTopic.trim()}
                      className={cn(
                        "px-8 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl shadow-lg transition-all flex items-center gap-2",
                        (isProcessing || !storyTopic.trim()) ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-600 active:scale-95 shadow-orange-200 dark:shadow-orange-900/20"
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
