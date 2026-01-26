import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { userEmail } = await req.json();
    
    // Fetch user activity data
    const [profile] = await base44.entities.UserProfile.filter({ user_email: userEmail });
    const [userPoints] = await base44.entities.UserPoints.filter({ user_email: userEmail });
    const participations = await base44.entities.Participation.filter({ user_email: userEmail });
    const recognitions = await base44.entities.Recognition.filter({ sender_email: userEmail });
    const teamMemberships = await base44.entities.TeamMembership.filter({ user_email: userEmail });
    
    // Calculate time since registration
    const accountAge = profile?.created_date ? 
      Math.floor((Date.now() - new Date(profile.created_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Build activity summary
    const activitySummary = {
      accountAgeDays: accountAge,
      profileComplete: !!(profile?.role && profile?.department && profile?.bio),
      hasProfilePicture: !!profile?.profile_picture_url,
      skillsCount: profile?.skills?.length || 0,
      eventsAttended: participations.filter(p => p.status === 'attended').length,
      eventsRegistered: participations.length,
      recognitionsSent: recognitions.length,
      teamsJoined: teamMemberships.length,
      totalPoints: userPoints?.total_points || 0,
      currentLevel: userPoints?.current_level || 1
    };
    
    // AI generates proactive tips
    const tipsPrompt = `Generate 3 personalized onboarding tips for a new employee:

User Activity:
- Account age: ${activitySummary.accountAgeDays} days
- Profile complete: ${activitySummary.profileComplete ? 'Yes' : 'No'}
- Profile picture: ${activitySummary.hasProfilePicture ? 'Yes' : 'No'}
- Skills listed: ${activitySummary.skillsCount}
- Events registered: ${activitySummary.eventsRegistered}
- Events attended: ${activitySummary.eventsAttended}
- Recognitions sent: ${activitySummary.recognitionsSent}
- Teams joined: ${activitySummary.teamsJoined}
- Total points: ${activitySummary.totalPoints}
- Level: ${activitySummary.currentLevel}

Based on their activity, suggest:
1. Next best action to take
2. Missing opportunity they should explore
3. Motivational tip or milestone celebration

Make tips friendly, specific, and actionable.`;
    
    const tips = await base44.integrations.Core.InvokeLLM({
      prompt: tipsPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          tips: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                message: { type: "string" },
                action: { type: "string" },
                action_url: { type: "string" },
                icon: { type: "string" }
              }
            }
          },
          priority_action: { type: "string" },
          motivation_message: { type: "string" }
        }
      }
    });
    
    return Response.json({
      success: true,
      activitySummary,
      tips: tips.tips,
      priorityAction: tips.priority_action,
      motivationMessage: tips.motivation_message
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});