# Gamification Admin Guide

**For:** HR, People Ops, Admin Users  
**Updated:** January 14, 2026

---

## Overview

The INTeract gamification system rewards employee engagement through:
- **Points** for actions (recognition, event attendance, challenges)
- **Tiers** (Bronze → Silver → Gold → Platinum) based on cumulative points
- **Badges** for milestones and achievements
- **Leaderboards** (Weekly, Monthly, Quarterly)
- **Rewards Store** for redemption

---

## Points Configuration

### Default Point Awards

| Action | Points | Notes |
|--------|--------|-------|
| Give recognition | 10 | Per post |
| Receive recognition | 5 | When someone recognizes you |
| Attend event | 10 | Per event |
| Lead event | 25 | Facilitator bonus |
| Complete survey | 5 | Per response |
| Join challenge | 5 | When enrolling |
| Win challenge | 50 | First place |
| Participate in survey | 3 | Optional engagement |

### Seasonal Multipliers

During themed seasons, points are multiplied:
- **Summer Surge** (Jun-Aug): 1.5x multiplier
- **Fall Focus** (Sep-Oct): 1.2x multiplier
- **Giving Season** (Nov-Dec): 1.5x multiplier
- **New Year** (Jan): 1.2x multiplier

**To enable:** Gamification Settings > Seasonal Events

### Custom Rules

Create custom rules in **Gamification Admin > Rules**:

```
Name: "Friday Social Bonus"
Condition: Event type = "social" AND day_of_week = Friday
Points: +5 (bonus)
Enabled: Yes
Applies to: All users
```

---

## Tier System

### Current Tiers

| Tier | Points | Benefits | Color |
|------|--------|----------|-------|
| Bronze | 0-999 | Leaderboard access | 🟫 |
| Silver | 1,000-2,999 | Double points weekends | 🔶 |
| Gold | 3,000-4,999 | Priority event booking, Exclusive challenges | 🟨 |
| Platinum | 5,000+ | Custom badge, VIP recognition, Tier perks | 💜 |

### Tier Benefits

Edit benefits in **Settings > Gamification > Tier Benefits**:

**Silver:**
- Double points on weekend events
- Exclusive "Weekday Warrior" challenge

**Gold:**
- Early access to new challenges
- 2x multiplier on team events
- Featured profile badge

**Platinum:**
- Custom avatar border (5 color options)
- 1x per month: Award 25 bonus points to teammate
- Featured recognition feed
- Monthly VIP shoutout

### Managing Tier Demotion

Users maintain tier status unless **Decay Mode** is enabled:

**Decay Mode Settings:**
- None (Default): Tier never decreases
- Monthly: Tier drops if points fall below threshold
- Quarterly: Same, but checked quarterly

**Recommendation:** Keep decay disabled unless specifically needed for your culture.

---

## Badges & Achievements

### Built-in Badges

| Badge | Unlock Condition | Points | Icon |
|-------|-----------------|--------|------|
| First Step | Attend 1 event | 10 | 👣 |
| Team Player | Attend 10 events | 100 | 👥 |
| Recognizer | Give 50 recognitions | 150 | 🎖️ |
| Shout Out Champion | Receive 20 recognitions | 200 | 📣 |
| Event Host | Lead 5 events | 250 | 🎤 |
| Wellness Advocate | Attend 5 wellness events | 100 | 💪 |
| Learning Lover | Complete 3 learning modules | 150 | 📚 |
| Social Butterfly | Participate in 10 social events | 120 | 🦋 |

### Create Custom Badges

**Settings > Gamification > Custom Badges**

```
Badge Name: "Q4 Challenge Winner"
Description: "Won the Q4 holiday challenge"
Icon: Custom upload
Points Awarded: 300
Condition: challenge_id = "q4_holiday" AND rank = 1
Display: Public leaderboard
Date Range: Oct 1 - Dec 31, 2025
```

### Badge Management

- **View who earned:** Click badge name
- **Revoke badge:** Actions > Remove from user
- **Announcement:** Auto-announce to Slack/Teams when earned
- **Showcase:** Featured badges appear on user profiles

---

## Leaderboards

### Snapshot Types

**Weekly** (Updates every Monday 9am)
- Last 7 days activity
- Best for engagement tracking
- Resets each week

**Monthly** (Updates 1st of month)
- Last 30 days activity
- Good for trend analysis
- Shows sustained engagement

**Quarterly** (Updates Jan 1, Apr 1, Jul 1, Oct 1)
- Cumulative per quarter
- For major celebrations
- Highest competition

### Customize Leaderboard

**Settings > Leaderboards**

**Options:**
- [ ] Show point breakdown (give/receive/attend/etc)
- [ ] Hide names, show only ranks (privacy mode)
- [ ] Exclude admins from rankings
- [ ] Display percentile instead of absolute rank
- [ ] Show "coming soon" threshold for next tier

**Example: Privacy Mode**
```
Rank | Points | User Tier
  1  |  850   | Silver
  2  |  720   | Silver
  3  |  650   | Bronze
```

### Team-Specific Leaderboards

Create team leaderboards in **Settings > Teams > [Team Name] > Leaderboard**:

