import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Header from './components/Header';
import SurahList from './components/SurahList';
import Player from './components/Player';
import SurahDetail from './components/SurahDetail';
import Settings from './components/Settings';
import ChallengePage from './components/ChallengePage';
import { SearchResults } from './components/SearchResults';
import HomePage from './components/HomePage';
import ReadingPage from './components/ReadingPage';
import QuizPage from './components/QuizPage';
import AsbabNuzulPage from './components/AsbabNuzulPage';
import KidsPage from './components/kids/KidsPage';
import RonaqMindPage from './components/RonaqMindPage';
import HistoryPage from './components/HistoryPage';
import WelcomeModal from './components/WelcomeModal';
import { Surah, Reciter, Ayah, ListeningStats, MuazzinSettings, Theme, QuranChallenge, SearchAyah, AzkarSettings } from './types';
import * as db from './db';
import { DEFAULT_THEME } from './themes';
import { GoogleGenAI, Type } from '@google/genai';
import { AZKAR_LIST } from './constants';
import SearchBar from './components/SearchBar';
import { RecitersIcon } from './components/icons/RecitersIcon';
import { DownloadsList } from './components/DownloadsList';
import { UserIcon } from './components/icons/UserIcon';
import { AudioWaveIcon } from './components/icons/AudioWaveIcon';

type Page = 'home' | 'audio' | 'reading' | 'quiz' | 'asbab' | 'kids' | 'ronaq_mind' | 'history';

interface DownloadedItem {
  surah: Surah;
  reciter: Reciter;
}

// A map to translate API style names into displayable Arabic.
const STYLE_ARABIC_MAP: { [key: string]: string } = {
  'Mujawwad': 'مجود',
  'Murattal': 'مرتل',
  'Warsh': 'ورش',
  'Qalun': 'قالون',
  'Muallim': 'معلم',
};


const HamburgerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
      } catch (error) {
        console.error(error);
        return defaultValue;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
};


