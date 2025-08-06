// src/i18n/config.js
import en from './locales/en.json';
import vi from './locales/vi.json';
import zhCn from './locales/zh-cn.json';

export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  'zh-cn': { name: '简体中文', flag: '🇨🇳' }
};

export const translations = {
  en,
  vi,
  'zh-cn': zhCn
};

export const defaultLanguage = 'vi';

// Get nested translation value by dot notation (e.g., "nav.blog")
export const getTranslation = (translations, key, fallback = key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], translations) || fallback;
};
