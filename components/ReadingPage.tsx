import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Surah } from '../types';
import * as db from '../db';
import { BackIcon } from './icons/BackIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

const ZoomInIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3h-6" />
  </svg>
);

const ZoomOutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
  </svg>
);

interface PageAyah {
    id: number;
    text: string;
    page_number: number;
    juz_number: number;
    numberInSurah: number;
}

interface PaginatedSurah {
    pageNumber: number;
    juzNumber: number;
    ayahs: PageAyah[];
}

interface ReadingStats {
    pagesRead: number;
    lastLocation: {
        surahId: number;
        surahName: string;
        page: number;
    } | null;
}

// Map of Surah IDs to a RegExp that matches their opening letters if they are a separate verse but merged by the API.
// This list is enhanced to be more robust and cover all 29 Surahs with Huroof Muqatta'at.
const surahLetterSplitMap: { [key: number]: RegExp } = {
  2: /^(الٓمٓ\s*)/,        // Al-Baqarah
  3: /^(الٓمٓ\s*)/,        // Aal-E-Imran
  7: /^(الٓمٓصٓ\s*)/,      // Al-A'raf
  10: /^(الٓرۚ?\s*)/,     // Yunus
  11: /^(الٓرۚ?\s*)/,     // Hud
  12: /^(الٓرۚ?\s*)/,     // Yusuf
  13: /^(الٓمٓرۚ?\s*)/,   // Ar-Ra'd
  14: /^(الٓرۚ?\s*)/,     // Ibrahim
  15: /^(الٓرۚ?\s*)/,     // Al-Hijr
  19: /^(كهيعٓصٓ\s*)/,    // Maryam
  20: /^(طه\s*)/,        // Ta-Ha
  26: /^(طسٓمٓ\s*)/,      // Ash-Shu'ara
  27: /^(طسٓۚ?\s*)/,      // An-Naml
  28: /^(طسٓمٓ\s*)/,      // Al-Qasas
  29: /^(الٓمٓ\s*)/,        // Al-Ankabut
  30: /^(الٓمٓ\s*)/,        // Ar-Rum
  31: /^(الٓمٓ\s*)/,        // Luqman
  32: /^(الٓمٓ\s*)/,        // As-Sajdah
  36: /^(يسٓ\s*)/,        // Ya-Sin
  38: /^(صٓۚ?\s*)/,      // Sad
  40: /^(حمٓ\s*)/,        // Ghafir
  41: /^(حمٓ\s*)/,        // Fussilat
  // Ash-Shura (42) has special handling in the function below for the "حم عسق" case.
  // This entry handles the case where only "حم" might be merged with the subsequent verse.
  42: /^(حمٓ\s*)/,
  43: /^(حمٓ\s*)/,        // Az-Zukhruf
  44: /^(حمٓ\s*)/,        // Ad-Dukhan
  45: /^(حمٓ\s*)/,        // Al-Jathiyah
  46: /^(حمٓ\s*)/,        // Al-Ahqaf
  50: /^(قٓۚ?\s*)/,       // Qaf
  68: /^(نٓۚ?\s*)/,       // Al-Qalam
};

