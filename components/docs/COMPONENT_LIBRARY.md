# INTeract Component Library Documentation

## Overview
Production-grade React components following atomic design principles and WCAG 2.1 AA accessibility standards.

---

## Design System Components

### LoadingSpinner
**Path:** `components/common/LoadingSpinner.jsx`

```jsx
import LoadingSpinner from '../components/common/LoadingSpinner';

// Usage
<LoadingSpinner 
  size="default"      // 'small' | 'default' | 'large'
  type="orange"       // Color variant
  message="Loading..." // Optional status text
  className=""        // Additional classes
/>
```

**Features:**
- Smooth rotation animation
- Color-coded by activity type
- Accessible (aria-live region)
- Mobile-optimized sizing

---

### EmptyState
**Path:** `components/common/EmptyState.jsx`

```jsx
import EmptyState from '../components/common/EmptyState';

<EmptyState
  icon={Calendar}
  title="No events scheduled"
  description="Your calendar is clear!"
  actionLabel="Schedule Event"
  onAction={() => navigate('/calendar')}
  tips={['Browse activities', 'Try icebreakers']}
  type="navy"  // 'navy' | 'orange' | 'purple'
/>
```

**Presets Available:**
- `NoSearchResults` - Generic search empty state
- `NoEventsEmpty` - No scheduled events
- `NoRecognitionsEmpty` - No recognitions given/received

---

### StatsCard & StatsGrid
**Path:** `components/common/StatsGrid.jsx`

```jsx
import StatsGrid, { StatCard } from '../components/common/StatsGrid';

// Single card
<StatCard
  title="Total Events"
  value={42}
  subtitle="This month"
  icon={Calendar}
  color="navy"
  trend="+12% from last month"
  delay={0.1}  // Stagger animation
/>

// Grid layout
<StatsGrid cols={4}>
  <StatCard {...} />
  <StatCard {...} />
  <StatCard {...} />
  <StatCard {...} />
</StatsGrid>
```

**Color Variants:**
- `navy` - Primary brand color
- `orange` - Accent color
- `purple` - Gamification
- `green` - Positive metrics
- `red` - Alerts/warnings

---

## Event Components

### EventCalendarCard
**Path:** `components/events/EventCalendarCard.jsx`

```jsx
import EventCalendarCard from '../components/events/EventCalendarCard';

<EventCalendarCard
  event={eventObject}
  activity={activityObject}
  participantCount={12}
  userEmail={user.email}
  onView={(event) => {}}
  onCopyLink={handleCopy}
  onDownloadCalendar={handleDownload}
  onSendReminder={handleReminder}
  onSendRecap={handleRecap}
  onCancel={handleCancel}
  onReschedule={handleReschedule}
/>
```

**Features:**
- Status badges (scheduled, completed, cancelled)
- Format indicators (online, offline, hybrid)
- Bookmark functionality
- Dropdown actions menu
- Mobile-responsive cards
- Skeleton loading state

---

### EventsList
**Path:** `components/events/EventsList.jsx`

```jsx
import EventsList from '../components/events/EventsList';

<EventsList
  events={eventsArray}
  activities={activitiesArray}
  participations={participationsArray}
  isLoading={false}
  title="Upcoming Events"
  maxItems={6}
  emptyText="No events scheduled"
  emptyAction="Schedule Event"
  onEmptyAction={() => {}}
  showActions={true}
  userEmail={user.email}
/>
```

**Handles:**
- Automatic activity enrichment
- Participation stats calculation
- Skeleton loaders (3 cards)
- Empty state messaging
- Action button delegation

---

## Gamification Components

### BadgeCard
**Path:** `components/gamification/BadgeCard.jsx`

```jsx
import BadgeCard from '../components/gamification/BadgeCard';

<BadgeCard
  badge={badgeObject}
  earned={true}
  progress={75}  // Percentage toward earning
  onClick={() => {}}
/>
```

**Display Modes:**
- Earned (full color, unlocked)
- Locked (grayscale, progress shown)
- Hidden (??? until earned)

---

### Leaderboard
**Path:** `components/leaderboard/Leaderboard.jsx`

```jsx
import Leaderboard from '../components/leaderboard/Leaderboard';

<Leaderboard
  timeframe="weekly"  // 'daily' | 'weekly' | 'monthly' | 'all-time'
  category="points"   // 'points' | 'badges' | 'streak'
  maxDisplay={10}
  highlightUser={user.email}
/>
```

**Features:**
- Podium view (top 3 special styling)
- Current user highlight (yellow glow)
- Ranking change indicators (↑↓)
- Avatar images
- Live updates (polling)

---

## Form Components

### ScheduleEventDialog
**Path:** `components/events/ScheduleEventDialog.jsx`

