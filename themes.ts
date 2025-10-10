import { Theme } from './types';

export const DEFAULT_THEME: Theme = {
  name: 'Desert Serenity',
  light: {
    primary: '#0d9488', // Teal 600
    background: '#fbf9f3', // Warm Beige
    card: '#ffffff',
    textPrimary: '#475569', // Slate 600
    textSecondary: '#94a3b8', // Slate 400
    border: '#e2e8f0', // Slate 200
    backgroundStart: '#fbf9f3',
    backgroundEnd: '#f5f1e8',
    mushafBackground: '#fdf6e3',
    mushafPage: '#fdfaf0',
    mushafBorder: '#dcd6c0',
  },
  dark: {
    primary: '#f59e0b', // Amber 500
    background: '#0f172a', // Slate 900
    card: '#1e293b', // Slate 800
    textPrimary: '#f1f5f9', // Slate 100
    textSecondary: '#94a3b8', // Slate 400
    border: '#334155', // Slate 700
    backgroundStart: '#0f172a',
    backgroundEnd: '#172135',
    mushafBackground: '#2a251c',
    mushafPage: '#3a3325',
    mushafBorder: '#5c5340',
  },
};

export const PREDEFINED_THEMES: Theme[] = [
  DEFAULT_THEME,
  {
    name: 'Medina Green',
    light: {
      primary: '#166534', // Green 800
      background: '#f0fdf4', // Green 50
      card: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      backgroundStart: '#f0fdf4',
      backgroundEnd: '#dcfce7',
      mushafBackground: '#f0fdf4',
      mushafPage: '#f6fff8',
      mushafBorder: '#bbf7d0',
    },
    dark: {
      primary: '#4ade80', // Green 400
      background: '#132a13',
      card: '#1a3a1a',
      textPrimary: '#f0fdf4',
      textSecondary: '#a3b3a3',
      border: '#2f5d2f',
      backgroundStart: '#132a13',
      backgroundEnd: '#102010',
      mushafBackground: '#1a3a1a',
      mushafPage: '#1f451f',
      mushafBorder: '#2f5d2f',
    },
  },
  {
    name: 'Kaaba Noir',
    light: { // Less common to use this theme in light mode, but provided for consistency
      primary: '#1f2937',
      background: '#f9fafb',
      card: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      backgroundStart: '#f9fafb',
      backgroundEnd: '#f3f4f6',
      mushafBackground: '#f9fafb',
      mushafPage: '#ffffff',
      mushafBorder: '#d1d5db',
    },
    dark: {
      primary: '#d4af37', // Soft Gold
      background: '#111111',
      card: '#1c1c1c',
      textPrimary: '#f5f5f5',
      textSecondary: '#a3a3a3',
      border: '#333333',
      backgroundStart: '#111111',
      backgroundEnd: '#1c1c1c',
      mushafBackground: '#1c1c1c',
      mushafPage: '#242424',
      mushafBorder: '#444444',
    },
  },
];
