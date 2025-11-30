# API Reference
## Employee Engagement Platform

---

## 1. Overview

### 1.1 Base Configuration

```javascript
// Frontend SDK Usage
import { base44 } from '@/api/base44Client';

// Backend Function Setup
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
const base44 = createClientFromRequest(req);
```

### 1.2 Authentication

```javascript
// Check authentication
const user = await base44.auth.me();

// Logout
base44.auth.logout(redirectUrl);

// Redirect to login
base44.auth.redirectToLogin(nextUrl);

// Check if authenticated
const isAuth = await base44.auth.isAuthenticated();
```

---

## 2. Platform Statistics

| Entity | Records | Description |
|--------|---------|-------------|
| Activity | 15+ | Activity templates |
| Event | Active | Scheduled events |
| Badge | 10 | Achievement badges |
| EventTemplate | 30+ | Pre-built templates |
| Channel | Dynamic | Team messaging |
| Team | Dynamic | Organization structure |
| UserPoints | Per-user | Gamification data |
| UserFollow | Dynamic | Social relationships |
| LeaderboardSnapshot | Periodic | Pre-computed rankings |
| StoreItem | 50+ | Avatar items |

---

## 3. Entity APIs

### 3.1 User Entity (Built-in)

```javascript
// List all users (admin only)
const users = await base44.entities.User.list();

// Get current user
const me = await base44.auth.me();

// Update current user
await base44.auth.updateMe({ custom_field: 'value' });
```

---

### 3.2 UserFollow API (NEW)

```javascript
// Follow a user
await base44.entities.UserFollow.create({
  follower_email: currentUser.email,
  following_email: targetEmail,
  status: 'active'
});

// Get users I follow
const following = await base44.entities.UserFollow.filter({
  follower_email: currentUser.email,
  status: 'active'
});

// Get my followers
const followers = await base44.entities.UserFollow.filter({
  following_email: currentUser.email,
  status: 'active'
});

// Block a user
await base44.entities.UserFollow.update(existingId, {
  status: 'blocked'
});

// Unfollow
await base44.entities.UserFollow.delete(existingId);
```

**UserFollow Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| follower_email | string | yes | User who follows |
| following_email | string | yes | User being followed |
| status | enum | no | 'active' or 'blocked' |

---

### 3.3 LeaderboardSnapshot API (NEW)

```javascript
// Get leaderboard snapshot
const snapshot = await base44.entities.LeaderboardSnapshot.filter({
  period: 'weekly',
  category: 'points'
});

// Create/update snapshot (backend only)
await base44.asServiceRole.entities.LeaderboardSnapshot.create({
  period: 'weekly',
  category: 'points',
  period_start: '2025-11-25',
  rankings: [
    { rank: 1, user_email: 'top@user.com', score: 1500 },
    // ...
  ],
  total_participants: 150,
  last_calculated: new Date().toISOString()
});
```

**LeaderboardSnapshot Schema:**
| Field | Type | Description |
|-------|------|-------------|
| period | enum | daily, weekly, monthly, all_time |
| category | enum | points, events, badges, engagement |
| period_start | date | Start of period |
| rankings | array | Ranked users with scores |
| total_participants | number | Users in leaderboard |
| last_calculated | datetime | Computation timestamp |

---

### 3.4 Recognition API

```javascript
// Create recognition
const recognition = await base44.entities.Recognition.create({
  sender_email: user.email,
  sender_name: user.full_name,
  recipient_email: 'colleague@company.com',
  recipient_name: 'Colleague Name',
  message: 'Great work on the project!',
  category: 'teamwork',
  company_values: ['collaboration'],
  visibility: 'public',
  status: 'pending'  // For moderation
});

// List approved recognitions
const feed = await base44.entities.Recognition.filter(
  { status: 'approved' },
  '-created_date',
  50
);

// Get flagged for moderation
const flagged = await base44.entities.Recognition.filter(
  { status: 'flagged' },
  '-created_date'
);

// Moderate recognition
await base44.entities.Recognition.update(id, {
  status: 'approved',
  moderated_by: admin.email,
  moderated_at: new Date().toISOString()
});
```

---

### 3.5 UserPoints API

```javascript
// Get user points
const points = await base44.entities.UserPoints.filter(
  { user_email: user.email }
);

// Get leaderboard (all users sorted by points)
const leaderboard = await base44.entities.UserPoints.list(
  '-total_points',
  100
);

// Award points (via backend function)
await base44.functions.invoke('awardPoints', {
  participationId: participation.id,
  actionType: 'attendance'  // or 'activity_completion', 'feedback'
});
```

