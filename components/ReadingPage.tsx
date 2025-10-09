
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Surah } from '../types';
import * as db from '../db';
import { BackIcon } from './icons/BackIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { SURAH_PAGE_MAP } from '../constants';
import { DownloadIcon } from './icons/DownloadIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CopyIcon } from './icons/CopyIcon';

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

const darkenColor = (hex: string, amount: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
    const b = Math.max(0, (num & 0x0000FF) - amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};


// Define a local type for Ayahs from the page API to match its structure.
interface PageAyah {
    number: number;
    text: string;
    numberInSurah: number;
    page: number;
    surah: {
        number: number;
        name: string;
    };
    juz: number;
}

interface ReadingStats {
    pagesRead: number;
    lastLocation: {
        surahId: number;
        surahName: string;
        page: number;
    } | null;
}

const calmColors = { 
    Beige: '#fdf9e8', 
    Cream: '#F2EEC0', 
    'Light Turquoise': '#E0F2F1', 
    'Light Green': '#E8F5E9' 
};
type CalmColorName = keyof typeof calmColors;

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
    surahs: Surah[];
    onBack: () => void;
}> = ({ surah, surahs, onBack }) => {
    const [currentPage, setCurrentPage] = useState(() => {
        const lastPages = JSON.parse(localStorage.getItem('lastReadPagePerSurah') || '{}');
        return lastPages[surah.id] || SURAH_PAGE_MAP[surah.id] || 1;
    });
    const [pageData, setPageData] = useState<PageAyah[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('mushafFontSize') || 28));
    const [bgColor, setBgColor] = useState<CalmColorName>(() => (localStorage.getItem('mushafBgColorName') as CalmColorName) || 'Beige');
    const [copyTooltip, setCopyTooltip] = useState<{ ayah: PageAyah; top: number; left: number } | null>(null);
    const [copied, setCopied] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const copyTooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
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

    useEffect(() => {
        localStorage.setItem('mushafBgColorName', bgColor);
    }, [bgColor]);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            const readPagesSet = new Set(JSON.parse(localStorage.getItem('readPagesSet') || '[]'));
            if (!readPagesSet.has(currentPage)) {
                readPagesSet.add(currentPage);
                localStorage.setItem('readPagesSet', JSON.stringify(Array.from(readPagesSet)));
            }
        }, 15000);

        return () => clearTimeout(timer);
    }, [currentPage]);

    useEffect(() => {
        const allLastPages = JSON.parse(localStorage.getItem('lastReadPagePerSurah') || '{}');
        allLastPages[surah.id] = currentPage;
        localStorage.setItem('lastReadPagePerSurah', JSON.stringify(allLastPages));

        const lastLocation = { surahId: surah.id, surahName: surah.name, page: currentPage };
        localStorage.setItem('lastReadLocation', JSON.stringify(lastLocation));
    }, [currentPage, surah]);
    
    const fetchPageData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPageData(null);

        try {
            // First, try to get data from IndexedDB
            const offlineSurahData = await db.getSurahText(surah.id);
            if (offlineSurahData) {
                const pageAyahs = offlineSurahData.filter(ayah => ayah.page === currentPage);
                if (pageAyahs.length > 0) {
                    setPageData(pageAyahs);
                    setIsLoading(false);
                    if (contentRef.current) contentRef.current.scrollTop = 0;
                    return; // Data found offline, no need to fetch from network
                }
            }
            
            // If not found offline, fetch from network using the corrected API
            const response = await fetch(`https://api.quran.com/api/v4/verses/by_page/${currentPage}?language=ar&fields=text_uthmani,juz_number`);
            if (!response.ok) throw new Error('Failed to fetch page data from network.');
            
            const data = await response.json();

            if (!data.verses) throw new Error('Invalid API response structure from quran.com.');
            
            const mappedAyahs: PageAyah[] = data.verses.map((verse: any) => {
                const [surahIdStr, ayahInSurahStr] = verse.verse_key.split(':');
                const surahId = parseInt(surahIdStr, 10);
                const surahInfo = surahs.find(s => s.id === surahId);
                
                return {
                    number: verse.id, // global verse number
                    text: verse.text_uthmani,
                    numberInSurah: parseInt(ayahInSurahStr, 10),
                    page: currentPage,
                    surah: {
                        number: surahId,
                        name: surahInfo ? surahInfo.name : '',
                    },
                    juz: verse.juz_number,
                };
            });
            
            setPageData(mappedAyahs);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            if (contentRef.current) contentRef.current.scrollTop = 0;
        }
    }, [currentPage, surah.id, surahs]);


    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const changePage = (offset: number) => {
        const newPage = currentPage + offset;
        if (newPage >= 1 && newPage <= 604) {
            setCurrentPage(newPage);
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
        const textToCopy = `"${copyTooltip.ayah.text}" (سورة ${copyTooltip.ayah.surah.name}, الآية ${copyTooltip.ayah.numberInSurah})`;
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
            if (newSize < MIN_FONT_SIZE) newSize = MIN_FONT_SIZE;
            if (newSize > MAX_FONT_SIZE) newSize = MAX_FONT_SIZE;
            return newSize;
        });
    };

    const scrollbarStyle = {
        '--scrollbar-track-bg': calmColors[bgColor],
        '--scrollbar-thumb-bg': darkenColor(calmColors[bgColor], 40)
    };
    
    const renderPageContent = () => {
        if (!pageData) return null;
        const renderedSurahHeaders = new Set<number>();
        return pageData.map((ayah, index) => {
            const textToDisplay = ayah.text.replace(/^[بسم الله الرحمن الرحيم\s]*/, '');
            const showBasmala = ayah.numberInSurah === 1 && ayah.surah.number !== 1 && ayah.surah.number !== 9 && !pageData.some(a => a.numberInSurah === 0 && a.surah.number === ayah.surah.number);

            // Special handling for Muqatta'at which are the first verse.
            // Some APIs merge Basmala with the first verse. `text_uthmani` is usually clean.
            const isFirstAyahOnPage = index === 0;
            const isSurahStartOnThisPage = pageData.some(a => a.numberInSurah === 1);
            
            const showSurahHeader = (isFirstAyahOnPage && isSurahStartOnThisPage) || (ayah.numberInSurah === 1);

            let surahForHeader: Surah | undefined;
            if (showSurahHeader && !renderedSurahHeaders.has(ayah.surah.number)) {
                 surahForHeader = surahs.find(s => s.id === ayah.surah.number);
                 if(surahForHeader) renderedSurahHeaders.add(ayah.surah.number);
            }
          
            return (
                <React.Fragment key={ayah.number}>
                    {surahForHeader && (
                        <div className="my-4 p-2 border-y-4 border-double border-[#b4a485] bg-[#f3efe4] text-center">
                            <h3 className="text-2xl font-bold font-amiri-quran text-black">{surahForHeader.name}</h3>
                            <p className="text-sm text-gray-700 font-sans">
                                {surahForHeader.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surahForHeader.numberOfAyahs} آيات
                            </p>
                        </div>
                    )}
                    {showBasmala && (
                        <p className="text-center font-amiri-quran tracking-wider my-4" style={{ fontSize: `${fontSize * 1.1}px` }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                    )}
                    <span onClick={(e) => handleAyahClick(e, ayah)} className="cursor-pointer hover:bg-primary/10 rounded-md">
                        <span className="ayah-text" data-ayah-ref={`${ayah.surah.number}:${ayah.numberInSurah}`}>
                            {ayah.text}
                        </span>
                        <AyahEndIcon number={ayah.numberInSurah} />
                    </span>
                </React.Fragment>
            );
       });
    };
    
    const juzNumber = pageData && pageData.length > 0 ? pageData[0].juz : null;

    return (
        <div className="fixed inset-0 z-30 flex flex-col animate-fade-in" style={{ backgroundColor: calmColors[bgColor] }}>
            <header className="flex-shrink-0 bg-[#3D3522] text-white shadow-lg p-3 flex items-center justify-between">
                <button onClick={onBack} className="p-2 rounded-full text-white/90 hover:bg-white/10 w-10 h-10 flex items-center justify-center" aria-label="العودة إلى قائمة السور"><BackIcon className="w-6 h-6 transform scale-x-[-1]" /></button>
                
                <div className="flex items-center gap-2">
                    <button onClick={() => changePage(1)} disabled={currentPage >= 604} className="p-2 rounded-full text-white hover:bg-white/10 disabled:opacity-40" aria-label="الصفحة التالية"><BackIcon className="w-6 h-6 transform scale-x-[-1]" /></button>
                    <span className="text-sm font-mono w-16 text-center text-white" aria-live="polite">
                        {currentPage} / 604
                    </span>
                    <button onClick={() => changePage(-1)} disabled={currentPage <= 1} className="p-2 rounded-full text-white hover:bg-white/10 disabled:opacity-40" aria-label="الصفحة السابقة"><BackIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={() => handleZoom('out')} disabled={fontSize <= MIN_FONT_SIZE} className="p-2 rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40" aria-label="تصغير الخط"><ZoomOutIcon className="w-6 h-6"/></button>
                    <button onClick={() => handleZoom('in')} disabled={fontSize >= MAX_FONT_SIZE} className="p-2 rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40" aria-label="تكبير الخط"><ZoomInIcon className="w-6 h-6"/></button>
                    <button onClick={() => { setIsSettingsOpen(o => !o); setCopyTooltip(null); }} className="p-2 rounded-full text-white/90 hover:bg-white/10" aria-label="إعدادات العرض"><SettingsIcon className="w-6 h-6"/></button>
                </div>
            </header>
            
            <main ref={contentRef} className="flex-grow overflow-y-auto p-4 custom-scrollbar" style={scrollbarStyle as React.CSSProperties}>
                 {isLoading && <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" role="status"><span className="sr-only">Loading...</span></div></div>}
                 {error && <div className="text-center text-red-500 p-8">{error}</div>}
                 {pageData && (
                     <div className="max-w-3xl mx-auto bg-[#fdfaf0] p-4 sm:p-6 rounded-lg shadow-xl border border-[#dcd6c0]">
                        <div className="font-amiri-quran text-right text-black" style={{ fontSize: `${fontSize}px`, lineHeight: 2.0, textAlign: 'justify' }} dir="rtl">
                           {renderPageContent()}
                        </div>
                        <div className="mt-4 pt-2 border-t-2 border-dashed border-[#d3c9a4] flex justify-between items-center text-sm font-sans text-gray-600">
                           {juzNumber && <span>الجزء {juzNumber}</span>}
                           <span>{currentPage}</span>
                        </div>
                    </div>
                 )}
            </main>

            {isSettingsOpen && (
                 <div ref={settingsRef} className="absolute top-16 right-3 w-72 bg-card p-4 rounded-lg shadow-xl border border-border-color z-40 animate-fade-in space-y-4">
                    <div>
                        <label className="text-sm text-text-secondary">لون الخلفية</label>
                        <div className="flex justify-between items-center mt-2">
                            {Object.entries(calmColors).map(([name, color]) => (
                                <button key={name} onClick={() => setBgColor(name as CalmColorName)} className={`w-10 h-10 rounded-full border-2 ${bgColor === name ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-card' : 'border-border-color'}`} style={{backgroundColor: color}} aria-label={`Select ${name} color`}></button>
                            ))}
                        </div>
                    </div>
                 </div>
            )}
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
            const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}?language=ar&fields=text_uthmani,page_number,juz_number`);
            if (!response.ok) throw new Error('Failed to fetch Surah text from quran.com.');
            const data = await response.json();

            if (!data.verses) throw new Error('Invalid API response structure from quran.com.');

            const ayahsForDb = data.verses.map((verse: any) => {
                const [surahIdStr, ayahInSurahStr] = verse.verse_key.split(':');
                return {
                    number: verse.id,
                    text: verse.text_uthmani,
                    numberInSurah: parseInt(ayahInSurahStr, 10),
                    page: verse.page_number,
                    surah: {
                        number: surah.id,
                        name: surah.name,
                    },
                    juz: verse.juz_number,
                };
            });

            await db.addSurahText(surah.id, ayahsForDb);
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
        return <MushafViewer surah={selectedSurah} surahs={surahs} onBack={() => setSelectedSurah(null)} />;
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
                        <div onClick={() => {
                            const surahToOpen = surahs.find(s => s.id === readingStats.lastLocation?.surahId);
                            if (surahToOpen) setSelectedSurah(surahToOpen);
                        }} className="cursor-pointer p-2 rounded-md hover:bg-border-color">
                            <p className="font-semibold text-text-primary truncate">{readingStats.lastLocation.surahName}</p>
                            <p className="text-sm text-text-secondary">آخر صفحة: {readingStats.lastLocation.page}</p>
                        </div>
                    ) : (
                         <div>
                            <p className="font-semibold text-text-primary">-</p>
                            <p className="text-sm text-text-secondary">آخر صفحة</p>
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
                            <div className="flex items-center">
                                <span className="w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium ml-4 bg-background text-text-secondary">
                                    {surah.id}
                                </span>
                                <p className="font-semibold font-amiri-quran text-xl text-text-primary">
                                    {surah.name}
                                </p>
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
