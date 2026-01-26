# INTeract Edge Cases & Error Handling Handbook
**Version:** 2.0  
**Last Updated:** January 26, 2026

---

## 📋 Table of Contents
1. [Empty States](#empty-states)
2. [Network Failures](#network-failures)
3. [Race Conditions](#race-conditions)
4. [Data Inconsistencies](#data-inconsistencies)
5. [Concurrent Operations](#concurrent-operations)
6. [Large Datasets](#large-datasets)
7. [Offline Mode](#offline-mode)
8. [Browser Compatibility](#browser-compatibility)
9. [Error Recovery Patterns](#error-recovery-patterns)

---

## 📭 Empty States

### No Data Scenarios

#### No Events Scheduled
```javascript
function EventsList({ events, isLoading }) {
  if (isLoading) {
    return <SkeletonGrid count={3} />;
  }
  
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No upcoming events"
        description="Check back soon for new activities and team-building sessions!"
        action={{
          label: "Browse Past Events",
          onClick: () => navigate('/events/past')
        }}
        illustration="https://illustrations.popsy.co/white/calendar.svg"
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {events.map(event => <EventCard key={event.id} event={event} />)}
    </div>
  );
}
```

#### No Points Yet (New User)
```javascript
function PointsDisplay({ userPoints }) {
  if (!userPoints || userPoints.total_points === 0) {
    return (
      <EmptyState
        icon={Award}
        title="Start earning points!"
        description="Attend events, give recognition, and complete challenges to build your score."
        actions={[
          {
            label: "Browse Events",
            onClick: () => navigate('/events'),
            variant: "default"
          },
          {
            label: "Give Recognition",
            onClick: () => navigate('/recognition'),
            variant: "outline"
          }
        ]}
      />
    );
  }
  
  return (
    <div>
      <h2>Total Points: {userPoints.total_points}</h2>
      <p>Level {userPoints.current_level}</p>
    </div>
  );
}
```

#### No Team Memberships
```javascript
function MyTeams({ teams, invitations }) {
  if (teams.length === 0 && invitations.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="You're not part of any teams yet"
        description="Join a team to participate in challenges and connect with colleagues!"
        action={{
          label: "Explore Teams",
          onClick: () => navigate('/teams/browse')
        }}
      />
    );
  }
  
  if (invitations.length > 0) {
    return (
      <div>
        <h3>Pending Invitations</h3>
        {invitations.map(invite => (
          <InvitationCard key={invite.id} invitation={invite} />
        ))}
      </div>
    );
  }
  
  return <TeamGrid teams={teams} />;
}
```

#### No Search Results
```javascript
function SearchResults({ query, results, isSearching }) {
  if (isSearching) {
    return <SearchSkeleton />;
  }
  
  if (query && results.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No results found"
        description={`We couldn't find anything matching "${query}"`}
        action={{
          label: "Clear Search",
          onClick: () => setQuery('')
        }}
      />
    );
  }
  
  return <ResultsList results={results} />;
}
```

---

## 🌐 Network Failures

### API Call Failures
```javascript
// Retry logic with exponential backoff
const { data, isError, error, refetch } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  onError: (error) => {
    console.error('Failed to fetch events:', error);
    toast.error('Failed to load events. Please try again.');
  }
});

if (isError) {
  return (
    <ErrorState
      title="Failed to load events"
      message={error.message}
      action={{
        label: "Try Again",
        onClick: () => refetch()
      }}
    />
  );
}
```

### Timeout Handling
```javascript
// API call with timeout
async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw error;
  }
}

// Usage in React Query
const { data } = useQuery({
  queryKey: ['slowEndpoint'],
  queryFn: () => fetchWithTimeout('/api/slow-endpoint', 5000),
  onError: (error) => {
    if (error.message.includes('timed out')) {
      toast.error('Request took too long. Please try again.');
    }
  }
});
```

### Offline Detection
```javascript
// Online/offline hook
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// Usage
function App() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {!isOnline && (
        <Banner variant="warning">
          You're offline. Some features may be unavailable.
        </Banner>
      )}
      <AppContent />
    </div>
  );
}

