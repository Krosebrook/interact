/**
 * GLOBAL KEYBOARD SHORTCUTS
 * Provides keyboard navigation throughout the app
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';

export default function KeyboardShortcuts({ onNewEvent, onSearch }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ignore if user is typing in an input/textarea
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        // Allow Escape to blur input fields
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      // Global shortcuts
      if (modKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            onSearch?.();
            toast.info('Search coming soon!');
            break;
          case 'n':
            e.preventDefault();
            onNewEvent?.();
            navigate(createPageUrl('Calendar'));
            toast.success('Opening event scheduler');
            break;
          case 'h':
            e.preventDefault();
            navigate(createPageUrl('Dashboard'));
            break;
          case 'p':
            e.preventDefault();
            navigate(createPageUrl('UserProfile'));
            break;
          case 's':
            e.preventDefault();
            navigate(createPageUrl('Settings'));
            break;
          default:
            break;
        }
      }

      // Non-modifier shortcuts
      switch (e.key) {
        case 'Escape':
          // Close any open dialogs/modals
          const closeButtons = document.querySelectorAll('[data-dialog-close]');
          if (closeButtons.length > 0) {
            closeButtons[closeButtons.length - 1].click();
          }
          break;
        case '?':
          if (!modKey) {
            e.preventDefault();
            showShortcutsHelp();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onNewEvent, onSearch]);

  return null;
}

function showShortcutsHelp() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const mod = isMac ? '⌘' : 'Ctrl';

  toast.info(
    <div className="space-y-2 text-sm">
      <div className="font-semibold mb-2">Keyboard Shortcuts</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-600">{mod} + K</span>
          <span>Search</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-600">{mod} + N</span>
          <span>New Event</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-600">{mod} + H</span>
          <span>Dashboard</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-600">{mod} + P</span>
          <span>Profile</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-600">{mod} + S</span>
          <span>Settings</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-600">Esc</span>
          <span>Close Dialog</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-600">?</span>
          <span>Show This Help</span>
        </div>
      </div>
    </div>,
    { duration: 8000 }
  );
}