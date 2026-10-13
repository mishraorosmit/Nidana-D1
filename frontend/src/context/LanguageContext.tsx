import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageMode, TranslationDictionary, translations } from '../data/translations';

interface LanguageContextType {
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'nidana_preferred_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [languageMode, setLanguageModeState] = useState<LanguageMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageMode;
        if (saved && (saved === 'odia' || saved === 'bilingual' || saved === 'english')) {
          return saved;
        }
      } catch (e) {
        console.warn('Could not read language from localStorage:', e);
      }
    }
    return 'odia';
  });

  const setLanguageMode = (mode: LanguageMode) => {
    setLanguageModeState(mode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, mode);
      } catch (e) {
        console.warn('Could not save language to localStorage:', e);
      }
    }
  };

  const toggleLanguage = () => {
    setLanguageMode(languageMode === 'odia' ? 'english' : 'odia');
  };

  const t = translations[languageMode] || translations.english;

  return (
    <LanguageContext.Provider value={{ languageMode, setLanguageMode, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
