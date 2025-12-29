import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI Content Generator for Learning Platforms
 * Generates learning paths, quiz questions, and video scripts
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, context } = await req.json();

    switch (action) {
      case 'generate_learning_path': {
        const { skill_gap, target_level, duration } = context;

        const prompt = `Create a comprehensive learning path for skill: "${skill_gap}"

Target Level: ${target_level}
Expected Duration: ${duration}

Generate a structured learning path with:
1. Clear, motivating title
2. Compelling description
3. 5-8 progressive milestones (each with title, description, estimated hours)
4. Learning outcomes (what they'll achieve)
5. Prerequisites (if any)
6. Recommended resources mix (videos, readings, exercises)

Make it engaging, actionable, and appropriate for remote/async learning.`;

        const learningPath = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              target_skill: { type: "string" },
              difficulty_level: { 
                type: "string", 
                enum: ["beginner", "intermediate", "advanced", "expert"] 
              },
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
              learning_outcomes: {
                type: "array",
                items: { type: "string" }
              },
              prerequisites: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        });

        return Response.json({ 
          success: true, 
          learning_path: learningPath 
        });
      }

      case 'generate_quiz': {
        const { topic, question_count, difficulty } = context;

        const prompt = `Create ${question_count} diverse, high-quality quiz questions about: "${topic}"

Difficulty: ${difficulty}

Requirements:
- Mix of question types (conceptual, applied, scenario-based)
- 4 options per question, 1 correct answer
- Clear explanations for correct answers
- Avoid trivial or overly complex questions
- Test understanding, not just memorization
- Include real-world application where relevant

Each question should challenge learners appropriately for ${difficulty} level.`;

        const quiz = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 4,
                      maxItems: 4
                    },
                    correct_answer: { 
                      type: "number",
                      minimum: 0,
                      maximum: 3
                    },
                    explanation: { type: "string" },
                    difficulty: {
                      type: "string",
                      enum: ["beginner", "intermediate", "advanced"]
                    }
                  }
                }
              }
            }
          }
        });

        return Response.json({ 
          success: true, 
          questions: quiz.questions 
        });
      }

      case 'generate_video_script': {
        const { topic, duration_minutes, tone } = context;

        const prompt = `Write an engaging ${duration_minutes}-minute video script about: "${topic}"

Tone: ${tone}
Format: Micro-learning video for remote employees

Structure:
1. Hook (first 15 seconds - grab attention)
2. Main content (${duration_minutes - 1} minutes - teach the concept)
   - Break into 3-4 digestible sections with timestamps
   - Include examples, analogies, or stories
   - Suggest visual elements (diagrams, animations, text overlays)
3. Call to action (final 30 seconds - what to do next)

Guidelines:
- Conversational, engaging language
- Clear, concise explanations
- Practical, actionable takeaways
- Pacing appropriate for ${tone} tone
- Include pauses for visual elements
- Remote-work friendly examples`;

        const script = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              hook: { type: "string" },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    timestamp: { type: "string" },
                    section: { type: "string" },
                    script: { type: "string" },
                    visuals: { type: "string" }
                  }
                }
              },
              call_to_action: { type: "string" },
              key_takeaways: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        });

        return Response.json({ 
          success: true, 
          script 
        });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('AI Content Generator Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate content' 
    }, { status: 500 });
  }
});