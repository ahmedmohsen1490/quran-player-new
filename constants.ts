import { Muazzin } from './types';

export const AZKAR_LIST = [
  "سبحان الله وبحمده، سبحان الله العظيم",
  "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
  "اللهم صلِّ وسلِّم على نبينا محمد",
  "أستغفر الله العظيم وأتوب إليه",
  "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر",
  "لا حول ولا قوة إلا بالله",
  "اللهم أعنِّ على ذكرك وشكرك وحسن عبادتك",
  "يا حي يا قيوم برحمتك أستغيث",
  "رضيت بالله ربًا، وبالإسلام دينًا، وبمحمدٍ نبيًا",
];

export const SURAH_PAGE_MAP: { [key: number]: number } = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518,
  51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542, 59: 545, 60: 549,
  61: 551, 62: 553, 63: 554, 64: 556, 65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568,
  71: 570, 72: 572, 73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585,
  81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594,
  91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602, 109: 603,
  110: 603, 111: 603, 112: 604, 113: 604, 114: 604
};

export const CALCULATION_METHODS = [
    { id: 1, name: 'Muslim World League' },
    { id: 2, name: 'ISNA (North America)' },
    { id: 3, name: 'Egyptian General Authority' },
    { id: 4, name: 'Umm Al-Qura, Makkah' },
    { id: 5, name: 'University of Islamic Sciences, Karachi' },
    { id: 0, name: 'Shia Ithna-Ansari' },
    { id: 7, name: 'Institute of Geophysics, University of Tehran' },
    { id: 8, name: 'Kuwait' },
    { id: 9, name: 'Qatar' },
    { id: 10, name: 'Singapore' },
    { id: 11, name: 'Union Organization islamic de France' },
    { id: 12, name: 'Diyanet İşleri Başkanlığı, Turkey' },
    { id: 13, name: 'Spiritual Administration of Muslims of Russia' },
    { id: 14, name: 'Moonsighting Committee Worldwide' },
    { id: 15, name: 'Dubai' },
];

export const COUNTRY_METHOD_MAP: { [key: string]: number } = {
  "Algeria": 11,
  "Australia": 1,
  "Bahrain": 8,
  "Canada": 2,
  "Egypt": 3,
  "India": 5,
  "Indonesia": 1,
  "Iraq": 1,
  "Jordan": 1,
  "Kuwait": 8,
  "Lebanon": 1,
  "Libya": 3,
  "Malaysia": 1,
  "Morocco": 11,
  "Oman": 1,
  "Pakistan": 5,
  "Palestine": 1,
  "Qatar": 9,
  "Saudi Arabia": 4,
  "Somalia": 3,
  "Sudan": 3,
  "Syria": 1,
  "Tunisia": 11,
  "United Arab Emirates": 15,
  "United Kingdom": 1,
  "United States": 2,
  "Yemen": 1,
};

export const MUAZZIN_LIST: Muazzin[] = [
  { id: 'mishary', name: 'مشاري راشد العفاسي', audioUrl: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'mecca', name: 'أذان الحرم المكي', audioUrl: 'https://www.islamcan.com/audio/adhan/azan15.mp3' },
  { id: 'medina', name: 'أذان الحرم المدني', audioUrl: 'https://www.islamcan.com/audio/adhan/azan16.mp3' },
  { id: 'egypt', name: 'الأذان المصري', audioUrl: 'https://www.islamcan.com/audio/adhan/azan13.mp3' },
];