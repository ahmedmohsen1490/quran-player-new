
import React from 'react';
import { Surah, Reciter } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CancelIcon } from './icons/CancelIcon';
import { DownloadTafsirIcon } from './icons/DownloadTafsirIcon';
import { DownloadAudioIcon } from './icons/DownloadAudioIcon';
import { AudioWaveIcon } from './icons/AudioWaveIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';


interface SurahListProps {
  surahs: Surah[];
  onSurahSelect: (surah: Surah, reciter?: Reciter) => void;
  currentSurahId: number | null;
  isPlaying: boolean;
  bookmarks: { [key: number]: number };
  selectedReciter: Reciter | null;
  downloadedTafsir: Set<number>;
  tafsirDownloadProgress: { [key: number]: number };
  onDownloadTafsir: (surah: Surah) => void;
  onCancelTafsirDownload: (surah: Surah) => void;
  downloadedAudio: Set<string>;
  audioDownloadProgress: { [key: string]: number };
  onDownloadAudio: (surah: Surah, reciter: Reciter) => void;
  onCancelAudioDownload: (surah: Surah, reciter: Reciter) => void;
}

const SurahList: React.FC<SurahListProps> = ({ 
  surahs, 
  onSurahSelect, 
  currentSurahId, 
  isPlaying,
  bookmarks,
  selectedReciter,
  downloadedTafsir,
  tafsirDownloadProgress,
  onDownloadTafsir,
  onCancelTafsirDownload,
  downloadedAudio,
  audioDownloadProgress,
  onDownloadAudio,
  onCancelAudioDownload,
}) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="space-y-3">
        {surahs.map(surah => {
          
          const isCurrent = currentSurahId === surah.id;
          const isTafsirDownloaded = downloadedTafsir.has(surah.id);
          const tafsirDownloadInfo = tafsirDownloadProgress[surah.id];
          const isTafsirDownloading = tafsirDownloadInfo !== undefined;
          
          const audioDownloadKey = `${selectedReciter?.identifier}-${surah.id}`;
          const isAudioDownloaded = downloadedAudio.has(audioDownloadKey);
          const audioDownloadInfo = audioDownloadProgress[audioDownloadKey];
          const isAudioDownloading = audioDownloadInfo !== undefined;

          const downloadTafsirActionContent = () => {
            if (isTafsirDownloaded) return <div className="p-2"><CheckCircleIcon className="w-5 h-5 text-primary" /></div>;
            if (isTafsirDownloading) return (
              <div className="flex items-center">
                <div className="w-8 text-center text-xs font-mono text-text-secondary" role="progressbar" aria-valuenow={tafsirDownloadInfo}>{tafsirDownloadInfo}%</div>
                <button onClick={(e) => { e.stopPropagation(); onCancelTafsirDownload(surah); }} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full" aria-label="Cancel tafsir download"><CancelIcon className="w-4 h-4" /></button>
              </div>
            );
            return (
              <button onClick={(e) => { e.stopPropagation(); onDownloadTafsir(surah); }} className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full" aria-label="Download tafsir"><DownloadTafsirIcon className="w-5 h-5" /></button>
            );
          };

          const downloadAudioActionContent = () => {
            if (!selectedReciter) return null;
            if (isAudioDownloaded) return <div className="p-2"><CheckCircleIcon className="w-5 h-5 text-green-500" /></div>;
            if (isAudioDownloading) return (
              <div className="flex items-center">
                <div className="w-8 text-center text-xs font-mono text-text-secondary" role="progressbar" aria-valuenow={audioDownloadInfo}>{audioDownloadInfo}%</div>
                <button onClick={(e) => { e.stopPropagation(); onCancelAudioDownload(surah, selectedReciter); }} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full" aria-label="Cancel audio download"><CancelIcon className="w-4 h-4" /></button>
              </div>
            );
            return (
              <button onClick={(e) => { e.stopPropagation(); onDownloadAudio(surah, selectedReciter); }} className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full" aria-label="Download audio"><DownloadAudioIcon className="w-5 h-5" /></button>
            );
          };

          const isCurrentAndPlaying = isCurrent && isPlaying;
          const PlayButton = () => (
             <button
              onClick={(e) => {
                e.stopPropagation();
                onSurahSelect(surah);
              }}
              className={`p-2 rounded-full transition-colors ${
                isCurrentAndPlaying ? 'text-primary' : 'text-text-secondary hover:text-primary'
              }`}
              aria-label={isCurrentAndPlaying ? `Pause ${surah.name}` : `Play ${surah.name}`}
            >
              {isCurrentAndPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>
          );


          return (
            <div
              key={surah.id}
              onClick={() => onSurahSelect(surah)}
              className={`group relative p-4 rounded-lg transition-all duration-300 flex items-center justify-between cursor-pointer border ${isCurrent ? 'bg-card border-primary shadow-lg shadow-primary/10' : 'bg-card/60 border-border-color/50 hover:border-border-color hover:bg-card'}`}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 flex items-center justify-center rounded-lg text-lg font-bold ml-4 transition-colors ${isCurrent ? 'bg-primary text-black' : 'bg-background text-text-primary'}`}>
                  {surah.id}
                </div>
                <div>
                  <p className="font-semibold font-amiri-quran text-2xl text-text-primary">
                    {surah.name}
                  </p>
                  <div className="text-xs text-text-secondary flex items-center gap-2">
                    <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                    <span>•</span>
                    <span>{surah.numberOfAyahs} آيات</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between w-36">
                <PlayButton />
                {downloadTafsirActionContent()}
                {downloadAudioActionContent()}
              </div>

              {isCurrent && isPlaying && (
                 <div className="absolute top-1/2 -translate-y-1/2 left-4 h-full flex items-center">
                    <AudioWaveIcon className="w-5 h-5 text-primary" />
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SurahList;