// This function processes verses for special Surahs where the API merges the opening letters with the first full verse.
// It is enhanced to handle all cases of Huroof Muqatta'at, including the unique structure of Surah Ash-Shura.
const processSpecialVerses = (verses: any[], surahId: number): any[] => {
    // Return early if there's nothing to process or if the first verse is not verse #1
    if (!verses || verses.length === 0 || parseInt(String(verses[0].numberInSurah), 10) !== 1) {
        return verses;
    }

    const firstVerse = verses[0];
    
    // Special handling for Ash-Shura (42), which has two verses of disjointed letters (حم and عسق).
    // This handles the case where an API might merge both (or all three) verses.
    if (surahId === 42) {
        // This regex looks for "حم" followed by "عسق" and captures them and the rest of the text.
        const shuraRegex = /^(حمٓ)\s*(عٓسٓقٓ)\s*(.*)$/s;
        const match = firstVerse.text.match(shuraRegex);

        if (match) {
            const [, haMeem, ainSeenQaf, rest] = match;
            const remainingText = rest.trim();
            const newVerses = [];

            // Verse 1: حم
            newVerses.push({ ...firstVerse, text: haMeem, numberInSurah: 1 });
            // Verse 2: عسق
            newVerses.push({ ...firstVerse, number: parseFloat(String(firstVerse.number)) + 0.5, text: ainSeenQaf, numberInSurah: 2 });
            
            let verseOffset = 1; // We added one verse (عسق)

            if (remainingText) {
                // If there's text after عسق, it's the start of verse 3
                newVerses.push({ ...firstVerse, number: parseFloat(String(firstVerse.number)) + 0.6, text: remainingText, numberInSurah: 3 });
                verseOffset = 2; // We created a new verse 3 from the split
            }

            // Renumber all subsequent verses based on how many new verses we created
            const subsequentVerses = verses.slice(1).map(v => ({
                ...v,
                numberInSurah: parseInt(String(v.numberInSurah), 10) + verseOffset
            }));
            
            return [...newVerses, ...subsequentVerses];
        }
    }
    
    // Generic handling for all other Surahs
    const splitter = surahLetterSplitMap[surahId];
    if (!splitter) {
        return verses;
    }

    const match = firstVerse.text.match(splitter);
    if (match) {
        const lettersText = match[1].trim();
        const remainingText = firstVerse.text.substring(match[0].length).trim();

        if (!remainingText) {
            return verses; // Verse is already correct, nothing to split.
        }

        const lettersVerse = { ...firstVerse, text: lettersText, numberInSurah: 1 };
        const secondVerse = { ...firstVerse, text: remainingText, numberInSurah: 2, number: parseFloat(String(firstVerse.number)) + 0.5 };
        
        const updatedFollowingVerses = verses.slice(1).map(v => ({
            ...v,
            numberInSurah: parseInt(String(v.numberInSurah), 10) + 1,
        }));

        return [lettersVerse, secondVerse, ...updatedFollowingVerses];
    }

    return verses;
};


// Helper to remove Basmalah from any Ayah text to prevent duplication
const getCleanAyahText = (text: string) => text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '');


const AyahEndIcon: React.FC<{ number: number | string, className?: string }> = ({ number, className }) => (
    <svg viewBox="0 0 40 40" className={`inline-block w-[1.5em] h-[1.5em] text-primary dark:text-primary/80 ${className}`}>
        <path d="M20,4 C28.837,4 36,11.163 36,20 C36,28.837 28.837,36 20,36 C11.163,36 4,28.837 4,20 C4,11.163 11.163,4 20,4 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="currentColor" fontSize="14" fontFamily="sans-serif" fontWeight="bold">
            {number}
        </text>
    </svg>
);

