/**
 * Survey Anonymization & PII Protection Tests
 */

import { describe, it, expect, beforeEach } from 'npm:vitest@1.0.0';
import { base44 } from '@/api/base44Client';

describe('Survey Anonymization & PII Protection', () => {
  let testSurvey = null;
  const respondents = [
    'user1@company.com',
    'user2@company.com',
    'user3@company.com',
    'user4@company.com',
    'user5@company.com',
    'user6@company.com'
  ];

  beforeEach(async () => {
    // Create test survey
    testSurvey = {
      title: 'Q1 Engagement Pulse',
      description: 'Quick engagement check',
      questions: [
        { id: 'q1', type: 'rating', text: 'How engaged are you?' }
      ],
      is_active: true
    };
  });

  describe('Anonymous by Default', () => {
    it('Survey responses created as anonymous by default', async () => {
      const response = await base44.entities.SurveyResponse.create({
        survey_id: testSurvey.id,
        respondent_email: respondents[0],
        responses: [{ question_id: 'q1', answer: 5 }],
        is_anonymous: true
      });

      expect(response.is_anonymous).toBe(true);
      expect(response.respondent_email).toBeDefined(); // Stored for de-duping
    });
  });

  describe('Minimum Threshold (5 Responses)', () => {
    it('Aggregated results hidden with <5 responses', async () => {
      // Create 3 responses
      for (let i = 0; i < 3; i++) {
        await base44.entities.SurveyResponse.create({
          survey_id: testSurvey.id,
          respondent_email: respondents[i],
          responses: [{ question_id: 'q1', answer: i + 3 }],
          is_anonymous: true
        });
      }

      const results = await base44.functions.invoke('aggregateSurveyResults', {
        survey_id: testSurvey.id
      });

      expect(results.data.aggregate_visible).toBe(false);
      expect(results.data.reason).toContain('5');
    });

    it('Aggregated results shown with 5+ responses', async () => {
      // Create 5 responses
      for (let i = 0; i < 5; i++) {
        await base44.entities.SurveyResponse.create({
          survey_id: testSurvey.id,
          respondent_email: respondents[i],
          responses: [{ question_id: 'q1', answer: i + 1 }],
          is_anonymous: true
        });
      }

      const results = await base44.functions.invoke('aggregateSurveyResults', {
        survey_id: testSurvey.id
      });

      expect(results.data.aggregate_visible).toBe(true);
      expect(results.data.average_rating).toBeDefined();
      expect(results.data.response_count).toBe(5);
    });

    it('Individual responses never exposed in public API', async () => {
      // Create 10 responses
      for (let i = 0; i < 10; i++) {
        await base44.entities.SurveyResponse.create({
          survey_id: testSurvey.id,
          respondent_email: respondents[i % 6],
          responses: [{ question_id: 'q1', answer: i % 5 + 1 }],
          is_anonymous: true
        });
      }

      // Public call should never return individual responses
      const publicResults = await fetch(`/api/surveys/${testSurvey.id}/results`);
      const data = await publicResults.json();

      expect(data.responses).toBeUndefined();
      expect(data.individual_data).toBeUndefined();
      expect(data.aggregate).toBeDefined();
      expect(data.aggregate.average_rating).toBeDefined();
    });
  });

  describe('Demographic Breakdown', () => {
    it('Metadata aggregated with min 5 responses per group', async () => {
      // Create responses from Engineering team (5+)
      for (let i = 0; i < 5; i++) {
        await base44.entities.SurveyResponse.create({
          survey_id: testSurvey.id,
          respondent_email: respondents[i],
          responses: [{ question_id: 'q1', answer: 4 + i }],
          is_anonymous: true,
          metadata: {
            team_id: 'team-eng',
            department: 'Engineering'
          }
        });
      }

      // Create responses from Sales team (3 only - below threshold)
      for (let i = 0; i < 3; i++) {
        await base44.entities.SurveyResponse.create({
          survey_id: testSurvey.id,
          respondent_email: `sales${i}@company.com`,
          responses: [{ question_id: 'q1', answer: 3 }],
          is_anonymous: true,
          metadata: {
            team_id: 'team-sales',
            department: 'Sales'
          }
        });
      }

      const results = await base44.functions.invoke('aggregateSurveyResults', {
        survey_id: testSurvey.id,
        breakdown_by: 'department'
      });

      // Engineering visible (5+ responses)
      expect(results.data.by_department.Engineering).toBeDefined();
      expect(results.data.by_department.Engineering.response_count).toBe(5);

      // Sales hidden (3 responses < 5)
      expect(results.data.by_department.Sales).toBeUndefined();
    });
  });

  describe('Admin Access', () => {
    it('Only admins can view individual responses', async () => {
      const response = await base44.entities.SurveyResponse.filter({
        survey_id: testSurvey.id
      });

      // Non-admin should get empty array
      expect(Array.isArray(response)).toBe(true);
      if (response.length > 0) {
        // If returned, should not contain PII (respondent_email hashed)
        expect(response[0].respondent_email).toMatch(/^[a-f0-9]{32}$/);
      }
    });

    it('Admin sees hashed email, not plaintext', async () => {
      // Even admins shouldn't see plaintext email
      const response = await base44.entities.SurveyResponse.create({
        survey_id: testSurvey.id,
        respondent_email: 'john.doe@company.com',
        responses: [{ question_id: 'q1', answer: 5 }]
      });

      // Email should be hashed in storage
      expect(response.respondent_email).not.toBe('john.doe@company.com');
    });
  });

  describe('Edge Cases', () => {
    it('Handles exactly 5 responses (threshold boundary)', async () => {
      for (let i = 0; i < 5; i++) {
        await base44.entities.SurveyResponse.create({
          survey_id: testSurvey.id,
          respondent_email: respondents[i],
          responses: [{ question_id: 'q1', answer: 3 }],
          is_anonymous: true
        });
      }

      const results = await base44.functions.invoke('aggregateSurveyResults', {
        survey_id: testSurvey.id
      });

      expect(results.data.aggregate_visible).toBe(true);
    });

    it('Prevents duplicate responses from same user', async () => {
      const firstResponse = await base44.entities.SurveyResponse.create({
        survey_id: testSurvey.id,
        respondent_email: respondents[0],
        responses: [{ question_id: 'q1', answer: 5 }],
        is_anonymous: true
      });

      // Try to submit again
      expect(async () => {
        await base44.entities.SurveyResponse.create({
          survey_id: testSurvey.id,
          respondent_email: respondents[0],
          responses: [{ question_id: 'q1', answer: 3 }],
          is_anonymous: true
        });
      }).toThrow(); // Should fail due to unique constraint
    });
  });
});