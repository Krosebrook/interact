# Recognition System 2.0 Guide
**Version:** 2.0  
**Last Updated:** February 6, 2026

---

## 🏆 Enhanced Recognition System

### 1. Predefined Award Categories
**Entity:** `RecognitionCategory`

**Default Categories:**
| Category | Points | Icon | Use Case |
|----------|--------|------|----------|
| Teamwork Excellence | 15 | Users | Outstanding collaboration |
| Innovation | 20 | Lightbulb | Creative problem-solving |
| Leadership | 25 | Crown | Leading by example |
| Going Above & Beyond | 20 | Zap | Exceeding expectations |
| Customer Focus | 15 | Heart | Exceptional service |
| Problem Solving | 15 | Target | Tough challenges solved |
| Mentorship | 20 | GraduationCap | Helping others grow |
| Culture Champion | 15 | Star | Embodying company values |

**Admin Management:**
- Create/edit categories in Recognition Admin
- Set point values per category
- Track usage count
- Enable/disable categories

---

### 2. Enhanced Recognition Form
**Component:** `components/social/EnhancedRecognitionForm.jsx`

**Features:**
- **Category Selection**: Dropdown with point values displayed
- **Bonus Points**: Senders can gift extra points from their balance
- **Badge Award**: Attach a badge to recognition (optional)
- **Visibility Control**: Public, Team Only, or Private
- **Points Summary**: Real-time calculation of total award

**Form Flow:**
1. Select recipient (email)
2. Choose category (auto-shows points)
3. Write personalized message
4. (Optional) Add bonus points from your balance
5. (Optional) Award a badge
6. Set visibility
7. Submit → Points awarded to recipient

**Example Recognition:**
```json
{
  "recipient_email": "jane@company.com",
  "category": "leadership",
  "message": "Jane led the Q4 project brilliantly!",
  "base_points": 25,
  "bonus_points": 25,
  "total_awarded": 50,
  "badge_awarded": "Team MVP",
  "visibility": "public"
}
```

---

### 3. Top Recognizer Leaderboard
**Component:** `components/recognition/TopRecognizerLeaderboard.jsx`  
**Function:** `functions/awardRecognitionBonus.js`  
**Automation:** Weekly (Mondays at 9am)

**Leaderboard:**
- Top 10 recognizers by count (last 30 days)
- Shows total recognitions given
- Shows total points distributed
- Podium display for top 3
- Highlights current user's position

**Consistent Recognition Bonus:**
- **5-9 recognitions/week**: +50 bonus points
- **10+ recognitions/week**: +150 bonus points
- Awarded every Monday at 9am
- Notification sent to recipients

**Gamification:**
```javascript
Weekly Recognition Challenge:
- Give 5+ recognitions: 50-point bonus
- Give 10+ recognitions: 150-point bonus
- Bonus stacks with category points
```

---

### 4. Peer-to-Peer Recognition Feed
**Component:** `components/social/RecognitionFeed.jsx`  
**Page:** `pages/RecognitionFeed.js`

**Feed Features:**
- **Real-time Updates**: Live subscription to new recognitions
- **Category Filter**: Filter by recognition type
- **Sorting**: Recent or Most Popular (by reactions)
- **Reactions**: Heart reactions (❤️)
- **Comments**: Discussion on recognitions
- **Multi-type Feed**: Recognitions + Badge Awards + Tier Changes

**Feed Items:**
1. **Recognition Cards**
   - Sender → Recipient
   - Category badge
   - Point value
   - Heart reactions
   - Comment count
   - Company values tags

2. **Badge Award Cards**
   - Badge icon and name
   - Recipient highlight
   - Timestamp

3. **Tier Change Cards**
   - Tier emoji (🥉🥈🥇💎)
   - User advancement notification

**Visibility Rules:**
- **Public**: All authenticated users
- **Team Only**: Users in same team
- **Private**: Only sender and recipient

---

## 📅 Enhanced Event Management

