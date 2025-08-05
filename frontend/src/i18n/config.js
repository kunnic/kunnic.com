// src/i18n/config.js
import en from './locales/en.json';
import vi from './locales/vi.json';

export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' }
};

export const translations = {
  en,
  vi
};

export const defaultLanguage = 'vi';

// Get nested translation value by dot notation (e.g., "nav.blog")
export const getTranslation = (translations, key, fallback = key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], translations) || fallback;
};
