# Onboarding System Documentation

## Overview
The onboarding system guides new users through key platform features using a milestone-based approach. Users complete tasks to earn points, badges, and unlock platform features. Progress is visually tracked and gamified.

## Milestones

### Core Onboarding Milestones

| Milestone | Points | Order | Description |
|-----------|--------|-------|-------------|
| **Profile Complete** | 50 | 1 | Add photo, bio, and skills |
| **Profile Picture** | 30 | 2 | Upload professional photo |
| **Write Bio** | 30 | 3 | Tell team about yourself |
| **First Recognition** | 75 | 4 | Give recognition to teammate |
| **First Event** | 60 | 5 | Attend company event |
| **First Challenge** | 100 | 6 | Complete gamification challenge |
| **Join a Team** | 40 | 7 | Become team/department member |
| **Profile Customization** | 45 | 8 | Apply badges, profile flair |
| **Earn 100 Points** | 25 | 9 | Accumulate points (passive) |

**Total Possible Points:** 455 + 250 (completion bonus) = 705 points

### Introductory Badges

Each milestone completion awards a thematic badge:

```
✓ Profile Complete Master → Profile Badge
✓ Picture Upload Expert → Camera Badge
✓ Bio Writer Pro → Pen Badge
✓ Recognition Champion → Heart Badge
✓ Event Attendee → Calendar Badge
✓ Challenge Master → Trophy Badge
✓ Team Player → People Badge
✓ Customization Artist → Palette Badge
```

**Completion Badge:** "Onboarding Complete" (special badge when all milestones done)

## User Experience

### Onboarding Hub Page
**Location:** `pages/OnboardingHub.js`

**Features:**
- Progress bar (0-100%)
- Milestone cards with status (pending/completed)
- Milestone count (e.g., "4 of 9 completed")
- Direct links to complete each task
- Celebration view when all milestones done

**Visual Design:**
- Completed milestones: checkmark, green background
- Pending milestones: circle outline, inactive
- Points displayed for each milestone
- Badge earned indicator
- Estimated completion time: 2-3 weeks

### Milestone Card Components

```
[Status Icon]  Milestone Title (e.g., ✏️ Complete Your Profile)
               Description of what's needed
               Points Badge: +50
               [Action Button] - e.g., "Go to Profile"
               
Optional:
[Badge Earned] 🏆 if already completed
[Approval Note] ⚠️ if requires verification
```

### Verification & Auto-Completion

**Auto-Verified Milestones:**
- Profile picture uploaded (checks UserProfile.avatar_url)
- Bio written (checks UserProfile.bio length)
- Team joined (checks Team membership)

**Manual Marking:**
- First recognition (user clicks "Mark Complete")
- First event attendance (auto-marked by system)
- First challenge (auto-marked by system)
- Profile customization (checks display_flair)

## Database Schema

### OnboardingMilestone Entity
```
{
  "user_email": "required",
  "milestone_type": "required - enum",
  "completed": boolean,
  "completed_date": date-time,
  "points_earned": number,
  "badge_earned": string (badge_id),
  "order": number
}
```

**Milestone Types:**
```
- profile_complete
- first_recognition
- first_event
- first_challenge
- first_points
- profile_picture
- bio_added
- team_joined
- customization_complete
```

### Creation
Milestones auto-created on first login:
- Backend function checks if user has OnboardingMilestones
- If not, creates default set
- User sees populated hub immediately

## Backend Functions

### completeMilestone
**File:** `functions/completeMilestone.js`

```javascript
POST /api/functions/completeMilestone
{
  "user_email": "user@company.com",
  "milestone_type": "profile_complete"
}

Response:
{
  "success": true,
  "points_awarded": 50,
  "milestone_completed": true,
  "onboarding_complete": false
}
```

**What It Does:**
1. Verifies user permission (own milestone or admin)
2. Marks milestone completed with timestamp
3. Awards points to UserPoints entity
4. Creates BadgeAward for earned badge
5. Checks if all milestones completed
6. Awards 250 bonus points + special badge if complete

## Integration Points

### Auto-Triggers

**First Recognition Completed:**
- When Recognition created with sender_email = user
- Auto-marks "first_recognition" milestone
- Awards 75 points

**First Event Attended:**
- When Participation.attendance_status = "attended"
- Auto-marks "first_event" milestone
- Awards 60 points

**First Challenge Completed:**
- When PersonalChallenge.status = "completed"
- Auto-marks "first_challenge" milestone
- Awards 100 points

**Points Threshold:**
- Triggered by backend when UserPoints.total_points >= 100
- Auto-marks "first_points" milestone
- Awards 25 points

**Profile Picture/Bio:**
- Optional: manual verification via UI button
- Or auto-verify in completeMilestone function

### Points & Gamification
- All milestone points added to UserPoints.total_points
- Points appear immediately in store, leaderboards
- Counts toward tier progression
- Eligible for redemption same day

## Admin Interface

### Viewing User Progress
**Location:** Likely in OnboardingDashboard admin page

**Capabilities:**
- Filter users by: onboarding status (0-100%)
- See who's stuck at certain milestones
- Manually mark milestones as complete
- Reset onboarding (for testing)
- Send reminders to inactive users

### Analytics
- Avg completion time
- Most/least completed milestones
- Drop-off points
- Correlation with engagement metrics

## Configuration

### Customizing Milestones
Edit `functions/completeMilestone.js` pointsMap:

```javascript
const pointsMap = {
  profile_complete: 50,      // change here
  first_recognition: 75,
  // ... etc
};
```

### Changing Milestone Order
Edit `pages/OnboardingHub.js` orderedMilestones sort.

### Adding New Milestones
1. Add type to OnboardingMilestone enum
2. Add to pointsMap in completeMilestone function
3. Add MilestoneInfo to OnboardingHub component
4. Update creation logic to include new type

## Best Practices

1. **Keep Milestones Simple**
   - Each should take 5-10 minutes
   - Don't gate core features behind onboarding
   - Make tasks achievable within first week

2. **Points Should Feel Rewarding**
   - 50-100 points per milestone reasonable
   - Total ~400-500 before bonus
   - Bonus for completing entire sequence (250 pts)

3. **Badge Strategy**
   - Use visual icons in card titles
   - Make badges displayable on profiles
   - Feature "newbies" with special flair

4. **Timing**
   - Show hub on first login
   - Don't force completion, make it optional
   - Send weekly progress reminders (if low engagement)

5. **Mobile Optimization**
   - Large tap targets
   - Short descriptions
   - Vertical scrolling (no horizontal)

## Troubleshooting

### Milestones Not Created
- Check DB for OnboardingMilestone records
- Verify fetchMilestones function runs on hub load
- Check browser console for errors

### Points Not Awarded
- Verify UserPoints record exists
- Check completeMilestone function logs
- Confirm milestone_type matches enum

### Badges Not Appearing
- Verify Badge entity has matching names
- Check BadgeAward creation in completeMilestone
- Ensure UserProfile.display_flair updates

## Future Enhancements
- [ ] Mobile-only onboarding flow
- [ ] Video tutorials for each milestone
- [ ] Peer mentors assigned to new users
- [ ] Buddy system integration
- [ ] Role-specific onboarding paths
- [ ] Conditional milestones (facilitator vs participant)
- [ ] Time-based reminders
- [ ] Celebration animations on completion