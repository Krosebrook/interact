import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { feedback_source_type, feedback_source_id } = await req.json();

    // Fetch feedback and related entity
    const [comments, participations, entity] = await Promise.all([
      base44.asServiceRole.entities.Comment.filter({ 
        entity_type: feedback_source_type === 'event' ? 'event' : feedback_source_type,
        entity_id: feedback_source_id 
      }),
      feedback_source_type === 'event' ? 
        base44.asServiceRole.entities.Participation.filter({ event_id: feedback_source_id }) : 
        Promise.resolve([]),
      feedback_source_type === 'event' ? 
        base44.asServiceRole.entities.Event.filter({ id: feedback_source_id }).then(r => r[0]) : 
        feedback_source_type === 'learning_resource' ?
        base44.asServiceRole.entities.LearningResource.filter({ id: feedback_source_id }).then(r => r[0]) :
        base44.asServiceRole.entities.TeamChallenge.filter({ id: feedback_source_id }).then(r => r[0])
    ]);

    const commentTexts = comments.map(c => c.content).join('\n');
    const entityTitle = entity?.title || entity?.resource_name || entity?.challenge_name || 'Unknown';

    if (!commentTexts || comments.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No feedback found for analysis',
        feedback_count: 0
      });
    }

    const prompt = `
    Analyze the following feedback comments for a ${feedback_source_type}. Perform:
    1. Sentiment analysis (positive/neutral/negative percentages and average score)
    2. Theme categorization (content_quality, delivery, relevance, pacing, engagement, technical_issues, accessibility, other)
    3. Engagement correlation (if participation data available, compare satisfaction with completion/attendance)
    4. Generate improvement suggestions based on feedback patterns

    FEEDBACK SOURCE:
    - Type: ${feedback_source_type}
    - Title: ${entityTitle}
    - Total Comments: ${comments.length}

    FEEDBACK COMMENTS:
    ${commentTexts}

    PARTICIPATION DATA (if available):
    - Total Attendees/Participants: ${participations.length}
    - High Engagement Count: ${participations.filter(p => p.engagement_score >= 7).length}
    - Low Engagement Count: ${participations.filter(p => p.engagement_score < 5).length}

    Generate detailed analysis with sentiment breakdown, theme extraction, engagement correlation, effectiveness score (0-100), and 3-5 improvement suggestions.

    OUTPUT JSON SCHEMA:
    {
      "sentiment_summary": {
        "positive_percentage": "number (0-100)",
        "neutral_percentage": "number (0-100)",
        "negative_percentage": "number (0-100)",
        "average_sentiment_score": "number (1-5)"
      },
      "feedback_themes": [
        {
          "theme_name": "content_quality|delivery|relevance|pacing|engagement|technical_issues|accessibility|other",
          "frequency": "number",
          "sentiment": "positive|negative|mixed",
          "example_comments": ["string (2-3 representative examples)"]
        }
      ],
      "engagement_correlation": {
        "high_satisfaction_participants": "number",
        "high_satisfaction_completion_rate": "number (0-100)",
        "low_satisfaction_participants": "number",
        "low_satisfaction_completion_rate": "number (0-100)",
        "correlation_insights": ["string (key findings)"]
      },
      "overall_effectiveness_score": "number (0-100)",
      "improvement_suggestions": ["string (actionable improvements)"],
      "summary": "string (2-3 sentence summary of feedback quality and recommendations)"
    }
    `;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment_summary: {
            type: "object",
            properties: {
              positive_percentage: { type: "number" },
              neutral_percentage: { type: "number" },
              negative_percentage: { type: "number" },
              average_sentiment_score: { type: "number" }
            }
          },
          feedback_themes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                theme_name: { type: "string" },
                frequency: { type: "number" },
                sentiment: { type: "string" },
                example_comments: { type: "array", items: { type: "string" } }
              }
            }
          },
          engagement_correlation: {
            type: "object",
            properties: {
              high_satisfaction_participants: { type: "number" },
              high_satisfaction_completion_rate: { type: "number" },
              low_satisfaction_participants: { type: "number" },
              low_satisfaction_completion_rate: { type: "number" },
              correlation_insights: { type: "array", items: { type: "string" } }
            }
          },
          overall_effectiveness_score: { type: "number" },
          improvement_suggestions: { type: "array", items: { type: "string" } },
          summary: { type: "string" }
        },
        required: ["sentiment_summary", "feedback_themes", "overall_effectiveness_score"]
      }
    });

    // Store analysis
    const analysis = await base44.asServiceRole.entities.FeedbackAnalysis.create({
      feedback_source_type,
      feedback_source_id,
      feedback_source_title: entityTitle,
      total_feedback_count: comments.length,
      sentiment_summary: aiResponse.sentiment_summary,
      feedback_themes: aiResponse.feedback_themes,
      engagement_correlation: aiResponse.engagement_correlation || {},
      overall_effectiveness_score: aiResponse.overall_effectiveness_score,
      improvement_suggestions: aiResponse.improvement_suggestions,
      analyzed_at: new Date().toISOString()
    });

    return Response.json({ success: true, analysis, summary: aiResponse.summary });

  } catch (error) {
    console.error('Error analyzing feedback:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});