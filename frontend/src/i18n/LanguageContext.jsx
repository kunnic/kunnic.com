// src/i18n/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, defaultLanguage, getTranslation } from './config';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get saved language from localStorage or use default
    return localStorage.getItem('language') || defaultLanguage;
  });

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  const t = (key, fallback) => {
    return getTranslation(translations[currentLanguage], key, fallback);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
