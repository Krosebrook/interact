
/**
 * HOOKS BARREL EXPORT
 * Centralized export for all custom hooks
 */

// Authentication & User
export { useUserData } from './useUserData';
export { useAuth } from './useAuth';
export { useUserProfile } from './useUserProfile';
export { usePermissions } from './usePermissions';

// Data Fetching
export { useEventData } from './useEventData';
export { useActivities } from './useActivities';
export { useTeamData } from './useTeamData';
export { useEntities } from './useEntities';
export { useGamificationData } from './useGamificationData';
export { useLeaderboard } from './useLeaderboard';

// Actions & Mutations
export { useEventScheduling } from './useEventScheduling';
export { useFormState, useDialogForm } from './useFormState';

// Re-export from nested locations for convenience
export { useEventActions } from '../events/useEventActions';
export { useTeamActions } from '../teams/useTeamActions';
export { useStoreActions } from '../store/hooks/useStoreActions';
export { useSocialActions } from '../profile/hooks/useSocialActions';
export { useModerationActions } from '../moderation/hooks/useModerationActions';
export { useAvatarCustomization } from '../store/hooks/useAvatarCustomization';
