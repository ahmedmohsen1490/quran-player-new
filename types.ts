
export interface Surah {
  id: number;
  name: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface Reciter {
  identifier: string;
  name: string;
  englishName: string;
  rawName: string;
  style: string | null;
}

export interface Ayah {
  number: number;
  audio: string;
  text: string;
  numberInSurah: number;
  page: number;
}

export interface ListeningStats {
  hoursThisWeek: number;
  surahsCompleted: number;
}

export interface Tafsir {
  text: string;
}

export interface PrayerSettings {
  country: string;
  region: string;
  method: number;
}

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string; // For dynamic access
}

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  backgroundStart: string;
  backgroundEnd: string;
}

export interface Theme {
  name: string;
  isCustom?: boolean;
  light: ThemeColors;
  dark: ThemeColors;
}

export interface QuranChallenge {
  isActive: boolean;
  isPaused: boolean;
  startDate: string; // ISO Date string
  durationDays: number;
  progress: Record<string, number>; // YYYY-MM-DD -> count
  completedAyahs: Record<string, number[]>; // surahId (as string key) -> array of ayah numbers in surah
}

export interface SearchAyah {
  surahId: number;
  ayahIdInSurah: number;
  text: string;
  surahName: string;
}

export interface AzkarSettings {
  isEnabled: boolean;
  frequency: number; // in hours
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  shortExplanation: string;
  detailedExplanation: string;
  reference: string;
}

export interface FiqhTopic {
  id: string;
  title: string;
  color: 'blue' | 'green' | 'amber' | 'sky' | 'slate';
  icon: string;
  questions: QuizQuestion[];
}

export interface FiqhProgress {
  [topicId: string]: {
    correctAnswers: number;
    answeredQuestionIds: number[];
  };
}

export interface GeneralProgress {
  correctAnswers: number;
  answeredQuestionIds: number[];
}


export interface NuzulStory {
  ayahRange: string;
  shortSummary: string;
  detailedVersion: string;
  source: string;
}

export interface SurahNuzul {
  surahId: number;
  surahName: string;
  stories: NuzulStory[];
}

// Kid's World Types
export interface KidProfile {
  id: number;
  name: string;
  age: number;
}

export interface KidsStory {
  id: number;
  title: string;
  content: string; // Simplified story text
  moral: string; // Lesson learned
  question: {
    text: string;
    options: string[];
    correctAnswer: string;
  };
  ageGroup: '3-5' | '6-8' | '9-12';
  illustration: string; // Emoji for visual aid
}

export interface KidsMatchingPair {
  id: number;
  item1: string;
  item2: string;
}

export interface KidsGame {
  id: string;
  title: string;
  type: 'quiz' | 'matching';
  questions?: KidsQuizQuestion[];
  matchingPairs?: KidsMatchingPair[];
  ageGroup: '3-5' | '6-8' | '9-12';
}

export interface KidsQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface KidsDhikr {
  id: string;
  title: string;
  dhikr: string;
  audio: string;
  benefit: string;
  ageGroup: '3-5' | '6-8' | '9-12';
}

export interface Flashcard {
  id: number;
  front: string; // e.g., Arabic letter
  back: string;  // e.g., Pronunciation
}

export interface FlashcardSet {
  id: string;
  title: string;
  cards: Flashcard[];
  ageGroup: '3-5' | '6-8' | '9-12';
}

export interface KidsProgress {
  storiesCompleted: number[];
  gamesCorrectAnswers: Record<string, number[]>; // gameId -> [questionId]
  dhikrCompleted: string[];
  flashcardsCompleted: string[];
}

// History Page Types
export interface HistoryTopic {
  title: string;
  preview: string;
  fullContent: string;
  source: string;
}

export interface Companion {
  name: string;
  preview: string;
  fullContent: string;
  source: string;
}

export interface Battle {
  name: string;
  date: string;
  reason: string;
  participants: string;
  events: string;
  results: string;
  stories: string;
}