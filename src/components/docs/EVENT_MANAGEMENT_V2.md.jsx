# Event Management System 2.0
**Version:** 2.0  
**Last Updated:** February 6, 2026

---

## 📅 Enhanced Event Features

### 1. Post-Event Feedback Collection
**Entity:** `PostEventFeedback`  
**Component:** `components/events/PostEventFeedbackDialog.jsx`

**Feedback Fields:**
- Overall rating (1-5 stars)
- Engagement level (low/medium/high)
- Would recommend (yes/no)
- Favorite aspect (text)
- Improvement suggestions (text)
- Facilitator rating (1-5 stars)

**Gamification:**
- +10 points for submitting feedback
- Helps improve future events
- Anonymous aggregation for insights

**Trigger:**
- Shown to attendees 1 hour after event ends
- Accessible from past events list
- One-time submission per event

---

### 2. User-Proposed Events
**Entity:** `EventProposal`  
**Component:** `components/events/ProposeEventDialog.jsx`

**Proposal Flow:**
1. **User Submits**: Title, description, type, suggested date/time, virtual/in-person
2. **AI Assists**: Generate description with one click
3. **Community Upvotes**: Colleagues upvote proposals they like
4. **Admin Reviews**: Approve, reject, or request changes
5. **Schedule**: Approved proposals become events

**Proposal Card:**
- Upvote count (democratic prioritization)
- Activity type badge
- Virtual/In-person indicator
- Admin review actions
- Feedback notes from admin

**Status Flow:**
```
Pending → (Admin Review) → Approved/Rejected
         ↓
    Upvotes from team
```

---

### 3. AI Optimal Scheduling
**Function:** `functions/suggestOptimalEventTime.js`  
**Component:** `components/events/AISchedulingSuggestions.jsx`

**Analysis Inputs:**
- Historical event attendance data
- Day of week participation rates
- Time of day engagement patterns
- Activity type performance
- Team-specific trends (optional)

**AI Recommendations:**
1. **Primary Slot**: Best day + time with expected attendance %
2. **Alternative Slots**: 2-3 backup options
3. **Avoid Times**: When NOT to schedule
4. **General Insights**: Patterns discovered

**Example Output:**
```json
{
  "primary_recommendation": {
    "day_name": "Tuesday",
    "hour": 14,
    "time_slot": "2:00 PM",
    "expected_attendance_rate": 78,
    "reasoning": "Tuesday afternoons have 78% avg attendance for wellness events, avoiding Monday rush and Friday dropoff"
  },
  "alternative_slots": [...],
  "general_insights": [
    "Wellness events perform 25% better on Tue/Thu vs Mon/Fri",
    "Lunchtime (12-1pm) has lowest attendance (42%)",
    "Late afternoon (4-5pm) highest for social events (82%)"
  ]
}
```

**Integration:**
- Available in ScheduleEventDialog
- One-click apply suggested time
- Considers activity type + duration
- Updates based on latest participation data

---

### 4. Recurring Event Series Management
**Component:** `components/events/EventSeriesCreator.jsx`  
**Entity:** `EventSeries` (existing)

**Features:**
- Create series of related events
- Define recurrence pattern (daily/weekly/monthly)
- Edit entire series or single occurrence
- Cancel series with cascade

**Series Editing:**
- Modify future occurrences only
- Update series template
- Exception handling for holidays

---

### 5. RSVP & Calendar Invites
**Component:** `components/events/RSVPButton.jsx`  
**Function:** `functions/sendCalendarInvite.js`

**RSVP Flow:**
1. User clicks RSVP dropdown
2. Selects Going/Maybe/Not Going
3. Status saved to Participation entity
4. If "Going" → Calendar invite (.ics) sent via email
5. 15-minute reminder alarm included
6. Meeting link embedded (if virtual)

**Calendar Invite Format:**
```
VCALENDAR 2.0
- Event title, description
- Start/end time
- Location or meeting link
- Alarm: 15 minutes before
- Organizer: Event creator
```

