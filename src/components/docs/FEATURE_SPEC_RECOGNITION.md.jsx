# Peer-to-Peer Recognition System - Feature Specification
## Employee Engagement Platform - Intinc

---

## 1. Overview

### 1.1 Purpose
The Recognition System enables employees to publicly acknowledge colleagues' contributions, tag relevant skills/projects, and optionally award points. Admins can moderate before publishing to maintain quality and appropriateness.

### 1.2 Key Benefits
- **Culture Building**: Reinforce company values through recognition
- **Engagement**: Increase employee engagement and retention
- **Visibility**: Make great work visible across the organization
- **Motivation**: Points and badges incentivize participation

---

## 2. Database Schema

### Entity: `Recognition`
```json
{
  "name": "Recognition",
  "properties": {
    "sender_email": { "type": "string", "description": "Who sent the recognition" },
    "sender_name": { "type": "string", "description": "Sender display name" },
    "recipient_emails": { 
      "type": "array", 
      "items": { "type": "string" },
      "description": "One or more recipients"
    },
    "recipient_names": {
      "type": "array",
      "items": { "type": "string" }
    },
    "message": { 
      "type": "string", 
      "description": "Recognition message (max 500 chars)" 
    },
    "category": {
      "type": "string",
      "enum": [
        "teamwork",
        "innovation",
        "leadership",
        "customer_focus",
        "excellence",
        "mentorship",
        "above_and_beyond",
        "culture_champion",
        "problem_solving",
        "other"
      ],
      "default": "teamwork"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Skills, projects, or value tags"
    },
    "points_awarded": {
      "type": "number",
      "default": 0,
      "description": "Points given with recognition"
    },
    "visibility": {
      "type": "string",
      "enum": ["public", "team_only", "private"],
      "default": "public"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "approved", "rejected", "flagged"],
      "default": "pending"
    },
    "moderation": {
      "type": "object",
      "properties": {
        "reviewed_by": { "type": "string" },
        "reviewed_at": { "type": "string", "format": "date-time" },
        "rejection_reason": { "type": "string" },
        "auto_approved": { "type": "boolean" }
      }
    },
    "reactions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "emoji": { "type": "string" },
          "user_emails": { "type": "array", "items": { "type": "string" } }
        }
      },
      "default": []
    },
    "comments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "user_email": { "type": "string" },
          "user_name": { "type": "string" },
          "content": { "type": "string" },
          "created_at": { "type": "string", "format": "date-time" }
        }
      },
      "default": []
    },
    "featured": { "type": "boolean", "default": false },
    "featured_at": { "type": "string", "format": "date-time" }
  },
  "required": ["sender_email", "recipient_emails", "message"]
}
```

### Entity: `RecognitionTag`
```json
{
  "name": "RecognitionTag",
  "properties": {
    "name": { "type": "string", "description": "Tag name" },
    "type": {
      "type": "string",
      "enum": ["skill", "project", "value", "custom"],
      "default": "custom"
    },
    "color": { "type": "string", "description": "Tag color hex" },
    "icon": { "type": "string", "description": "Tag emoji" },
    "usage_count": { "type": "number", "default": 0 },
    "is_active": { "type": "boolean", "default": true }
  },
  "required": ["name", "type"]
}
```

### Entity: `RecognitionSettings`
```json
{
  "name": "RecognitionSettings",
  "properties": {
    "config_key": { "type": "string", "default": "default" },
    "moderation_mode": {
      "type": "string",
      "enum": ["none", "auto", "manual", "hybrid"],
      "default": "hybrid",
      "description": "none=instant publish, auto=AI filter, manual=HR review, hybrid=AI+flagged to HR"
    },
    "points_enabled": { "type": "boolean", "default": true },
    "points_per_recognition": {
      "type": "object",
      "properties": {
        "sender_points": { "type": "number", "default": 5 },
        "recipient_base_points": { "type": "number", "default": 10 },
        "max_points_per_day": { "type": "number", "default": 50 }
      }
    },
    "daily_recognition_limit": { "type": "number", "default": 5 },
    "allow_self_recognition": { "type": "boolean", "default": false },
    "allow_anonymous": { "type": "boolean", "default": false },
    "require_category": { "type": "boolean", "default": true },
    "min_message_length": { "type": "number", "default": 20 },
    "blocked_words": { "type": "array", "items": { "type": "string" } },
    "featured_rotation_days": { "type": "number", "default": 7 }
  }
}
```

