/**
 * AGGREGATE SURVEY RESULTS FUNCTION
 * Returns only aggregated survey data, never individual responses
 * Enforces anonymization threshold server-side
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import type {
  Base44Client,
  Survey,
  SurveyResponse,
  SurveyQuestion,
  SurveyResponseAnswer,
  AggregatedQuestionResult,
} from './lib/types.ts';
import { getErrorMessage } from './lib/types.ts';

interface AggregatePayload {
  surveyId: string;
}

interface Demographics {
  by_department: Record<string, number>;
  by_tenure: Record<string, number>;
  by_role: Record<string, number>;
}

interface AggregateResponse {
  success: boolean;
  meetsThreshold: boolean;
  responseCount: number;
  threshold?: number;
  message?: string;
  survey?: {
    id: string;
    title: string;
    survey_type?: string;
    is_anonymous?: boolean;
  };
  aggregated?: AggregatedQuestionResult[];
  demographics?: Demographics;
}

interface ValueDistribution {
  value: number;
  count: number;
}

interface OptionDistribution {
  option: string;
  count: number;
  percentage: number;
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    const base44 = createClientFromRequest(req) as Base44Client;

    // Require authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin/HR can access aggregated results
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden - admin access required' }, { status: 403 });
    }

    const { surveyId }: AggregatePayload = await req.json();

    if (!surveyId) {
      return Response.json({ error: 'surveyId required' }, { status: 400 });
    }

    // Get survey
    const surveys = await base44.entities.Survey.filter({ id: surveyId }) as Survey[];
    if (surveys.length === 0) {
      return Response.json({ error: 'Survey not found' }, { status: 404 });
    }
    const survey = surveys[0];

    // Get responses
    const responses = await base44.asServiceRole.entities.SurveyResponse.filter({
      survey_id: surveyId
    }) as SurveyResponse[];

    // Check anonymization threshold
    const threshold = survey.anonymization_threshold || 5;
    if (responses.length < threshold) {
      const result: AggregateResponse = {
        success: true,
        meetsThreshold: false,
        responseCount: responses.length,
        threshold: threshold,
        message: `Results will be available after ${threshold} responses (currently ${responses.length})`
      };
      return Response.json(result);
    }

    // Aggregate data (NEVER return individual responses)
    const aggregated: AggregatedQuestionResult[] = survey.questions.map((question: SurveyQuestion) => {
      const questionResponses: SurveyResponseAnswer[] = responses
        .map((r) => r.responses.find((res) => res.question_id === question.id))
        .filter((res): res is SurveyResponseAnswer => res !== undefined);

      if (question.question_type === 'rating' || question.question_type === 'scale') {
        const values: number[] = questionResponses
          .map((r) => r.answer)
          .filter((v): v is number => typeof v === 'number');

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
        const distribution: Record<string, number> = {};
        questionResponses.forEach((r) => {
          const answer = r.answer?.toString() || 'No response';
          distribution[answer] = (distribution[answer] || 0) + 1;
        });

        const optionDistribution: OptionDistribution[] = Object.entries(distribution).map(([option, count]) => ({
          option,
          count,
          percentage: (count / questionResponses.length) * 100
        }));

        return {
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          distribution: optionDistribution,
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
          note: 'Text responses kept confidential for anonymity'
        };
      }

      return null;
    }).filter((result): result is AggregatedQuestionResult => result !== null);

    // Demographic segmentation (if metadata provided)
    const demographics: Demographics = {
      by_department: {},
      by_tenure: {},
      by_role: {}
    };

    responses.forEach((r) => {
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

    const result: AggregateResponse = {
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
    };

    return Response.json(result);

  } catch (error: unknown) {
    console.error('Survey aggregation error:', error);
    return Response.json({
      error: getErrorMessage(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
});

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function calculateDistribution(values: number[]): ValueDistribution[] {
  const dist: Record<number, number> = {};
  values.forEach((v) => {
    dist[v] = (dist[v] || 0) + 1;
  });
  return Object.entries(dist).map(([value, count]) => ({
    value: Number(value),
    count
  })).sort((a, b) => a.value - b.value);
}
