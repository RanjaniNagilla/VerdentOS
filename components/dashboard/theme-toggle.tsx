'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_STORAGE_KEY = 'verdantos-theme';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Reads the persisted preference (falling back to the current class on
  // <html>, in case an inline script already set it before hydration) once
  // on mount. Deferred to an effect since window/localStorage don't exist
  // during server rendering.
  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = stored ? stored === 'dark' : document.documentElement.classList.contains('dark');
    setIsDark(prefersDark);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark, isMounted]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((prev) => !prev)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    >
      {isDark ? <Sun className="h-4 w-4" strokeWidth={2} /> : <Moon className="h-4 w-4" strokeWidth={2} />}
    </button>
  );
}