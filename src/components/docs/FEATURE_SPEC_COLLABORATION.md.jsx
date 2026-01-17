# Collaboration Features Specification

## Overview
Real-time collaboration features enabling seamless communication and teamwork across the platform through direct messaging, comment discussions, and collaborative editing.

## Features

### 1. Direct Messaging
**Purpose**: Enable private 1-on-1 conversations between users

**Components**:
- `DirectMessaging.js` - Full-featured chat interface
- `DirectMessage` entity - Message storage with read receipts

**Features**:
- Real-time message delivery (3-second polling + subscriptions)
- Read receipts
- Message search
- Conversation history
- Mobile-responsive chat interface

**Access**:
- Available from user profiles via "Message" button
- Admins can view all conversations (for compliance)

**Security**:
- RBAC: Only participants + admins can read messages
- End-to-end conversation privacy
- Message deletion by sender

### 2. Comment Sections
**Purpose**: Enable threaded discussions on events, profiles, and activities

**Components**:
- `CommentSection.js` - Universal comment widget
- `Comment` entity - Polymorphic comment storage

**Features**:
- Real-time comment updates via subscriptions
- Edit/delete own comments
- Quick emoji reactions (👍 ❤️ 🎉 💡 👏)
- Author attribution with avatars
- Mobile-optimized threading

**Supported Entities**:
- Events (event planning discussions)
- User Profiles (peer feedback)
- Activities (template suggestions)
- Recognitions (amplification)

**Permissions**:
- Read: Public (all authenticated users)
- Write: Authenticated users
- Edit/Delete: Author + Admins

### 3. Collaborative Text Editor
**Purpose**: Enable real-time co-editing of event descriptions and PRDs

**Components**:
- `CollaborativeTextEditor.js` - Rich text editor with auto-save
- Uses ReactQuill for formatting

**Features**:
- Auto-save (2-second debounce)
- Real-time sync via entity subscriptions
- Rich text formatting (headers, lists, links, code blocks)
- Multi-user awareness
- Conflict detection with toast notifications

**Use Cases**:
- Event description collaboration
- PRD co-authoring
- Activity instruction refinement

## Database Schema

### DirectMessage Entity
```json
{
  "conversation_id": "user1@example.com_user2@example.com",
  "sender_email": "user1@example.com",
  "recipient_email": "user2@example.com",
  "message": "Hello, how are you?",
  "read": false,
  "read_at": null,
  "attachment_url": null
}
```

**Conversation ID Logic**: Sorted emails concatenated with underscore ensures consistent ID between two users.

### Comment Entity
```json
{
  "entity_type": "event|user_profile|activity|recognition",
  "entity_id": "abc123",
  "author_email": "user@example.com",
  "author_name": "John Doe",
  "content": "Great idea! Let's schedule this for next week.",
  "parent_comment_id": null,
  "mentions": ["jane@example.com"],
  "reactions": [
    { "emoji": "👍", "user_email": "jane@example.com" }
  ],
  "edited": false,
  "edited_at": null
}
```

## Real-time Architecture

### Subscription Pattern
All collaboration features use Base44's real-time subscriptions:

```javascript
useEffect(() => {
  const unsubscribe = base44.entities.Comment.subscribe((event) => {
    if (event.data?.entity_id === targetId) {
      queryClient.invalidateQueries(['comments']);
    }
  });
  return unsubscribe;
}, [targetId]);
```

### Polling Fallback
Direct messaging includes 3-second polling as fallback:
```javascript
refetchInterval: 3000
```

### Conflict Resolution
Collaborative editor uses timestamp-based conflict detection:
- Tracks last sync time
- Ignores updates from own changes
- Shows toast when remote changes detected

## Integration Points

### User Profiles
- "Message" button opens DM dialog
- Profile discussion comment section
- Only visible when viewing others' profiles

### Event Pages
- Comment section for event planning discussions
- Collaborative editing for descriptions
- Real-time participant coordination

### Analytics
Future: Track collaboration metrics
- Messages sent per user
- Comments per entity
- Most discussed events/profiles

## Mobile Optimization

All collaboration features are mobile-responsive:
- **Direct Messaging**: Full-screen on mobile with touch-friendly UI
- **Comments**: Vertical stacking, large touch targets
- **Editor**: Simplified toolbar on small screens

## Accessibility

- Keyboard navigation for all features
- Screen reader support with ARIA labels
- Focus management in dialogs
- High contrast mode compatible

## Privacy & Compliance

### Data Retention
- Messages: Retained indefinitely (user can delete)
- Comments: Permanent (edit history tracked)
- Deleted content: Hard delete (GDPR compliance)

### Admin Access
- Admins can view all messages (compliance)
- Audit log for moderation actions
- Export capabilities for legal requests

### Content Moderation
- User-reported comments flagged for review
- Automated keyword filtering (future)
- Admin can delete inappropriate content

## Performance Considerations

### Optimizations
- Debounced auto-save (2s)
- Pagination for long message threads (100 messages)
- Comment count limits (display 100, load more)
- Lazy loading for avatars

### Rate Limits
- Message sending: 10 messages/minute
- Comment posting: 20 comments/minute
- Reaction toggling: No limit

## Future Enhancements
- Threaded comment replies
- @mentions with notifications
- File attachments in messages
- Video/voice calling
- Group chat channels
- Markdown support in comments
- Code syntax highlighting
- Collaborative drawing/whiteboard
- Presence indicators (online/offline)