```jsx
import ScheduleEventDialog from '../components/events/ScheduleEventDialog';

<ScheduleEventDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  activity={selectedActivity}
  onEventCreated={(event) => {}}
/>
```

**Fields:**
- Date/time picker (react-day-picker)
- Duration selector
- Format toggle (online/offline/hybrid)
- Location (conditional on format)
- Max participants (optional)
- Facilitator assignment
- Custom instructions (textarea)

**Validation:**
- Date cannot be in past
- Duration required
- Location required if offline
- Email domain check for facilitator

---

## Profile Components

### ProfileHeader
**Path:** `components/profile/ProfileHeader.jsx`

```jsx
import ProfileHeader from '../components/profile/ProfileHeader';

<ProfileHeader
  user={userObject}
  profile={profileObject}
  userPoints={pointsObject}
  isOwnProfile={true}
  canEdit={true}
/>
```

**Sections:**
- Avatar (upload on click if editable)
- Display name & job title
- Stats boxes (points, level, badges, streak)
- Edit button (modal)
- Privacy badge
- Level progress bar

---

### SkillsInterestsManager
**Path:** `components/profile/SkillsInterestsManager.jsx`

```jsx
import SkillsInterestsManager from '../components/profile/SkillsInterestsManager';

<SkillsInterestsManager
  profile={profileObject}
  onUpdate={(updated) => {}}
/>
```

**Features:**
- Skill tag input (autocomplete suggestions)
- Interest tags (preset + custom)
- Remove on click (X button)
- Recommendations: "Add skills for better AI suggestions"

---

## Admin Components

### UserManagementPanel
**Path:** `components/admin/UserManagementPanel.jsx`

```jsx
import UserManagementPanel from '../components/admin/UserManagementPanel';

<UserManagementPanel currentUser={user} />
```

**Displays:**
- Pending invitations list
- Invitation stats (pending, accepted, expired)
- Revoke invitation button
- Auto-refresh on status change

---

### PointsAdjustment
**Path:** `components/admin/PointsAdjustment.jsx`

```jsx
import PointsAdjustment from '../components/admin/PointsAdjustment';

<PointsAdjustment
  userEmail="john@intinc.com"
  currentPoints={500}
  onSuccess={(result) => {}}
/>
```

**Form Fields:**
- Type selector (Bonus/Penalty)
- Amount input (positive integers)
- Reason textarea (required)
- Balance preview (with warning if negative)

**Safeguards:**
- Requires reason (audit trail)
- Validates amount > 0
- Shows projected balance
- Creates immutable ledger entry

---

### BulkUserImport
**Path:** `components/admin/BulkUserImport.jsx`

```jsx
import BulkUserImport from '../components/admin/BulkUserImport';

<BulkUserImport currentUser={user} />
```

**Features:**
- CSV template download
- Drag-and-drop upload
- Preview first 5 rows
- Validates email domains
- Batch invitation sending
- Error summary (with failed emails)

**CSV Format:**
```csv
email,role,message
john@intinc.com,participant,Welcome!
jane@intinc.com,facilitator,
```

---

## Analytics Components

### AnalyticsHeader
**Path:** `components/analytics/AnalyticsHeader.jsx`

```jsx
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';

<AnalyticsHeader metrics={metricsObject} />
```

**Displays:**
- Total events
- Avg attendance
- Engagement score
- Completion rate
- Export dropdown (PDF/CSV)

---

### AttendanceMetrics
**Path:** `components/analytics/AttendanceMetrics.jsx`

**Chart Types:**
- Line chart (attendance over time)
- Bar chart (by department)
- Heatmap (day/time analysis)

---

## Onboarding Components

### OnboardingModal
**Path:** `components/onboarding/OnboardingModal.jsx`

**Steps:**
1. Welcome screen
2. Profile setup
3. Preference selection
4. Feature tour (spotlight)
5. First action (schedule event or RSVP)

**Features:**
- Role-specific steps (admin vs participant)
- Progress bar (5 steps)
- Skip option (can restart later)
- Keyboard navigation (←→ arrows)
- Gamification preview

---

## AI Components

### AISuggestionsWidget
**Path:** `components/ai/AISuggestionsWidget.jsx`

```jsx
import AISuggestionsWidget from '../components/ai/AISuggestionsWidget';

<AISuggestionsWidget
  onScheduleActivity={(activity) => {}}
  onGenerateCustom={() => {}}
/>
```

**Shows:**
- AI-recommended activities
- Confidence score (0-100%)
- Reasoning explanation
- Accept/Dismiss buttons
- Custom generation option

---

### ActivityGenerator
**Path:** `components/ai/ActivityGenerator.jsx`

