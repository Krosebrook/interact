# Real-time Architecture

**Overview:** INTeract uses Base44's subscription system for real-time updates on leaderboards, recognition, reactions, and team activity.

---

## Core Concepts

### 1. Entity Subscriptions

Every Base44 entity supports real-time subscriptions:

```javascript
const unsubscribe = base44.entities.Recognition.subscribe((event) => {
  if (event.type === 'create') {
    console.log('New recognition:', event.data);
  }
});

// Cleanup
return unsubscribe;
```

**Event types:**
- `create` - New record created
- `update` - Record modified
- `delete` - Record removed

### 2. Leaderboard Real-time Updates

When a user's points change, their leaderboard rank updates in real-time:

```javascript
// components/hooks/useLeaderboardSubscription.js
export function useLeaderboardSubscription(type = 'weekly') {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = base44.entities.LeaderboardSnapshot.subscribe((event) => {
      if (event.type === 'update' && event.data.snapshot_type === type) {
        // Optimistically update cache
        queryClient.setQueryData(['leaderboard', type], oldData => ({
          ...oldData,
          snapshots: oldData.snapshots.map(s =>
            s.id === event.data.id ? event.data : s
          )
        }));
      }
    });

    return unsubscribe;
  }, [type, queryClient]);
}
```

### 3. Optimistic Updates

UI updates immediately while request is in-flight:

```javascript
// User clicks "Give Recognition"
// 1. UI updates immediately (optimistic)
// 2. API call happens
// 3. If success, confirm. If failure, rollback UI
```

**Benefits:**
- Fast, responsive UI
- Reduced perceived latency
- Survives network delays

**Implementation:**
```javascript
const mutation = useMutation({
  mutationFn: giveRecognition,
  onMutate: async (newRecognition) => {
    // Immediately update UI
    queryClient.setQueryData(['recognitions'], old => [newRecognition, ...old]);
  },
  onError: (error, vars, context) => {
    // Rollback on error
    queryClient.setQueryData(['recognitions'], context.previous);
  }
});
```

---

## Real-time Features

### Recognition & Reactions

**Real-time reactions on recognition posts:**

```javascript
// User reacts with 👍 emoji
base44.entities.Recognition.subscribe((event) => {
  if (event.type === 'update' && event.data.id === postId) {
    setReactions(event.data.reactions);
  }
});
```

**Throttling:** Reactions batched in 500ms windows to prevent spam updates

### Team Activity Stream

**Live team channel messages:**

```javascript
useEffect(() => {
  const unsubscribe = base44.entities.TeamMessage.subscribe((event) => {
    if (event.data.channel_id === currentChannelId) {
      addMessageToUI(event.data);
    }
  });
  return unsubscribe;
}, [currentChannelId]);
```

**Filtering:** Only subscribe to current channel, unsubscribe on leave

### Notification Updates

**Unread notification count updates in real-time:**

```javascript
const unsubscribe = base44.entities.Notification.subscribe((event) => {
  if (event.type === 'create' && event.data.recipient_email === user.email) {
    setUnreadCount(c => c + 1);
    showToast(event.data.message);
  }
});
```

### Leaderboard Rank Changes

**User sees their rank move in real-time:**

```javascript
// functions/leaderboardRealtime.js
async function getUserRankChange(base44, userEmail, type) {
  const currentSnap = await base44.entities.LeaderboardSnapshot.filter({
    snapshot_type: type,
    user_email: userEmail
  });

  const allSnapshots = await base44.entities.LeaderboardSnapshot.filter({
    snapshot_type: type
  });

  const userRank = allSnapshots.filter(s => s.points > currentSnap.points).length + 1;
  
  return { currentRank: userRank, rankChange: previousRank - userRank };
}
```

---

## Connection Management

### Reconnection Logic

When network drops and reconnects:

```javascript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Refetch all queries
      queryClient.refetchQueries();
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Queue actions locally
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Subscription Cleanup

Always unsubscribe on unmount to prevent memory leaks:

```javascript
useEffect(() => {
  const unsubscribe = base44.entities.SomeEntity.subscribe(handler);
  return unsubscribe; // Cleanup
}, []);
```

---

## Performance Optimization

### 1. Selective Subscriptions

Only subscribe to data you display:

```javascript
// ❌ BAD: Subscribe to all recognitions
base44.entities.Recognition.subscribe(handler);

// ✅ GOOD: Subscribe only to current team
base44.entities.Recognition.subscribe((event) => {
  if (event.data.team_id === currentTeamId) {
    handleUpdate(event.data);
  }
});
```

### 2. Batch Updates

Batch multiple changes before re-rendering:

```javascript
const [updates, setUpdates] = useState([]);

