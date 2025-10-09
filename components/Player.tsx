import React, { useRef, useState, useEffect } from 'react';
import { Surah, Reciter, Ayah } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { NextIcon } from './icons/NextIcon';
import { PrevIcon } from './icons/PrevIcon';
import { RepeatIcon } from './icons/RepeatIcon';

interface PlayerProps {
  surah: Surah | null;
  reciter: Reciter;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEnded: () => void;
  audioSrc: string;
  currentAyah: Ayah | null;
  totalAyahs: number;
  onDurationChange: (duration: number) => void;
  onTimeUpdate: (time: number) => void;
  seekToTime: number | null;
  onSeeked: () => void;
}

const Player: React.FC<PlayerProps> = ({
  surah,
  reciter,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onEnded,
  audioSrc,
  currentAyah,
  totalAyahs,
  onDurationChange,
  onTimeUpdate,
  seekToTime,
  onSeeked,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeating, setIsRepeating] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.loop = isRepeating;
    }
  }, [isRepeating]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playWithFadeIn = () => {
      audio.volume = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          let currentVolume = 0;
          const fadeInterval = setInterval(() => {
            currentVolume += 0.1;
            if (currentVolume >= 1) {
              audio.volume = 1;
              clearInterval(fadeInterval);
            } else {
              audio.volume = currentVolume;
            }
          }, 150); // Fade in over 1.5 seconds
        }).catch(error => {
          if (error.name !== 'AbortError') {
            console.error("Audio play failed during fade-in", error);
          }
        });
      }
    };

    if (audioSrc) {
      if (audio.src !== audioSrc) {
        audio.src = audioSrc;
        // Reset internal state for new track
        setCurrentTime(0);
        setDuration(0);
        setProgress(0);
      }

      if (isPlaying) {
        // Check if we should fade in (only on auto-resume)
        if (seekToTime !== null) {
          playWithFadeIn();
        } else {
          audio.volume = 1; // Ensure volume is max for normal playback
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              if (error.name !== 'AbortError') {
                console.error("Audio play failed", error);
              }
            });
          }
        }
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [isPlaying, audioSrc, seekToTime]);


  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      setCurrentTime(currentTime);
      onTimeUpdate(currentTime);
      if (duration) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
        setProgress(0);
        const audioDuration = audioRef.current.duration;
        if (isFinite(audioDuration)) {
          setDuration(audioDuration);
          onDurationChange(audioDuration);
        }
        if (seekToTime !== null) {
          audioRef.current.currentTime = seekToTime;
        }
    }
  };

  const handleAudioEnded = () => {
    if (!isRepeating) {
        onEnded();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      audioRef.current.currentTime = (clickX / width) * duration;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!surah) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg shadow-t-lg z-20 border-t border-border-color/50">
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={onSeeked}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center min-w-0 w-1/4">
            <div className="mr-4 truncate">
              <p className="font-semibold text-text-primary font-amiri-quran text-lg truncate">{surah.name}</p>
              <p className="text-sm text-text-secondary truncate">{reciter.name}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-grow mx-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                  <button
                      onClick={onPrev}
                      className="p-2 rounded-full text-text-primary hover:bg-border-color focus:outline-none"
                      aria-label="Previous Surah"
                  >
                      <PrevIcon className="w-7 h-7" />
                  </button>
                  <button
                      onClick={onPlayPause}
                      className="p-4 rounded-full bg-primary text-background shadow-lg hover:opacity-90 focus:outline-none"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                      {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                  </button>
                  <button
                      onClick={onNext}
                      className="p-2 rounded-full text-text-primary hover:bg-border-color focus:outline-none"
                      aria-label="Next Surah"
                  >
                      <NextIcon className="w-7 h-7" />
                  </button>
              </div>
              <div className="w-full flex items-center gap-2 mt-3">
                  <span className="text-xs font-mono text-text-secondary w-10 text-center">{formatTime(currentTime)}</span>
                  <div 
                      className="w-full bg-border-color rounded-full h-2 cursor-pointer group" 
                      onClick={handleProgressClick}
                      role="slider"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Audio progress"
                  >
                      <div className="bg-primary h-2 rounded-full relative" style={{ width: `${progress}%` }}>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-primary transition-transform group-hover:scale-110"></div>
                      </div>
                  </div>
                  <span className="text-xs font-mono text-text-secondary w-10 text-center">{formatTime(duration)}</span>
              </div>
          </div>

          <div className="w-1/4 flex items-center justify-end">
             <button
                onClick={() => setIsRepeating(prev => !prev)}
                className={`p-2 rounded-full hover:bg-border-color focus:outline-none ${isRepeating ? 'text-primary' : 'text-text-secondary'}`}
                aria-label="Repeat Ayah"
            >
                <RepeatIcon className="w-6 h-6" />
            </button>
            {totalAyahs > 0 && currentAyah && (
              <p className="text-sm text-text-secondary mr-2">
                {currentAyah.numberInSurah}/{totalAyahs}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Player;