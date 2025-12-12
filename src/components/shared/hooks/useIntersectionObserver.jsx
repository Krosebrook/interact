/**
 * INTERSECTION OBSERVER HOOK
 * Detect when element enters viewport (infinite scroll, lazy loading)
 */

import { useState, useEffect, useRef } from 'react';

export function useIntersectionObserver(options = {}) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options;

  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);
  const observer = useRef(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    if (!node || frozen) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observer.current.observe(node);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, [node, threshold, root, rootMargin, frozen]);

  return [setNode, entry];
}

export default useIntersectionObserver;