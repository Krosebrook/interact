/**
 * SERVICE WORKER INITIALIZATION
 * Registers service worker and handles updates
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function ServiceWorkerInit() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Online/offline listeners
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('You\'re back online!', {
        icon: <Wifi className="h-4 w-4" />
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('You\'re offline. Some features may be limited.', {
        icon: <WifiOff className="h-4 w-4" />,
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function registerServiceWorker() {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setRegistration(reg);
      console.log('[SW] Service Worker registered:', reg.scope);

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              toast.info('New version available!', {
                description: 'Click to update the app.',
                action: {
                  label: 'Update',
                  onClick: handleUpdate
                },
                duration: 10000
              });
            }
          });
        }
      });

      // Check for waiting worker on page load
      if (reg.waiting) {
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.error('[SW] Registration failed:', error);
    }
  }

  function handleUpdate() {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // Render offline indicator
  if (isOffline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg shadow-lg">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline Mode</span>
      </div>
    );
  }

  // Render update button if available
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={handleUpdate}
          className="bg-int-orange hover:bg-int-orange/90 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Update Available
        </Button>
      </div>
    );
  }

  return null;
}