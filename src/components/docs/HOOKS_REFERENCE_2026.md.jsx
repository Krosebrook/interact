# INTeract Hooks Reference Guide
**Version:** 2.0  
**Last Updated:** January 26, 2026

---

## 📚 Table of Contents
1. [Authentication Hooks](#authentication-hooks)
2. [Data Fetching Hooks](#data-fetching-hooks)
3. [Action Hooks](#action-hooks)
4. [Form Hooks](#form-hooks)
5. [UI State Hooks](#ui-state-hooks)
6. [Performance Hooks](#performance-hooks)
7. [Custom Hook Patterns](#custom-hook-patterns)

---

## 🔐 Authentication Hooks

### useUserData
**Location:** `components/hooks/useUserData.jsx`

```javascript
import { useUserData } from '@/components/hooks/useUserData';

function Dashboard() {
  const { 
    user,           // Current user object
    userPoints,     // User points record
    profile,        // User profile record
    loading,        // Loading state
    isAdmin,        // Boolean: user.role === 'admin'
    isFacilitator,  // Boolean: user.user_type === 'facilitator'
    isParticipant,  // Boolean: user.user_type === 'participant'
    refreshUserData // Function: refresh all user data
  } = useUserData(requireAuth = true);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>Welcome {user.full_name}!</h1>
      <p>Points: {userPoints?.total_points || 0}</p>
      <p>Level: {userPoints?.current_level || 1}</p>
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

**Parameters:**
- `requireAuth` (boolean, default: true) - Auto-redirect to login if not authenticated

**Returns:**
- `user` - User object from base44.auth.me()
- `userPoints` - UserPoints entity for current user
- `profile` - UserProfile entity for current user
- `loading` - Combined loading state
- `isAdmin` - Computed boolean
- `isFacilitator` - Computed boolean
- `isParticipant` - Computed boolean
- `refreshUserData()` - Invalidate and refetch all user data

**Features:**
- Automatic role-based redirects
- Handles new users without profile/points
- React Query caching with appropriate stale times
- Error handling with logout on auth failure

---

## 📊 Data Fetching Hooks

### useEventData
**Location:** `components/hooks/useEventData.jsx`

```javascript
import { useEventData } from '@/components/hooks/useEventData';

function CalendarPage() {
  const {
    events,         // All events
    activities,     // All activities
    participations, // Current user's participations
    upcomingEvents, // Computed: future events
    pastEvents,     // Computed: past events
    myEvents,       // Computed: user's registered events
    isLoading,      // Loading state
    refetch         // Refetch all data
  } = useEventData(user.email);
  
  return (
    <div>
      <h2>Upcoming Events ({upcomingEvents.length})</h2>
      {upcomingEvents.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

**Parameters:**
- `userEmail` (string, required) - Current user's email

**Returns:**
- `events` - All Event entities
- `activities` - All Activity entities
- `participations` - User's Participation entities
- `upcomingEvents` - Events with start_time > now
- `pastEvents` - Events with start_time < now
- `myEvents` - Events user is registered for
- `isLoading` - Combined loading state
- `refetch()` - Refetch all queries

**Caching:**
- Events: 5 minutes stale time
- Activities: 10 minutes stale time
- Participations: 2 minutes stale time

---

### useGamificationData
**Location:** `components/hooks/useGamificationData.jsx`

```javascript
import { useGamificationData } from '@/components/hooks/useGamificationData';

function GamificationDashboard() {
  const {
    userPoints,        // User's points record
    badges,            // All available badges
    userBadges,        // User's earned badges
    challenges,        // Personal challenges
    teamChallenges,    // Team challenges
    leaderboard,       // Leaderboard rankings
    myRank,            // User's current rank
    tier,              // User's achievement tier
    isLoading,
    refetch
  } = useGamificationData(user.email);
  
  return (
    <div>
      <PointsDisplay points={userPoints?.total_points} />
      <BadgeShowcase badges={userBadges} />
      <LeaderboardRank rank={myRank} total={leaderboard.length} />
    </div>
  );
}
```

**Returns:**
- `userPoints` - UserPoints entity
- `badges` - All Badge entities
- `userBadges` - User's BadgeAward entities
- `challenges` - User's PersonalChallenge entities
- `teamChallenges` - User's TeamChallenge entities
- `leaderboard` - Computed rankings array
- `myRank` - User's position in leaderboard
- `tier` - User's AchievementTier entity

---

### useTeamData
**Location:** `components/hooks/useTeamData.jsx`

```javascript
import { useTeamData } from '@/components/hooks/useTeamData';

function TeamsPage() {
  const {
    myTeams,          // Teams user is member of
    allTeams,         // All teams (if user can view)
    memberships,      // User's TeamMembership records
    invitations,      // Pending team invitations
    isLoading,
    refetch
  } = useTeamData(user.email);
  
  return (
    <div>
      <h2>My Teams ({myTeams.length})</h2>
      {myTeams.map(team => (
        <TeamCard key={team.id} team={team} />
      ))}
      
      {invitations.length > 0 && (
        <div>
          <h3>Pending Invitations</h3>
          {invitations.map(invite => (
            <InvitationCard key={invite.id} invitation={invite} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Action Hooks (Mutations)

### useEventActions
**Location:** `components/events/useEventActions.jsx`

```javascript
import { useEventActions } from '@/components/events/useEventActions';

function EventCard({ event }) {
  const {
    register,        // Register for event
    unregister,      // Cancel registration
    sendReminder,    // Send reminder to participants
    cancelEvent,     // Cancel event (admin/facilitator)
    isRegistering,   // Loading states
    isCanceling
  } = useEventActions(event.id, user.email);
  
  const isRegistered = participations.some(p => p.event_id === event.id);
  
  return (
    <Card>
      <EventDetails event={event} />
      
      {isRegistered ? (
        <Button onClick={() => unregister()} disabled={isRegistering}>
          Cancel Registration
        </Button>
      ) : (
        <Button onClick={() => register()} disabled={isRegistering}>
          Register
        </Button>
      )}
      
      {isFacilitator && (
        <Button onClick={() => sendReminder()}>
          Send Reminder
        </Button>
      )}
      
      {isAdmin && (
        <Button onClick={() => cancelEvent()} disabled={isCanceling}>
          Cancel Event
        </Button>
      )}
    </Card>
  );
}
```

**Methods:**
- `register()` - Create Participation record
- `unregister()` - Delete Participation record
- `sendReminder()` - Send email/notification to participants
- `cancelEvent()` - Update event status to 'cancelled'
- `updateEvent(data)` - Update event details
- `deleteEvent()` - Delete event (admin only)

**Features:**
- Optimistic updates
- Auto-invalidation of related queries
- Toast notifications
- Loading state management

---

### useStoreActions
**Location:** `components/store/hooks/useStoreActions.jsx`

```javascript
import { useStoreActions } from '@/components/store/hooks/useStoreActions';

function StoreItemCard({ item }) {
  const {
    purchaseWithPoints,    // Purchase with points
    purchaseWithStripe,    // Purchase with real money
    isPurchasing,          // Loading state
    canAfford              // Boolean: enough points
  } = useStoreActions(user.email, userPoints?.total_points || 0);
  
  return (
    <Card>
      <h3>{item.name}</h3>
      <p>{item.points_cost} points</p>
      
      <Button
        onClick={() => purchaseWithPoints(item.id)}
        disabled={!canAfford(item.points_cost) || isPurchasing}
      >
        {isPurchasing ? 'Processing...' : 'Purchase'}
      </Button>
      
      {item.stripe_price_id && (
        <Button onClick={() => purchaseWithStripe(item.id)}>
          Buy with Card
        </Button>
      )}
    </Card>
  );
}
```

---

### useTeamActions
**Location:** `components/teams/useTeamActions.jsx`

```javascript
import { useTeamActions } from '@/components/teams/useTeamActions';

function TeamManagement({ team }) {
  const {
    createTeam,        // Create new team
    updateTeam,        // Update team details
    deleteTeam,        // Delete team
    inviteMember,      // Send team invitation
    removeMember,      // Remove team member
    acceptInvitation,  // Accept team invite
    declineInvitation, // Decline team invite
    isLoading
  } = useTeamActions(user.email);
  
  const handleCreate = async (teamData) => {
    try {
      const newTeam = await createTeam(teamData);
      toast.success('Team created!');
      navigate(`/teams/${newTeam.id}`);
    } catch (error) {
      toast.error('Failed to create team');
    }
  };
  
  return (
    <div>
      <CreateTeamForm onSubmit={handleCreate} />
    </div>
  );
}
```

---

## 📝 Form Hooks

### useFormState
**Location:** `components/hooks/useFormState.jsx`

```javascript
import { useFormState } from '@/components/hooks/useFormState';

function CreateEventForm() {
  const {
    formData,      // Current form state
    errors,        // Validation errors
    touched,       // Touched fields
    handleChange,  // Handle input change
    handleBlur,    // Handle input blur
    setField,      // Set specific field
    reset,         // Reset form
    validate,      // Run validation
    isValid        // Boolean: form is valid
  } = useFormState(
    initialValues,  // Initial form state
    validationSchema // Zod schema
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }
    
    await createEvent(formData);
    reset();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="title"
        value={formData.title}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.title && errors.title}
      />
      
      <Button type="submit" disabled={!isValid}>
        Create Event
      </Button>
    </form>
  );
}
```

---

## 🎨 UI State Hooks

### useSessionTimeout
**Location:** `components/hooks/useSessionTimeout.jsx`

```javascript
import { useSessionTimeout } from '@/components/hooks/useSessionTimeout';

// In Layout.jsx
function Layout({ children }) {
  useSessionTimeout(enabled = true, timeoutMinutes = 480);  // 8 hours
  
  // Automatically logs out user after 8 hours of inactivity
  // Shows warning modal 5 minutes before timeout
  // Resets timer on user activity
  
  return <div>{children}</div>;
}
```

### useOnboarding
**Location:** `components/onboarding/OnboardingProvider.jsx`

```javascript
import { useOnboarding } from '@/components/onboarding/OnboardingProvider';

function DashboardWelcome() {
  const {
    showOnboarding,      // Boolean: onboarding modal visible
    currentStep,         // Current onboarding step
    totalSteps,          // Total number of steps
    completedSteps,      // Array of completed step IDs
    tutorialMode,        // Boolean: in tutorial mode
    completeStep,        // Function: mark step complete
    skipOnboarding,      // Function: skip tutorial
    resetOnboarding,     // Function: restart tutorial
    startTutorial        // Function: begin tutorial
  } = useOnboarding();
  
  useEffect(() => {
    if (isNewUser && !hasCompletedOnboarding) {
      startTutorial();
    }
  }, [isNewUser]);
  
  return (
    <div>
      {tutorialMode && (
        <OnboardingTooltip step={currentStep} />
      )}
      <DashboardContent />
    </div>
  );
}
```

### useNotifications
**Location:** `components/hooks/useNotifications.jsx`

```javascript
import { useNotifications } from '@/components/hooks/useNotifications';

function NotificationBell() {
  const {
    notifications,      // All notifications
    unreadCount,        // Count of unread
    markAsRead,         // Mark notification as read
    markAllAsRead,      // Mark all as read
    deleteNotification, // Delete notification
    isLoading
  } = useNotifications(user.email);
  
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          {notifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={() => markAsRead(notif.id)}
              onDelete={() => deleteNotification(notif.id)}
            />
          ))}
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
```

---

## 📦 Data Fetching Hooks

### useActivities
**Location:** `components/hooks/useActivities.jsx`

```javascript
import { useActivities } from '@/components/hooks/useActivities';

function ActivitiesPage() {
  const {
    activities,      // All Activity entities
    filteredActivities, // Filtered by selected filters
    filters,         // Current filter state
    setFilters,      // Update filters
    favoriteIds,     // User's favorite activity IDs
    addFavorite,     // Add to favorites
    removeFavorite,  // Remove from favorites
    isLoading
  } = useActivities(user.email);
  
  return (
    <div>
      <ActivityFilters filters={filters} onFilterChange={setFilters} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredActivities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isFavorite={favoriteIds.includes(activity.id)}
            onToggleFavorite={() => {
              if (favoriteIds.includes(activity.id)) {
                removeFavorite(activity.id);
              } else {
                addFavorite(activity.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

**Features:**
- Real-time filtering
- Favorite management
- Activity type categorization
- Duration-based sorting

---

### useLeaderboard
**Location:** `components/hooks/useLeaderboard.jsx`

```javascript
import { useLeaderboard } from '@/components/hooks/useLeaderboard';

function LeaderboardPage() {
  const {
    rankings,         // Sorted array of user rankings
    myRank,           // Current user's rank (optimized O(1) lookup)
    nearby,           // 3 users above + 3 below current user
    totalParticipants, // Total users in leaderboard
    topThree,         // Podium (top 3 users)
    isLoading
  } = useLeaderboard(
    category = 'points',    // 'points' | 'events_attended' | 'recognition_sent'
    period = 'weekly',      // 'all_time' | 'monthly' | 'weekly'
    userEmail = user.email
  );
  
  return (
    <div>
      {/* Podium display */}
      <Podium users={topThree} />
      
      {/* Current user rank */}
      <MyRankCard
        rank={myRank}
        total={totalParticipants}
        points={userPoints.total_points}
      />
      
      {/* Nearby users */}
      <div>
        <h3>Your Competition</h3>
        {nearby.map(user => (
          <LeaderboardRow key={user.email} user={user} />
        ))}
      </div>
      
      {/* Full leaderboard */}
      <LeaderboardList rankings={rankings} />
    </div>
  );
}
```

**Performance:**
- O(1) user rank lookup using Map
- Memoized calculations
- Virtual scrolling for large lists

---

### useChannelData
**Location:** `components/hooks/useChannelData.jsx`

```javascript
import { useChannelData } from '@/components/hooks/useChannelData';

function ChannelView({ channelId }) {
  const {
    channel,         // Channel entity
    messages,        // Channel messages
    members,         // Channel members
    unreadCount,     // Unread message count
    sendMessage,     // Send new message
    reactToMessage,  // Add reaction
    deleteMessage,   // Delete message (admin/author)
    isLoading
  } = useChannelData(channelId, user.email);
  
  // Real-time subscription to new messages
  useEffect(() => {
    const unsubscribe = base44.entities.ChannelMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.channel_id === channelId) {
        // Auto-updates via React Query invalidation
      }
    });
    
    return unsubscribe;
  }, [channelId]);
  
  return (
    <div>
      <ChannelHeader channel={channel} members={members} />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

---

## 🎮 Gamification Hooks

### useGamificationTrigger
**Location:** `components/hooks/useGamificationTrigger.jsx`

```javascript
import { useGamificationTrigger } from '@/components/hooks/useGamificationTrigger';

function EventCompletionHandler() {
  const { triggerReward } = useGamificationTrigger();
  
  const handleEventComplete = async (participationId) => {
    // Mark participation complete
    await base44.entities.Participation.update(participationId, {
      status: 'completed',
      feedback_submitted: true
    });
    
    // Trigger gamification rewards
    const rewards = await triggerReward({
      action: 'event_completion',
      participationId,
      metadata: {
        event_id: event.id,
        engagement_level: 'high'
      }
    });
    
    // Show celebration
    if (rewards.pointsAwarded > 0) {
      toast.success(`You earned ${rewards.pointsAwarded} points!`);
    }
    
    if (rewards.badgesEarned?.length > 0) {
      showBadgeCelebration(rewards.badgesEarned);
    }
    
    if (rewards.leveledUp) {
      showLevelUpAnimation(rewards.newLevel);
    }
  };
}
```

---

## 🔄 Performance Hooks

### useDebounce
**Location:** `components/shared/hooks/useDebounce.jsx`

```javascript
import { useDebounce } from '@/components/shared/hooks/useDebounce';

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);  // 300ms delay
  
  // Only runs when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return (
    <Input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### useIntersectionObserver
**Location:** `components/shared/hooks/useIntersectionObserver.jsx`

```javascript
import { useIntersectionObserver } from '@/components/shared/hooks/useIntersectionObserver';

function InfiniteScrollList({ items }) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '100px'
  });
  
  useEffect(() => {
    if (isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage]);
  
  return (
    <div>
      {items.map(item => <ItemCard key={item.id} item={item} />)}
      
      {hasNextPage && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
```

### useLocalStorage
**Location:** `components/shared/hooks/useLocalStorage.jsx`

```javascript
import { useLocalStorage } from '@/components/shared/hooks/useLocalStorage';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  return (
    <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
}
```

---

## 🎯 Custom Hook Patterns

### Creating Custom Hooks

#### Pattern 1: Data Fetching Hook
```javascript
// Template for custom data fetching hook
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useEntityData(entityName, filters = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [entityName, filters],
    queryFn: () => base44.entities[entityName].filter(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    retry: 1
  });
  
  return {
    data: data || [],
    isLoading,
    error,
    refetch
  };
}

// Usage
const { data: badges, isLoading } = useEntityData('Badge', { is_active: true });
```

#### Pattern 2: Mutation Hook
```javascript
// Template for custom mutation hook
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useEntityMutation(entityName, options = {}) {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities[entityName].create(data),
    onSuccess: () => {
      queryClient.invalidateQueries([entityName]);
      options.onSuccess?.();
    },
    onError: options.onError
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities[entityName].update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([entityName]);
      options.onSuccess?.();
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities[entityName].delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries([entityName]);
      options.onSuccess?.();
    }
  });
  
  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isLoading: createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading
  };
}

// Usage
const { create, update, delete: deleteEntity, isLoading } = useEntityMutation('Recognition', {
  onSuccess: () => toast.success('Recognition saved!')
});
```

#### Pattern 3: Computed State Hook
```javascript
// Template for computed state hook
import { useMemo } from 'react';

export function useUserStats(userEmail, events, participations, recognitions) {
  const stats = useMemo(() => {
    const eventsAttended = participations.filter(p => p.status === 'completed').length;
    const recognitionsSent = recognitions.filter(r => r.sender_email === userEmail).length;
    const recognitionsReceived = recognitions.filter(r => r.recipient_email === userEmail).length;
    
    const totalPoints = eventsAttended * 10 + 
                        recognitionsSent * 15 + 
                        recognitionsReceived * 20;
    
    const engagementScore = Math.min(100, (eventsAttended * 2) + (recognitionsSent * 3));
    
    return {
      eventsAttended,
      recognitionsSent,
      recognitionsReceived,
      totalPoints,
      engagementScore
    };
  }, [userEmail, events, participations, recognitions]);
  
  return stats;
}

// Usage
const stats = useUserStats(user.email, events, participations, recognitions);

<StatsCard
  eventsAttended={stats.eventsAttended}
  recognitionsSent={stats.recognitionsSent}
  engagementScore={stats.engagementScore}
/>
```

---

## 🏗️ Hook Best Practices

### Do's
```javascript
✅ Use hooks at top level of component
✅ Name hooks with 'use' prefix
✅ Return object for multiple values
✅ Memoize expensive calculations
✅ Clean up subscriptions in useEffect
✅ Handle loading and error states
✅ Use React Query for server state
✅ Use useState for UI state

function MyComponent() {
  // ✅ Good
  const { data, isLoading } = useQuery(...);
  const [isOpen, setIsOpen] = useState(false);
  
  const computed = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  useEffect(() => {
    const unsubscribe = subscribeToUpdates();
    return () => unsubscribe();
  }, []);
}
```

### Don'ts
```javascript
❌ Don't call hooks conditionally
❌ Don't call hooks in loops
❌ Don't call hooks in callbacks
❌ Don't mix server and client state
❌ Don't forget dependency arrays

function MyComponent({ condition }) {
  // ❌ Bad - conditional hook
  if (condition) {
    const data = useQuery(...);
  }
  
  // ❌ Bad - hook in loop
  items.forEach(item => {
    const data = useQuery(...);
  });
  
  // ❌ Bad - missing dependencies
  useEffect(() => {
    doSomething(data);
  }, []);  // Should include 'data'
}
```

---

## 📋 All Available Hooks

### Authentication
- `useUserData(requireAuth)` - User, points, profile, role checks
- `useAuth()` - Simple auth state
- `usePermissions()` - RBAC permission checks
- `useSessionTimeout(enabled, minutes)` - Auto-logout

### Data Fetching
- `useEventData(userEmail)` - Events, activities, participations
- `useActivities(userEmail)` - Activities with filtering
- `useGamificationData(userEmail)` - Points, badges, challenges
- `useLeaderboard(category, period, userEmail)` - Rankings
- `useTeamData(userEmail)` - Teams, memberships
- `useChannelData(channelId, userEmail)` - Channel messages
- `useRecognitionData(userEmail)` - Recognitions sent/received
- `useStoreData(userEmail)` - Store items, inventory
- `useNotifications(userEmail)` - User notifications
- `useAnalytics()` - Analytics data

### Actions (Mutations)
- `useEventActions(eventId, userEmail)` - Event CRUD
- `useTeamActions(userEmail)` - Team management
- `useStoreActions(userEmail, currentPoints)` - Purchases
- `useModerationActions()` - Content moderation
- `useGamificationTrigger()` - Award points/badges

### Forms
- `useFormState(initialValues, schema)` - Form state + validation
- `useDialogForm()` - Form + dialog combined

### UI State
- `useOnboarding()` - Onboarding flow state
- `useTheme()` - Dark/light theme
- `useMediaQuery(query)` - Responsive breakpoints
- `useLocalStorage(key, defaultValue)` - Persistent state

### Performance
- `useDebounce(value, delay)` - Debounced values
- `useIntersectionObserver(options)` - Lazy loading trigger
- `useMemoizedValue(fn, deps)` - Cached computations

### Feature-Specific
- `useAvatarCustomization(userEmail)` - Avatar builder
- `useEventScheduling()` - Recurring event logic
- `useOnboardingSteps(userType)` - Role-based steps
- `useSocialActions(userEmail)` - Follow/block
- `useProfileCompletion(profile)` - Profile % complete

---

**Last Updated:** January 26, 2026  
**Total Hooks:** 30+  
**Next Review:** April 2026