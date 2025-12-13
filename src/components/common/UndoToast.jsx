/**
 * UNDO TOAST SYSTEM
 * Provides undo functionality for destructive actions
 */

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

/**
 * Show a toast with undo functionality
 * @param {string} message - Message to display
 * @param {Function} onUndo - Function to call when undo is clicked
 * @param {number} duration - Duration in ms (default 5000)
 */
export function showUndoToast(message, onUndo, duration = 5000) {
  let dismissed = false;
  
  const toastId = toast.success(message, {
    duration,
    action: {
      label: (
        <div className="flex items-center gap-1">
          <Undo2 className="h-3 w-3" />
          <span>Undo</span>
        </div>
      ),
      onClick: () => {
        if (!dismissed) {
          dismissed = true;
          onUndo();
          toast.dismiss(toastId);
          toast.info('Action undone');
        }
      }
    },
    onDismiss: () => {
      dismissed = true;
    },
    onAutoClose: () => {
      dismissed = true;
    }
  });

  return toastId;
}

/**
 * Confirmation dialog for destructive actions
 */
export function confirmDelete(itemName, itemType = 'item') {
  return new Promise((resolve) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${itemType}?\n\n"${itemName}"\n\nThis action can be undone within 5 seconds.`
    );
    resolve(confirmed);
  });
}