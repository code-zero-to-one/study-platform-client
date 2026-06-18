'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe `matchMedia` hook. Returns `false` on the server and during the
 * first client render (avoids hydration mismatch), then reflects the live match
 * after mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
}