const MushafViewer: React.FC<{
    surah: Surah;
    onBack: () => void;
}> = ({ surah, onBack }) => {
    const [paginatedSurah, setPaginatedSurah] = useState<PaginatedSurah[] | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('mushafFontSize') || 28));
    const [copyTooltip, setCopyTooltip] = useState<{ ayah: PageAyah; top: number; left: number } | null>(null);
    const [copied, setCopied] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const copyTooltipRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (copyTooltipRef.current && !copyTooltipRef.current.contains(event.target as Node)) {
                setCopyTooltip(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        localStorage.setItem('mushafFontSize', String(fontSize));
    }, [fontSize]);

    const fetchAndPaginateSurah = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPaginatedSurah(null);

        try {
            let versesData: any[] = [];
            const offlineSurahData = await db.getSurahText(surah.id);

            if (offlineSurahData && offlineSurahData.length > 0) {
                versesData = offlineSurahData;
            } else {
                const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah.id}/editions/quran-uthmani`);
                if (!response.ok) throw new Error('فشل في جلب بيانات السورة من الإنترنت.');
                const data = await response.json();
                if (data.code !== 200 || !data.data[0].ayahs) throw new Error('مصدر البيانات غير صالح.');
                versesData = data.data[0].ayahs;
            }

            if (!versesData || versesData.length === 0) {
                throw new Error('لا توجد بيانات لهذه السورة.');
            }
            
            const processedVersesData = processSpecialVerses(versesData, surah.id);

            const verses: PageAyah[] = processedVersesData.map((verse: any) => ({
                id: verse.number,
                text: verse.text,
                page_number: verse.page,
                juz_number: verse.juz,
                numberInSurah: verse.numberInSurah,
            }));

            const pagesMap = new Map<number, PaginatedSurah>();
            for (const verse of verses) {
                if (!verse.page_number) continue;
                if (!pagesMap.has(verse.page_number)) {
                    pagesMap.set(verse.page_number, {
                        pageNumber: verse.page_number,
                        juzNumber: verse.juz_number,
                        ayahs: [],
                    });
                }
                pagesMap.get(verse.page_number)!.ayahs.push(verse);
            }
            const pagesArray = Array.from(pagesMap.values()).sort((a, b) => a.pageNumber - b.pageNumber);
            setPaginatedSurah(pagesArray);

            const lastPages = JSON.parse(localStorage.getItem('lastReadPagePerSurah') || '{}');
            const lastReadPageNumber = lastPages[surah.id];
            
            const startingPageIndex = lastReadPageNumber ? pagesArray.findIndex(p => p.pageNumber === lastReadPageNumber) : 0;
            setCurrentPageIndex(startingPageIndex > -1 ? startingPageIndex : 0);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف.');
        } finally {
            setIsLoading(false);
        }
    }, [surah.id]);

    useEffect(() => {
        fetchAndPaginateSurah();
    }, [fetchAndPaginateSurah]);
    
    useEffect(() => {
        if (paginatedSurah && paginatedSurah[currentPageIndex]) {
            const currentPageNumber = paginatedSurah[currentPageIndex].pageNumber;
            const allLastPages = JSON.parse(localStorage.getItem('lastReadPagePerSurah') || '{}');
            allLastPages[surah.id] = currentPageNumber;
            localStorage.setItem('lastReadPagePerSurah', JSON.stringify(allLastPages));

            const lastLocation = { surahId: surah.id, surahName: surah.name, page: currentPageNumber };
            localStorage.setItem('lastReadLocation', JSON.stringify(lastLocation));

            const readPagesSet = new Set(JSON.parse(localStorage.getItem('readPagesSet') || '[]'));
            if (!readPagesSet.has(currentPageNumber)) {
                readPagesSet.add(currentPageNumber);
                localStorage.setItem('readPagesSet', JSON.stringify(Array.from(readPagesSet)));
            }
        }
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [currentPageIndex, paginatedSurah, surah.id, surah.name]);


    const changePage = (offset: number) => {
        const newIndex = currentPageIndex + offset;
        if (paginatedSurah && newIndex >= 0 && newIndex < paginatedSurah.length) {
            setCurrentPageIndex(newIndex);
            setCopyTooltip(null);
        }
    };
    
    const handleAyahClick = (e: React.MouseEvent<HTMLSpanElement>, ayah: PageAyah) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCopyTooltip({ ayah, top: rect.top + window.scrollY, left: rect.left + window.scrollX });
        setCopied(false);
    };

    const handleCopy = () => {
        if (!copyTooltip) return;
        const textToCopy = `"${copyTooltip.ayah.text}" (سورة ${surah.name}, الآية ${copyTooltip.ayah.numberInSurah})`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopyTooltip(null);
            }, 1200);
        });
    };

    const FONT_STEP = 2;
    const MIN_FONT_SIZE = 20;
    const MAX_FONT_SIZE = 48;

    const handleZoom = (direction: 'in' | 'out') => {
        setFontSize(prevSize => {
            let newSize = prevSize + (direction === 'in' ? FONT_STEP : -FONT_STEP);
            return Math.max(MIN_FONT_SIZE, Math.min(newSize, MAX_FONT_SIZE));
        });
    };

    const renderPageContent = () => {
        if (!paginatedSurah) return null;
        const currentPageData = paginatedSurah[currentPageIndex];
        if (!currentPageData || !currentPageData.ayahs) return null;
        
        const isFirstPageOfSurah = currentPageData.ayahs.some(a => a.numberInSurah === 1) && currentPageIndex === 0;

        const showBasmalah = isFirstPageOfSurah && surah.id !== 1 && surah.id !== 9;

        const surahHeader = (
            <div className="text-center mb-4">
                <div className="p-2 border-y-4 border-double border-mushaf-border">
                    <h3 className="text-2xl font-bold font-amiri-quran text-text-primary">{surah.name}</h3>
                </div>
            </div>
        );

        return (
            <>
                {isFirstPageOfSurah && surah.id !== 1 && surahHeader}
                {showBasmalah && (
                     <p className="font-amiri-quran tracking-wider my-4 text-center" style={{ fontSize: `${fontSize * 1.1}px` }}>
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                )}
                
                {currentPageData.ayahs.map((ayah) => {
                    // For ayahs that were split, don't clean the basmalah as it's not present.
                    // Only clean for actual first ayahs of surahs that contain it.
                    const text = (surah.id !== 1 && surah.id !== 9 && ayah.numberInSurah === 1) ? getCleanAyahText(ayah.text) : ayah.text;
                    return (
                        <span key={ayah.id} onClick={(e) => handleAyahClick(e, ayah)} className="cursor-pointer hover:bg-primary/10 rounded-md">
                            {text}
                            <AyahEndIcon number={ayah.numberInSurah} />
                        </span>
                    );
                })}
            </>
        );
    };
    
    const currentPageData = paginatedSurah?.[currentPageIndex];

    return (
        <div className="fixed inset-0 z-30 flex flex-col animate-fade-in bg-mushaf-background">
            <header className="flex-shrink-0 bg-background text-text-primary shadow-lg p-3 flex items-center justify-between border-b border-border-color">
                <button onClick={onBack} className="p-2 rounded-full text-text-secondary hover:bg-border-color w-10 h-10 flex items-center justify-center" aria-label="العودة إلى قائمة السور"><BackIcon className="w-6 h-6 transform scale-x-[-1]" /></button>
                
                <div className="flex items-center gap-2">
                    <button onClick={() => changePage(1)} disabled={!paginatedSurah || currentPageIndex >= paginatedSurah.length - 1} className="p-2 rounded-full text-text-secondary hover:bg-border-color disabled:opacity-40" aria-label="الصفحة التالية"><BackIcon className="w-6 h-6 transform scale-x-[-1]" /></button>
                    <span className="text-sm font-mono w-24 text-center text-text-primary" aria-live="polite">
                        {currentPageData?.pageNumber || '...'}
                    </span>
                    <button onClick={() => changePage(-1)} disabled={currentPageIndex <= 0} className="p-2 rounded-full text-text-secondary hover:bg-border-color disabled:opacity-40" aria-label="الصفحة السابقة"><BackIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={() => handleZoom('out')} disabled={fontSize <= MIN_FONT_SIZE} className="p-2 rounded-full text-text-secondary hover:bg-border-color disabled:opacity-40" aria-label="تصغير الخط"><ZoomOutIcon className="w-6 h-6"/></button>
                    <button onClick={() => handleZoom('in')} disabled={fontSize >= MAX_FONT_SIZE} className="p-2 rounded-full text-text-secondary hover:bg-border-color disabled:opacity-40" aria-label="تكبير الخط"><ZoomInIcon className="w-6 h-6"/></button>
                </div>
            </header>
            
            <main ref={contentRef} className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                 {isLoading && <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" role="status"><span className="sr-only">Loading...</span></div></div>}
                 {error && <div className="text-center text-red-500 p-8">{error}</div>}
                 {currentPageData && (
                     <div className="max-w-3xl mx-auto bg-mushaf-page p-4 sm:p-6 rounded-lg shadow-xl border border-mushaf-border">
                        <div className="font-amiri-quran text-right text-text-primary" style={{ fontSize: `${fontSize}px`, lineHeight: 2.5, textAlign: 'justify' }} dir="rtl">
                           {renderPageContent()}
                        </div>
                        <div className="mt-4 pt-2 border-t-2 border-dashed border-mushaf-border/70 flex justify-between items-center text-sm font-sans text-text-secondary/90">
                           {currentPageData.juzNumber && <span>الجزء {currentPageData.juzNumber}</span>}
                           <span>{currentPageData.pageNumber}</span>
                        </div>
                    </div>
                 )}
            </main>
            
            {copyTooltip && (
                <div ref={copyTooltipRef} style={{ top: copyTooltip.top - 70, left: '50%', transform: 'translateX(-50%)' }} className="fixed bg-card p-2 rounded-lg shadow-xl border border-border-color z-50 text-center animate-fade-in w-72">
                    <p className="text-xs text-text-secondary mb-2">نسخ الآية؟</p>
                    <button onClick={handleCopy} className={`w-full text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 ${copied ? 'bg-green-500' : 'bg-primary hover:opacity-90'}`}>
                        {copied ? <><CheckCircleIcon className="w-5 h-5"/> تم النسخ!</> : <><CopyIcon className="w-5 h-5" /> نسخ</>}
                    </button>
                </div>
            )}
        </div>
    );
};

const ReadingPage: React.FC<{ surahs: Surah[] }> = ({ surahs }) => {
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [readingStats, setReadingStats] = useState<ReadingStats>({ pagesRead: 0, lastLocation: null });
    const [downloadedSurahs, setDownloadedSurahs] = useState<Set<number>>(new Set());
    const [surahBeingDownloaded, setSurahBeingDownloaded] = useState<number | null>(null);

    useEffect(() => {
        if (!selectedSurah) {
            const savedPages = localStorage.getItem('readPagesSet');
            const readPages = savedPages ? JSON.parse(savedPages as string) : [];
            
            const savedLocation = localStorage.getItem('lastReadLocation');
            const lastLocation = savedLocation ? JSON.parse(savedLocation) : null;
            
            setReadingStats({ pagesRead: readPages.length, lastLocation });

            const checkDownloads = async () => {
                await db.initDB();
                const keys = await db.getAllDownloadedKeys('quranText');
                setDownloadedSurahs(new Set(keys.map(k => Number(k))));
            };
            checkDownloads();
        }
    }, [selectedSurah]);

    const handleDownloadSurah = async (surah: Surah) => {
        if (downloadedSurahs.has(surah.id) || surahBeingDownloaded === surah.id) return;
        setSurahBeingDownloaded(surah.id);
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah.id}/editions/quran-uthmani`);
            if (!response.ok) throw new Error('Failed to fetch Surah text from API.');
            const data = await response.json();
            if (data.code !== 200 || !data.data[0].ayahs) throw new Error('Invalid API response structure.');

            const versesToStore = data.data[0].ayahs;
            await db.addSurahText(surah.id, versesToStore);
            setDownloadedSurahs(prev => new Set(prev).add(surah.id));
        } catch (error) {
            console.error(`Failed to download Surah ${surah.id}`, error);
            alert(`فشل تحميل سورة ${surah.name}. يرجى التحقق من اتصالك بالإنترنت.`);
        } finally {
            setSurahBeingDownloaded(null);
        }
    };

    const handleDeleteSurah = async (surahId: number) => {
        if (!window.confirm("هل أنت متأكد من حذف النص المحمل لهذه السورة؟")) return;
        try {
            await db.deleteSurahText(surahId);
            setDownloadedSurahs(prev => {
                const newSet = new Set(prev);
                newSet.delete(surahId);
                return newSet;
            });
        } catch (error) {
            console.error(`Failed to delete Surah ${surahId}`, error);
            alert("حدث خطأ أثناء الحذف.");
        }
    };

    if (selectedSurah) {
        return <MushafViewer surah={selectedSurah} onBack={() => setSelectedSurah(null)} />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 animate-fade-in">
             <div className="mb-6 bg-card p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-text-primary mb-3 text-center">تقدم القراءة</h3>
                <div className="flex justify-around text-center items-center">
                    <div>
                        <p className="text-2xl font-bold text-primary">{readingStats.pagesRead}</p>
                        <p className="text-sm text-text-secondary">صفحة مقروءة</p>
                    </div>
                    {readingStats.lastLocation ? (
                        <button onClick={() => {
                            const surahToOpen = surahs.find(s => s.id === readingStats.lastLocation?.surahId);
                            if (surahToOpen) setSelectedSurah(surahToOpen);
                        }} className="p-2 rounded-md hover:bg-border-color">
                            <p className="font-semibold text-text-primary truncate">متابعة: {readingStats.lastLocation.surahName}</p>
                            <p className="text-sm text-text-secondary">صفحة {readingStats.lastLocation.page}</p>
                        </button>
                    ) : (
                         <div>
                            <p className="font-semibold text-text-primary">-</p>
                            <p className="text-sm text-text-secondary">آخر موضع قراءة</p>
                        </div>
                    )}
                </div>
            </div>

             <h2 className="text-xl font-bold text-text-primary mb-4">اختر سورة للبدء</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {surahs.map(surah => {
                    const isDownloaded = downloadedSurahs.has(surah.id);
                    const isDownloading = surahBeingDownloaded === surah.id;
                    return (
                        <div key={surah.id}
                            className="p-4 rounded-lg shadow-md bg-card hover:bg-border-color transition-all duration-200 flex items-center justify-between cursor-pointer"
                            onClick={() => setSelectedSurah(surah)}>
                            <div className="flex items-center min-w-0">
                                <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-medium ml-4 bg-background text-text-secondary">
                                    {surah.id}
                                </span>
                                <div className="truncate">
                                    <p className="font-semibold font-amiri-quran text-xl text-text-primary truncate">
                                        {surah.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                {isDownloading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                                ) : isDownloaded ? (
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSurah(surah.id); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full" aria-label="حذف النص المحمل"><TrashIcon className="w-5 h-5"/></button>
                                ) : (
                                    <button onClick={(e) => { e.stopPropagation(); handleDownloadSurah(surah); }} className="p-2 text-text-secondary hover:text-primary rounded-full" aria-label="تحميل للقراءة بدون انترنت"><DownloadIcon className="w-6 h-6" /></button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReadingPage;
