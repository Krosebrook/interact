import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate personalized onboarding tips using AI with governance
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { step_title, step_description } = await req.json();

    if (!step_title) {
      return Response.json({ error: 'step_title required' }, { status: 400 });
    }

    const { secureAICall } = await import('./lib/aiGovernance.ts');

    const prompt = `You are a friendly onboarding coach for INTeract, an employee engagement platform.

Current onboarding step: "${step_title}"
Description: "${step_description}"

Provide ONE brief, actionable tip (1-2 sentences max) to help the user complete this step successfully.
Be encouraging, specific, and conversational. No bullet points or formatting.`;

    const aiResult = await secureAICall(base44, {
      userEmail: user.email,
      userRole: user.role || 'user',
      functionName: 'generateOnboardingTip',
      prompt,
      agentName: 'OnboardingCoach'
    });

    if (!aiResult.success) {
      return Response.json({
        tip: 'Take your time exploring this step - you're doing great!'
      });
    }

    return Response.json({
      tip: aiResult.data,
      step: step_title
    });

  } catch (error) {
    console.error('Onboarding tip error:', error);
    return Response.json({
      tip: 'Take your time and explore this feature!',
      error: error.message
    }, { status: 200 }); // Return success with fallback tip
  }
});