import React from 'react';
import { Reciter, Surah, Theme } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { BackIcon } from './icons/BackIcon';
import { SimpleThemeSelector } from './SimpleThemeSelector';

type Page = 'home' | 'audio' | 'reading' | 'quiz' | 'asbab' | 'kids' | 'ronaq_mind' | 'history';

interface HeaderProps {
  reciters: Reciter[];
  selectedReciter: Reciter | null;
  onReciterChange: (reciter: Reciter) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSettingsClick: () => void;
  onChallengeClick: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const PAGE_TITLES: Record<Page, string> = {
  home: 'رونق',
  audio: 'أنصت',
  reading: 'اقرأ',
  quiz: 'فقه وحكمة',
  asbab: 'تدبر',
  kids: 'عالم الطفل',
  ronaq_mind: 'Ronaq Mind',
  history: 'اعرف تاريخك',
};


const Header: React.FC<HeaderProps> = ({ 
  reciters, selectedReciter, onReciterChange, 
  isDarkMode, onToggleDarkMode, onSettingsClick, 
  onChallengeClick, currentPage, onNavigate,
  currentTheme, onThemeChange
}) => {
  const handleReciterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const reciterIdentifier = event.target.value;
    const reciter = reciters.find(r => r.identifier === reciterIdentifier);
    if (reciter) {
      onReciterChange(reciter);
    }
  };

  return (
    <header className="bg-card/70 dark:bg-card/70 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 flex items-center">
             {currentPage !== 'home' && (
              <button 
                onClick={() => onNavigate('home')} 
                className="p-2 -ml-2 rounded-full text-text-secondary hover:bg-border-color"
                aria-label="العودة للصفحة الرئيسية"
              >
                <BackIcon className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-text-primary mr-2">{PAGE_TITLES[currentPage]}</h1>
          </div>
          
          <div className="flex-1 text-center truncate">
            {currentPage !== 'audio' && (
              <select
                value={selectedReciter?.identifier || ''}
                onChange={handleReciterChange}
                disabled={!selectedReciter || reciters.length === 0}
                className="bg-background dark:bg-card border border-border-color text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full max-w-[200px] sm:max-w-xs p-2.5 mx-auto"
              >
                {reciters.length === 0 && <option>Loading...</option>}
                {reciters.map(reciter => (
                  <option key={reciter.identifier} value={reciter.identifier}>{reciter.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-2">
            <SimpleThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
             <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full text-text-secondary hover:bg-border-color focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={onChallengeClick}
              className="p-2 rounded-full text-text-secondary hover:bg-border-color focus:outline-none"
              aria-label="Quran Challenge"
            >
              <TrophyIcon className="w-6 h-6" />
            </button>
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-full text-text-secondary hover:bg-border-color focus:outline-none"
              aria-label="Settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;