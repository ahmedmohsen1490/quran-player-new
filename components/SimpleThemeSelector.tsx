import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '../types';
import { PREDEFINED_THEMES } from '../themes';

interface SimpleThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const SimpleThemeSelector: React.FC<SimpleThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  return (
    <div ref={wrapperRef} className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 rounded-full border-2 border-border-color"
        style={{ backgroundColor: currentTheme.light.primary }}
        aria-label="Change theme"
      />
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-card rounded-lg shadow-lg border border-border-color z-20">
            <div className="flex gap-3">
            {PREDEFINED_THEMES.map(theme => (
                <button
                    key={theme.name}
                    onClick={() => { onThemeChange(theme); setIsOpen(false); }}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${!theme.isCustom && currentTheme.name === theme.name ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-card' : ''}`}
                    style={{ backgroundColor: theme.light.primary }}
                    aria-label={`Select ${theme.name} theme`}
                />
            ))}
            </div>
        </div>
      )}
    </div>
  );
};
