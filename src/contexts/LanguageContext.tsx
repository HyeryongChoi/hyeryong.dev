'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import en from '@/locales/en.json';
import ko from '@/locales/ko.json';

export type Locale = 'ko' | 'en';

type Messages = typeof en;

const messages: Record<Locale, Messages> = {
  en,
  ko,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'locale';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === 'ko' || stored === 'en') return stored;
  return 'en';
}

function resolveMessage(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === 'string') return current;
  return undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getInitialLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next === 'ko' ? 'ko' : 'en';
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale === 'ko' ? 'ko' : 'en';
  }, [mounted, locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let msg =
        resolveMessage(messages[locale] as unknown as Record<string, unknown>, key) ??
        resolveMessage(messages.en as unknown as Record<string, unknown>, key) ??
        key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          msg = msg.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return msg;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
