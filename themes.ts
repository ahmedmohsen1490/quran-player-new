import { Theme } from './types';

export const DEFAULT_THEME: Theme = {
  name: 'Islamic Blue & Gold',
  light: {
    primary: '#2563eb', // blue-600
    background: '#f8fafd',
    card: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    backgroundStart: '#f8fafd',
    backgroundEnd: '#eef4ff',
  },
  dark: {
    primary: '#f59e0b', // amber-500
    background: '#111827',
    card: '#1f2937', // gray-800
    textPrimary: '#f9fafb', // gray-50
    textSecondary: '#a1a1aa', // zinc-400
    border: '#3f3f46', // zinc-700
    backgroundStart: '#111827',
    backgroundEnd: '#25210f',
  },
};

export const PREDEFINED_THEMES: Theme[] = [
  DEFAULT_THEME,
  {
    name: 'Emerald Green',
    light: {
      primary: '#059669', // emerald-600
      background: '#f9fafb',
      card: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      backgroundStart: '#f9fafb',
      backgroundEnd: '#f0fdf4', // emerald-50
    },
    dark: {
      primary: '#10b981', // emerald-500
      background: '#111827',
      card: '#1f2937',
      textPrimary: '#f9fafb',
      textSecondary: '#a1a1aa',
      border: '#3f3f46',
      backgroundStart: '#111827',
      backgroundEnd: '#064e3b', // emerald-900
    },
  },
  {
    name: 'Royal Purple',
    light: {
      primary: '#7c3aed', // violet-600
      background: '#f9fafb',
      card: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      backgroundStart: '#f9fafb',
      backgroundEnd: '#f5f3ff', // violet-50
    },
    dark: {
      primary: '#8b5cf6', // violet-500
      background: '#111827',
      card: '#1f2937',
      textPrimary: '#f9fafb',
      textSecondary: '#a1a1aa',
      border: '#3f3f46',
      backgroundStart: '#1e1b4b', // indigo-950
      backgroundEnd: '#312e81', // indigo-900
    },
  },
];