```
Team: "Engineering"
Points Multiplier: 1.5x (team events)
Visibility: Team only
Period: Weekly
Show Comparison: vs Company leaderboard
```

---

## Rewards Store

### Create Rewards

**Gamification > Rewards Store > Add Reward**

```
Item Name: "Extra Vacation Day"
Category: Time Off
Points Cost: 1,000
Quantity: Unlimited
Max Per User: 1 per year
Requires Approval: Yes
Instructions: Submit to HR, manager approves
```

**Categories:**
- Time Off (vacation, WFH day)
- Swag (company merch)
- Experience (dinner, gift card)
- Donation (give to charity)
- Perks (parking, office setup)

### Approval Workflow

1. User redeems reward (points deducted immediately)
2. Request enters **Redemption Admin** queue
3. HR/Manager approves or denies
4. User notified via email + in-app
5. Admin notes: "Approved - vacation starting Jan 20"

**Track status:** Gamification > Redemption Admin

---

## Challenges

### Create Challenge

**Activities > Create Challenge**

```
Name: "Recognition Sprint"
Description: "Give 10 recognitions this week"
Type: Personal
Difficulty: Easy
Duration: 1 week (Jan 13-20)
Reward: 100 points + "Recognition Master" badge
Participants: All
```

**Challenge Types:**
- **Personal:** Individual goal
- **Team:** Team competes together
- **Department:** Dept vs Dept competition
- **Company-wide:** Everyone ranked together

### Seasonal Challenges

Suggested seasonal themes:

**Q1 (Jan-Mar):** "New Year, New Goals"
**Q2 (Apr-Jun):** "Summer Surge"
**Q3 (Jul-Sep):** "Back to School Learning"
**Q4 (Oct-Dec):** "Giving & Gratitude"

---

## Analytics & Reporting

### Key Metrics Dashboard

**Gamification > Analytics**

- Total active users in system
- Average points per user per month
- Top earners (trending)
- Badge distribution (which badges most earned)
- Leaderboard diversity (not just same 5 winners)
- Engagement trend (↑ ↓ or flat)

### Run Reports

**Reports > Gamification Reports**

```
Report: "Q4 Engagement Summary"
Period: Oct 1 - Dec 31, 2025
Include:
  ☑ Total points awarded
  ☑ User participation rate
  ☑ Badge unlocks
  ☑ Tier distribution
  ☑ Top 20 users
  ☑ Comparison to Q3
Format: CSV for Excel
```

---

## Common Tasks

### Task: Reset Leaderboard for New Quarter

1. Go to **Gamification > Leaderboards**
2. Click "Quarterly" 
3. Select current quarter
4. **Actions > Create Snapshot**
5. Leaderboard resets with new baseline

### Task: Award Bonus Points (Manual)

1. **Gamification Admin > Manual Awards**
2. Select user(s) or upload CSV
3. Enter points: `+100`
4. Reason: "Q4 Excellence"
5. Message to user: ☑ (sends email)
6. Submit

### Task: Disable Gamification for One User

1. **Users > [User Name]**
2. **Gamification Settings**
3. [ ] Disable gamification
4. Reason: (optional)
5. Save

### Task: Export Leaderboard Data

1. **Analytics > Export**
2. Select leaderboard type
3. Period: Choose date range
4. Include: Points, rank, tier, badges earned
5. Format: CSV/Excel
6. Download or email

---

## Best Practices

### ✅ DO

- **Start small:** Launch with 3-5 actions before expanding
- **Celebrate wins:** Announce badges and tier promotions in Slack
- **Vary point values:** Don't make everything 10 points
- **Test edge cases:** Try double-click redemption, session timeouts
- **Monitor engagement:** Check analytics weekly, adjust rules if needed
- **Be inclusive:** Ensure all roles have point-earning opportunities
- **Communicate changes:** Announce new challenges/badges 1 week prior

### ❌ DON'T

- Inflate points (1,000 points for coffee) - confuses users
- Create unlimited tier levels (stick to 4)
- Forget decay or soft reset - leaderboards go stale
- Award points for things outside company values
- Ignore equity - don't favor certain teams/roles
- Change rules mid-competition
- Make redemption too restrictive (users won't engage)

---

## Troubleshooting

**Q: User reports they earned points but leaderboard didn't update**
A: Leaderboards cache for 5 minutes. Wait 5-10 minutes, then hard refresh browser (Ctrl+Shift+R).

**Q: Badge won't unlock despite meeting condition**
A: Check badge settings > condition logic. Run test: Analytics > Test Badge Unlock.

**Q: Redemption request stuck in "pending"**
A: Admin hasn't acted. Go to Redemption Admin queue, approve or deny.

**Q: Points awarded twice for one action**
A: This shouldn't happen (we prevent double-charging). Contact support if occurs.

**Q: Need to increase points for all past recognition**
A: Use Backfill tool. **Admin > Backfill Points** (requires careful review).

---

## Support & Questions

- **Technical issues:** #support-channel in Slack
- **Feature requests:** Create in admin dashboard
- **Security concerns:** Email security@intinc.com

---

**Last Updated:** January 14, 2026  
**Version:** 1.0  
**Owner:** People Operations Team