'use client';
// React hooks for i18n - Client-side only
import { useState, useEffect } from 'react';
import { i18n } from './i18n';

export function useTranslation() {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage());
  
  useEffect(() => {
    const handleLanguageChange = (newLang) => {
      setLanguage(newLang);
    };
    
    i18n.addListener(handleLanguageChange);
    
    return () => {
      i18n.removeListener(handleLanguageChange);
    };
  }, []);
  
  return {
    t: i18n.t.bind(i18n),
    language,
    setLanguage: i18n.setLanguage.bind(i18n),
    availableLanguages: i18n.getAvailableLanguages(),
    getRandomSkipMessage: i18n.getRandomSkipMessage.bind(i18n)
  };
}