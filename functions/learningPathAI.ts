import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AI-Powered Learning Path Generator
 * Creates personalized learning journeys based on skill gaps
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, context } = await req.json();

    switch (action) {
      case 'generate_learning_path': {
        const { target_skill, current_level, target_level, user_email } = context;

        // Fetch user profile for context
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({
          user_email: user_email || user.email
        });
        const profile = profiles[0];

        // Fetch existing skill tracking
        const skillTracking = await base44.asServiceRole.entities.SkillTracking.filter({
          user_email: user_email || user.email
        });

        const prompt = `You are an AI learning architect creating a personalized skill development path.

Employee Profile:
- Current Skill Level: ${current_level || 'beginner'}
- Target Skill Level: ${target_level || 'intermediate'}
- Skill to Develop: ${target_skill}
- Existing Skills: ${profile?.skill_interests?.join(', ') || 'None specified'}
- Learning Preferences: ${profile?.preferred_learning_styles?.join(', ') || 'Not specified'}
- Department: ${profile?.department || 'General'}

Create a structured learning path with:
1. 4-6 progressive milestones
2. 3-5 resources per milestone (mix of articles, videos, exercises)
3. Clear learning outcomes
4. Realistic time estimates
5. Prerequisites if needed

Make it practical, actionable, and role-specific.`;

        const learningPath = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              estimated_duration: { type: "string" },
              milestones: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    order: { type: "number" },
                    estimated_hours: { type: "number" }
                  }
                }
              },
              resources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    milestone_id: { type: "string" },
                    title: { type: "string" },
                    type: { type: "string" },
                    url: { type: "string" },
                    estimated_time: { type: "string" },
                    is_required: { type: "boolean" }
                  }
                }
              },
              prerequisites: { type: "array", items: { type: "string" } },
              learning_outcomes: { type: "array", items: { type: "string" } }
            }
          }
        });

        // Create the learning path in database
        const createdPath = await base44.asServiceRole.entities.LearningPath.create({
          ...learningPath,
          target_skill,
          difficulty_level: target_level || 'intermediate',
          created_for: user_email || user.email,
          ai_generated: true,
          is_template: false
        });

        return Response.json({ success: true, learning_path: createdPath });
      }

      case 'recommend_resources': {
        const { skill_gaps, user_email } = context;

        const profiles = await base44.asServiceRole.entities.UserProfile.filter({
          user_email: user_email || user.email
        });
        const profile = profiles[0];

        const prompt = `You are an AI learning advisor recommending resources for skill development.

Skill Gaps Identified: ${skill_gaps?.join(', ') || 'General development'}
Current Skills: ${profile?.skill_interests?.join(', ') || 'None'}
Learning Preferences: ${profile?.preferred_learning_styles?.join(', ') || 'Mixed'}

Recommend 5-8 learning resources:
- Mix of free and paid options
- Various formats (articles, videos, courses, hands-on)
- Prioritize practical, immediately applicable content
- Include difficulty level for each

For each resource:
- Title
- Type (article/video/course/workshop/doc)
- URL (use real platforms: Coursera, Udemy, YouTube, Medium, company docs)
- Skill addressed
- Difficulty level
- Estimated time
- Why it's recommended`;

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
                    url: { type: "string" },
                    skill: { type: "string" },
                    difficulty: { type: "string" },
                    estimated_time: { type: "string" },
                    reason: { type: "string" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, resources: resources.resources });
      }

      case 'suggest_next_steps': {
        const { learning_path_id, user_email } = context;

        // Fetch learning path and progress
        const paths = await base44.asServiceRole.entities.LearningPath.filter({
          id: learning_path_id
        });
        const path = paths[0];

        const progress = await base44.asServiceRole.entities.LearningPathProgress.filter({
          user_email: user_email || user.email,
          learning_path_id
        });
        const userProgress = progress[0];

        if (!path) {
          return Response.json({ error: 'Learning path not found' }, { status: 404 });
        }

        const completedMilestones = userProgress?.milestones_completed || [];
        const totalMilestones = path.milestones?.length || 0;
        const progressPercent = userProgress?.progress_percentage || 0;

        const prompt = `You are an AI learning coach providing personalized guidance.

Learning Path: ${path.title}
Target Skill: ${path.target_skill}
Progress: ${progressPercent}% (${completedMilestones.length}/${totalMilestones} milestones)
Time Spent: ${userProgress?.time_spent_hours || 0} hours

Current Status:
${completedMilestones.length === 0 ? '- Just started the learning journey' : ''}
${completedMilestones.length > 0 && completedMilestones.length < totalMilestones ? '- In progress, making good headway' : ''}
${completedMilestones.length === totalMilestones ? '- All milestones completed!' : ''}

Provide:
1. 3-5 specific next steps (immediate actions)
2. Motivational message (1-2 sentences)
3. Tips for success (2-3 practical tips)
4. Recommended pace (hours per week)

Be encouraging, specific, and actionable.`;

        const nextSteps = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              next_steps: { type: "array", items: { type: "string" } },
              motivation: { type: "string" },
              tips: { type: "array", items: { type: "string" } },
              recommended_pace: { type: "string" }
            }
          }
        });

        // Update progress with AI suggestions
        if (userProgress) {
          await base44.asServiceRole.entities.LearningPathProgress.update(userProgress.id, {
            ai_next_steps: nextSteps.next_steps
          });
        }

        return Response.json({ success: true, guidance: nextSteps });
      }

      case 'analyze_skill_gaps': {
        const { user_email } = context;

        // Fetch user data
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({
          user_email: user_email || user.email
        });
        const profile = profiles[0];

        const participations = await base44.asServiceRole.entities.Participation.filter({
          user_email: user_email || user.email
        });

        const recognitions = await base44.asServiceRole.entities.Recognition.filter({
          recipient_email: user_email || user.email,
          status: 'approved'
        });

        const prompt = `You are an AI career development advisor analyzing skill gaps.

Employee Profile:
- Current Skills: ${profile?.skill_interests?.join(', ') || 'None specified'}
- Skill Levels: ${JSON.stringify(profile?.skill_levels || [])}
- Department: ${profile?.department || 'General'}
- Events Attended: ${participations.length}
- Recognitions Received: ${recognitions.length}
- Recognition Categories: ${[...new Set(recognitions.map(r => r.category))].join(', ')}

Based on their profile and activity:
1. Identify 3-5 high-impact skill gaps
2. For each gap, explain why it matters for their role
3. Prioritize gaps (high/medium/low impact)
4. Suggest first step to address each gap`;

        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
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
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                    reason: { type: "string" },
                    first_step: { type: "string" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, analysis: analysis.skill_gaps });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Learning Path AI Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to process learning path request' 
    }, { status: 500 });
  }
});