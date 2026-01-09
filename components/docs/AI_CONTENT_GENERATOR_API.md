# AI Content Generator API Documentation

## Overview
Backend function that generates educational content using AI for the learning platform.

## Endpoint
`POST /aiContentGenerator`

## Authentication
- **Required**: Yes
- **Role**: Admin only
- **Method**: JWT token via base44 SDK

## Actions

### 1. Generate Learning Path

**Action**: `generate_learning_path`

**Request**:
```json
{
  "action": "generate_learning_path",
  "context": {
    "skill_gap": "Python for Data Science",
    "target_level": "intermediate",
    "duration": "2-4 weeks"
  }
}
```

**Response**:
```json
{
  "success": true,
  "learning_path": {
    "title": "Master Python for Data Science",
    "description": "Comprehensive journey from basics to advanced analytics",
    "target_skill": "Python for Data Science",
    "difficulty_level": "intermediate",
    "estimated_duration": "3 weeks",
    "milestones": [
      {
        "id": "m1",
        "title": "Python Fundamentals",
        "description": "Core syntax and data structures",
        "order": 1,
        "estimated_hours": 8
      }
    ],
    "learning_outcomes": [
      "Build data analysis pipelines",
      "Create visualizations with matplotlib"
    ],
    "prerequisites": ["Basic programming knowledge"]
  }
}
```

**Edge Cases**:
- Empty skill_gap → 400 error
- Invalid target_level → defaults to intermediate
- AI timeout → 500 error with retry suggestion

---

### 2. Generate Quiz Questions

**Action**: `generate_quiz`

**Request**:
```json
{
  "action": "generate_quiz",
  "context": {
    "topic": "JavaScript Async/Await",
    "question_count": 5,
    "difficulty": "intermediate"
  }
}
```

**Response**:
```json
{
  "success": true,
  "questions": [
    {
      "question": "What does the 'await' keyword do in JavaScript?",
      "options": [
        "Pauses execution until a promise resolves",
        "Creates a new promise",
        "Throws an error",
        "Runs code asynchronously"
      ],
      "correct_answer": 0,
      "explanation": "The await keyword pauses the execution of an async function until the promise settles, then returns the result.",
      "difficulty": "intermediate"
    }
  ]
}
```

**Validation**:
- question_count: 1-20 (enforced in frontend)
- difficulty: beginner|intermediate|advanced
- options: Always 4 choices
- correct_answer: 0-3 index

**Edge Cases**:
- Empty topic → Button disabled in UI
- Invalid question_count → Clamped to 1-20
- Malformed AI response → Error caught and reported

---

### 3. Generate Video Script

**Action**: `generate_video_script`

**Request**:
```json
{
  "action": "generate_video_script",
  "context": {
    "topic": "Effective remote team communication",
    "duration_minutes": 5,
    "tone": "professional"
  }
}
```

**Response**:
```json
{
  "success": true,
  "script": {
    "title": "5 Keys to Remote Team Communication",
    "hook": "Ever wonder why some remote teams thrive while others struggle? It all comes down to communication.",
    "sections": [
      {
        "timestamp": "0:15-1:30",
        "section": "The Remote Communication Challenge",
        "script": "When you're not in the same room, things get lost...",
        "visuals": "Split-screen showing confused remote team members"
      },
      {
        "timestamp": "1:30-3:00",
        "section": "The 5 Communication Keys",
        "script": "Here are the five essential practices...",
        "visuals": "Animated checklist appearing one by one"
      }
    ],
    "call_to_action": "Try implementing one of these strategies in your next team meeting and see the difference.",
    "key_takeaways": [
      "Over-communicate in remote settings",
      "Use video for important discussions",
      "Document everything"
    ]
  }
}
```

**Tone Options**:
- `professional`: Formal, business-focused
- `casual`: Friendly, conversational
- `energetic`: High-energy, motivational
- `storytelling`: Narrative-driven, emotional

**Edge Cases**:
- Duration too short (<3 min) → Warning about limited content depth
- Duration too long (>10 min) → Suggests breaking into multiple videos
- Missing tone → Defaults to professional
- Empty sections → Error handled

---

## Error Responses

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 400 Bad Request
```json
{
  "error": "Invalid action"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate content"
}
```

## Usage Examples

### Frontend Integration (React)
```jsx
import { base44 } from '@/api/base44Client';

// Generate learning path
const response = await base44.functions.invoke('aiContentGenerator', {
  action: 'generate_learning_path',
  context: {
    skill_gap: 'Leadership',
    target_level: 'advanced',
    duration: '1-2 months'
  }
});

const learningPath = response.data.learning_path;
```

### Using with React Query
```jsx
const generateMutation = useMutation({
  mutationFn: async (params) => {
    const response = await base44.functions.invoke('aiContentGenerator', {
      action: 'generate_quiz',
      context: params
    });
    return response.data;
  },
  onSuccess: (data) => {
    console.log('Generated questions:', data.questions);
  }
});
```

## Performance
- Average generation time: 5-15 seconds
- Timeout: 30 seconds
- Rate limit: 10 requests/minute per admin
- Caching: Not implemented (each call generates new content)

## Best Practices

1. **Learning Paths**:
   - Be specific about skill gaps
   - Choose realistic durations
   - Review and customize AI output before publishing

2. **Quiz Questions**:
   - Start with 5 questions per module
   - Review explanations for accuracy
   - Test questions before deploying to users
   - Mix difficulty levels within a module

3. **Video Scripts**:
   - Keep micro-learning videos under 10 minutes
   - Match tone to company culture
   - Review visual suggestions for feasibility
   - Test pacing with actual recording

4. **Content Quality**:
   - Always review AI-generated content
   - Customize for your organization
   - Validate technical accuracy
   - Test with sample audience

## Future Enhancements
- [ ] Batch generation (multiple paths at once)
- [ ] Content versioning and templates
- [ ] Integration with external LMS platforms
- [ ] Multi-language content generation
- [ ] Adaptive difficulty based on user performance
- [ ] Content recommendation engine