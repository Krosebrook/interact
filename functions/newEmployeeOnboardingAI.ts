import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, context } = await req.json();

    // Fetch user profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: user.email
    });
    const profile = profiles[0];

    // Fetch company data
    const [allUsers, teams, activities, events] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Team.filter({}),
      base44.asServiceRole.entities.Activity.filter({ is_template: true }),
      base44.asServiceRole.entities.Event.filter({ status: 'scheduled' })
    ]);

    switch (action) {
      case 'generate_plan': {
        const { role, department } = context;
        
        const prompt = `You are an AI onboarding specialist creating a personalized 30-day onboarding plan.

New Employee Information:
- Role: ${role || 'General Employee'}
- Department: ${department || 'Not specified'}
- User Type: ${user.user_type || 'Participant'}
- Company: Remote-first tech company (50-200 employees)

Create a comprehensive 30-day onboarding plan with:
- Week 1: Orientation and setup (days 1-7)
- Week 2: Team integration (days 8-14)
- Week 3: Skill development (days 15-21)
- Week 4: Project engagement (days 22-30)

For each week, provide:
1. 3-5 specific tasks/goals
2. Expected outcomes
3. Resources needed
4. Success metrics

Make it actionable, welcoming, and role-specific.`;

        const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              welcome_message: { type: "string" },
              weeks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    week_number: { type: "number" },
                    title: { type: "string" },
                    focus: { type: "string" },
                    tasks: { type: "array", items: { type: "string" } },
                    outcomes: { type: "array", items: { type: "string" } },
                    resources: { type: "array", items: { type: "string" } },
                    success_metrics: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, plan });
      }

      case 'generate_introductions': {
        // Find key team members based on role
        const departmentTeams = teams.filter(t => 
          t.team_name?.toLowerCase().includes(profile?.department?.toLowerCase() || '')
        );
        
        const teamLeaders = allUsers.filter(u => 
          u.user_type === 'facilitator' || u.role === 'admin'
        ).slice(0, 5);

        const prompt = `You are an AI onboarding assistant introducing a new employee to their team.

New Employee: ${user.full_name} (${user.email})
Department: ${profile?.department || 'General'}
Role: ${user.user_type}

Team Context:
- ${teamLeaders.length} team leaders/facilitators available
- ${teams.length} active teams
- ${departmentTeams.length} teams in their department

Generate 5 personalized introduction messages to key people they should meet:
1. Direct manager/team leader
2. HR/People Ops contact
3. Buddy/mentor in their department
4. Cross-functional team member
5. Culture champion/social committee

For each introduction:
- Explain why this person is important to connect with
- Suggest a good icebreaker question
- Provide context about their role`;

        const introductions = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              introductions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    person_role: { type: "string" },
                    why_connect: { type: "string" },
                    icebreaker: { type: "string" },
                    context: { type: "string" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ 
          success: true, 
          introductions: introductions.introductions,
          team_leaders: teamLeaders.map(u => ({ email: u.email, name: u.full_name }))
        });
      }

      case 'suggest_tasks': {
        const upcomingEvents = events
          .filter(e => new Date(e.scheduled_date) > new Date())
          .slice(0, 5);

        const prompt = `You are an AI onboarding assistant suggesting initial tasks for a new employee.

Employee Info:
- Name: ${user.full_name}
- Role: ${user.user_type}
- Department: ${profile?.department || 'General'}

Available Resources:
- ${activities.length} activity templates
- ${upcomingEvents.length} upcoming events
- ${teams.length} teams to explore

Suggest 8-10 specific first-week tasks organized by category:
1. Setup & Admin (2-3 tasks)
2. Team Connection (2-3 tasks)
3. Learning & Development (2-3 tasks)
4. Culture & Engagement (1-2 tasks)

Make tasks actionable with clear completion criteria.`;

        const tasks = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              task_categories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    tasks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                          estimated_time: { type: "string" },
                          completion_criteria: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        return Response.json({ 
          success: true, 
          tasks: tasks.task_categories,
          upcoming_events: upcomingEvents.map(e => ({
            id: e.id,
            title: e.title,
            date: e.scheduled_date
          }))
        });
      }

      case 'chatbot': {
        const { question } = context;

        const prompt = `You are a friendly AI onboarding assistant for a remote-first employee engagement platform.

New Employee: ${user.full_name}
Question: ${question}

Company Context:
- Remote-first tech company (50-200 employees)
- Focus on peer recognition, team engagement, and wellness
- Platform features: Recognition, Events, Teams, Channels, Gamification, Surveys
- Key contacts: HR team, Team leaders, IT support

Answer the question:
- Be warm, welcoming, and helpful
- Keep it concise (2-3 sentences max)
- Provide specific next steps if applicable
- Use a friendly, conversational tone

If the question is about platform features, explain them briefly.
If it's about company culture, emphasize remote-first values.
If you don't know, suggest who they should contact.`;

        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              answer: { type: "string" },
              suggested_actions: { type: "array", items: { type: "string" } },
              helpful_resources: { type: "array", items: { type: "string" } }
            }
          }
        });

        return Response.json({ success: true, response });
      }

      case 'learning_resources': {
        const { interests } = context;

        const prompt = `You are an AI learning advisor suggesting resources for a new employee.

Employee Interests: ${interests?.join(', ') || 'General onboarding'}
Role: ${user.user_type}
Department: ${profile?.department || 'General'}

Suggest 6-8 learning resources across categories:
1. Platform tutorials (2-3)
2. Skill development (2-3)
3. Company culture (1-2)
4. Industry insights (1-2)

For each resource provide:
- Title
- Type (video, article, course, interactive)
- Estimated time
- Why it's relevant
- Priority level (high/medium)`;

        const resources = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              resources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    type: { type: "string" },
                    estimated_time: { type: "string" },
                    relevance: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium"] }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, resources: resources.resources });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('New Employee Onboarding AI Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to process onboarding request' 
    }, { status: 500 });
  }
});