**UserPoints Schema:**
| Field | Type | Description |
|-------|------|-------------|
| user_email | string | User identifier |
| total_points | number | All-time points |
| available_points | number | Spendable points |
| lifetime_points | number | Never decreases |
| level | number | Current level (1-20) |
| streak_days | number | Consecutive active days |
| events_attended | number | Event count |
| activities_completed | number | Activity count |
| feedback_submitted | number | Feedback count |
| badges_earned | array | Badge IDs |
| team_id | string | Team membership |
| points_history | array | Recent transactions |

---

### 3.6 Store Item API

```javascript
// List available store items
const items = await base44.entities.StoreItem.filter(
  { is_available: true },
  'display_order'
);

// Purchase with points (via backend)
const result = await base44.functions.invoke('purchaseWithPoints', {
  itemId: item.id,
  quantity: 1
});

// Purchase with Stripe (via backend)
const { data } = await base44.functions.invoke('createStoreCheckout', {
  itemId: item.id
});
window.location.href = data.checkoutUrl;
```

---

### 3.7 User Inventory API

```javascript
// Get user's inventory
const inventory = await base44.entities.UserInventory.filter(
  { user_email: user.email }
);

// Get equipped items
const equipped = await base44.entities.UserInventory.filter({
  user_email: user.email,
  is_equipped: true
});
```

---

### 3.8 User Avatar API

```javascript
// Get user's avatar configuration
const avatars = await base44.entities.UserAvatar.filter(
  { user_email: user.email }
);
const avatar = avatars[0];

// Update equipped items
await base44.entities.UserAvatar.update(avatar.id, {
  equipped_hat: itemId,
  equipped_glasses: null,
  equipped_background: bgItemId,
  last_updated: new Date().toISOString()
});
```

---

## 4. Backend Functions

### 4.1 Gamification Functions

```javascript
// Award points for participation
await base44.functions.invoke('awardPoints', {
  participationId: 'part_123',
  actionType: 'attendance'  // attendance | activity_completion | feedback | high_engagement
});

// Response:
{
  success: true,
  pointsAwarded: 10,
  newTotal: 250,
  newLevel: 3,
  badgesEarned: []
}
```

### 4.2 Store Functions

```javascript
// Purchase with points
const { data } = await base44.functions.invoke('purchaseWithPoints', {
  itemId: 'item_123',
  quantity: 1
});

// Response:
{
  success: true,
  item: { id, name, category },
  points_spent: 100,
  remaining_points: 150,
  expires_at: null  // For power-ups
}

// Create Stripe checkout
const { data } = await base44.functions.invoke('createStoreCheckout', {
  itemId: 'item_123'
});

// Response:
{
  checkoutUrl: 'https://checkout.stripe.com/...'
}
```

### 4.3 Notification Functions

```javascript
// Send Slack notification
await base44.functions.invoke('slackNotifications', {
  channel: '#general',
  message: 'New recognition posted!'
});

// Send Teams notification
await base44.functions.invoke('teamsNotifications', {
  webhookUrl: 'https://...',
  title: 'Recognition',
  message: 'You received a shoutout!'
});
```

---

## 5. Custom Hooks (Frontend)

### 5.1 useLeaderboard

```javascript
import { useLeaderboard, LEADERBOARD_CATEGORIES, TIME_PERIODS } from '@/components/leaderboard/hooks/useLeaderboard';

const {
  rankings,      // Top 100 users
  myRank,        // Current user's rank object
  nearby,        // Users ±2 positions
  totalParticipants,
  isLoading,
  category,
  period
} = useLeaderboard('points', 'weekly', currentUserEmail);
```

### 5.2 useSocialActions

```javascript
import { useSocialActions } from '@/components/profile/hooks/useSocialActions';

const {
  following,        // Users I follow
  followers,        // My followers
  blocked,          // Blocked users
  followingCount,
  followersCount,
  isFollowing,      // (email) => boolean
  isBlocked,        // (email) => boolean
  follow,           // (email) => void
  unfollow,         // (email) => void
  block,            // (email) => void
  isLoading
} = useSocialActions(currentUserEmail);
```

### 5.3 useModerationActions

```javascript
import { useModerationActions } from '@/components/moderation/hooks/useModerationActions';

const {
  moderateMutation,      // Approve/reject
  analyzeContent,        // AI analysis
  invalidateModerationQueries
} = useModerationActions(currentUser);

// Usage
moderateMutation.mutate({ id, action: 'approve', notes: '' });
await analyzeContent(recognition);
```