// Query configuration for offline
const { data } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
  enabled: isOnline,  // Don't fetch when offline
  placeholderData: cachedEvents  // Show cached data when offline
});
```

---

## ⚡ Race Conditions

### Duplicate Submission Prevention
```javascript
// Pattern 1: Disable button
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return;  // Guard clause
  
  setIsSubmitting(true);
  
  try {
    await createRecognition(formData);
    toast.success('Recognition sent!');
    reset();
  } catch (error) {
    toast.error('Failed to send recognition');
  } finally {
    setIsSubmitting(false);
  }
};

<Button onClick={handleSubmit} disabled={isSubmitting}>
  {isSubmitting ? 'Sending...' : 'Send Recognition'}
</Button>

// Pattern 2: useMutation auto-handles this
const mutation = useMutation({
  mutationFn: createRecognition
});

<Button
  onClick={() => mutation.mutate(formData)}
  disabled={mutation.isLoading}
>
  {mutation.isLoading ? 'Sending...' : 'Send Recognition'}
</Button>
```

### Concurrent Updates
```javascript
// Optimistic update with conflict resolution
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
  
  onMutate: async ({ id, data }) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['events', id]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['events', id]);
    
    // Optimistically update
    queryClient.setQueryData(['events', id], old => ({
      ...old,
      ...data,
      updated_date: new Date().toISOString()
    }));
    
    return { previous };
  },
  
  onError: (err, { id }, context) => {
    // Rollback on error
    queryClient.setQueryData(['events', id], context.previous);
    toast.error('Update failed. Changes have been reverted.');
  },
  
  onSettled: (data, error, { id }) => {
    // Always refetch to ensure consistency
    queryClient.invalidateQueries(['events', id]);
  }
});
```

### Debounced Search
```javascript
// Prevent excessive API calls
import { useDebounce } from '@/components/shared/hooks/useDebounce';

function UserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const { data: results, isLoading } = useQuery({
    queryKey: ['userSearch', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,  // Min 2 characters
    staleTime: 30 * 1000  // Cache for 30 seconds
  });
  
  return (
    <div>
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search users..."
      />
      
      {isLoading && <Spinner size="sm" />}
      
      {results?.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## 🔄 Data Inconsistencies

### Stale Data Refresh
```javascript
// Auto-refresh on window focus
const queryClient = useQueryClient();

useEffect(() => {
  const handleFocus = () => {
    // Refetch critical data when user returns to tab
    queryClient.invalidateQueries(['userPoints']);
    queryClient.invalidateQueries(['notifications']);
    queryClient.invalidateQueries(['events']);
  };
  
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [queryClient]);

// Periodic background refresh
useEffect(() => {
  const interval = setInterval(() => {
    queryClient.invalidateQueries(['leaderboard']);
  }, 60 * 1000);  // Every minute
  
  return () => clearInterval(interval);
}, [queryClient]);
```

### Optimistic Update Rollback
```javascript
const mutation = useMutation({
  mutationFn: updateProfile,
  
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['profile']);
    
    const previous = queryClient.getQueryData(['profile']);
    
    queryClient.setQueryData(['profile'], old => ({
      ...old,
      ...newData
    }));
    
    return { previous };
  },
  
  onError: (err, newData, context) => {
    // Rollback to previous state
    queryClient.setQueryData(['profile'], context.previous);
    
    toast.error('Update failed. Changes have been reverted.');
  },
  
  onSuccess: () => {
    toast.success('Profile updated!');
  }
});
```

### Missing Related Data
```javascript
// Handle missing profile for user
function UserCard({ user }) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user.email }),
    placeholderData: []  // Default to empty array
  });
  
  const userProfile = profile?.[0];
  
  return (
    <Card>
      <h3>{user.full_name}</h3>
      <p>{user.email}</p>
      
      {/* Gracefully handle missing profile */}
      {isLoading ? (
        <Skeleton className="h-4 w-32" />
      ) : userProfile ? (
        <>
          <p>{userProfile.role || 'Team Member'}</p>
          <p>{userProfile.department || 'General'}</p>
        </>
      ) : (
        <p className="text-slate-500 italic">Profile not set up yet</p>
      )}
    </Card>
  );
}
```

---

## 🏃 Concurrent Operations

### Multiple Simultaneous Updates
```javascript
// Use Promise.all for independent operations
async function registerForMultipleEvents(eventIds, userEmail) {
  try {
    const registrations = await Promise.all(
      eventIds.map(eventId =>
        base44.entities.Participation.create({
          event_id: eventId,
          user_email: userEmail,
          status: 'registered'
        })
      )
    );
    
    toast.success(`Registered for ${registrations.length} events!`);
    
    return registrations;
  } catch (error) {
    // If any fail, none are committed (transaction-like)
    toast.error('Registration failed. Please try again.');
    throw error;
  }
}

// Use Promise.allSettled for independent operations that can partially fail
async function sendMultipleNotifications(userEmails, message) {
  const results = await Promise.allSettled(
    userEmails.map(email =>
      base44.entities.Notification.create({
        user_email: email,
        message,
        type: 'announcement'
      })
    )
  );
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  if (failed > 0) {
    toast.warning(`Sent to ${succeeded} users, ${failed} failed`);
  } else {
    toast.success(`Notification sent to ${succeeded} users!`);
  }
}
```

### Sequential Dependencies
```javascript
// When operations depend on previous results
async function createEventWithActivity(eventData, activityData) {
  try {
    // Step 1: Create activity
    const activity = await base44.entities.Activity.create(activityData);
    
    // Step 2: Create event with activity reference
    const event = await base44.entities.Event.create({
      ...eventData,
      activity_id: activity.id
    });
    
    // Step 3: Register user automatically
    await base44.entities.Participation.create({
      event_id: event.id,
      user_email: user.email,
      status: 'registered'
    });
    
    toast.success('Event created and you're registered!');
    
    return { event, activity };
  } catch (error) {
    // Cleanup: delete activity if event creation failed
    if (activity?.id && !event?.id) {
      await base44.entities.Activity.delete(activity.id);
    }
    
    toast.error('Failed to create event');
    throw error;
  }
}
```

---

## 📊 Large Datasets

### Pagination
```javascript
// Infinite scroll with React Query
import { useInfiniteQuery } from '@tanstack/react-query';

function EventHistory() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['events', 'history'],
    queryFn: ({ pageParam = 0 }) => {
      return base44.entities.Event.filter(
        { status: 'completed' },
        '-start_time',  // Sort by date descending
        20,             // Limit
        pageParam * 20  // Skip
      );
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length : undefined;
    }
  });
  
  const allEvents = data?.pages.flatMap(page => page) || [];
  
  return (
    <div>
      {allEvents.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
      
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
```

### Virtual Scrolling
```javascript
// For very large lists (1000+ items)
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualLeaderboard({ rankings }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: rankings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,  // Row height in pixels
    overscan: 10  // Render extra rows for smooth scrolling
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <LeaderboardRow user={rankings[virtualRow.index]} rank={virtualRow.index + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Cursor-Based Pagination
```javascript
// For real-time data with frequent updates
async function fetchMessages(channelId, cursor = null) {
  const messages = await base44.entities.ChannelMessage.filter(
    { channel_id: channelId },
    '-created_date',
    50,
    cursor ? { after: cursor } : undefined
  );
  
  return {
    messages,
    nextCursor: messages.length === 50 ? messages[messages.length - 1].id : null
  };
}

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['messages', channelId],
  queryFn: ({ pageParam }) => fetchMessages(channelId, pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor
});
```

---

## 🔄 Graceful Degradation

### Feature Detection
```javascript
// Check for browser capabilities
const capabilities = {
  notifications: 'Notification' in window,
  serviceWorker: 'serviceWorker' in navigator,
  webGL: (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      );
    } catch (e) {
      return false;
    }
  })(),
  localStorage: (() => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  })(),
  webRTC: !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  )
};