### 5. RSVP System
**Component:** `components/events/RSVPButton.jsx`  
**Function:** `functions/sendCalendarInvite.js`

**RSVP Options:**
- ✅ **Going**: Confirmed attendance + calendar invite sent
- ⏰ **Maybe**: Tentative
- ❌ **Not Going**: Declined

**Calendar Invite:**
- iCalendar (.ics) format
- Sent via email
- 15-minute reminder alarm
- Includes meeting link for virtual events
- Auto-triggered on "Going" RSVP

**Event Card Integration:**
```jsx
<RSVPButton 
  event={event}
  userEmail={user.email}
  userName={user.full_name}
  participation={participation}
/>
```

---

### 6. Event Participation → Gamification
**Automation:** Entity trigger on Participation updates  
**Function:** `functions/awardPoints.js`

**Points Awarded:**
- **RSVP (Going)**: +5 points
- **Attended**: +15 points (base)
- **Facilitated**: +30 points (if facilitator)
- **Feedback Submitted**: +10 points (bonus)

**Tracking:**
- All participations tracked in UserProfile → engagement_metrics
- Attendance streaks calculated
- Event type analytics (icebreaker, wellness, social, etc.)

---

## 🔄 Automated Systems

### Weekly Recognition Bonus
**Automation:** Every Monday at 9am  
**Function:** `awardRecognitionBonus`

**Process:**
1. Count recognitions per sender (last 7 days)
2. Apply bonus tiers:
   - 5-9 recognitions: +50 points
   - 10+ recognitions: +150 points
3. Update UserPoints
4. Send notification
5. Log bonus awards

---

### Category Usage Analytics
**Tracking:**
- Each category tracks `usage_count`
- Auto-incremented on recognition create
- Used for trending category insights
- Helps admins optimize categories

---

## 📊 Integration Points

### In Recognition Feed Page:
```jsx
<RecognitionFeed />
  → Tabs: Feed | Top Recognizers
  → Filter by category
  → Sort by recent/popular
  → Real-time updates
```

### In Dashboard:
```jsx
<UserProgressReportCard userEmail={user.email} />
  → Shows recognition stats
  → Export to PDF/CSV
```

### In Event Cards:
```jsx
<EventCalendarCard 
  event={event}
  participation={participation}
  userEmail={user.email}
  userName={user.full_name}
/>
  → RSVP dropdown
  → Auto-sends calendar invite
```

---

## 🎯 User Flows

### Give Recognition:
1. Click "Give Recognition" in feed
2. Select recipient email
3. Choose category (see point value)
4. Write message
5. (Optional) Add bonus points
6. (Optional) Attach badge
7. Submit → Recipient gets points + notification

### RSVP to Event:
1. Browse events in Calendar
2. Click RSVP dropdown on event card
3. Select Going/Maybe/Not Going
4. If Going → Calendar invite sent to email
5. Participation tracked for gamification points

### Top Recognizer Journey:
1. Give 5+ recognitions in a week
2. Monday at 9am: Bonus points awarded
3. Notification: "Recognition Bonus Earned! +50 pts"
4. Appear on Top Recognizer Leaderboard
5. Motivation to continue recognizing others

---

## 🔐 Security & Permissions

**Recognition Entity:**
- **Read**: Public/approved visible to all, private only to sender/recipient
- **Write**: Any authenticated user
- **Update**: Admin or sender (if pending)
- **Delete**: Admin or sender

**RecognitionCategory:**
- **Read**: All users
- **Write**: Admin only

**Participation:**
- **Read**: User or admin
- **Write**: User can RSVP to events
- **Update**: User or admin (status changes)

---

## 📱 Mobile Optimization

- RSVP button: Touch-friendly dropdown (44px tap target)
- Recognition form: Mobile-responsive, collapsible sections
- Feed: Infinite scroll, pull-to-refresh
- Leaderboard: Horizontal scroll on mobile

---

**Last Updated:** February 6, 2026  
**Total Categories:** 8  
**Automation:** Weekly bonus awards (Mondays 9am)