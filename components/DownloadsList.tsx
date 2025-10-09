
import React, { useState } from 'react';
import { Surah, Reciter } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface DownloadedItem {
  surah: Surah;
  reciter: Reciter;
}

interface DownloadsListProps {
  items: DownloadedItem[];
  onPlay: (surah: Surah, reciter: Reciter) => void;
  onDelete: (surah: Surah, reciter: Reciter) => void;
  currentSurah: Surah | null;
  currentReciter: Reciter | null;
  isPlaying: boolean;
}

export const DownloadsList: React.FC<DownloadsListProps> = ({
  items,
  onPlay,
  onDelete,
  currentSurah,
  currentReciter,
  isPlaying,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-fade-in">
      <div className="bg-card/80 rounded-xl shadow-lg border border-border-color p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-right"
          aria-expanded={isExpanded}
        >
          <h2 className="text-xl font-bold text-text-primary">
            المحتوى المحمّل ({items.length})
          </h2>
          <ChevronDownIcon
            className={`w-6 h-6 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border-color/50">
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {items.map(({ surah, reciter }) => {
                const isCurrentlyPlaying =
                  currentSurah?.id === surah.id &&
                  currentReciter?.identifier === reciter.identifier &&
                  isPlaying;
                
                const isCurrentTrack = 
                  currentSurah?.id === surah.id &&
                  currentReciter?.identifier === reciter.identifier;

                return (
                  <div
                    key={`${surah.id}-${reciter.identifier}`}
                    className={`p-3 rounded-lg flex items-center justify-between transition-colors ${isCurrentTrack ? 'bg-primary/20' : 'bg-background'}`}
                  >
                    <div>
                      <p className="font-semibold font-amiri-quran text-lg text-text-primary">{surah.name}</p>
                      <p className="text-xs text-text-secondary">{reciter.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPlay(surah, reciter)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-full"
                        aria-label={isCurrentlyPlaying ? `إيقاف ${surah.name}` : `تشغيل ${surah.name}`}
                      >
                        {isCurrentlyPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (window.confirm(`هل أنت متأكد من حذف الملفات الصوتية لسورة ${surah.name} للقارئ ${reciter.name}؟`)) onDelete(surah, reciter); }}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                        aria-label={`حذف ${surah.name}`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
