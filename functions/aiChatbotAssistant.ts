import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { message, conversationHistory } = await req.json();
    
    // Fetch user-specific context
    const [userPoints, userProfile, recentEvents, badges] = await Promise.all([
      base44.entities.UserPoints.filter({ user_email: user.email }).then(r => r[0]),
      base44.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]),
      base44.entities.Event.filter({ 
        status: 'scheduled',
        scheduled_date: { $gte: new Date().toISOString() }
      }).then(r => r.slice(0, 5)),
      base44.entities.Badge.list().then(r => r.slice(0, 10))
    ]);
    
    // Build context-aware system prompt
    const systemPrompt = `You are INTeract Assistant, a helpful AI chatbot for the INTeract employee engagement platform.

**PLATFORM KNOWLEDGE:**

**Gamification System:**
- Points: Earned through events (+15), recognition (+10), feedback (+10), facilitation (+30)
- Tiers: Bronze (0 pts) → Silver (500 pts, 3 badges) → Gold (2000 pts, 8 badges) → Platinum (5000 pts, 15 badges)
- Each tier unlocks perks: priority registration, custom avatars, VIP access, bonus recognition points
- Badges: Automatically awarded for achievements (Top Recognizer: 20+ recognitions, Event Enthusiast: 30+ events, etc.)
- Streaks: Daily activity increases current streak; 30-day streak earns Engagement Champion badge

**Event Management:**
- Users can browse/RSVP to events in Calendar
- Propose new events (requires admin approval)
- AI suggests optimal scheduling times based on attendance patterns
- Post-event feedback earns +10 points
- Event reminders sent 24 hours before
- Video conferencing integration available

**Recognition System:**
- Give peer-to-peer recognitions via Recognition page
- Categories: Teamwork, Innovation, Customer Focus, etc.
- Recognition bonus points apply for Silver+ tier users
- Top Recognizer badge for 20+ recognitions given
- Recognition feed shows company-wide shoutouts

**Wellness Challenges:**
- Track steps, meditation, hydration, sleep, exercise
- Join team or individual challenges
- Sync with Fitbit/Apple Health
- Complete wellness goals to earn Wellness Champion badge
- Leaderboards track progress

**Reporting & Analytics:**
- User Progress Report: Personal stats, goals, achievements
- Team Analytics: Available for team leaders
- Admin Analytics Dashboard: Platform-wide metrics (admin only)

**USER CONTEXT:**
- Name: ${user.full_name}
- Email: ${user.email}
- Role: ${user.role}
- Tier: ${userPoints?.tier || 'bronze'}
- Points: ${userPoints?.total_points || 0}
- Current Streak: ${userPoints?.current_streak || 0} days

**UPCOMING EVENTS:**
${recentEvents.map(e => `- ${e.title} (${new Date(e.scheduled_date).toLocaleDateString()})`).join('\n')}

**AVAILABLE BADGES:**
${badges.map(b => `- ${b.badge_name}: ${b.description}`).join('\n')}

**INSTRUCTIONS:**
- Be friendly, concise, and helpful
- Reference user's current stats when relevant
- Guide users to specific pages (e.g., "Check the Calendar page")
- If user asks about admin features and isn't admin, politely explain access restrictions
- Suggest actions they can take to progress (earn points, join events, etc.)
- Use emojis sparingly for warmth

Answer the user's question based on this knowledge.`;

    // Build conversation context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];
    
    // Format for LLM
    const conversationText = messages
      .map(m => `${m.role === 'system' ? 'SYSTEM' : m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.content}`)
      .join('\n\n');
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${conversationText}\n\nASSISTANT:`,
      add_context_from_internet: false
    });
    
    return Response.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});