**Workflow:**
1. User inputs team context
2. AI generates custom activity
3. Preview shown (title, instructions, duration)
4. User can regenerate or accept
5. Activity saved to library

---

## Utility Hooks

### useUserData
```javascript
const {
  user,           // Current user object
  profile,        // UserProfile object
  userPoints,     // UserPoints object
  loading,        // Loading state
  isAdmin,        // Boolean
  isFacilitator,  // Boolean
  logout,         // Function
  refreshUserData // Function
} = useUserData(
  requireAuth = true,
  requireAdmin = false,
  requireFacilitator = false,
  requireParticipant = false
);
```

### useEventData
```javascript
const {
  events,        // All events
  activities,    // All activities
  participations, // All participations
  isLoading,     // Combined loading state
  refetchEvents  // Invalidate cache
} = useEventData();
```

### useRBACGuard
```javascript
// Enforce permission, redirect if denied
useRBACGuard(user, 'INVITE_USERS', 'Dashboard');

// Check multiple permissions
const {
  canInviteUsers,
  canManageRoles,
  canViewAnalytics
} = useUserPermissions(user);
```

---

## Styling Guidelines

### Glass Panel System
```jsx
// Transparent glass with blur
<div className="glass-panel">
  Content
</div>

// Solid glass (readable text)
<div className="glass-panel-solid">
  Content
</div>

// Glass card (hover effects)
<div className="glass-card">
  Content
</div>
```

### Activity Type Colors
```css
--activity-icebreaker: #3B82F6 (blue)
--activity-creative: #8B5CF6 (purple)
--activity-competitive: #F59E0B (amber)
--activity-wellness: #10B981 (green)
--activity-learning: #06B6D4 (cyan)
--activity-social: #EC4899 (pink)
```

### Animation Classes
```jsx
<div className="animate-fade-in">Fades in on mount</div>
<div className="animate-slide-up">Slides up from bottom</div>
<div className="animate-pulse-glow">Pulsing glow effect</div>
<div className="hover-lift">Lifts on hover</div>
```

---

## Accessibility

### Keyboard Navigation
- Tab: Focus next element
- Enter: Activate button/link
- Escape: Close modal/dropdown
- ←→: Navigate carousel/tabs
- ?: Show keyboard shortcuts

### Screen Reader Support
```jsx
// Always include aria-label for icon buttons
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Use semantic HTML
<nav aria-label="Main navigation">
  {/* Navigation items */}
</nav>
```

### Focus Management
```jsx
// Auto-focus first input in modals
<input ref={inputRef} autoFocus />

// Restore focus on modal close
const previousFocus = document.activeElement;
// ... modal closes
previousFocus?.focus();
```

---

## Performance Best Practices

### Code Splitting
```jsx
// Lazy load heavy components
const Analytics = React.lazy(() => import('./pages/Analytics'));

<Suspense fallback={<LoadingSpinner />}>
  <Analytics />
</Suspense>
```

### Memoization
```jsx
// Expensive calculations
const stats = useMemo(() => 
  calculateDashboardStats(events, activities),
  [events, activities]
);

// Callbacks
const handleSubmit = useCallback((data) => {
  // ...
}, [dependencies]);
```

### Image Optimization
```jsx
// Lazy load images
<img 
  src={url} 
  loading="lazy" 
  alt="Description"
  className="object-cover"
/>
```

---

## Testing

### Component Tests
```jsx
// Example test structure
describe('EventCalendarCard', () => {
  it('renders event details correctly', () => {
    // ...
  });
  
  it('shows actions dropdown for admins', () => {
    // ...
  });
  
  it('handles RSVP click', () => {
    // ...
  });
});
```

### Accessibility Tests
- Keyboard-only navigation
- Screen reader compatibility
- Color contrast ratios
- Touch target sizes (min 44x44px)

---

## Error Handling

### Standard Pattern
```jsx
const mutation = useMutation({
  mutationFn: async (data) => {
    // API call
  },
  onSuccess: (response) => {
    toast.success('Action completed!');
    queryClient.invalidateQueries(['key']);
  },
  onError: (error) => {
    toast.error(error.message || 'Something went wrong');
    // Log to monitoring service
  }
});
```

### Graceful Degradation
```jsx
// Show fallback if feature disabled
{hasFeature('aiRecommendations') ? (
  <AISuggestionsWidget />
) : (
  <ManualRecommendations />
)}
```

---

## Mobile Responsiveness

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile-First Patterns
```jsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Left</div>
  <div className="flex-1">Right</div>
</div>

// Hide on mobile, show on desktop
<div className="hidden sm:block">
  Desktop-only content
</div>

// Large touch targets
<Button className="min-h-[44px] min-w-[44px]">
  Tap me
</Button>
```

---

This component library ensures consistency, accessibility, and maintainability across the entire platform.