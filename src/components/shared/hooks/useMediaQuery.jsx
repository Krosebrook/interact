/**
 * MEDIA QUERY HOOK
 * Responsive design helper
 */

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Convenience hooks
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.MD - 1}px)`);
}

export function useIsTablet() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.MD}px) and (max-width: ${BREAKPOINTS.LG - 1}px)`);
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.LG}px)`);
}

export default useMediaQuery;