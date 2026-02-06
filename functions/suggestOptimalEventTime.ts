import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { activityType, duration, teamId } = await req.json();
    
    // Fetch historical event data
    const allEvents = await base44.entities.Event.list('-created_date', 100);
    const participations = await base44.entities.Participation.list('-created_date', 500);
    
    // Filter by team if specified
    let relevantParticipations = participations;
    if (teamId) {
      const memberships = await base44.entities.TeamMembership.filter({ team_id: teamId });
      const memberEmails = memberships.map(m => m.user_email);
      relevantParticipations = participations.filter(p => memberEmails.includes(p.user_email));
    }
    
    // Calculate participation rates by day of week and time
    const eventStats = allEvents.map(event => {
      const eventDate = new Date(event.start_time || event.scheduled_date);
      const dayOfWeek = eventDate.getDay();
      const hour = eventDate.getHours();
      const eventParticipations = participations.filter(p => p.event_id === event.id);
      const attendanceRate = eventParticipations.length > 0 
        ? eventParticipations.filter(p => p.status === 'attended' || p.status === 'going').length / eventParticipations.length
        : 0;
      
      return {
        day: dayOfWeek,
        hour,
        attendanceRate,
        participantCount: eventParticipations.length,
        activityType: event.activity_type || 'general'
      };
    });
    
    // AI analysis
    const analysisPrompt = `Analyze event participation data and suggest optimal scheduling times:

Activity Type: ${activityType}
Duration: ${duration} minutes
Team: ${teamId ? 'Specific team' : 'Company-wide'}

Historical Data:
- Total events analyzed: ${allEvents.length}
- Total participations: ${participations.length}
- Average attendance rate: ${Math.round(eventStats.reduce((sum, e) => sum + e.attendanceRate, 0) / eventStats.length * 100)}%

Day of Week Distribution:
${[0, 1, 2, 3, 4, 5, 6].map(day => {
  const dayEvents = eventStats.filter(e => e.day === day);
  const avgRate = dayEvents.length > 0 ? dayEvents.reduce((sum, e) => sum + e.attendanceRate, 0) / dayEvents.length : 0;
  return `  ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}: ${dayEvents.length} events, ${Math.round(avgRate * 100)}% avg attendance`;
}).join('\n')}

Time of Day Distribution:
${[9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => {
  const hourEvents = eventStats.filter(e => e.hour === hour);
  const avgRate = hourEvents.length > 0 ? hourEvents.reduce((sum, e) => sum + e.attendanceRate, 0) / hourEvents.length : 0;
  return `  ${hour}:00: ${hourEvents.length} events, ${Math.round(avgRate * 100)}% attendance`;
}).join('\n')}

Recommend:
1. Top 3 optimal time slots (day + hour)
2. Reasoning for each recommendation
3. Expected attendance rate
4. Alternative times if primary conflicts`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          primary_recommendation: {
            type: "object",
            properties: {
              day_of_week: { type: "number" },
              day_name: { type: "string" },
              hour: { type: "number" },
              time_slot: { type: "string" },
              expected_attendance_rate: { type: "number" },
              reasoning: { type: "string" }
            }
          },
          alternative_slots: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day_of_week: { type: "number" },
                day_name: { type: "string" },
                hour: { type: "number" },
                time_slot: { type: "string" },
                expected_attendance_rate: { type: "number" },
                reasoning: { type: "string" }
              }
            }
          },
          avoid_times: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time_description: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          general_insights: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });
    
    return Response.json({
      success: true,
      recommendations
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});