### 5.4 useStoreActions

```javascript
import { useStoreActions } from '@/components/store/hooks/useStoreActions';

const {
  purchasePointsMutation,
  purchaseStripeMutation,
  purchase,              // (item, 'points'|'stripe') => void
  isPurchasing,
  invalidateStoreQueries
} = useStoreActions();
```

### 5.5 useAvatarCustomization

```javascript
import { useAvatarCustomization, SLOT_CONFIG } from '@/components/store/hooks/useAvatarCustomization';

const {
  activeSlot,
  setActiveSlot,
  selectedItems,
  hasChanges,
  inventory,
  getSlotItems,        // (slot) => items[]
  getEquippedItem,     // (slot) => item
  handleSelectItem,    // (slot, itemId) => void
  handleReset,
  saveAvatar,
  saveMutation
} = useAvatarCustomization(userEmail);
```

---

## 6. Query Patterns

### 6.1 Filtering

```javascript
// Exact match
await base44.entities.Recognition.filter({ status: 'approved' });

// Multiple conditions
await base44.entities.Recognition.filter({
  status: 'approved',
  visibility: 'public'
});
```

### 6.2 Sorting

```javascript
// Descending (newest first)
await base44.entities.Recognition.list('-created_date');

// With limit
await base44.entities.Recognition.list('-created_date', 20);
```

---

## 7. Integrations

### 7.1 Core Integrations

```javascript
// AI Analysis (for moderation)
const result = await base44.integrations.Core.InvokeLLM({
  prompt: 'Analyze this content for appropriateness...',
  response_json_schema: {
    type: 'object',
    properties: {
      is_safe: { type: 'boolean' },
      flag_reason: { type: 'string' },
      confidence: { type: 'number' }
    }
  }
});

// File Upload
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject
});

// Send Email
await base44.integrations.Core.SendEmail({
  to: 'user@company.com',
  subject: 'You earned a badge!',
  body: '<html>...</html>'
});
```

### 7.2 Stripe (Backend Only)

```javascript
import Stripe from 'npm:stripe';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: item.stripe_price_id, quantity: 1 }],
  success_url: `${origin}/PointStore?success=true`,
  cancel_url: `${origin}/PointStore?canceled=true`,
  customer_email: user.email,
  metadata: { user_email: user.email, item_id: itemId }
});
```

---

## 8. Error Handling

```javascript
// Frontend mutations
const mutation = useMutation({
  mutationFn: async (data) => { ... },
  onSuccess: () => toast.success('Done!'),
  onError: (error) => {
    const msg = error.response?.data?.error || 'Failed';
    toast.error(msg);
  }
});

// Backend functions
Deno.serve(async (req) => {
  try {
    // ... logic
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## 9. Configuration Constants

### 9.1 Leaderboard Categories

```javascript
export const LEADERBOARD_CATEGORIES = {
  points: { label: 'Points', field: 'total_points', icon: '🏆' },
  events: { label: 'Events Attended', field: 'events_attended', icon: '📅' },
  badges: { label: 'Badges Earned', field: 'badges_count', icon: '🎖️' },
  engagement: { label: 'Engagement Score', field: 'engagement_score', icon: '⚡' }
};

export const TIME_PERIODS = {
  daily: { label: 'Today', days: 1 },
  weekly: { label: 'This Week', days: 7 },
  monthly: { label: 'This Month', days: 30 },
  all_time: { label: 'All Time', days: null }
};
```

### 9.2 Avatar Slots

```javascript
export const SLOT_CONFIG = {
  hat: { label: 'Hat', icon: '🎩', category: 'avatar_hat' },
  glasses: { label: 'Glasses', icon: '👓', category: 'avatar_glasses' },
  background: { label: 'Background', icon: '🖼️', category: 'avatar_background' },
  frame: { label: 'Frame', icon: '✨', category: 'avatar_frame' },
  effect: { label: 'Effect', icon: '🌟', category: 'avatar_effect' }
};
```

### 9.3 Moderation Flags

```javascript
export const FLAG_REASONS = {
  inappropriate: { label: 'Inappropriate Content', severity: 'high' },
  spam: { label: 'Spam/Promotional', severity: 'medium' },
  bias: { label: 'Potential Bias', severity: 'medium' },
  low_quality: { label: 'Low Quality', severity: 'low' },
  needs_review: { label: 'Needs Human Review', severity: 'medium' }
};
```

---

*Document Version: 2.0*
*Last Updated: 2025-11-30*