---

## 3. User Flows

### 3.1 Employee Recognition Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GIVE RECOGNITION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. INITIATE                                                     │
│     ├── Click "Give Shoutout" button (prominent in nav/dash)    │
│     ├── Quick action from colleague's profile                   │
│     └── Reply to existing recognition                           │
│                                                                  │
│  2. SELECT RECIPIENT(S)                                          │
│     ├── Search by name/email with autocomplete                  │
│     ├── Select multiple recipients (team recognition)           │
│     └── See recipient's recent recognitions (avoid duplicates)  │
│                                                                  │
│  3. COMPOSE MESSAGE                                              │
│     ├── Write heartfelt message (20-500 chars)                  │
│     ├── AI writing assistant (optional)                         │
│     └── Real-time character count                               │
│                                                                  │
│  4. ADD CONTEXT                                                  │
│     ├── Select category (teamwork, innovation, etc.)            │
│     ├── Add tags (skills, projects, values)                     │
│     ├── Attach image (optional)                                 │
│     └── Set visibility (public/team/private)                    │
│                                                                  │
│  5. AWARD POINTS (optional)                                      │
│     ├── Select point amount (from daily allowance)              │
│     └── See remaining daily points                              │
│                                                                  │
│  6. PREVIEW & SEND                                               │
│     ├── Preview how it will appear                              │
│     ├── Confirm and submit                                      │
│     └── See moderation status message                           │
│                                                                  │
│  7. POST-SEND                                                    │
│     ├── Notification to recipient(s)                            │
│     ├── Appears in feed (after approval if moderated)           │
│     └── Both parties earn points                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Recognition Feed Experience

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECOGNITION FEED                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🌟 FEATURED RECOGNITION                                  │    │
│  │ ───────────────────────────────────────────────────────  │    │
│  │ Sarah Chen recognized Alex Johnson                       │    │
│  │ for Outstanding Leadership                               │    │
│  │                                                          │    │
│  │ "Alex went above and beyond leading the product launch.  │    │
│  │ His calm demeanor and clear communication kept the       │    │
│  │ entire team aligned through a challenging sprint."       │    │
│  │                                                          │    │
│  │ 🏷️ #leadership #product-launch #Q4-goals                │    │
│  │ 💰 +25 points                                            │    │
│  │                                                          │    │
│  │ 👍 24  ❤️ 18  🎉 12  💬 5 comments                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  FILTERS: [All] [My Team] [Given by Me] [Received]              │
│  SORT: [Recent] [Most Reactions] [Featured]                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 💡 Recognition Card (Standard)                           │    │
│  │ [Avatar] Name → Name | Category | Time ago               │    │
│  │ Message preview... [Read more]                           │    │
│  │ Tags | Reactions | Comments | Share                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Admin Moderation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODERATION QUEUE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PENDING REVIEW: 3 | FLAGGED: 1 | TODAY: 24 approved           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ⚠️ FLAGGED BY AI                                         │    │
│  │ Reason: Potential inappropriate language                 │    │
│  │ ───────────────────────────────────────────────────────  │    │
│  │ [Full recognition content]                               │    │
│  │                                                          │    │
│  │ [✓ Approve] [✗ Reject] [✏️ Edit] [📝 Request Edit]      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  BULK ACTIONS: [Approve All Pending] [Export Report]            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Moderation System

### 4.1 Moderation Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **None** | Instant publish | High-trust small teams |
| **Auto** | AI filters, auto-approve clean | Medium teams |
| **Manual** | HR reviews all | Strict compliance needs |
| **Hybrid** | AI filters, flags suspicious to HR | Recommended default |

### 4.2 Auto-Moderation Logic

