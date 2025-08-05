// src/hooks/useTranslations.js
import { useLanguage } from '../i18n';

export const useTranslations = () => {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  
  // Helper function for page-specific translations
  const getPageTranslations = (pageName) => {
    return {
      title: t(`pages.${pageName}.title`),
      loading: t(`pages.${pageName}.loading`),
      error: t(`pages.${pageName}.error`),
    };
  };

  // Helper function for common translations
  const getCommonTranslations = () => {
    return {
      loading: t('common.loading'),
      error: t('common.error'),
      retry: t('common.retry'),
      close: t('common.close'),
    };
  };

  // Helper function for navigation translations
  const getNavTranslations = () => {
    return {
      blog: t('nav.blog'),
      music: t('nav.music'),
      gallery: t('nav.gallery'),
      start: t('nav.start'),
    };
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    getPageTranslations,
    getCommonTranslations,
    getNavTranslations,
  };
};
