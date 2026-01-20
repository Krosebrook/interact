import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email } = await req.json();
    const targetEmail = user_email || user.email;

    // Only allow viewing own plan or admin/manager viewing their reports
    if (targetEmail !== user.email && user.role !== 'admin') {
      const targetProfile = await base44.entities.UserProfile.filter({ user_email: targetEmail });
      if (!targetProfile[0] || targetProfile[0].manager_email !== user.email) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const profile = await base44.entities.UserProfile.filter({ user_email: targetEmail });
    if (!profile || profile.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const userProfile = profile[0];

    // Gather additional data
    const lifecycleState = await base44.entities.LifecycleState.filter({ user_email: targetEmail });
    const participations = await base44.entities.Participation.filter({ user_email: targetEmail });
    const recognitions = await base44.entities.Recognition.filter({ recipient_email: targetEmail });

    const prompt = `Create a personalized development plan for this employee:

EMPLOYEE PROFILE:
Role: ${userProfile.role}
Department: ${userProfile.department}
Years at Company: ${userProfile.start_date ? Math.floor((Date.now() - new Date(userProfile.start_date)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'}

SKILLS:
${userProfile.skills?.map(s => `- ${s.skill_name}: ${s.proficiency} (${s.years_experience || 0} years)`).join('\n') || 'No skills listed'}

INTERESTS:
${userProfile.interests?.join(', ') || 'None listed'}

CAREER ASPIRATIONS:
${userProfile.career_aspirations || 'Not specified'}

CURRENT GOALS:
${userProfile.development_goals?.map(g => `- ${g.goal} (${g.status})`).join('\n') || 'No goals set'}

ENGAGEMENT METRICS:
- Events Attended: ${userProfile.engagement_metrics?.total_events_attended || 0}
- Recognition Given: ${userProfile.engagement_metrics?.recognition_given || 0}
- Recognition Received: ${userProfile.engagement_metrics?.recognition_received || 0}
- Engagement Score: ${userProfile.engagement_metrics?.engagement_score || 0}/100

PERFORMANCE METRICS:
- Productivity: ${userProfile.performance_metrics?.productivity_score || 0}/100
- Collaboration: ${userProfile.performance_metrics?.collaboration_score || 0}/100
- Innovation: ${userProfile.performance_metrics?.innovation_score || 0}/100

LIFECYCLE STATE:
${lifecycleState[0]?.lifecycle_state || 'Unknown'}

RECENT ACTIVITY:
- Total Participations: ${participations.length}
- Recognition Count: ${recognitions.length}

Based on this data, create a comprehensive development plan with:
1. Skill gaps to address
2. Recommended learning paths (3-5 specific courses/resources)
3. Stretch assignments or projects
4. Mentorship recommendations
5. Timeline for achieving career aspirations
6. Short-term goals (3 months)
7. Long-term goals (12 months)
8. Specific, actionable next steps

Respond in JSON format.`;

    const plan = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          skill_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                current_level: { type: "string" },
                target_level: { type: "string" },
                priority: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          learning_paths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                duration: { type: "string" },
                type: { type: "string" },
                provider: { type: "string" }
              }
            }
          },
          stretch_assignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                assignment: { type: "string" },
                skills_developed: { type: "array", items: { type: "string" } },
                estimated_duration: { type: "string" }
              }
            }
          },
          mentorship_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                area: { type: "string" },
                ideal_mentor_profile: { type: "string" },
                focus_topics: { type: "array", items: { type: "string" } }
              }
            }
          },
          career_timeline: {
            type: "object",
            properties: {
              current_position: { type: "string" },
              next_role: { type: "string" },
              estimated_timeline: { type: "string" },
              key_milestones: { type: "array", items: { type: "string" } }
            }
          },
          short_term_goals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                goal: { type: "string" },
                metric: { type: "string" },
                deadline: { type: "string" }
              }
            }
          },
          long_term_goals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                goal: { type: "string" },
                milestone: { type: "string" },
                target_date: { type: "string" }
              }
            }
          },
          next_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                timeline: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      user_email: targetEmail,
      profile_summary: {
        role: userProfile.role,
        department: userProfile.department,
        engagement_score: userProfile.engagement_metrics?.engagement_score || 0
      },
      development_plan: plan,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});