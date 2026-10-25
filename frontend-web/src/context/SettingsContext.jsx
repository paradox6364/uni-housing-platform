"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translate } from '../lib/translations';

const SettingsContext = createContext(null);

const LANG_KEY = 'unihousing_lang';
const THEME_KEY = 'unihousing_theme';

// الافتراضي: عربي + وضع نهاري
export function SettingsProvider({ children }) {
  const [lang, setLang] = useState('ar');
  const [theme, setTheme] = useState('light');
  const [ready, setReady] = useState(false);

  // بعد تحميل الصفحة: اقرأ اختيارات المستخدم المحفوظة في المتصفح
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_KEY);
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedLang === 'ar' || savedLang === 'en') setLang(savedLang);
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    } catch (e) {
      // لو التخزين غير متاح نكمل بالإعدادات الافتراضية
    }
    setReady(true);
  }, []);

  // طبّق اللغة والاتجاه (يمين لليسار / يسار لليمين) على الصفحة
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }, [lang, ready]);

  // طبّق الوضع الليلي / النهاري
  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }, [theme, ready]);

  const toggleLang = useCallback(() => setLang((l) => (l === 'ar' ? 'en' : 'ar')), []);
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const value = useMemo(
    () => ({ lang, theme, isRTL: lang === 'ar', isDark: theme === 'dark', toggleLang, toggleTheme, t }),
    [lang, theme, toggleLang, toggleTheme, t]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