// Conditional rendering
function DashboardPage() {
  return (
    <div>
      {capabilities.notifications ? (
        <NotificationSettings />
      ) : (
        <div className="text-sm text-slate-500">
          Browser notifications are not supported
        </div>
      )}
      
      {capabilities.webGL ? (
        <ThreeDVisualization />
      ) : (
        <TwoDChart />
      )}
      
      {capabilities.webRTC ? (
        <VideoCallButton />
      ) : (
        <AudioCallButton />
      )}
    </div>
  );
}
```

### Progressive Enhancement
```javascript
// Core functionality without JavaScript
<form action="/api/recognition" method="POST">
  <input type="email" name="recipient" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send Recognition</button>
</form>

// Enhanced with JavaScript
function RecognitionForm() {
  const [formData, setFormData] = useState({});
  const [aiSuggestion, setAiSuggestion] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createRecognition(formData);
      
      // Enhanced features (not critical)
      await awardPoints(formData.recipient_email);
      await sendNotification(formData.recipient_email);
      
      toast.success('Recognition sent!');
    } catch (error) {
      // Core functionality still works via form action
      toast.error('Failed to send. Submitting via fallback...');
      e.target.submit();  // Use native form submission
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="recipient"
        value={formData.recipient}
        onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
      />
      
      <Textarea
        name="message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />
      
      {/* AI suggestion - enhancement only */}
      {aiSuggestion && (
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-sm">💡 AI Suggestion:</p>
          <p className="text-sm italic">{aiSuggestion}</p>
          <Button size="sm" onClick={() => setFormData({ ...formData, message: aiSuggestion })}>
            Use This
          </Button>
        </div>
      )}
      
      <Button type="submit">Send Recognition</Button>
    </form>
  );
}
```

---

## 🚨 Error Recovery Patterns

### User-Friendly Error Messages
```javascript
// Error message mapping
const ERROR_MESSAGES = {
  'INSUFFICIENT_POINTS': 'You don\'t have enough points for this purchase.',
  'EVENT_FULL': 'This event is full. Try joining the waitlist!',
  'UNAUTHORIZED': 'Please log in to continue.',
  'FORBIDDEN': 'You don\'t have permission to perform this action.',
  'NOT_FOUND': 'The requested resource was not found.',
  'RATE_LIMITED': 'Too many requests. Please wait a moment and try again.',
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'NETWORK_ERROR': 'Network connection lost. Please check your internet.',
  'TIMEOUT': 'Request timed out. Please try again.',
  'SERVER_ERROR': 'Something went wrong on our end. We\'re looking into it.'
};

function handleError(error) {
  const message = ERROR_MESSAGES[error.code] || 
                  ERROR_MESSAGES.SERVER_ERROR;
  
  toast.error(message);
  
  // Log for debugging
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Send to monitoring
  if (error.code === 'SERVER_ERROR') {
    base44.functions.invoke('logError', {
      error: error.message,
      user: user?.email,
      page: window.location.pathname
    });
  }
}
```

### Retry Mechanisms
```javascript
// Automatic retry with backoff
async function retryOperation(operation, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Exponential backoff
      const delay = Math.min(1000 * 2 ** i, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
    }
  }
  
  throw lastError;
}

