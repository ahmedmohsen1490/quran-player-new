import React from 'react';
import { Surah, Ayah } from '../types';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface SurahDetailProps {
  surah: Surah;
  currentAyah: Ayah | null;
  showTafsir: boolean;
  onToggleTafsir: () => void;
  tafsirText: string | null;
  isTafsirLoading: boolean;
  isTafsirError: boolean;
  bookmarks: { [key: number]: number };
  onToggleBookmark: (surahId: number, ayahNumber: number) => void;
}

const SurahDetail: React.FC<SurahDetailProps> = ({
  surah,
  currentAyah,
  showTafsir,
  onToggleTafsir,
  tafsirText,
  isTafsirLoading,
  isTafsirError,
  bookmarks,
  onToggleBookmark,
}) => {

  const isBookmarked = !!(currentAyah && bookmarks[surah.id] === currentAyah.numberInSurah);
  const shouldShowBasmala = currentAyah && currentAyah.numberInSurah === 1 && surah.id !== 1 && surah.id !== 9;

  const getCleanAyahText = () => {
    if (!currentAyah) return '';
    if (shouldShowBasmala) {
        return currentAyah.text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '');
    }
    return currentAyah.text;
  };

  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${active ? 'bg-primary text-black' : 'text-text-secondary hover:bg-border-color'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6">
      <div className="bg-card rounded-xl shadow-lg border border-border-color p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <TabButton active={showTafsir} onClick={onToggleTafsir}>التفسير</TabButton>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => currentAyah && onToggleBookmark(surah.id, currentAyah.numberInSurah)}
              disabled={!currentAyah}
              className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-primary bg-primary/20' : 'text-text-secondary hover:bg-primary/10'}`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <BookmarkIcon className="w-6 h-6" isFilled={isBookmarked} />
            </button>
          </div>
        </div>

        <div className="border-t border-border-color pt-4 mt-4">
          {/* Ayah Content - Always Visible */}
          <div className="flex items-center justify-center p-4">
            {currentAyah ? (
              <div className="text-center">
                {shouldShowBasmala && (
                  <p className="text-2xl md:text-3xl font-amiri-quran text-text-primary leading-loose mb-4">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                )}
                <p key={currentAyah.number} className="text-3xl md:text-4xl font-amiri-quran text-text-primary leading-loose">
                  {getCleanAyahText()}
                  <span className="font-sans text-lg align-middle mx-2 p-1 text-primary">
                    ({currentAyah.numberInSurah})
                  </span>
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-text-secondary text-lg">اختر سورة للبدء.</p>
                <p className="text-sm text-text-secondary">من القائمة على اليسار</p>
              </div>
            )}
          </div>
          
          {/* Tafsir Content - Conditionally Visible */}
          {showTafsir && (
            <div className="mt-4 border-t border-border-color/50 pt-4 animate-fade-in">
              <div className="flex flex-col justify-center">
                <h4 className="font-semibold mb-2 text-text-primary">التفسير الميسر للآية {currentAyah?.numberInSurah}</h4>
                <div className="flex-grow flex items-center justify-center rounded-lg bg-background p-4 min-h-[8rem]">
                  {isTafsirLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : isTafsirError ? (
                    <p className="text-red-500 text-center">{tafsirText}</p>
                  ) : (
                    tafsirText && <p className="text-text-secondary max-w-none leading-relaxed text-right">{tafsirText}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurahDetail;
