"use client";

import { useState, useEffect } from 'react';
import { getTranslations, detectLanguage, Language } from '../utils/translations';

const LANGUAGE_COOKIE = 'yt-mosaic-language';

const setCookie = (name: string, value: string, days: number = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string => {
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
  return cookie ? cookie.trim().substring(name.length + 1) : '';
};

export const useTranslation = () => {
  const [language, setLanguageState] = useState<Language>('en');
  const [t, setT] = useState(getTranslations('en'));

  useEffect(() => {
    // Check if user has a saved language preference
    const savedLang = getCookie(LANGUAGE_COOKIE) as Language;
    const langToUse = (savedLang === 'fr' || savedLang === 'en') ? savedLang : detectLanguage();
    
    setLanguageState(langToUse);
    setT(getTranslations(langToUse));
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setT(getTranslations(lang));
    setCookie(LANGUAGE_COOKIE, lang);
  };

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'fr' : 'en';
    setLanguage(newLang);
  };

  return { t, language, setLanguage, toggleLanguage };
};

