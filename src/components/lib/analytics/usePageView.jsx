/**
 * PAGE VIEW TRACKING HOOK
 * Track page views for analytics
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from './eventTracking';

export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view', {
      page_path: location.pathname,
      page_search: location.search,
      page_title: document.title
    });
  }, [location]);
}

export default usePageView;