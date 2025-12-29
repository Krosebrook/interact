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

      case 'suggest_projects': {
        const { role, skills } = context;

        const prompt = `You are an AI career advisor suggesting initial projects for a new employee.

New Employee Profile:
- Role: ${role || user.user_type}
- Skills: ${skills?.join(', ') || profile?.skill_interests?.join(', ') || 'General'}
- Department: ${profile?.department || 'General'}
- Experience Level: New hire (first 30 days)

Suggest 3-5 starter projects/initiatives that:
1. Match their skill level and role
2. Provide quick wins (completable in 1-2 weeks)
3. Help them learn the company's processes
4. Build relationships with team members
5. Create visible impact

For each project provide:
- Project name
- Description (2-3 sentences)
- Expected duration (1-2 weeks, 2-4 weeks)
- Skills developed
- Key stakeholders to collaborate with
- Success criteria
- Why it's a good first project`;

        const projects = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              projects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    duration: { type: "string" },
                    skills_developed: { type: "array", items: { type: "string" } },
                    stakeholders: { type: "array", items: { type: "string" } },
                    success_criteria: { type: "array", items: { type: "string" } },
                    why_good_fit: { type: "string" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, projects: projects.projects });
      }

      case 'generate_welcome_messages': {
        const { team_members } = context;

        const prompt = `You are generating personalized welcome messages from team members to a new hire.

New Employee: ${user.full_name}
Role: ${user.user_type}
Department: ${profile?.department || 'General'}

Generate 3-5 warm, authentic welcome messages from different team members:
1. Direct manager/team lead
2. Senior team member (mentor figure)
3. Peer in same role
4. Cross-functional collaborator
5. Culture/social committee member

Each message should:
- Be personal and welcoming (not generic)
- Mention something specific they can help with
- Include an invitation to connect (coffee chat, lunch, etc.)
- Be 2-3 sentences
- Sound authentic, not corporate

Make each message distinct in tone and personality.`;

        const messages = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              welcome_messages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    from_role: { type: "string" },
                    message: { type: "string" },
                    invitation: { type: "string" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, welcome_messages: messages.welcome_messages });
      }

      case 'task_completion_feedback': {
        const { task_title, completed_tasks_count, total_tasks, user_interests } = context;

        // Get user's onboarding progress
        const onboardingRecords = await base44.asServiceRole.entities.UserOnboarding.filter({
          user_email: user.email
        });
        const onboarding = onboardingRecords[0];

        const prompt = `You are an AI onboarding coach providing personalized feedback on task completion.

Employee: ${user.full_name}
Task Completed: "${task_title}"
Overall Progress: ${completed_tasks_count}/${total_tasks} tasks completed
Days Since Start: ${onboarding ? Math.floor((Date.now() - new Date(onboarding.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0}
Interests: ${user_interests?.join(', ') || 'Not specified'}

Provide personalized feedback that:
1. Celebrates the specific accomplishment
2. Highlights what skills they're developing
3. Suggests next best task based on their progress
4. Offers 1 actionable tip for success
5. Is encouraging and specific (not generic)

Keep it conversational and under 100 words.`;

        const feedback = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              celebration: { type: "string" },
              skills_developed: { type: "array", items: { type: "string" } },
              next_task_suggestion: { type: "string" },
              success_tip: { type: "string" },
              encouragement: { type: "string" }
            }
          }
        });

        return Response.json({ success: true, feedback });
      }

      case 'proactive_learning_suggestions': {
        const { completed_tasks, skill_interests, days_since_start } = context;

        // Get user's learning path progress
        const learningProgress = await base44.asServiceRole.entities.LearningPathProgress.filter({
          user_email: user.email
        });

        // Get available learning paths
        const learningPaths = await base44.asServiceRole.entities.LearningPath.filter({
          is_template: true
        });

        const prompt = `You are an AI learning advisor proactively suggesting resources for a new employee.

Employee Profile:
- Name: ${user.full_name}
- Role: ${user.user_type}
- Days Since Start: ${days_since_start || 0}
- Completed Tasks: ${completed_tasks?.length || 0}
- Stated Interests: ${skill_interests?.join(', ') || 'Not specified'}
- Current Learning Paths: ${learningProgress.length} active

Available Learning Paths: ${learningPaths.slice(0, 5).map(lp => lp.title).join(', ')}

Based on their progress and interests, suggest 3-4 highly relevant learning resources:
1. One learning path they should start
2. One micro-learning opportunity (article, video)
3. One practical exercise or project
4. One peer connection for mentorship

For each suggestion:
- Explain WHY it's relevant to their specific situation
- Estimate time commitment
- Show expected outcome/benefit
- Rate urgency (immediate, this week, this month)`;

        const suggestions = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["learning_path", "article", "exercise", "mentorship"] },
                    title: { type: "string" },
                    relevance_reason: { type: "string" },
                    time_commitment: { type: "string" },
                    expected_outcome: { type: "string" },
                    urgency: { type: "string", enum: ["immediate", "this_week", "this_month"] },
                    resource_id: { type: "string" }
                  }
                }
              },
              personalized_message: { type: "string" }
            }
          }
        });

        return Response.json({ success: true, suggestions: suggestions.suggestions, message: suggestions.personalized_message });
      }

      case 'team_connection_suggestions': {
        const { skill_interests, personality_traits, completed_tasks } = context;

        // Get all users with profiles
        const userProfiles = await base44.asServiceRole.entities.UserProfile.filter({
          status: 'active'
        });

        // Filter out the current user and get potential matches
        const potentialConnections = userProfiles
          .filter(p => p.user_email !== user.email)
          .slice(0, 20); // Limit to avoid token limits

        const prompt = `You are an AI networking advisor suggesting team connections for a new employee.

New Employee:
- Name: ${user.full_name}
- Role: ${user.user_type}
- Interests: ${skill_interests?.join(', ') || 'Not specified'}
- Personality: ${personality_traits ? JSON.stringify(personality_traits) : 'Not assessed'}
- Tasks Completed: ${completed_tasks?.length || 0}

Available Team Members:
${potentialConnections.slice(0, 10).map(p => 
  `- ${p.user_email}: ${p.job_title || 'N/A'}, Interests: ${p.skill_interests?.slice(0, 3).join(', ') || 'N/A'}`
).join('\n')}

Suggest 3-5 team members they should connect with based on:
1. Shared interests or complementary skills
2. Potential mentorship opportunities
3. Similar personality/work style
4. Cross-functional collaboration potential
5. Social/cultural fit

For each connection:
- Explain why they'd be a great match
- Suggest a conversation starter
- Identify potential collaboration areas
- Rate connection priority (high, medium)`;

        const connections = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              connections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    name: { type: "string" },
                    why_connect: { type: "string" },
                    conversation_starter: { type: "string" },
                    collaboration_potential: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium"] },
                    shared_interests: { type: "array", items: { type: "string" } }
                  }
                }
              },
              networking_tip: { type: "string" }
            }
          }
        });

        return Response.json({ success: true, connections: connections.connections, tip: connections.networking_tip });
      }

      case 'skill_progress_analysis': {
        const { completed_tasks, skill_interests, days_since_start } = context;

        // Get user's skill tracking
        const skillTracking = await base44.asServiceRole.entities.SkillTracking.filter({
          user_email: user.email
        });

        const prompt = `You are an AI career development advisor analyzing skill progress for a new employee.

Employee:
- Name: ${user.full_name}
- Days Since Start: ${days_since_start || 0}
- Target Skills: ${skill_interests?.join(', ') || 'Not specified'}
- Tasks Completed: ${completed_tasks?.length || 0}
- Skills Being Tracked: ${skillTracking.map(st => `${st.skill_name} (${st.current_level})`).join(', ') || 'None yet'}

Based on their progress, provide:
1. Skills they're naturally developing through completed tasks
2. Skills gaps to focus on next
3. Recommended activities/projects to develop specific skills
4. Projected timeline to proficiency
5. Personalized development strategy

Be specific and actionable.`;

        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              developing_skills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill: { type: "string" },
                    current_level: { type: "string" },
                    evidence: { type: "string" }
                  }
                }
              },
              skill_gaps: { type: "array", items: { type: "string" } },
              recommended_activities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    activity: { type: "string" },
                    target_skill: { type: "string" },
                    time_to_complete: { type: "string" }
                  }
                }
              },
              timeline_to_proficiency: { type: "string" },
              development_strategy: { type: "string" }
            }
          }
        });

        return Response.json({ success: true, analysis });
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