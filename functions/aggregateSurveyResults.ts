/**
 * AGGREGATE SURVEY RESULTS FUNCTION
 * Returns only aggregated survey data, never individual responses
 * Enforces anonymization threshold server-side
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Require authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin/HR can access aggregated results
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden - admin access required' }, { status: 403 });
    }

    const { surveyId } = await req.json();
    
    if (!surveyId) {
      return Response.json({ error: 'surveyId required' }, { status: 400 });
    }

    // Get survey
    const surveys = await base44.entities.Survey.filter({ id: surveyId });
    if (surveys.length === 0) {
      return Response.json({ error: 'Survey not found' }, { status: 404 });
    }
    const survey = surveys[0];

    // Get responses
    const responses = await base44.asServiceRole.entities.SurveyResponse.filter({ 
      survey_id: surveyId 
    });

    // Check anonymization threshold
    const threshold = survey.anonymization_threshold || 5;
    if (responses.length < threshold) {
      return Response.json({
        success: true,
        meetsThreshold: false,
        responseCount: responses.length,
        threshold: threshold,
        message: `Results will be available after ${threshold} responses (currently ${responses.length})`
      });
    }

    // Aggregate data (NEVER return individual responses)
    const aggregated = survey.questions.map(question => {
      const questionResponses = responses
        .map(r => r.responses.find(res => res.question_id === question.id))
        .filter(Boolean);

      if (question.question_type === 'rating' || question.question_type === 'scale') {
        const values = questionResponses.map(r => r.answer).filter(v => typeof v === 'number');
        
        return {
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          average: values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0,
          median: calculateMedian(values),
          distribution: calculateDistribution(values),
          response_count: values.length
        };
      }

      if (question.question_type === 'multiple_choice' || question.question_type === 'yes_no') {
        const distribution = {};
        questionResponses.forEach(r => {
          const answer = r.answer?.toString() || 'No response';
          distribution[answer] = (distribution[answer] || 0) + 1;
        });

        return {
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          distribution: Object.entries(distribution).map(([option, count]) => ({
            option,
            count,
            percentage: (count / questionResponses.length) * 100
          })),
          response_count: questionResponses.length
        };
      }

      if (question.question_type === 'text') {
        // For text responses, only return count and sentiment (no actual text)
        return {
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          response_count: questionResponses.length,
          // Could add AI sentiment analysis here
          note: 'Text responses kept confidential for anonymity'
        };
      }

      return null;
    }).filter(Boolean);

    // Demographic segmentation (if metadata provided)
    const demographics = {
      by_department: {},
      by_tenure: {},
      by_role: {}
    };

    responses.forEach(r => {
      if (r.metadata?.department) {
        demographics.by_department[r.metadata.department] = 
          (demographics.by_department[r.metadata.department] || 0) + 1;
      }
      if (r.metadata?.tenure_bucket) {
        demographics.by_tenure[r.metadata.tenure_bucket] = 
          (demographics.by_tenure[r.metadata.tenure_bucket] || 0) + 1;
      }
      if (r.metadata?.role) {
        demographics.by_role[r.metadata.role] = 
          (demographics.by_role[r.metadata.role] || 0) + 1;
      }
    });

    return Response.json({
      success: true,
      meetsThreshold: true,
      survey: {
        id: survey.id,
        title: survey.title,
        survey_type: survey.survey_type,
        is_anonymous: survey.is_anonymous
      },
      responseCount: responses.length,
      aggregated: aggregated,
      demographics: demographics,
      // NEVER include individual responses
    });

  } catch (error) {
    console.error('Survey aggregation error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

function calculateMedian(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

function calculateDistribution(values) {
  const dist = {};
  values.forEach(v => {
    dist[v] = (dist[v] || 0) + 1;
  });
  return Object.entries(dist).map(([value, count]) => ({
    value: Number(value),
    count
  })).sort((a, b) => a.value - b.value);
}