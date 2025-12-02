/**
 * HOOKS BARREL EXPORT
 * Centralized export for all custom hooks
 * Version: 4.0.0
 * Last Updated: 2025-12-02
 * 
 * Organization:
 * - Authentication & User: User state, auth, permissions
 * - Data Fetching: Entity data fetching hooks
 * - Actions & Mutations: State management and mutations
 * - Feature Hooks: Re-exported from feature directories
 */

// ============================================================================
// AUTHENTICATION & USER
// ============================================================================
export { useUserData } from './useUserData';
export { useAuth } from './useAuth';
export { useUserProfile } from './useUserProfile';
export { usePermissions } from './usePermissions';

// ============================================================================
// DATA FETCHING
// ============================================================================
export { useEventData } from './useEventData';
export { useActivities } from './useActivities';
export { useTeamData } from './useTeamData';
export { useEntities } from './useEntities';
export { useGamificationData } from './useGamificationData';
export { useLeaderboard } from './useLeaderboard';

// ============================================================================
// ACTIONS & MUTATIONS
// ============================================================================
export { useEventScheduling } from './useEventScheduling';
export { useFormState, useDialogForm } from './useFormState';

// ============================================================================
// FEATURE HOOKS (Re-exported from feature directories)
// ============================================================================
export { useEventActions } from '../events/useEventActions';
export { useTeamActions } from '../teams/useTeamActions';
export { useStoreActions } from '../store/hooks/useStoreActions';
export { useSocialActions } from '../profile/hooks/useSocialActions';
export { useModerationActions } from '../moderation/hooks/useModerationActions';
export { useAvatarCustomization } from '../store/hooks/useAvatarCustomization';
export { useActivityFilters } from '../activities/useActivityFilters';
export { useTeamsNotification, useSendAnnouncement, useSendReminder, useSendRecap } from './useTeamsNotification';

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================
export { useAnalyticsData } from '../analytics/useAnalyticsData';