---

## 🏆 Dynamic Badge System

### Achievement Badges
**Function:** `functions/awardDynamicBadges.js`  
**Automation:** Daily at 3am

**Badges:**
1. **Top Recognizer** 🏆
   - Criteria: 20+ recognitions given
   - Rarity: Rare
   - Auto-awarded daily

2. **Event Enthusiast** 🎉
   - Criteria: 30+ events attended
   - Rarity: Rare
   - Auto-awarded daily

3. **Wellness Champion** 💪
   - Criteria: 10+ wellness goals completed
   - Rarity: Epic
   - Auto-awarded daily

**Badge Awarding:**
- Runs daily check for all users
- Awards badges automatically when criteria met
- Sends notification to recipient
- Appears in recognition feed
- Cannot be lost once earned

---

## 🎖️ Tier System Expansion

**Tier Levels:**
| Tier | Points | Badges | Rewards |
|------|--------|--------|---------|
| 🥉 Bronze | 0 | 0 | Basic access, weekly challenges |
| 🥈 Silver | 500 | 3 | Priority registration, custom avatars, +5 recognition pts |
| 🥇 Gold | 2000 | 8 | VIP access, premium store, 2x recognition pts, team creation |
| 💎 Platinum | 5000 | 15 | Exclusive events, custom badges, 3x recognition pts, executive recognition |

**Tier Advancement:**
- Automatic based on points AND badges
- Notification sent on tier-up
- Unlocks new perks immediately
- Visible in user profile and feed

**Component:** `components/gamification/TierRewardsDisplay.jsx`

**Displays:**
- Current tier with perks
- Progress to next tier (points + badges)
- All tiers overview with unlock status
- Visual progress bars

---

## 📊 Event Participation → Gamification

**Automated Point Awards:**
| Action | Points | Trigger |
|--------|--------|---------|
| RSVP (Going) | +5 | Participation create |
| Event Attended | +15 | Status → attended |
| Facilitated Event | +30 | Event organizer |
| Feedback Submitted | +10 | PostEventFeedback create |

**Tracking:**
- All participations in UserProfile → engagement_metrics
- Attendance streaks calculated
- Event type analytics
- Contribution to tier advancement

---

## 🔄 Integration Points

### In Calendar Page:
```jsx
<Tabs>
  <TabsContent value="calendar">
    <EventsList onProvideFeedback={setFeedbackEvent} />
  </TabsContent>
  <TabsContent value="proposals">
    <EventProposalsList />
  </TabsContent>
</Tabs>

<PostEventFeedbackDialog event={feedbackEvent} />
<ProposeEventDialog user={user} />
```

### In ScheduleEventDialog:
```jsx
<AISchedulingSuggestions
  activityType={activityType}
  duration={duration}
  onSelectTime={applyTime}
/>
```

### In GamificationDashboard:
```jsx
<TierRewardsDisplay
  currentPoints={points}
  currentBadges={badgeCount}
  currentTier={tier}
/>
```

---

## 🎯 User Flows

### Propose Event Flow:
1. Click "Propose Event" in Calendar
2. Fill in details (AI assist for description)
3. Submit proposal
4. Colleagues upvote if interested
5. Admin reviews (approve/reject/feedback)
6. If approved → Admin schedules from Calendar

### Post-Event Feedback Flow:
1. Event ends
2. Attendee sees feedback prompt in past events
3. Submit ratings and comments
4. Earn +10 points
5. Admin sees aggregated insights

### Tier Advancement Flow:
1. User earns points and badges
2. Daily automation checks criteria
3. Tier updated if threshold reached
4. Notification sent
5. New perks unlocked immediately
6. Feed announcement shows tier change

---

**Last Updated:** February 6, 2026  
**New Entities:** EventProposal, PostEventFeedback, RecognitionCategory  
**Automations:** Daily badge awards (3am), Weekly recognition bonus (Mon 9am)