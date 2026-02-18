import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Smart notification system that triggers personalized alerts
 * Based on user behavior and content relevance
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role for system notifications
    const { user_email, notification_type, context } = await req.json();

    if (!user_email) {
      return Response.json({ error: 'user_email required' }, { status: 400 });
    }

    // Fetch user profile to understand preferences
    const [userProfile, userPrefs] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.filter({ user_email }).then(r => r[0]),
      base44.asServiceRole.entities.UserPreferences.filter({ user_email }).then(r => r[0])
    ]);

    // Check if user has notification consent
    if (userPrefs?.notification_preferences === false) {
      return Response.json({ 
        success: true, 
        skipped: true,
        reason: 'User has disabled notifications'
      });
    }

    // Generate personalized notification content
    const { secureAICall } = await import('./lib/aiGovernance.ts');

    const prompt = `Generate a personalized, engaging notification message.

NOTIFICATION TYPE: ${notification_type}
USER CONTEXT: ${JSON.stringify({ 
  department: userProfile?.department,
  interests: userProfile?.interests,
  role: userProfile?.role
})}
TRIGGER CONTEXT: ${JSON.stringify(context)}

Create a notification in JSON format:
{
  "title": "Catchy, personalized title (max 50 chars)",
  "message": "Brief, engaging message (max 100 chars)",
  "action_label": "Clear action button text",
  "priority": "low|medium|high",
  "reasoning": "Why this notification matters for this user"
}

Rules:
- Use user's interests/role to personalize
- Be concise and actionable
- Avoid generic messages`;

    const responseSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        message: { type: "string" },
        action_label: { type: "string" },
        priority: { type: "string" },
        reasoning: { type: "string" }
      }
    };

    const aiResult = await secureAICall(base44, {
      userEmail: user_email,
      userRole: 'system',
      functionName: 'createSmartNotification',
      prompt,
      responseSchema,
      agentName: 'NotificationEngine'
    });

    if (!aiResult.success) {
      // Fallback to basic notification
      await base44.asServiceRole.entities.Notification.create({
        user_email,
        type: notification_type,
        title: context.title || 'New Update',
        message: context.message || 'Check out something new',
        read: false
      });

      return Response.json({ success: true, fallback: true });
    }

    // Create personalized notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      user_email,
      type: notification_type,
      title: aiResult.data.title,
      message: aiResult.data.message,
      action_url: context.action_url,
      action_label: aiResult.data.action_label,
      priority: aiResult.data.priority,
      read: false,
      metadata: {
        ai_generated: true,
        reasoning: aiResult.data.reasoning,
        context
      }
    });

    return Response.json({
      success: true,
      notification_id: notification.id,
      personalized: true
    });

  } catch (error) {
    console.error('Smart notification error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});