```javascript
const moderateRecognition = async (recognition) => {
  const checks = [];
  
  // 1. Blocked words check
  const hasBlockedWords = checkBlockedWords(recognition.message);
  if (hasBlockedWords) {
    checks.push({ type: 'blocked_words', severity: 'high' });
  }
  
  // 2. AI sentiment analysis
  const sentiment = await analyzeSentiment(recognition.message);
  if (sentiment.toxicity > 0.7) {
    checks.push({ type: 'toxicity', severity: 'high', score: sentiment.toxicity });
  }
  
  // 3. Self-recognition check
  if (recognition.recipient_emails.includes(recognition.sender_email)) {
    checks.push({ type: 'self_recognition', severity: 'high' });
  }
  
  // 4. Spam detection (same sender/recipient pair recently)
  const recentDuplicates = await checkRecentDuplicates(recognition);
  if (recentDuplicates > 2) {
    checks.push({ type: 'potential_spam', severity: 'medium' });
  }
  
  // 5. Message quality
  if (recognition.message.length < 20) {
    checks.push({ type: 'too_short', severity: 'low' });
  }
  
  // Determine action
  const highSeverity = checks.filter(c => c.severity === 'high');
  const mediumSeverity = checks.filter(c => c.severity === 'medium');
  
  if (highSeverity.length > 0) {
    return { status: 'flagged', checks, requiresReview: true };
  } else if (mediumSeverity.length > 0) {
    return { status: 'pending', checks, requiresReview: true };
  } else {
    return { status: 'approved', checks, auto_approved: true };
  }
};
```

---

## 5. Points Integration

### 5.1 Points Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   SENDER     │    │  RECOGNITION │    │  RECIPIENT   │
│              │    │              │    │              │
│ Daily Pool:  │───▶│ Points Given │───▶│ Points       │
│ 50 points    │    │ (5-25)       │    │ Received     │
│              │    │              │    │              │
│ Also earns:  │    │ After        │    │ Base + Given │
│ 5 pts/recog  │    │ Approval     │    │ = Total      │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 5.2 Points Configuration

| Action | Points | Notes |
|--------|--------|-------|
| Send recognition | +5 | Sender reward |
| Receive recognition (base) | +10 | Minimum |
| Bonus points (from sender) | +5 to +25 | From sender's pool |
| Featured recognition | +50 | Weekly selection |
| Recognition with 10+ reactions | +10 | Viral bonus |

---

## 6. UI Components

```
components/recognition/
├── RecognitionComposer.jsx      # Create new recognition
├── RecipientSelector.jsx        # Search & select recipients
├── CategoryPicker.jsx           # Category selection grid
├── TagInput.jsx                 # Add skill/project tags
├── PointsSlider.jsx             # Select points to award
├── RecognitionCard.jsx          # Display single recognition
├── RecognitionFeed.jsx          # Scrollable feed
├── FeaturedRecognition.jsx      # Highlighted recognition
├── RecognitionReactions.jsx     # Emoji reactions
├── RecognitionComments.jsx      # Comment thread
├── ModerationQueue.jsx          # Admin: pending items
├── ModerationActions.jsx        # Admin: approve/reject
├── RecognitionStats.jsx         # User: given/received stats
└── RecognitionLeaderboard.jsx   # Top recognized people
```

---

## 7. Notifications

| Event | Channels | Recipients |
|-------|----------|------------|
| Recognition received | Email, In-app, Slack | Recipient(s) |
| Recognition approved | In-app | Sender |
| Recognition rejected | Email, In-app | Sender |
| Comment on recognition | In-app | Recognition parties |
| Featured selection | Email, In-app, Slack | Recipient |
| Weekly recognition digest | Email | All employees |

---

## 8. Analytics & Reporting

### 8.1 Metrics Dashboard

- **Recognition Volume**: Daily/weekly/monthly counts
- **Top Recognized**: Leaderboard by received count
- **Top Givers**: Most generous recognizers
- **Category Distribution**: Which values are most recognized
- **Tag Trends**: Popular skills/projects
- **Team Health**: Recognition flow between teams
- **Engagement Rate**: % of employees participating

### 8.2 Network Visualization

Show recognition flow as a network graph:
- Nodes = Employees
- Edges = Recognition given
- Thickness = Frequency
- Color = Category

Identify isolated employees (potential engagement risk).

---

## 9. Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `recognition.enabled` | Master toggle | true |
| `recognition.points` | Points with recognition | true |
| `recognition.moderation` | Moderation mode | "hybrid" |
| `recognition.anonymous` | Allow anonymous | false |
| `recognition.comments` | Enable comments | true |
| `recognition.reactions` | Enable reactions | true |
| `recognition.featured` | Featured rotation | true |
| `recognition.ai_assist` | AI writing helper | false |