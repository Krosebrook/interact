# Quick Start Guide - AI Features

## For Administrators

### 1. Setup Gamification Automation (5 minutes)

**Step 1**: Go to **Gamification Settings → Rules Admin**

**Step 2**: Create your first rule
- Click "Create Rule"
- Example: "Event Attendance Reward"
  - Rule Type: `event_attendance`
  - Points Reward: 25
  - Limit: `unlimited`
  - Active: ✓

**Step 3**: Test it
- Attend an event or mark attendance
- You should see: "🎉 +25 points earned!"

### 2. More Useful Rules to Create
```
Rule: First Event Attendance
- Type: first_time_action
- Points: 50
- Limit: once

Rule: Survey Completion
- Type: survey_completed
- Points: 15
- Limit: unlimited

Rule: Weekly Streak
- Type: streak_milestone
- Points: 100
- Trigger Conditions: { threshold: 7, comparison: "equals" }
- Limit: weekly

Rule: Recognition Champion
- Type: recognition_given
- Points: 10
- Limit: unlimited
```

---

## For Team Leaders

### 1. Access Your Dashboard
- Navigate to **Team Leader Dashboard** (appears in sidebar)
- You'll see: Team stats, AI Assistant, Coaching Module

### 2. Get Team Insights (AI Coach)
**Action**: Click "Generate Insights" in AI Coach widget

**You'll Get**:
- Team health score (1-10)
- At-risk members with coaching strategies
- High performers with leverage ideas
- Skill gaps with learning recommendations

**Use Case**: Weekly check-in to identify who needs support

### 3. Create Team Challenges
**Go to**: Challenges tab

**Click**: "Create Challenge"

**Example**:
- Title: "December Engagement Sprint"
- Type: Points Race
- Duration: 2 weeks
- Prize: Team lunch

**Or use AI**: 
- Go to AI Assistant → Challenges tab
- Click "Generate Challenge Ideas"
- Copy one you like

### 4. Approve Team Recognitions
**Go to**: Approvals tab

**For each pending recognition**:
- Click "Review & Decide"
- Optional: Click "AI Draft" for suggested response
- Approve or Reject

---

## For New Employees

### Your First Day

**You'll auto-land on**: New Employee Onboarding page

**What you'll see**:
1. **Plan Tab**: Your personalized 30-day roadmap
2. **Team Tab**: Key people to meet
3. **Tasks Tab**: First week checklist
4. **Learn Tab**: Recommended resources
5. **AI Chatbot**: Ask anything, anytime

### Using the Chatbot
**Example Questions**:
- "How do I join a team?"
- "What's the recognition system?"
- "Where can I find upcoming events?"
- "Who should I talk to about IT setup?"

**Pro Tip**: The AI knows about:
- Platform features
- Company structure
- Your role/department
- Available resources

### Completing Your Onboarding
- Check off tasks as you complete them
- Progress bar shows completion %
- Once done, you'll be redirected to main Dashboard

---

## For Facilitators

### Triggering Gamification in Your Events

**When you**:
- Mark attendance for participants
- Collect event feedback
- Complete an event

**Gamification auto-triggers**:
- Points for attendees
- Bonus for feedback submission
- Streak tracking updates

**No action needed** - it's all automatic!

---

## Common Workflows

### Weekly Team Leader Routine
1. Monday: Generate coaching insights
2. Review at-risk members, reach out
3. Approve pending recognitions
4. Wednesday: Check challenge progress
5. Friday: Recognize high performers

### Monthly Admin Routine
1. Review gamification rules performance
2. Adjust point values if needed
3. Create new badges for achievements
4. Analyze overall engagement trends
5. Update team structures

### New Employee First Week
1. Complete profile (triggers points!)
2. Join a team (more points!)
3. Attend first event (even more points!)
4. Give your first recognition
5. Complete first survey

---

## Troubleshooting

### "I'm not seeing points for my actions"
- Check if rule exists and is active
- Verify you haven't hit daily/weekly limit
- Some rules have thresholds (e.g., attend 5 events)

### "AI Assistant isn't responding"
- Check internet connection
- Wait 10 seconds (AI can be slow)
- Try refreshing the page
- Contact admin if persists

### "I can't access Team Leader Dashboard"
- Verify you're assigned as team leader
- Check your role (should be facilitator or admin)
- Contact admin to assign you as leader

---

## Getting Help

### Resources
- **Documentation**: All docs in Dashboard → Documentation
- **API Reference**: For developers in docs folder
- **Project Plan**: Roadmap and features

### Support
- **Platform Issues**: Contact Base44 support
- **Feature Requests**: Discuss with admin
- **Onboarding Questions**: Use the AI chatbot!

---

Quick Start Guide v1.0
Last Updated: 2025-12-21