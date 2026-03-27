import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Word } from '../types';
import { cn } from '../lib/utils';

interface TooltipProps {
  word: Word;
  targetRect: DOMRect | null;
  onClose: () => void;
  isJapanese: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ word, targetRect, onClose, isJapanese }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetRect && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      setCoords({
        top: targetRect.top + scrollY - tooltipRect.height - 12,
        left: targetRect.left + scrollX + (targetRect.width / 2) - (tooltipRect.width / 2),
      });
    }
  }, [targetRect]);

  if (!targetRect) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed z-50 bg-white dark:bg-gray-900 p-3 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 min-w-[120px] pointer-events-auto"
        style={{ top: coords.top, left: coords.left }}
      >
        <div className="flex flex-col items-center text-center">
          {isJapanese ? (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-1">{word.reading}</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{word.ja}</span>
              <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-1" />
              <span className="text-sm text-gray-600 dark:text-gray-400 italic">{word.en}</span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{word.en}</span>
              <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-1" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-1">{word.reading}</span>
              <span className="text-md font-medium text-gray-700 dark:text-gray-300">{word.ja}</span>
            </>
          )}
        </div>
        {/* Arrow */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 border-b border-r border-gray-100 dark:border-gray-800 rotate-45"
        />
      </motion.div>
    </AnimatePresence>
  );
};
