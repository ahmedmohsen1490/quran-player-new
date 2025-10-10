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

export interface Muazzin {
  id: string;
  name: string;
  audioUrl: string;
}

export interface MuazzinSettings {
  country: string;
  city: string;
  method: number;
  school: 0 | 1; // 0 for Standard, 1 for Hanafi
  muazzinId: string;
  remindersEnabled: boolean;
  tune: Record<string, number>;
}

// FIX: Add missing 'PrayerSettings' interface to resolve compilation errors.
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
  mushafBackground: string;
  mushafPage: string;
  mushafBorder: string;
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
  // FIX: Add missing 'icon' property to FiqhTopic interface
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
  gender: 'male' | 'female';
}

export type AgeGroup = '3-5' | '6-8' | '9-12' | '13-15';

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
  ageGroup: AgeGroup;
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
  ageGroup: AgeGroup;
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
  ageGroup: AgeGroup;
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
  ageGroup: AgeGroup;
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

export interface DailyContent {
  contentType: 'آية قرآنية' | 'حديث شريف';
  text: string;
  source: string;
  takeaway: string;
}

// Quranic Reference Types for Non-AI Assistant
export interface HadithReference {
  text: string;
  source: string;
}

export interface AyahReference {
  ayahNumber: number;
  text: string;
  tafseer: {
    text: string;
    source: string;
  };
  tajweed: {
    text: string;
    source: string;
  };
  hadith: HadithReference[];
}

export interface SurahReference {
  surahId: number;
  surahName: string;
  ayahs: AyahReference[];
}

export interface CounselorTopic {
  id: string;
  title: string;
  icon: string;
  content: {
    introduction: string;
    psychological: {
      title: string;
      text: string;
      source: string;
    };
    spiritual: {
      title: string;
      text: string;
      source: string;
    };
    practical: {
      title: string;
      text: string;
      source: string;
    };
  };
}

// Types for Recitation Analysis
export interface TajweedRule {
  rule: string;
  word: string;
  explanation: string;
}

export interface TestPoints {
  positive: string[];
  negative: string[];
}

export interface RecitationAnalysis {
  surahId: number;
  ayahNumber: number;
  text: string;
  tajweedAnalysis: TajweedRule[];
  testPoints: TestPoints;
}