const AudioPageLayout: React.FC<{
  reciters: Reciter[];
  selectedReciter: Reciter | null;
  onReciterChange: (reciter: Reciter) => void;
  children: React.ReactNode;
}> = ({ reciters, selectedReciter, onReciterChange, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const FEATURED_RECITERS_RAW_NAMES = useMemo(() => [
    'مشاري راشد العفاسي',
    'عبدالرحمن السديس',
    'سعود الشريم',
    'سعد الغامدي',
    'ماهر المعيقلي',
    'أحمد بن علي العجمي',
    'ياسر الدوسري',
    'محمود خليل الحصري',
    'محمد صديق المنشاوي',
    'عبدالباسط عبدالصمد',
  ], []);

  const { featured, grouped } = useMemo(() => {
    const sourceList = searchQuery.trim()
      ? reciters.filter(r =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.rawName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : reciters;

    const featuredList: Reciter[] = [];
    const regularReciters: Reciter[] = [];

    if (!searchQuery.trim()) {
      const featuredSet = new Set<string>();
      FEATURED_RECITERS_RAW_NAMES.forEach(name => {
        const reciterVersions = reciters.filter(r => r.rawName === name);
        reciterVersions.forEach(reciterVersion => {
          if (!featuredSet.has(reciterVersion.identifier)) {
            featuredList.push(reciterVersion);
            featuredSet.add(reciterVersion.identifier);
          }
        });
      });
      regularReciters.push(...reciters.filter(r => !featuredSet.has(r.identifier)));
    } else {
      regularReciters.push(...sourceList);
    }

    const groupedReciters = regularReciters.reduce((acc, reciter) => {
      const styleKey = reciter.style || 'Murattal';
      const styleDisplay = STYLE_ARABIC_MAP[styleKey] || styleKey;
      if (!acc[styleDisplay]) {
        acc[styleDisplay] = [];
      }
      acc[styleDisplay].push(reciter);
      return acc;
    }, {} as Record<string, Reciter[]>);
    
    const sortedGroupEntries = Object.entries(groupedReciters).sort(([a], [b]) => {
        if (a === 'مرتل') return -1;
        if (b === 'مرتل') return 1;
        if (a === 'مجود') return -1;
        if (b === 'مجود') return 1;
        return a.localeCompare(b, 'ar');
    });

    return { featured: featuredList, grouped: sortedGroupEntries };
  }, [reciters, searchQuery, FEATURED_RECITERS_RAW_NAMES]);
  
  const renderReciterButton = (reciter: Reciter) => {
    const isSelected = selectedReciter?.identifier === reciter.identifier;
    return (
        <button
            key={reciter.identifier}
            onClick={() => {
                onReciterChange(reciter);
                setIsSidebarOpen(false);
            }}
            className={`w-full p-2.5 rounded-xl text-right transition-all duration-200 flex items-center justify-between relative group ${
                isSelected ? 'bg-primary/20' : 'bg-card/50 hover:bg-card'
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <UserIcon className={`w-7 h-7 flex-shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-text-secondary/70'}`} />
                <div className="min-w-0">
                    <span className={`font-semibold w-full truncate transition-colors text-sm ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                        {reciter.name}
                    </span>
                </div>
            </div>
            {isSelected && (
                <div className="text-primary flex-shrink-0 ml-2">
                    <AudioWaveIcon className="w-5 h-5" />
                </div>
            )}
        </button>
    );
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className={`absolute lg:relative top-0 right-0 h-full bg-background/80 dark:bg-background/90 backdrop-blur-lg z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-80 lg:w-96 border-l border-border-color h-full flex flex-col">
          <div className="p-4 border-b border-border-color flex-shrink-0">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <RecitersIcon className="w-6 h-6 text-primary"/>
              اختر القارئ
            </h2>
          </div>
          <div className="p-3 border-b border-border-color">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن قارئ..."
              className="w-full bg-background border border-border-color rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-4">
            {reciters.length === 0 && (
              <div className="text-center p-4 text-text-secondary">جاري تحميل القراء...</div>
            )}
            {featured.length > 0 && (
                <div className="space-y-1">
                    <h3 className="px-2 text-sm font-semibold text-text-secondary mb-2">القراء المميزون</h3>
                    {featured.map(reciter => renderReciterButton(reciter))}
                </div>
            )}
            {grouped.map(([style, recitersInGroup]) => (
                <div key={style} className="space-y-1">
                    <h3 className="px-2 text-sm font-semibold text-text-secondary mb-2">{style}</h3>
                    {recitersInGroup.map(reciter => renderReciterButton(reciter))}
                </div>
            ))}
            {reciters.length > 0 && featured.length === 0 && grouped.length === 0 && (
                <div className="text-center p-4 text-text-secondary">لا توجد نتائج بحث.</div>
            )}
          </div>
        </div>
      </aside>
      
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-20 lg:hidden"></div>}

      <main className="flex-grow w-full overflow-y-auto">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden p-2 text-left">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md bg-card/50 text-text-secondary">
                 <HamburgerIcon className="w-6 h-6"/>
             </button>
        </div>
        {children}
      </main>
    </div>
  );
};


const App: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('ronaqTheme');
        return savedTheme ? JSON.parse(savedTheme) : DEFAULT_THEME;
      } catch (e) {
        return DEFAULT_THEME;
      }
    }
    return DEFAULT_THEME;
  });

  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentAyahs, setCurrentAyahs] = useState<Ayah[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioSrc, setAudioSrc] = useState<string>('');
  
  const [bookmarks, setBookmarks] = useState<{ [key: number]: number }>(() => {
    if (typeof window !== 'undefined') {
      const savedBookmarks = localStorage.getItem('ronaqBookmarks');
      return savedBookmarks ? JSON.parse(savedBookmarks) : {};
    }
    return {};
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [stats, setStats] = useState<ListeningStats>({ hoursThisWeek: 0, surahsCompleted: 0 });
  const [currentAyahDuration, setCurrentAyahDuration] = useState<number>(0);

  const [showTafsir, setShowTafsir] = useState<boolean>(false);
  const [currentTafsir, setCurrentTafsir] = useState<string | null>(null);
  const [isTafsirLoading, setIsTafsirLoading] = useState<boolean>(false);
  const [isTafsirError, setIsTafsirError] = useState<boolean>(false);

  const defaultMuazzinSettings: MuazzinSettings = {
    country: 'Saudi Arabia',
    city: 'Riyadh',
    method: 4,
    school: 0,
    muazzinId: 'mecca',
    remindersEnabled: false,
    tune: { Imsak: 0, Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0, Midnight: 0 },
  };

  const [muazzinSettings, setMuazzinSettings] = usePersistentState<MuazzinSettings>('muazzinSettings', defaultMuazzinSettings);

  // Sanitizes muazzin settings from localStorage to prevent errors with old/incomplete data structures.
  const sanitizedMuazzinSettings = useMemo(() => {
    return {
      ...defaultMuazzinSettings,
      ...muazzinSettings,
      tune: {
        ...defaultMuazzinSettings.tune,
        ...(muazzinSettings.tune || {}),
      },
    };
  }, [muazzinSettings]);


  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // State for offline downloads
  const [downloadedTafsir, setDownloadedTafsir] = useState<Set<number>>(new Set());
  const [tafsirDownloadProgress, setTafsirDownloadProgress] = useState<{ [key: number]: number }>({});
  const tafsirDownloadControllers = useRef<{ [key: number]: AbortController }>({});

  // State for audio downloads
  const [downloadedAudio, setDownloadedAudio] = useState<Set<string>>(new Set());
  const [audioDownloadProgress, setAudioDownloadProgress] = useState<{ [key: string]: number }>({});
  const audioDownloadControllers = useRef<{ [key: string]: AbortController }>({});
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([]);


  // Quran Challenge State
  const [challenge, setChallenge] = useState<QuranChallenge | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // State for Smart Search
  const [ayahSearchResults, setAyahSearchResults] = useState<SearchAyah[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pendingPlay, setPendingPlay] = useState<{ surahId: number; ayahNumberInSurah: number } | null>(null);
  
  // Azkar Notifications State
  const [azkarSettings, setAzkarSettings] = useState<AzkarSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('azkarSettings');
      return saved ? JSON.parse(saved) : { isEnabled: false, frequency: 1 };
    }
    return { isEnabled: false, frequency: 1 };
  });
  const [notificationDhikr, setNotificationDhikr] = useState<string | null>(null);
  const azkarIntervalRef = useRef<number | null>(null);
  
  // State for smart sound control
  const [currentTime, setCurrentTime] = useState(0);
  const [seekToTime, setSeekToTime] = useState<number | null>(null);
  const didRestoreState = useRef(false);

  // State for Welcome Modal
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);


  const ai = useRef<GoogleGenAI | null>(null);
  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (process.env.API_KEY) {
      ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }, []);

  useEffect(() => {
     // Welcome Modal Logic
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenWelcome) {
        const timer = setTimeout(() => {
            setIsWelcomeModalOpen(true);
        }, 3000); // 3 seconds

        return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setIsWelcomeModalOpen(false);
    localStorage.setItem('hasSeenWelcomePopup', 'true');
  };

  useEffect(() => {
    document.body.classList.toggle('audio-theme', currentPage === 'audio');
    const root = document.documentElement;
    const themeColors = isDarkMode ? currentTheme.dark : currentTheme.light;
    
    if (currentPage === 'audio' || currentPage === 'kids') {
        root.style.setProperty('--scrollbar-track-bg', isDarkMode ? '#0d1a2e' : '#fbf9f3');
        root.style.setProperty('--scrollbar-thumb-bg', isDarkMode ? '#2a3e5c' : '#d1c7ac');
    } else {
        root.style.setProperty('--scrollbar-track-bg', themeColors.background);
        root.style.setProperty('--scrollbar-thumb-bg', themeColors.border);
    }
  }, [currentPage, isDarkMode, currentTheme]);

  // Restore playback state
  useEffect(() => {
    if (didRestoreState.current || surahs.length === 0 || reciters.length === 0) {
      return;
    }

    const savedStateJSON = localStorage.getItem('lastPlaybackState');
    if (savedStateJSON) {
      try {
        const savedState = JSON.parse(savedStateJSON);
        const surah = surahs.find(s => s.id === savedState.surahId);
        const reciter = reciters.find(r => r.identifier === savedState.reciterIdentifier);
        const savedTime = parseFloat(savedState.time);
        const savedAyahIndex = savedState.currentAyahIndex !== undefined ? parseInt(savedState.currentAyahIndex, 10) : 0;

        if (surah && reciter && !isNaN(savedTime)) {
          didRestoreState.current = true;
          setSelectedReciter(reciter);
          setCurrentSurah(surah);
          setSeekToTime(savedTime);
          setCurrentAyahIndex(isNaN(savedAyahIndex) ? 0 : savedAyahIndex);
          // Do not autoplay on load to comply with browser policies.
          // The user must initiate the first playback.
          setIsPlaying(false);
        } else {
          localStorage.removeItem('lastPlaybackState');
        }
      } catch (e) {
        console.error("Failed to parse saved playback state", e);
        localStorage.removeItem('lastPlaybackState');
      }
    }
  }, [surahs, reciters]);
  
  // Save playback state
  useEffect(() => {
    const savePlaybackState = () => {
      if (currentSurah && selectedReciter && currentAyahs.length > 0) {
        const playbackState = {
          surahId: currentSurah.id,
          reciterIdentifier: selectedReciter.identifier,
          time: currentTime,
          currentAyahIndex: currentAyahIndex,
        };
        localStorage.setItem('lastPlaybackState', JSON.stringify(playbackState));
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        savePlaybackState();
      }
    };

    window.addEventListener('pagehide', savePlaybackState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', savePlaybackState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, currentSurah, selectedReciter, currentTime, currentAyahIndex, currentAyahs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChallenge = localStorage.getItem('quranChallenge');
      if (savedChallenge) {
        const parsedChallenge = JSON.parse(savedChallenge);
        if (!parsedChallenge.completedAyahs) {
          parsedChallenge.completedAyahs = {};
        }
        setChallenge(parsedChallenge);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (challenge) {
        localStorage.setItem('quranChallenge', JSON.stringify(challenge));
      } else {
        localStorage.removeItem('quranChallenge');
      }
    }
  }, [challenge]);

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('azkarSettings', JSON.stringify(azkarSettings));
    }
  }, [azkarSettings]);

  useEffect(() => {
    if (azkarIntervalRef.current) {
      clearInterval(azkarIntervalRef.current);
    }

    if (azkarSettings.isEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const showNotification = () => {
        const randomIndex = Math.floor(Math.random() * AZKAR_LIST.length);
        const dhikr = AZKAR_LIST[randomIndex];
        
        const notification = new Notification('تذكير أذكار', {
          body: dhikr,
          icon: 'https://i.imgur.com/1m8xN9N.png',
          tag: 'azkar-notification',
        });

        notification.onclick = () => {
          setNotificationDhikr(dhikr);
          window.focus();
        };
      };

      setTimeout(showNotification, 2000); 

      const intervalMs = azkarSettings.frequency * 60 * 60 * 1000;
      azkarIntervalRef.current = window.setInterval(showNotification, intervalMs);
    }

    return () => {
      if (azkarIntervalRef.current) {
        clearInterval(azkarIntervalRef.current);
      }
    };
  }, [azkarSettings]);


  useEffect(() => {
     const checkTafsirDownloads = async () => {
        await db.initDB();
        const downloadedSet = new Set<number>();
        await Promise.all(surahs.map(async (surah) => {
            const count = await db.getDownloadedTafsirCountForSurah(surah.id);
            if (count >= surah.numberOfAyahs) {
                downloadedSet.add(surah.id);
            }
        }));
        setDownloadedTafsir(downloadedSet);
    };

    if (surahs.length > 0) {
        checkTafsirDownloads();
    }
  }, [surahs]);

  useEffect(() => {
    const loadDownloadedAudio = async () => {
        if (surahs.length === 0 || reciters.length === 0) return;

        await db.initDB();
        const keys = await db.getAllDownloadedKeys('ayahs');
        
        const counts = new Map<string, number>();
        keys.forEach(key => {
            const parts = key.split('-');
            if (parts.length === 3) {
                const mapKey = `${parts[0]}-${parts[1]}`;
                counts.set(mapKey, (counts.get(mapKey) || 0) + 1);
            }
        });

        const newDownloadedItems: DownloadedItem[] = [];
        const newDownloadedAudio = new Set<string>();

        for (const [key, count] of counts.entries()) {
            const [reciterId, surahIdStr] = key.split('-');
            const surahId = parseInt(surahIdStr, 10);

            const surah = surahs.find(s => s.id === surahId);
            const reciter = reciters.find(r => r.identifier === reciterId);

            if (surah && reciter && count >= surah.numberOfAyahs) {
                newDownloadedItems.push({ surah, reciter });
                newDownloadedAudio.add(key);
            }
        }
        setDownloadedItems(newDownloadedItems.sort((a, b) => a.surah.id - b.surah.id));
        setDownloadedAudio(newDownloadedAudio);
    };

    loadDownloadedAudio();
}, [surahs, reciters]);
  
  const calculateStats = useCallback((): ListeningStats => {
    const history: { timestamp: number; duration: number }[] = JSON.parse(localStorage.getItem('listeningHistory') || '[]');
    const completed: number[] = JSON.parse(localStorage.getItem('completedSurahs') || '[]');
  
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const secondsThisWeek = history
      .filter(item => item.timestamp >= oneWeekAgo)
      .reduce((total, item) => total + (item.duration || 0), 0);
    
    const hoursThisWeek = secondsThisWeek / 3600;
    const surahsCompleted = new Set(completed).size;
  
    return { hoursThisWeek, surahsCompleted };
  }, []);

  useEffect(() => {
    setStats(calculateStats());
  }, [calculateStats]);
  
  const logListenedAyah = useCallback((duration: number) => {
    if (!duration || duration === Infinity) return;
    const history: { timestamp: number; duration: number }[] = JSON.parse(localStorage.getItem('listeningHistory') || '[]');
    history.push({ timestamp: Date.now(), duration });
    localStorage.setItem('listeningHistory', JSON.stringify(history));
    setStats(calculateStats());
  }, [calculateStats]);
  
  const logCompletedSurah = useCallback((surahId: number) => {
    const completed: number[] = JSON.parse(localStorage.getItem('completedSurahs') || '[]');
    const completedSet = new Set(completed);
    if (!completedSet.has(surahId)) {
      completedSet.add(surahId);
      localStorage.setItem('completedSurahs', JSON.stringify(Array.from(completedSet)));
      setStats(calculateStats());
    }
  }, [calculateStats]);

  const logChallengeProgress = useCallback((surah: Surah, ayah: Ayah) => {
    setChallenge(prevChallenge => {
      if (!prevChallenge || !prevChallenge.isActive || prevChallenge.isPaused || !surah || !ayah) {
        return prevChallenge;
      }
  
      const surahIdStr = String(surah.id);
      const completedInSurah = prevChallenge.completedAyahs[surahIdStr] || [];
  
      if (completedInSurah.includes(ayah.numberInSurah)) {
        return prevChallenge;
      }
      
      const todayStr = new Date().toISOString().split('T')[0];
      const newProgress = { ...prevChallenge.progress };
      newProgress[todayStr] = (newProgress[todayStr] || 0) + 1;
  
      const newCompletedAyahs = { ...prevChallenge.completedAyahs };
      newCompletedAyahs[surahIdStr] = [...completedInSurah, ayah.numberInSurah];
      
      return {
        ...prevChallenge,
        progress: newProgress,
        completedAyahs: newCompletedAyahs,
      };
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('ronaqBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const appClassName = useMemo(() => {
    const themeClass = (currentPage === 'audio' || currentPage === 'kids') ? 'audio-page-theme' : '';
    // A mapping from theme names to custom background classes if needed
    // For now, just handling the audio page theme
    return themeClass;
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('ronaqTheme', JSON.stringify(currentTheme));
    
    const root = document.documentElement;
    const themeColors = isDarkMode ? currentTheme.dark : currentTheme.light;
    
    root.style.setProperty('--color-primary', themeColors.primary);
    root.style.setProperty('--color-background', themeColors.background);
    root.style.setProperty('--color-card', themeColors.card);
    root.style.setProperty('--color-text-primary', themeColors.textPrimary);
    root.style.setProperty('--color-text-secondary', themeColors.textSecondary);
    root.style.setProperty('--color-border-color', themeColors.border);
    root.style.setProperty('--color-background-start', themeColors.backgroundStart);
    root.style.setProperty('--color-background-end', themeColors.backgroundEnd);
    root.style.setProperty('--color-mushaf-background', themeColors.mushafBackground);
    root.style.setProperty('--color-mushaf-page', themeColors.mushafPage);
    root.style.setProperty('--color-mushaf-border', themeColors.mushafBorder);
  }, [currentTheme, isDarkMode]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [surahsResponse, recitersResponse] = await Promise.all([
          fetch('https://api.quran.com/api/v4/chapters?language=ar'),
          fetch('https://api.quran.com/api/v4/resources/recitations?language=ar')
        ]);

        if (!surahsResponse.ok) throw new Error('Failed to fetch surahs');
        if (!recitersResponse.ok) throw new Error('Failed to fetch reciters');

        const surahsData = await surahsResponse.json();
        const mappedSurahs: Surah[] = surahsData.chapters.map((s: any) => ({
          id: s.id,
          name: s.name_arabic,
          revelationType: s.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
          numberOfAyahs: s.verses_count,
        }));
        setSurahs(mappedSurahs);

        const recitersData = await recitersResponse.json();
        
        // Pre-process to find reciters with multiple styles
        const reciterStyleCounts = new Map<string, Set<string>>();
        recitersData.recitations.forEach((r: any) => {
          if (!r.reciter_name) return;
          if (!reciterStyleCounts.has(r.reciter_name)) {
            reciterStyleCounts.set(r.reciter_name, new Set());
          }
          if (r.style) {
            reciterStyleCounts.get(r.reciter_name)!.add(r.style);
          }
        });

        const mappedReciters: Reciter[] = recitersData.recitations
          .map((r: any) => {
            const reciterName = r.reciter_name;
            if (!reciterName) return null;

            const style = r.style;
            const stylesForThisReciter = reciterStyleCounts.get(reciterName);

            let displayName = reciterName;

            if (style) {
              const hasOtherStyles = stylesForThisReciter && stylesForThisReciter.size > 1;
              if (style !== 'Murattal' || hasOtherStyles) {
                  const arabicStyle = STYLE_ARABIC_MAP[style] || style;
                  displayName = `${reciterName} (${arabicStyle})`;
              }
            }
            
            return {
              identifier: String(r.id),
              name: displayName,
              englishName: r.translated_name?.name || reciterName,
              rawName: reciterName,
              style: style || 'Murattal',
            };
          })
          .filter((r): r is Reciter => r !== null)
          .sort((a: Reciter, b: Reciter) => a.name.localeCompare(b.name, 'ar'));
        
        setReciters(mappedReciters);

        if (mappedReciters.length > 0 && !didRestoreState.current) {
          const defaultReciter = mappedReciters.find(r => r.rawName.includes('العفاسي')) || mappedReciters[0];
          setSelectedReciter(defaultReciter);
        }

      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!currentSurah || !selectedReciter) return;

    const fetchAyahs = async () => {
      try {
        let startingAyahIndex = 0;
        if (seekToTime !== null && currentAyahs.length === 0) { 
        } else if (pendingPlay) {
            startingAyahIndex = currentAyahs.findIndex(ayah => ayah.numberInSurah === pendingPlay.ayahNumberInSurah) || 0;
        } else {
            const bookmarkedAyahNumber = bookmarks[currentSurah.id];
            startingAyahIndex = bookmarkedAyahNumber ? (currentAyahs.findIndex(ayah => ayah.numberInSurah === bookmarkedAyahNumber) || 0) : 0;
        }

        const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${currentSurah.id}?language=ar&words=false&audio=${selectedReciter.identifier}&fields=text_uthmani,page_number`);
        if (!response.ok) throw new Error('Failed to fetch ayahs');
        const data = await response.json();
        const ayahs: Ayah[] = data.verses.map((ayah: any) => ({
            number: ayah.id,
            audio: `https://verses.quran.com/${ayah.audio.url}`,
            text: ayah.text_uthmani,
            numberInSurah: parseInt(ayah.verse_key.split(':')[1], 10),
            page: ayah.page_number,
        }));
        setCurrentAyahs(ayahs);
        
        if (seekToTime === null) {
            const bookmarkedAyahNumber = bookmarks[currentSurah.id];
            if (bookmarkedAyahNumber) {
              const bookmarkedIndex = ayahs.findIndex(ayah => ayah.numberInSurah === bookmarkedAyahNumber);
              setCurrentAyahIndex(bookmarkedIndex !== -1 ? bookmarkedIndex : 0);
            } else {
              setCurrentAyahIndex(0);
            }
        }
      } catch (error) {
        console.error("Error fetching ayahs:", error);
        setError('Failed to load Surah audio.');
        setCurrentAyahs([]);
      }
    };

    fetchAyahs();
  }, [currentSurah, selectedReciter, bookmarks]);
  
  useEffect(() => {
    if (pendingPlay && currentSurah?.id === pendingPlay.surahId && currentAyahs.length > 0) {
      const targetIndex = currentAyahs.findIndex(a => a.numberInSurah === pendingPlay.ayahNumberInSurah);
      if (targetIndex !== -1) {
        setCurrentAyahIndex(targetIndex);
        setIsPlaying(true);
      }
      setPendingPlay(null);
    }
  }, [currentAyahs, pendingPlay, currentSurah]);

  useEffect(() => {
    if (showTafsir && currentSurah && currentAyahs.length > currentAyahIndex) {
      const currentAyah = currentAyahs[currentAyahIndex];
      const fetchTafsir = async () => {
        setIsTafsirLoading(true);
        setIsTafsirError(false);
        setCurrentTafsir(null);
        
        const surahId = currentSurah.id;
        const ayahNumberInSurah = currentAyah.numberInSurah;
        
        try {
          const cachedTafsir = await db.getTafsir(surahId, ayahNumberInSurah);
          if (cachedTafsir) {
            setCurrentTafsir(cachedTafsir);
            setIsTafsirLoading(false);
            return;
          }

          const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahId}:${ayahNumberInSurah}/ar.muyassar`);
          if (!response.ok) throw new Error('Failed to fetch Tafsir data from API.');
          const data = await response.json();
          const tafsirText = data?.data?.text;
          
          if (tafsirText) {
            await db.addTafsir(surahId, ayahNumberInSurah, tafsirText);
            setCurrentTafsir(tafsirText);
          } else {
            setCurrentTafsir("لا يوجد تفسير لهذه الآية");
          }
        } catch (err) {
          console.error("Failed to fetch/load tafsir", err);
          setCurrentTafsir("تعذر تحميل التفسير. يرجى المحاولة مرة أخرى.");
          setIsTafsirError(true);
        } finally {
          setIsTafsirLoading(false);
        }
      };
      fetchTafsir();
    }
  }, [currentSurah, currentAyahIndex, showTafsir, currentAyahs]);

  const setAudioSource = useCallback(async (ayah: Ayah | null) => {
    if (!ayah || !selectedReciter || !currentSurah) {
      setAudioSrc('');
      return;
    }

    try {
      const offlineAudio = await db.getAyah(selectedReciter.identifier, currentSurah.id, ayah.numberInSurah);
      if (offlineAudio) {
        const blobUrl = URL.createObjectURL(offlineAudio);
        setAudioSrc(blobUrl);
      } else {
        setAudioSrc(ayah.audio);
      }
    } catch {
      setAudioSrc(ayah.audio); // Fallback to network on DB error
    }
  }, [selectedReciter, currentSurah]);
  
  useEffect(() => {
    const ayah = currentAyahs.length > 0 && currentAyahIndex < currentAyahs.length
      ? currentAyahs[currentAyahIndex]
      : null;
    setAudioSource(ayah);
  }, [currentAyahs, currentAyahIndex, setAudioSource]);


  const updateMediaSession = useCallback(() => {
    if ('mediaSession' in navigator && currentSurah && selectedReciter && currentAyahs.length > 0) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${currentSurah.name} (آية ${currentAyahs[currentAyahIndex]?.numberInSurah || currentAyahIndex + 1})`,
        artist: selectedReciter.name,
        album: 'رونق',
        artwork: [
          { src: 'https://i.imgur.com/1m8xN9N.png',   sizes: '96x96',   type: 'image/png' },
          { src: 'https://i.imgur.com/1m8xN9N.png', sizes: '128x128', type: 'image/png' },
          { src: 'https://i.imgur.com/1m8xN9N.png', sizes: '192x192', type: 'image/png' },
          { src: 'https://i.imgur.com/1m8xN9N.png', sizes: '256x256', type: 'image/png' },
          { src: 'https://i.imgur.com/1m8xN9N.png', sizes: '384x384', type: 'image/png' },
          { src: 'https://i.imgur.com/1m8xN9N.png', sizes: '512x512', type: 'image/png' },
        ]
      });
    }
  }, [currentSurah, selectedReciter, currentAyahs, currentAyahIndex]);

  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession]);
  
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!currentSurah && surahs.length > 0) {
      setCurrentSurah(surahs[0]);
    }
    setIsPlaying(prev => !prev);
  }, [currentSurah, surahs]);

  const handleNextSurah = useCallback(() => {
    if (surahs.length === 0) return;
    const currentIdx = surahs.findIndex(s => s.id === currentSurah?.id);
    const nextIndex = currentIdx !== -1 ? (currentIdx + 1) % surahs.length : 0;
    setCurrentSurah(surahs[nextIndex]);
    setCurrentAyahs([]);
    setIsPlaying(true);
  }, [currentSurah, surahs]);

  const handlePrevSurah = useCallback(() => {
    if (surahs.length === 0) return;
    const currentIdx = surahs.findIndex(s => s.id === currentSurah?.id);
    const prevIndex = currentIdx !== -1 ? (currentIdx - 1 + surahs.length) % surahs.length : 0;
    setCurrentSurah(surahs[prevIndex]);
    setCurrentAyahs([]);
    setIsPlaying(true);
  }, [currentSurah, surahs]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', handlePlayPause);
      navigator.mediaSession.setActionHandler('pause', handlePlayPause);
      navigator.mediaSession.setActionHandler('nexttrack', handleNextSurah);
      navigator.mediaSession.setActionHandler('previoustrack', handlePrevSurah);
    }
  }, [handlePlayPause, handleNextSurah, handlePrevSurah]);

  const handleSurahSelect = (surah: Surah, reciter?: Reciter) => {
    const targetReciter = reciter || selectedReciter;
    if (!targetReciter) return;

    if (currentSurah?.id === surah.id && selectedReciter?.identifier === targetReciter.identifier) {
        setIsPlaying(p => !p);
        return;
    }
    
    if (reciter && reciter.identifier !== selectedReciter?.identifier) {
        setSelectedReciter(reciter);
    }

    setCurrentSurah(surah);
    setCurrentAyahs([]);
    setIsPlaying(true);
  };

  const handleAyahEnded = () => {
    logListenedAyah(currentAyahDuration);

    const surahForChallenge = currentSurah;
    const ayahForChallenge = currentAyahs[currentAyahIndex];
    if (surahForChallenge && ayahForChallenge) {
      logChallengeProgress(surahForChallenge, ayahForChallenge);
    }

    if (currentAyahIndex < currentAyahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1);
    } else {
      if (currentSurah) {
          logCompletedSurah(currentSurah.id);
      }
      handleNextSurah();
    }
  };

  const handleReciterChange = (reciter: Reciter) => {
    setSelectedReciter(reciter);
  };
  
  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleBookmark = (surahId: number, ayahNumber: number) => {
    setBookmarks(prev => {
      const newBookmarks = { ...prev };
      if (newBookmarks[surahId] === ayahNumber) {
        delete newBookmarks[surahId];
      } else {
        newBookmarks[surahId] = ayahNumber;
      }
      return newBookmarks;
    });
  };

  const handleDownloadTafsir = async (surahToDownload: Surah) => {
    const surahId = surahToDownload.id;
    if (downloadedTafsir.has(surahId) || tafsirDownloadProgress[surahId] !== undefined) return;

    const controller = new AbortController();
    tafsirDownloadControllers.current[surahId] = controller;
    setTafsirDownloadProgress(prev => ({ ...prev, [surahId]: 0 }));

    try {
        const totalAyahs = surahToDownload.numberOfAyahs;
        for (let i = 1; i <= totalAyahs; i++) {
            if (controller.signal.aborted) {
              throw new DOMException('Download cancelled by user', 'AbortError');
            }
            const existingTafsir = await db.getTafsir(surahId, i);
            if (!existingTafsir) {
              const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahId}:${i}/ar.muyassar`, { signal: controller.signal });
              if (!response.ok) throw new Error(`Failed to fetch Tafsir for Ayah ${i}`);
              const data = await response.json();
              if (data.code === 200 && data.data.text) {
                 await db.addTafsir(surahId, i, data.data.text);
              }
            }
            const progress = Math.round((i / totalAyahs) * 100);
            setTafsirDownloadProgress(prev => ({ ...prev, [surahId]: progress }));
        }
        setDownloadedTafsir(prev => new Set(prev).add(surahId));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log(`Tafsir download cancelled for Surah ${surahToDownload.name}. Progress saved.`);
      } else {
        console.error("Tafsir download failed:", err);
        setError(`Failed to download Tafsir for Surah ${surahToDownload.name}.`);
      }
    } finally {
        setTafsirDownloadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[surahId];
            return newProgress;
        });
        delete tafsirDownloadControllers.current[surahId];
    }
  };

  const handleCancelTafsirDownload = (surahToCancel: Surah) => {
      const controller = tafsirDownloadControllers.current[surahToCancel.id];
      if (controller) {
        controller.abort();
      }
  };

  const handleDeleteTafsir = async (surahId: number) => {
      await db.deleteTafsirsForSurah(surahId);
      setDownloadedTafsir(prev => {
          const newSet = new Set(prev);
          newSet.delete(surahId);
          return newSet;
      });
  };
  
  const handleDownloadAudio = async (surahToDownload: Surah, reciter: Reciter) => {
    const key = `${reciter.identifier}-${surahToDownload.id}`;
    if (downloadedAudio.has(key) || audioDownloadProgress[key] !== undefined) return;

    const controller = new AbortController();
    audioDownloadControllers.current[key] = controller;
    setAudioDownloadProgress(prev => ({ ...prev, [key]: 0 }));

    try {
        const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahToDownload.id}?language=ar&words=false&audio=${reciter.identifier}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Failed to fetch ayahs list for Surah ${surahToDownload.name}`);
        const data = await response.json();
        const ayahs: { audio: string; numberInSurah: number }[] = data.verses.map((v: any) => ({
            audio: `https://verses.quran.com/${v.audio.url}`,
            numberInSurah: parseInt(v.verse_key.split(':')[1], 10)
        }));
        
        const totalAyahs = ayahs.length;
        for (let i = 0; i < totalAyahs; i++) {
            if (controller.signal.aborted) throw new DOMException('Download cancelled', 'AbortError');
            
            const ayah = ayahs[i];
            const audioResponse = await fetch(ayah.audio, { signal: controller.signal });
            if (!audioResponse.ok) throw new Error(`Failed to download audio for Ayah ${ayah.numberInSurah}`);
            const audioBlob = await audioResponse.blob();
            await db.addAyah(reciter.identifier, surahToDownload.id, ayah.numberInSurah, audioBlob);

            const progress = Math.round(((i + 1) / totalAyahs) * 100);
            setAudioDownloadProgress(prev => ({ ...prev, [key]: progress }));
        }

        setDownloadedAudio(prev => new Set(prev).add(key));
        setDownloadedItems(prev => [...prev, { surah: surahToDownload, reciter }].sort((a,b) => a.surah.id - b.surah.id));

    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.log(`Audio download cancelled for Surah ${surahToDownload.name}.`);
        } else {
            console.error("Audio download failed:", err);
            setError(`Failed to download audio for Surah ${surahToDownload.name}.`);
        }
    } finally {
        setAudioDownloadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[key];
            return newProgress;
        });
        delete audioDownloadControllers.current[key];
    }
  };

  const handleCancelAudioDownload = (surah: Surah, reciter: Reciter) => {
      const key = `${reciter.identifier}-${surah.id}`;
      const controller = audioDownloadControllers.current[key];
      if (controller) {
          controller.abort();
      }
  };

  const handleDeleteAudio = async (surah: Surah, reciter: Reciter) => {
      await db.deleteSurahAudio(reciter.identifier, surah.id);
      const key = `${reciter.identifier}-${surah.id}`;
      
      setDownloadedAudio(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
      });

      setDownloadedItems(prev => prev.filter(item => !(item.surah.id === surah.id && item.reciter.identifier === reciter.identifier)));
  };

  
  const performSmartSearch = useCallback(async (query: string) => {
    if (!ai.current) {
        setSearchError("Smart search is not available (API key may be missing).");
        return;
    }
    if (query.trim().length < 3) {
        setAyahSearchResults([]);
        return;
    }

    setIsSearching(true);
    setSearchError(null);
    setAyahSearchResults([]);

    try {
        const response = await ai.current.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find Quranic ayahs related to: "${query}"`,
            config: {
                systemInstruction: "You are an expert Quranic scholar. Your task is to find ayahs (verses) from the Quran that are relevant to the user's search query. The user is looking for topics, keywords, or concepts. Respond ONLY with a valid JSON array matching the provided schema. Do not include markdown backticks like ```json or any text outside the JSON. If no relevant ayahs are found, return an empty array `[]`. Limit results to a maximum of 10 ayahs.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            surahId: { type: Type.NUMBER, description: 'The chapter number of the Quran.' },
                            ayahIdInSurah: { type: Type.NUMBER, description: 'The verse number within the chapter.' },
                            text: { type: Type.STRING, description: 'The full Arabic text of the verse.' },
                            surahName: { type: Type.STRING, description: 'The Arabic name of the chapter.' },
                        },
                        required: ['surahId', 'ayahIdInSurah', 'text', 'surahName'],
                    },
                },
            },
        });

        const jsonString = response.text.trim();
        const results = JSON.parse(jsonString);
        setAyahSearchResults(results);
    } catch (err) {
        console.error("Smart search failed:", err);
        setSearchError("Failed to fetch smart search results. Please try again.");
        setAyahSearchResults([]);
    } finally {
        setIsSearching(false);
    }
  }, []);

  const handleSearchQueryChange = (query: string) => {
      setSearchQuery(query);
      if (searchTimeout.current) {
          clearTimeout(searchTimeout.current);
      }
      if (query.trim()) {
          searchTimeout.current = window.setTimeout(() => {
              performSmartSearch(query);
          }, 500);
      } else {
          setAyahSearchResults([]);
          setIsSearching(false);
          setSearchError(null);
      }
  };

  const handlePlayAyahFromSearch = (ayah: SearchAyah) => {
      const targetSurah = surahs.find(s => s.id === ayah.surahId);
      if (!targetSurah) return;

      if (currentSurah?.id === ayah.surahId) {
          const targetIndex = currentAyahs.findIndex(a => a.numberInSurah === ayah.ayahIdInSurah);
          if (targetIndex !== -1) {
              setCurrentAyahIndex(targetIndex);
              setIsPlaying(true);
          }
      } else {
          setIsPlaying(false);
          setCurrentAyahs([]);
          setPendingPlay({ surahId: ayah.surahId, ayahNumberInSurah: ayah.ayahIdInSurah });
          setCurrentSurah(targetSurah);
      }
  };

  const surahSearchResults = searchQuery.trim()
    ? surahs.filter(surah => 
        surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.id.toString().includes(searchQuery)
      )
    : [];
    
  const handleBackFromError = () => {
    if (surahs.length === 0) {
      window.location.reload();
    } else {
      setError(null);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage 
                  onNavigate={setCurrentPage} 
                  stats={stats}
                  challenge={challenge}
                  muazzinSettings={sanitizedMuazzinSettings}
                  onMuazzinSettingsChange={setMuazzinSettings}
                />;
      case 'audio':
        return (
          <AudioPageLayout
            reciters={reciters}
            selectedReciter={selectedReciter}
            onReciterChange={handleReciterChange}
          >
            <div className="px-4 sm:px-6 lg:px-8 pt-6">
                <SearchBar query={searchQuery} onQueryChange={handleSearchQueryChange} />
            </div>

            <DownloadsList
                items={downloadedItems}
                onPlay={handleSurahSelect}
                onDelete={handleDeleteAudio}
                currentSurah={currentSurah}
                currentReciter={selectedReciter}
                isPlaying={isPlaying}
            />

            {currentSurah && !searchQuery.trim() && (
              <SurahDetail
                surah={currentSurah}
                currentAyah={currentAyahs[currentAyahIndex] || null}
                showTafsir={showTafsir}
                onToggleTafsir={() => setShowTafsir(prev => !prev)}
                tafsirText={currentTafsir}
                isTafsirLoading={isTafsirLoading}
                isTafsirError={isTafsirError}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
              />
            )}
            
            {searchQuery.trim().length > 0 ? (
                <SearchResults
                  surahResults={surahSearchResults}
                  ayahResults={ayahSearchResults}
                  isSearching={isSearching}
                  searchError={searchError}
                  onSurahSelect={(s) => handleSurahSelect(s)}
                  onPlayAyah={handlePlayAyahFromSearch}
                  currentSurahId={currentSurah?.id || null}
                />
            ) : (
                <SurahList 
                  surahs={surahs} 
                  onSurahSelect={handleSurahSelect} 
                  currentSurahId={currentSurah?.id || null} 
                  isPlaying={isPlaying}
                  bookmarks={bookmarks}
                  selectedReciter={selectedReciter}
                  downloadedTafsir={downloadedTafsir}
                  tafsirDownloadProgress={tafsirDownloadProgress}
                  onDownloadTafsir={handleDownloadTafsir}
                  onCancelTafsirDownload={handleCancelTafsirDownload}
                  downloadedAudio={downloadedAudio}
                  audioDownloadProgress={audioDownloadProgress}
                  onDownloadAudio={handleDownloadAudio}
                  onCancelAudioDownload={handleCancelAudioDownload}
                />
            )}
          </AudioPageLayout>
        );
      case 'reading':
        return <ReadingPage surahs={surahs} />;
      case 'quiz':
        return <QuizPage />;
      case 'asbab':
        return <AsbabNuzulPage />;
      case 'kids':
        return <KidsPage />;
      case 'ronaq_mind':
        return <RonaqMindPage surahs={surahs} reciters={reciters} />;
      case 'history':
        return <HistoryPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} stats={stats} challenge={challenge} muazzinSettings={sanitizedMuazzinSettings} onMuazzinSettingsChange={setMuazzinSettings}/>;
    }
  };


  return (
    <div className={`min-h-screen bg-background text-text-primary transition-colors duration-300 ${appClassName}`}>
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={handleCloseWelcomeModal} />
      <Settings 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        azkarSettings={azkarSettings}
        onAzkarSettingsChange={setAzkarSettings}
        surahs={surahs}
        downloadedTafsir={downloadedTafsir}
        onDeleteTafsir={handleDeleteTafsir}
      />
      <ChallengePage
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        challenge={challenge}
        onUpdateChallenge={setChallenge}
      />
      
      {notificationDhikr && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] animate-fade-in" 
          onClick={() => setNotificationDhikr(null)}
        >
          <div 
            className="bg-card rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md m-4" 
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-text-primary mb-4 text-center">تذكير أذكار</h2>
            <p className="font-amiri-quran text-2xl text-text-primary leading-loose text-center mb-6">
              {notificationDhikr}
            </p>
            <div className="text-center">
              <button 
                onClick={() => setNotificationDhikr(null)} 
                className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:opacity-90"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      <Header
        reciters={reciters}
        selectedReciter={selectedReciter}
        onReciterChange={handleReciterChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onChallengeClick={() => setIsChallengeModalOpen(true)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />
      <main className="pb-40">
        {isLoading && !surahs.length && <p className="text-center py-10">...جاري تحميل البيانات</p>}
        {error && (
          <div className="text-center py-10 px-4 animate-fade-in">
            <div className="bg-red-500/10 dark:bg-red-900/20 p-6 rounded-lg shadow-md max-w-md mx-auto">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">حدث خطأ</h3>
              <p className="text-red-500 dark:text-red-300 mb-6">{error}</p>
              <button 
                onClick={handleBackFromError}
                className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-card"
              >
                عودة
              </button>
            </div>
          </div>
        )}
        {!error && renderPage()}
      </main>
      {selectedReciter && currentPage !== 'kids' && (
        <Player
          surah={currentSurah}
          reciter={selectedReciter}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={handleNextSurah}
          onPrev={handlePrevSurah}
          onEnded={handleAyahEnded}
          audioSrc={audioSrc}
          currentAyah={currentAyahs[currentAyahIndex] || null}
          totalAyahs={currentAyahs.length}
          onDurationChange={setCurrentAyahDuration}
          onTimeUpdate={setCurrentTime}
          seekToTime={seekToTime}
          onSeeked={() => setSeekToTime(null)}
        />
      )}
    </div>
  );
};

export default App;
