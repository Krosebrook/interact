/**
 * COMMON COMPONENTS INDEX
 * Central export point for all common/shared UI components
 */

// Layout & Structure
export { default as PageHeader, SectionHeader } from './PageHeader';
export { default as EmptyState, NoSearchResults, NoEventsEmpty, NoRecognitionsEmpty } from './EmptyState';
export { default as ErrorBoundary } from './ErrorBoundary';

// Cards & Containers
export { default as ResponsiveCard, TruncatedText, CardGrid, ResponsiveListGrid, ImageCard, CardSkeleton } from './ResponsiveCard';
export { default as QuickActionCard } from './QuickActionCard';

// Loading States
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as SkeletonGrid } from './SkeletonGrid';
export { default as DataLoader } from './DataLoader';

// Filters & Tags
export { default as FilterChip, FilterChipGroup, ActiveFiltersBar } from './FilterChip';

// Indicators & Badges
export { default as ContentTypeIndicator, ContentTypeRibbon, ContentTypeStripe, getContentTypeConfig } from './ContentTypeIndicator';

// Feedback
export { default as feedback } from './ToastFeedback';

// Stats
export { default as StatsGrid, StatCard } from './StatsGrid';

// Animations
export { default as AnimatedButton } from './AnimatedButton';
export { default as AnimatedCard } from './AnimatedCard';