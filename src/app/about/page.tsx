'use client';

import { useState, useEffect } from 'react';
import { useWindow } from '@/contexts/WindowContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';

const INITIAL_LOAD_MS = 3000;

export default function AboutPage() {
  const { t } = useLanguage();
  const { setShowStartMenu } = useWindow();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsInitialLoading(false), INITIAL_LOAD_MS);
    return () => clearTimeout(t);
  }, []);

  if (isInitialLoading) {
    return <LoadingSpinner asDialog label={t("blog.loading")} />;
  }

  return (
    <main className="desktop" onClick={() => setShowStartMenu(false)}>
      <div className="text-center mt-20">
        <h1 className="text-4xl font-bold text-white mb-4">{t("about.title")}</h1>
        <p className="text-xl text-white">{t("about.comingSoon")}</p>
      </div>
    </main>
  );
}