useEffect(() => {
  const timeout = setTimeout(() => {
    if (updates.length > 0) {
      // Process all updates at once
      processUpdates(updates);
      setUpdates([]);
    }
  }, 500); // 500ms batch window

  return () => clearTimeout(timeout);
}, [updates]);
```

### 3. Unsubscribe on Route Change

Prevent multiple subscriptions:

```javascript
useEffect(() => {
  const unsub = base44.entities.Recognition.subscribe(handler);
  
  // Clean up on unmount
  return unsub;
}, []); // Empty deps = only on mount/unmount
```

---

## Debugging Real-time

### Enable Debug Logging

```javascript
// In development, log all subscription events
if (process.env.NODE_ENV === 'development') {
  base44.entities.Recognition.subscribe((event) => {
    console.log('[SUBSCRIPTION]', event.type, event.data.id);
  });
}
```

### Check Active Subscriptions

**Chrome DevTools → Network tab:**
- Look for WebSocket connections
- Filter: `wss://` (secure WebSocket)
- Should show as "101 Switching Protocols"

### Test Subscription Lag

```javascript
const start = Date.now();
base44.entities.Recognition.subscribe(() => {
  const latency = Date.now() - start;
  console.log(`Update latency: ${latency}ms`);
});
```

---

## Common Patterns

### Pattern 1: Live Counter

```javascript
export function LivePointsCounter({ userId }) {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const unsubscribe = base44.entities.UserPoints.subscribe((event) => {
      if (event.data.user_email === userId) {
        setPoints(event.data.total_points);
      }
    });
    return unsubscribe;
  }, [userId]);

  return <div>{points} points</div>;
}
```

### Pattern 2: Live List

```javascript
export function LiveRecognitionList() {
  const [recognitions, setRecognitions] = useState([]);

  useEffect(() => {
    const unsubscribe = base44.entities.Recognition.subscribe((event) => {
      if (event.type === 'create') {
        setRecognitions(old => [event.data, ...old]);
      } else if (event.type === 'delete') {
        setRecognitions(old => old.filter(r => r.id !== event.data.id));
      }
    });
    return unsubscribe;
  }, []);

  return <div>{recognitions.map(r => <RecognitionCard key={r.id} {...r} />)}</div>;
}
```

### Pattern 3: Live Status

```javascript
export function LiveUserStatus({ userId }) {
  const [status, setStatus] = useState('offline');

  useEffect(() => {
    const unsubscribe = base44.entities.UserProfile.subscribe((event) => {
      if (event.data.user_email === userId) {
        setStatus(event.data.online_status);
      }
    });
    return unsubscribe;
  }, [userId]);

  return <StatusIndicator status={status} />;
}
```

---

## Fallbacks & Degradation

### If Real-time Unavailable

The app gracefully degrades:

```javascript
export function useSmartQuery(queryKey, queryFn) {
  const query = useQuery({ queryKey, queryFn });
  
  useEffect(() => {
    // If subscription fails, fall back to polling
    const interval = setInterval(() => {
      query.refetch();
    }, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [query]);

  return query;
}
```

### Timeout Handling

```javascript
// If update doesn't arrive in 30s, refetch
const timeout = setTimeout(() => {
  queryClient.refetchQueries();
}, 30000);
```

---

## Security

### Only Subscribe to Permitted Data

```javascript
// ✅ GOOD: Filtering handled server-side
// User can only see recognitions they have permission to
base44.entities.Recognition.subscribe(handler);
// Base44 SDK filters automatically

// ❌ BAD: Don't try to filter sensitive data client-side
// A determined user can inspect network traffic
const secretData = event.data; // Don't filter here!
```

---

## Limitations

- **No historical data:** Subscriptions only capture changes after subscription created
- **No guaranteed delivery:** Network issues may cause lost updates (refetch on reconnect)
- **No ordering guarantee:** Fast concurrent updates may arrive out-of-order
- **No offline queue:** Changes made offline won't sync (handled by Service Worker separately)

---

## Testing Real-time Features

```javascript
// jest.test.js
test('updates leaderboard when points awarded', async () => {
  const handler = jest.fn();
  const unsubscribe = base44.entities.LeaderboardSnapshot.subscribe(handler);

  // Award points (triggers subscription)
  await awardPoints('user@test.com', 100);

  // Wait for update
  await waitFor(() => expect(handler).toHaveBeenCalled());
  expect(handler).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'update' })
  );

  unsubscribe();
});
```

---

## Resources

- **Base44 SDK Docs:** https://base44.dev/docs/subscriptions
- **WebSocket Protocol:** RFC 6455
- **Real-time Best Practices:** https://www.patterns.dev/posts/real-time-patterns

---

**Last Updated:** January 14, 2026  
**Owner:** Engineering Team