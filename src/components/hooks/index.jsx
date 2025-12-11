/**
 * CENTRALIZED HOOKS EXPORTS
 * Single import point for all custom hooks
 */

// Core Hooks
export { useUserData } from './useUserData';
export { useAuth } from './useAuth';
export { useUser } from '../contexts/UserContext';
export { usePermissions, PermissionGuard } from './usePermissions';
export { useAuthMonitor } from '../lib/authManager';

// Data Hooks (refactored with apiClient)
export { useEventData } from './useEventData';
export { useGamificationData } from './useGamificationData';
export { useActivities } from './useActivities';
export { useTeamData } from './useTeamData';
export { useLeaderboard } from './useLeaderboard';
export { useRecognitionData } from './useRecognitionData';
export { useStoreData } from './useStoreData';
export { useNotifications } from './useNotifications';
export { useChannelData } from './useChannelData';

// Feature Hooks
export { useUserProfile } from './useUserProfile';
export { useEventScheduling } from './useEventScheduling';
export { useTeamsNotification } from './useTeamsNotification';

// Utility Hooks
export { useFormState } from './useFormState';
export { useActivityFilters } from '../activities/useActivityFilters';

// Entity Hooks (for backwards compatibility)
export * from './useEntities';