"use client";

import React from 'react';
import { Moon, Sun, Languages } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

// زرّا تغيير اللغة والوضع الليلي. يُستخدمان في الـ Navbar ويمكن وضعهما في أي صفحة.
export default function SettingsToggles({ className = '' }) {
  const { t, isDark, toggleLang, toggleTheme } = useSettings();

  const buttonClass =
    'inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-semibold ' +
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={toggleLang}
        aria-label={t('toggle.languageLabel')}
        className={`${buttonClass} px-2.5`}
      >
        <Languages className="w-4 h-4" />
        <span>{t('toggle.language')}</span>
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? t('toggle.toLight') : t('toggle.toDark')}
        title={isDark ? t('toggle.toLight') : t('toggle.toDark')}
        className={`${buttonClass} w-9`}
      >
        {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
      </button>
    </div>
  );
}