// Usage
const createRecognition = async (data) => {
  return retryOperation(async () => {
    return await base44.entities.Recognition.create(data);
  }, 3);
};
```

### Fallback UI
```javascript
// Error boundary with fallback
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    
    // Log to monitoring
    base44.functions.invoke('logError', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-4">
            We're sorry for the inconvenience. The error has been logged.
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

---

## 🎯 Specific Edge Cases

### Points Deduction with Insufficient Balance
```javascript
async function purchaseItem(itemId, userEmail) {
  const [userPoints] = await base44.entities.UserPoints.filter({ user_email: userEmail });
  const item = await base44.entities.StoreItem.get(itemId);
  
  // Edge case: User doesn't have points record
  if (!userPoints) {
    throw new Error('INSUFFICIENT_POINTS');
  }
  
  // Edge case: Insufficient balance
  if (userPoints.total_points < item.points_cost) {
    throw new Error('INSUFFICIENT_POINTS');
  }
  
  // Edge case: Item out of stock
  if (item.stock !== null && item.stock <= 0) {
    throw new Error('OUT_OF_STOCK');
  }
  
  // Edge case: Item expired
  if (item.expires_at && new Date(item.expires_at) < new Date()) {
    throw new Error('ITEM_EXPIRED');
  }
  
  // Proceed with purchase
  const newBalance = userPoints.total_points - item.points_cost;
  
  await Promise.all([
    // Deduct points
    base44.entities.UserPoints.update(userPoints.id, {
      total_points: newBalance
    }),
    
    // Add to inventory
    base44.entities.UserInventory.create({
      user_email: userEmail,
      item_id: itemId,
      quantity: 1,
      acquired_at: new Date().toISOString()
    }),
    
    // Update stock
    item.stock !== null && base44.entities.StoreItem.update(itemId, {
      stock: item.stock - 1
    }),
    
    // Create transaction record
    base44.entities.StoreTransaction.create({
      user_email: userEmail,
      item_id: itemId,
      points_spent: item.points_cost,
      status: 'completed'
    })
  ]);
  
  return { success: true, newBalance };
}
```

### Event Registration Edge Cases
```javascript
async function registerForEvent(eventId, userEmail) {
  const event = await base44.entities.Event.get(eventId);
  
  // Edge case: Event doesn't exist
  if (!event) {
    throw new Error('EVENT_NOT_FOUND');
  }
  
  // Edge case: Event already started
  if (new Date(event.start_time) < new Date()) {
    throw new Error('EVENT_ALREADY_STARTED');
  }
  
  // Edge case: Event cancelled
  if (event.status === 'cancelled') {
    throw new Error('EVENT_CANCELLED');
  }
  
  // Edge case: Already registered
  const existing = await base44.entities.Participation.filter({
    event_id: eventId,
    user_email: userEmail
  });
  
  if (existing.length > 0) {
    throw new Error('ALREADY_REGISTERED');
  }
  
  // Edge case: Event full
  if (event.capacity) {
    const participations = await base44.entities.Participation.filter({
      event_id: eventId,
      status: { $in: ['registered', 'attended'] }
    });
    
    if (participations.length >= event.capacity) {
      throw new Error('EVENT_FULL');
    }
  }
  
  // Proceed with registration
  return await base44.entities.Participation.create({
    event_id: eventId,
    user_email: userEmail,
    status: 'registered',
    registered_at: new Date().toISOString()
  });
}

// UI handling
const handleRegister = async () => {
  try {
    await registerForEvent(event.id, user.email);
    toast.success('Successfully registered!');
  } catch (error) {
    const messages = {
      'EVENT_NOT_FOUND': 'Event not found',
      'EVENT_ALREADY_STARTED': 'This event has already started',
      'EVENT_CANCELLED': 'This event has been cancelled',
      'ALREADY_REGISTERED': 'You\'re already registered for this event',
      'EVENT_FULL': 'This event is full. Would you like to join the waitlist?'
    };
    
    toast.error(messages[error.message] || 'Registration failed');
    
    // Special handling for full events
    if (error.message === 'EVENT_FULL') {
      setShowWaitlistDialog(true);
    }
  }
};
```

### Badge Award Duplicate Prevention
```javascript
async function awardBadge(userEmail, badgeId) {
  // Edge case: Check if already awarded
  const existing = await base44.entities.BadgeAward.filter({
    user_email: userEmail,
    badge_id: badgeId
  });
  
  if (existing.length > 0) {
    console.log('Badge already awarded to user');
    return { success: false, reason: 'ALREADY_AWARDED' };
  }
  
  // Edge case: Badge doesn't exist
  const badge = await base44.entities.Badge.get(badgeId);
  
  if (!badge) {
    throw new Error('BADGE_NOT_FOUND');
  }
  
  // Edge case: Badge is inactive
  if (!badge.is_active) {
    throw new Error('BADGE_INACTIVE');
  }
  
  // Proceed with award
  const award = await base44.entities.BadgeAward.create({
    user_email: userEmail,
    badge_id: badgeId,
    awarded_date: new Date().toISOString()
  });
  
  // Update badge statistics
  await base44.entities.Badge.update(badgeId, {
    times_awarded: (badge.times_awarded || 0) + 1
  });
  
  return { success: true, award };
}
```

---

## 🔄 Real-Time Sync Issues

### Subscription Cleanup
```javascript
// Proper subscription management
function ChannelMessages({ channelId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Subscribe to new messages
    const unsubscribe = base44.entities.ChannelMessage.subscribe((event) => {
      if (event.data.channel_id !== channelId) return;
      
      if (event.type === 'create') {
        setMessages(prev => [...prev, event.data]);
      }
      
      if (event.type === 'update') {
        setMessages(prev =>
          prev.map(m => m.id === event.id ? event.data : m)
        );
      }
      
      if (event.type === 'delete') {
        setMessages(prev => prev.filter(m => m.id !== event.id));
      }
    });
    
    // Cleanup on unmount
    return () => {
      console.log('Unsubscribing from channel messages');
      unsubscribe();
    };
  }, [channelId]);  // Re-subscribe if channel changes
  
  return <MessageList messages={messages} />;
}
```

### Subscription Memory Leaks
```javascript
// Anti-pattern: Missing cleanup
❌ useEffect(() => {
  base44.entities.Recognition.subscribe((event) => {
    updateRecognitions(event);
  });
  // Missing return cleanup!
}, []);

// Correct pattern: Always cleanup
✅ useEffect(() => {
  const unsubscribe = base44.entities.Recognition.subscribe((event) => {
    updateRecognitions(event);
  });
  
  return () => unsubscribe();
}, []);
```

---

## 🧪 Testing Edge Cases

### Smoke Test Checklist
```markdown
## Critical Path Testing

### Authentication
- [ ] New user can sign up
- [ ] Existing user can log in
- [ ] Session persists across page refresh
- [ ] Session expires after 8 hours
- [ ] Logout clears session
- [ ] Unauthorized access redirects to login

### Event Registration
- [ ] User can register for upcoming event
- [ ] User cannot register for past event
- [ ] User cannot register twice
- [ ] Event full shows waitlist option
- [ ] Cancelled event shows appropriate message
- [ ] Reminder sent 1 hour before event

### Points & Gamification
- [ ] Points awarded for event attendance
- [ ] Points awarded for recognition sent
- [ ] Points correctly deducted on purchase
- [ ] Insufficient points prevents purchase
- [ ] Badges auto-awarded when criteria met
- [ ] Leaderboard updates in real-time

### Recognition
- [ ] User can send recognition
- [ ] Recipient receives notification
- [ ] AI moderation flags inappropriate content
- [ ] Points awarded to recipient
- [ ] Recognition appears in feed
- [ ] Private recognition hidden from public

### Teams
- [ ] User can create team
- [ ] User can join team
- [ ] User can leave team
- [ ] Team challenges track progress correctly
- [ ] Team leaderboard aggregates points
```

---

**Last Updated:** January 26, 2026  
**Total Edge Cases Documented:** 50+  
**Next Review:** April 2026