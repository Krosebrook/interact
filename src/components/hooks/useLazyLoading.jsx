import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Lazy loading hook for lists and infinite scroll
 * Implements intersection observer for performance
 */
export function useLazyLoading() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  return { ref, inView };
}

/**
 * Virtual scrolling for large lists
 * Only renders items in viewport + buffer
 */
export function useVirtualScroll(items, itemHeight = 80, bufferSize = 5) {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
      const end = Math.min(
        items.length,
        Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferSize
      );

      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [items.length, itemHeight, bufferSize]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * itemHeight;

  return {
    containerRef,
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight
  };
}

/**
 * Pagination hook with cursor-based navigation
 * More efficient than offset-based for large datasets
 */
export function useCursorPagination(queryFn, pageSize = 20) {
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await queryFn(nextCursor, pageSize);
      setItems(prev => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, nextCursor, pageSize, isLoading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
  }, []);

  return { items, isLoading, hasMore, loadMore, reset };
}