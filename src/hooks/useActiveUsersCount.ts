import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const countryBases: Record<string, { min: number; max: number; offset: number }> = {
  pt: { min: 45, max: 97, offset: 0 },
  en: { min: 28, max: 74, offset: 7 },
  es: { min: 18, max: 58, offset: 13 },
  it: { min: 12, max: 42, offset: 19 },
};

// Singleton state so every consumer shares the same number
let globalCount: Record<string, number> = {};
let listeners: Set<() => void> = new Set();
let activeLanguage: string | null = null;
let timerRef: ReturnType<typeof setTimeout> | null = null;
let intervalRef: ReturnType<typeof setInterval> | null = null;

function getInitialCount(lang: string) {
  const cfg = countryBases[lang] || countryBases.pt;
  const hour = new Date().getHours();
  const peakBonus = hour >= 10 && hour <= 22 ? 12 : 0;
  return cfg.min + cfg.offset + peakBonus + Math.floor(Math.random() * 10);
}

function startTicking(lang: string) {
  if (timerRef) clearTimeout(timerRef);
  if (intervalRef) clearInterval(intervalRef);
  activeLanguage = lang;

  const cfg = countryBases[lang] || countryBases.pt;

  const scheduleNext = () => {
    const delay = 3000 + Math.random() * 5000;
    timerRef = setTimeout(() => {
      const delta = Math.floor(Math.random() * 9) - 3;
      let next = (globalCount[lang] || getInitialCount(lang)) + delta;
      next = Math.max(cfg.min, Math.min(cfg.max, next));
      globalCount[lang] = next;
      listeners.forEach(fn => fn());
    }, delay);
  };

  scheduleNext();
  intervalRef = setInterval(() => {
    if (timerRef) clearTimeout(timerRef);
    scheduleNext();
  }, 8000);
}

export function useActiveUsersCount() {
  const { language } = useLanguage();
  const [, forceUpdate] = useState(0);

  // Initialize count for this language if not set
  if (globalCount[language] === undefined) {
    globalCount[language] = getInitialCount(language);
  }

  useEffect(() => {
    const listener = () => forceUpdate(c => c + 1);
    listeners.add(listener);

    // Restart ticker if language changed
    if (activeLanguage !== language) {
      startTicking(language);
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        if (timerRef) clearTimeout(timerRef);
        if (intervalRef) clearInterval(intervalRef);
        activeLanguage = null;
      }
    };
  }, [language]);

  return globalCount[language] || getInitialCount(language);
}
