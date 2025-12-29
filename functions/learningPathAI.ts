import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, context } = await req.json();

    switch (action) {
      case 'suggest_paths': {
        // Fetch user data
        const [userProfile, userPoints, completedPaths, allPaths] = await Promise.all([
          base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]),
          base44.asServiceRole.entities.UserPoints.filter({ user_email: user.email }).then(r => r[0]),
          base44.asServiceRole.entities.LearningPathProgress.filter({ user_email: user.email }),
          base44.asServiceRole.entities.LearningPath.list()
        ]);

        const completedPathIds = completedPaths
          .filter(p => p.status === 'completed')
          .map(p => p.learning_path_id);

        const availablePaths = allPaths.filter(p => 
          p.is_template && !completedPathIds.includes(p.id)
        );

        const prompt = `You are an AI learning advisor for an employee engagement platform.

User Profile:
- Email: ${user.email}
- Role: ${user.user_type || 'participant'}
- Department: ${userProfile?.department || 'Not specified'}
- Skills/Interests: ${userProfile?.skill_interests?.join(', ') || 'None specified'}
- Learning Goals: ${userProfile?.learning_goals?.join(', ') || 'None'}
- Expertise Areas: ${userProfile?.expertise_areas?.join(', ') || 'None'}
- Skill Levels: ${JSON.stringify(userProfile?.skill_levels || [])}
- Current Tier: ${userPoints?.tier || 'bronze'}
- Completed Paths: ${completedPaths.length}

Available Learning Paths (${availablePaths.length}):
${availablePaths.slice(0, 15).map(p => 
  `- ${p.title} (${p.difficulty_level}): ${p.target_skill} | ${p.description?.substring(0, 80)}`
).join('\n')}

Analyze the user's profile and recommend 5-7 learning paths that:
1. Match their skill interests and goals
2. Address skill gaps based on their role
3. Are appropriate for their experience level
4. Help them progress in their career
5. Build on their existing expertise

Prioritize paths that will have the most impact on their growth.`;

        const suggestions = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    learning_path_title: { type: "string" },
                    relevance_score: { type: "number" },
                    why_recommended: { type: "string" },
                    expected_outcomes: { type: "array", items: { type: "string" } },
                    career_impact: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] }
                  }
                }
              },
              skill_gap_analysis: {
                type: "object",
                properties: {
                  identified_gaps: { type: "array", items: { type: "string" } },
                  immediate_needs: { type: "array", items: { type: "string" } },
                  long_term_goals: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        });

        // Match recommendations to actual path IDs
        const enrichedRecommendations = suggestions.recommendations.map(rec => {
          const matchingPath = availablePaths.find(p => 
            p.title.toLowerCase().includes(rec.learning_path_title.toLowerCase()) ||
            rec.learning_path_title.toLowerCase().includes(p.title.toLowerCase())
          );
          return {
            ...rec,
            path_id: matchingPath?.id,
            path: matchingPath
          };
        }).filter(r => r.path_id);

        return Response.json({ 
          success: true, 
          recommendations: enrichedRecommendations,
          skill_gap_analysis: suggestions.skill_gap_analysis
        });
      }

      case 'generate_modules': {
        const { learning_path_id, path_title, target_skill } = context;

        const prompt = `Create a structured learning module curriculum for: "${path_title}"

Target Skill: ${target_skill}

Create 5-8 modules that form a complete learning journey:
- Mix of content types (videos, readings, quizzes, exercises, checkpoints)
- Progressive difficulty
- Each module builds on previous ones
- Include quizzes to test understanding
- Balance theory and practical application

For each module, provide:
- Module name
- Description (what learner will learn)
- Type (video/reading/quiz/exercise/project/checkpoint)
- Estimated time in minutes
- Points reward (10-50 based on complexity)
- Prerequisites (previous module numbers)
- For quizzes: 3-5 questions with multiple choice answers`;

        const modules = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              modules: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    module_name: { type: "string" },
                    description: { type: "string" },
                    module_type: { 
                      type: "string",
                      enum: ["video", "reading", "quiz", "exercise", "project", "checkpoint"]
                    },
                    estimated_time_minutes: { type: "number" },
                    points_reward: { type: "number" },
                    prerequisites: { type: "array", items: { type: "number" } },
                    quiz_questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          options: { type: "array", items: { type: "string" } },
                          correct_answer: { type: "number" },
                          explanation: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, modules: modules.modules });
      }

      case 'analyze_progress': {
        const { learning_path_id } = context;

        const [pathProgress, moduleCompletions, learningPath] = await Promise.all([
          base44.asServiceRole.entities.LearningPathProgress.filter({
            user_email: user.email,
            learning_path_id
          }).then(r => r[0]),
          base44.asServiceRole.entities.ModuleCompletion.filter({
            user_email: user.email,
            learning_path_id
          }),
          base44.asServiceRole.entities.LearningPath.filter({ id: learning_path_id }).then(r => r[0])
        ]);

        const prompt = `Analyze learning progress and provide personalized feedback:

Learning Path: ${learningPath?.title}
Overall Progress: ${pathProgress?.progress_percentage || 0}%
Modules Completed: ${moduleCompletions.filter(m => m.status === 'completed').length}
Total Time Spent: ${pathProgress?.time_spent_hours || 0} hours
Status: ${pathProgress?.status || 'not_started'}

Module Performance:
${moduleCompletions.map(m => 
  `- ${m.module_id}: ${m.status} ${m.quiz_score ? `(Score: ${m.quiz_score}%)` : ''}`
).join('\n')}

Provide:
1. Progress assessment
2. Strengths identified
3. Areas for improvement
4. Next recommended actions
5. Motivational message`;

        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              progress_assessment: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              improvement_areas: { type: "array", items: { type: "string" } },
              next_steps: { type: "array", items: { type: "string" } },
              motivational_message: { type: "string" },
              estimated_completion_date: { type: "string" }
            }
          }
        });

        return Response.json({ success: true, analysis });
      }

      case 'analyze_skill_gaps_with_micro': {
        const [userProfile, participations, userPoints] = await Promise.all([
          base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]),
          base44.asServiceRole.entities.Participation.filter({ user_email: user.email }),
          base44.asServiceRole.entities.UserPoints.filter({ user_email: user.email }).then(r => r[0])
        ]);

        const prompt = `Analyze skill gaps and suggest micro-learning opportunities:

User Profile:
- Skills/Interests: ${userProfile?.skill_interests?.join(', ') || 'None'}
- Learning Goals: ${userProfile?.learning_goals?.join(', ') || 'None'}
- Skill Levels: ${JSON.stringify(userProfile?.skill_levels || [])}
- Department: ${userProfile?.department || 'Unknown'}
- Events Attended: ${participations?.length || 0}
- Current Tier: ${userPoints?.tier || 'bronze'}

Identify 3-5 skill gaps that can be addressed with micro-learning (5-10 min modules).
Focus on practical, immediately applicable skills.`;

        const gaps = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              gaps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill: { type: "string" },
                    current_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                    target_level: { type: "string", enum: ["intermediate", "advanced", "expert"] },
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                    reason: { type: "string" },
                    estimated_time: { type: "string" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, gaps: gaps.gaps });
      }

      case 'generate_micro_modules': {
        const { skill_gap } = context;

        const prompt = `Create 3-4 bite-sized micro-learning modules for: ${skill_gap}

Each module must be 5-10 minutes and immediately actionable.

Requirements:
- Clear, action-oriented titles
- Mix of videos, exercises, articles
- 15-25 points reward per module
- Specific, measurable learning outcomes
- Beginner to intermediate difficulty`;

        const modules = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              modules: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    type: { type: "string", enum: ["video", "exercise", "article", "interactive"] },
                    duration: { type: "string" },
                    points_reward: { type: "number" },
                    learning_outcome: { type: "string" },
                    difficulty: { type: "string", enum: ["beginner", "intermediate"] }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, modules: modules.modules });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Learning Path AI Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to process learning request' 
    }, { status: 500 });
  }
});