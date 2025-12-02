/**
 * TOAST FEEDBACK UTILITIES
 * Consistent feedback messages with proper formatting and icons
 */

import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
  Trophy,
  Calendar,
  Users,
  Heart,
  Gift,
  Trash2
} from 'lucide-react';
import React from 'react';

// Custom toast icons
const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
  sparkles: Sparkles,
  trophy: Trophy,
  calendar: Calendar,
  users: Users,
  heart: Heart,
  gift: Gift,
  deleted: Trash2
};

const iconColors = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  loading: 'text-int-orange',
  sparkles: 'text-int-orange',
  trophy: 'text-amber-500',
  calendar: 'text-blue-500',
  users: 'text-emerald-500',
  heart: 'text-rose-500',
  gift: 'text-purple-500',
  deleted: 'text-slate-500'
};

/**
 * Create a custom toast icon component
 */
function ToastIcon({ type }) {
  const Icon = icons[type] || icons.info;
  const colorClass = iconColors[type] || iconColors.info;
  
  return (
    <Icon className={`h-5 w-5 ${colorClass} ${type === 'loading' ? 'animate-spin' : ''}`} />
  );
}

/**
 * Enhanced toast functions with consistent styling
 */
export const feedback = {
  /**
   * Success feedback
   */
  success(title, description) {
    return toast.success(title, {
      description,
      icon: <ToastIcon type="success" />
    });
  },

  /**
   * Error feedback
   */
  error(title, description) {
    return toast.error(title, {
      description,
      icon: <ToastIcon type="error" />
    });
  },

  /**
   * Warning feedback
   */
  warning(title, description) {
    return toast.warning(title, {
      description,
      icon: <ToastIcon type="warning" />
    });
  },

  /**
   * Info feedback
   */
  info(title, description) {
    return toast.info(title, {
      description,
      icon: <ToastIcon type="info" />
    });
  },

  /**
   * Loading feedback - returns dismiss function
   */
  loading(title, description) {
    return toast.loading(title, {
      description,
      icon: <ToastIcon type="loading" />
    });
  },

  /**
   * Promise feedback - for async operations
   */
  promise(promise, messages) {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Done!',
      error: messages.error || 'Something went wrong'
    });
  },

  // ---- Contextual feedback for common actions ----

  /**
   * Item created
   */
  created(itemType) {
    return toast.success(`${itemType} created!`, {
      description: `Your ${itemType.toLowerCase()} has been created successfully.`,
      icon: <ToastIcon type="sparkles" />
    });
  },

  /**
   * Item updated
   */
  updated(itemType) {
    return toast.success(`${itemType} updated!`, {
      description: `Your changes have been saved.`,
      icon: <ToastIcon type="success" />
    });
  },

  /**
   * Item deleted
   */
  deleted(itemType) {
    return toast.success(`${itemType} deleted`, {
      description: `The ${itemType.toLowerCase()} has been removed.`,
      icon: <ToastIcon type="deleted" />
    });
  },

  /**
   * Item duplicated
   */
  duplicated(itemType) {
    return toast.success(`${itemType} duplicated!`, {
      description: `A copy has been created.`,
      icon: <ToastIcon type="sparkles" />
    });
  },

  /**
   * Event scheduled
   */
  eventScheduled(eventTitle) {
    return toast.success('Event scheduled!', {
      description: eventTitle ? `"${eventTitle}" has been added to the calendar.` : 'Your event has been scheduled.',
      icon: <ToastIcon type="calendar" />
    });
  },

  /**
   * Recognition sent
   */
  recognitionSent(recipientName) {
    return toast.success('Recognition sent!', {
      description: recipientName ? `Your recognition to ${recipientName} was delivered.` : 'Your recognition was delivered.',
      icon: <ToastIcon type="heart" />
    });
  },

  /**
   * Points awarded
   */
  pointsAwarded(points, reason) {
    return toast.success(`+${points} points!`, {
      description: reason || 'Keep up the great work!',
      icon: <ToastIcon type="trophy" />
    });
  },

  /**
   * Link copied
   */
  linkCopied() {
    return toast.success('Link copied!', {
      description: 'The link has been copied to your clipboard.',
      icon: <ToastIcon type="success" />
    });
  },

  /**
   * Notification sent
   */
  notificationSent(channel = 'Teams') {
    return toast.success(`Notification sent!`, {
      description: `The notification has been sent to ${channel}.`,
      icon: <ToastIcon type="users" />
    });
  },

  /**
   * Reward redeemed
   */
  rewardRedeemed(rewardName) {
    return toast.success('Reward redeemed!', {
      description: rewardName ? `You've redeemed "${rewardName}"` : 'Your reward has been redeemed.',
      icon: <ToastIcon type="gift" />
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss(toastId) {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    toast.dismiss();
  }
};

export default feedback;