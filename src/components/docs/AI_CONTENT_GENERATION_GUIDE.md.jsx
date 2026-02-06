# AI Content Generation Guide
**Version:** 1.0  
**Last Updated:** February 6, 2026

---

## 🎨 AI Content Generation Features

### 1. Event Descriptions
**Function:** `functions/generateEventDescription.js`  
**Integration Point:** Schedule Event Dialog

**Capabilities:**
- Generates engaging 2-3 sentence descriptions
- Tailored to event type and activity
- Includes benefits and call-to-action
- Professional yet friendly tone
- Optimized for remote employees

**Usage:**
```javascript
const response = await base44.functions.invoke('generateEventDescription', {
  title: "Virtual Trivia Night",
  keywords: "quiz, team bonding, fun",
  activityType: "social",
  duration: 60
});

// Returns:
{
  description: "Join us for an exciting virtual trivia night...",
  benefits: ["Team bonding", "Mental break", "Fun competition"],
  suggested_tags: ["social", "remote-friendly", "casual"]
}
```

**UI Integration:**
- "AI Generate" button next to description field
- One-click to populate event details
- Shows loading state while generating

---

### 2. Recognition Message Suggestions
**Function:** `functions/generateRecognitionSuggestions.js`  
**Integration Point:** Recognition Form

**Capabilities:**
- Analyzes recipient profile (role, department)
- Considers company values being recognized
- Generates 3 different message options
- Varies tone (professional, warm, enthusiastic)
- Suggests appropriate point values

**Usage:**
```javascript
const response = await base44.functions.invoke('generateRecognitionSuggestions', {
  recipientEmail: "john@company.com",
  context: "Led project to successful completion",
  valueType: "Leadership"
});

// Returns:
{
  suggestions: [
    {
      message: "John's leadership on the Q4 project...",
      tone: "professional",
      suggested_points: 25
    },
    {
      message: "What an inspiring leader! John...",
      tone: "enthusiastic",
      suggested_points: 20
    }
  ]
}
```

**UI Integration:**
- "AI Suggestions" button in recognition form
- Displays 3 clickable suggestions
- Refresh button to generate new options
- Tracks if message is AI-assisted

---

### 3. Wellness Challenge Ideas
**Function:** `functions/generateWellnessChallengeIdeas.js`  
**Integration Point:** Wellness Admin Page

**Capabilities:**
- Generates 3 unique challenge ideas
- Avoids duplicating existing challenges
- Includes promotional copy
- Recommends goal values and points
- Specifies benefits for employees

**Usage:**
```javascript
const response = await base44.functions.invoke('generateWellnessChallengeIdeas', {
  theme: "steps",
  duration: "30 days",
  teamBased: false
});

// Returns:
{
  challenges: [
    {
      title: "10K Steps Daily Challenge",
      description: "Walk 10,000 steps every day...",
      challenge_type: "steps",
      goal_value: 10000,
      goal_unit: "steps",
      promotional_copy: "Join the movement! Get healthier...",
      points_reward: 100,
      benefits: ["Improved health", "Team bonding", "Fun competition"]
    }
  ]
}
```

**UI Integration:**
- "AI Ideas" button in create challenge dialog
- Shows 3 AI-generated cards
- Click to apply idea to form
- Displays promotional copy preview

---

## 🎯 Best Practices

### Content Quality
- All AI content reviewed by platform for appropriateness
- Maintains professional workplace standards
- Inclusive language for diverse teams
- Remote-employee friendly

### User Experience
- Non-blocking: Users can still type manually
- Clear indication when AI is used
- Refresh option to get new suggestions
- Easy to dismiss/ignore AI suggestions

### Performance
- Cached for 5 minutes (event descriptions)
- Lightweight prompts for fast generation
- Fallback to manual entry if AI fails
- No impact on core functionality

---

## 📊 Analytics Tracking

Track AI content generation usage:
```javascript
base44.analytics.track({
  eventName: "ai_content_generated",
  properties: {
    content_type: "event_description",
    success: true,
    user_accepted: true
  }
});
```

---

**Admin Only Functions:** 
- `generateWellnessChallengeIdeas` (requires admin role)

**All User Functions:**
- `generateEventDescription`
- `generateRecognitionSuggestions`

---

**Last Updated:** February 6, 2026