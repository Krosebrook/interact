import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch user data and engagement
    const [userProfile, userPoints, participations, recognitions, comments, onboardingMilestones] = await Promise.all([
      base44.entities.UserProfile.filter({ user_email: user.email }),
      base44.entities.UserPoints.filter({ user_email: user.email }),
      base44.entities.Participation.filter({ user_email: user.email }),
      base44.entities.Recognition.filter({ 
        $or: [{ sender_email: user.email }, { recipient_email: user.email }]
      }),
      base44.entities.Comment.filter({ author_email: user.email }),
      base44.entities.OnboardingMilestone.filter({ user_email: user.email })
    ]);

    const profile = userProfile[0];
    const points = userPoints[0];
    const completedMilestones = onboardingMilestones.filter(m => m.completed);
    
    // Determine user's stage
    const isNewUser = !profile?.onboarding_completed;
    const hasAttendedEvent = participations.some(p => p.attendance_status === 'attended');
    const hasGivenRecognition = recognitions.some(r => r.sender_email === user.email);
    const hasEngaged = comments.length > 0 || hasGivenRecognition;

    // Build AI prompt
    const prompt = `As an employee engagement onboarding coach, create a personalized onboarding plan:

USER PROFILE:
- Role: ${user.role}
- User Type: ${user.user_type || 'participant'}
- Email: ${user.email}
- Profile Complete: ${profile ? 'Yes' : 'No'}
- Onboarding Completed: ${profile?.onboarding_completed || false}

CURRENT PROGRESS:
- Events Attended: ${participations.length}
- Recognitions Given: ${recognitions.filter(r => r.sender_email === user.email).length}
- Recognitions Received: ${recognitions.filter(r => r.recipient_email === user.email).length}
- Comments Posted: ${comments.length}
- Milestones Completed: ${completedMilestones.length}/10
- Current Points: ${points?.total_points || 0}

ROLE-SPECIFIC CONTEXT:
${user.role === 'admin' ? '- Admin: Full access to analytics, settings, user management' : ''}
${user.user_type === 'facilitator' ? '- Facilitator: Can create and manage events' : ''}
${user.user_type === 'participant' ? '- Participant: Attend events, give recognition, engage' : ''}

Provide personalized onboarding guidance in JSON format:
{
  "welcome_message": "Warm, personalized greeting",
  "current_stage": "setup|exploration|engagement|advanced",
  "priority_actions": [
    {
      "action": "specific action to take",
      "reason": "why this is important now",
      "cta_text": "Button text",
      "feature_path": "feature to navigate to",
      "estimated_time": "2 min"
    }
  ],
  "recommended_features": [
    {
      "feature_name": "Feature name",
      "description": "What it does",
      "benefit": "How it helps you",
      "icon": "icon name",
      "priority": "high|medium|low"
    }
  ],
  "profile_setup_tips": [
    "tip1",
    "tip2"
  ],
  "quick_wins": [
    "easy action to build momentum"
  ],
  "next_milestones": [
    {
      "milestone": "milestone name",
      "description": "what to do",
      "reward": "what you get"
    }
  ],
  "personalized_encouragement": "Motivating message based on their progress"
}`

    // Use secure AI call with governance
    const { secureAICall } = await import('./lib/aiGovernance.ts');
    
    const responseSchema = {
        type: "object",
        properties: {
          welcome_message: { type: "string" },
          current_stage: { type: "string" },
          priority_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                reason: { type: "string" },
                cta_text: { type: "string" },
                feature_path: { type: "string" },
                estimated_time: { type: "string" }
              }
            }
          },
          recommended_features: {
            type: "array",
            items: {
              type: "object",
              properties: {
                feature_name: { type: "string" },
                description: { type: "string" },
                benefit: { type: "string" },
                icon: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          profile_setup_tips: { type: "array", items: { type: "string" } },
          quick_wins: { type: "array", items: { type: "string" } },
          next_milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                milestone: { type: "string" },
                description: { type: "string" },
                reward: { type: "string" }
              }
            }
          },
          personalized_encouragement: { type: "string" }
        }
      }
    };

    const aiResult = await secureAICall(base44, {
      userEmail: user.email,
      userRole: user.role || 'user',
      functionName: 'aiOnboardingAssistant',
      prompt,
      responseSchema,
      agentName: 'OnboardingCoach'
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI call failed');
    }

    const aiGuidance = aiResult.data;

    return Response.json({
      success: true,
      guidance: aiGuidance,
      user_context: {
        is_new_user: isNewUser,
        has_engaged: hasEngaged,
        completion_percentage: (completedMilestones.length / 10) * 100,
        role: user.role,
        user_type: user.user_type
      }
    });

  } catch (error) {
    console.error('Error generating onboarding guidance:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});