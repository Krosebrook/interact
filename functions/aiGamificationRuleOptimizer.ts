import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import type {
  Base44Client,
  UserPoints,
  Participation,
  Badge,
  BadgeAward,
  GamificationRule,
  LearningPathProgress,
  Recognition,
  AIGamificationSuggestion,
  SuggestionType,
  SuggestionPriority,
  ProposedChanges,
  ExpectedImpact,
} from './lib/types.ts';
import { getErrorMessage } from './lib/types.ts';

interface RequestPayload {
  action: 'analyze_and_suggest' | 'approve_suggestion' | 'reject_suggestion' | 'implement_suggestion';
  suggestion_id?: string;
  auto_implement?: boolean;
}

interface AnalysisMetrics {
  engagement_rate: number;
  active_users: number;
  total_users: number;
  issues_found: number;
}

interface AnalysisResponse {
  suggestions: AIGamificationSuggestion[];
  metrics: AnalysisMetrics;
}

interface LLMSuggestion {
  type: SuggestionType;
  priority: SuggestionPriority;
  title: string;
  description: string;
  reasoning: string;
  proposed_changes: ProposedChanges;
  expected_impact: ExpectedImpact;
  confidence_score: number;
}

interface BadgeStat {
  badge: Badge;
  awards: number;
  awardRate: number;
}

interface RuleStat {
  rule: GamificationRule;
  effectiveness: number;
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    const base44 = createClientFromRequest(req) as Base44Client;
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, suggestion_id, auto_implement }: RequestPayload = await req.json();

    switch (action) {
      case 'analyze_and_suggest':
        return await analyzeAndSuggest(base44);

      case 'approve_suggestion':
        if (!suggestion_id) {
          return Response.json({ error: 'suggestion_id required' }, { status: 400 });
        }
        return await approveSuggestion(base44, suggestion_id, user.email, auto_implement);

      case 'reject_suggestion':
        if (!suggestion_id) {
          return Response.json({ error: 'suggestion_id required' }, { status: 400 });
        }
        return await rejectSuggestion(base44, suggestion_id, user.email);

      case 'implement_suggestion':
        if (!suggestion_id) {
          return Response.json({ error: 'suggestion_id required' }, { status: 400 });
        }
        return await implementSuggestion(base44, suggestion_id, user.email);

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('AI Rule Optimizer Error:', error);
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});

async function analyzeAndSuggest(base44: Base44Client): Promise<Response> {
  // Fetch comprehensive platform data
  const [userPoints, participations, badges, badgeAwards, rules, learningProgress, recognitions] = await Promise.all([
    base44.asServiceRole.entities.UserPoints.list(),
    base44.asServiceRole.entities.Participation.list(),
    base44.asServiceRole.entities.Badge.list(),
    base44.asServiceRole.entities.BadgeAward.list(),
    base44.asServiceRole.entities.GamificationRule.list(),
    base44.asServiceRole.entities.LearningPathProgress.list(),
    base44.asServiceRole.entities.Recognition.list()
  ]) as [UserPoints[], Participation[], Badge[], BadgeAward[], GamificationRule[], LearningPathProgress[], Recognition[]];

  // Calculate key metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentParticipations = participations.filter((p) =>
    new Date(p.event_id ? p.event_id : '') > thirtyDaysAgo
  );

  const recentBadgeAwards = badgeAwards.filter((b) =>
    new Date(b.awarded_date) > thirtyDaysAgo
  );

  const recentRecognitions = recognitions.filter((r) =>
    new Date(r.created_date) > thirtyDaysAgo
  );

  const activeUsers = new Set(recentParticipations.map((p) => p.participant_email)).size;
  const totalUsers = userPoints.length;
  const engagementRate = totalUsers > 0 ? activeUsers / totalUsers : 0;

  // Calculate skill trends
  const skillFrequency: Record<string, number> = {};
  learningProgress.forEach((lp) => {
    if (lp.status === 'in_progress' || lp.status === 'completed') {
      const skill = lp.learning_path_id;
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    }
  });

  const emergingSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  // Analyze badge saturation
  const badgeStats: BadgeStat[] = badges.map((badge) => {
    const awards = badgeAwards.filter((ba) => ba.badge_id === badge.id);
    const awardRate = totalUsers > 0 ? awards.length / totalUsers : 0;
    return { badge, awards: awards.length, awardRate };
  });

  const oversaturatedBadges = badgeStats.filter((b) => b.awardRate > 0.7 && b.badge.rarity !== 'common');
  const underutilizedBadges = badgeStats.filter((b) => b.awardRate < 0.05 && b.badge.is_active);

  // Analyze rule effectiveness
  const ruleStats: RuleStat[] = rules.map((rule) => {
    const effectiveness = calculateRuleEffectiveness(rule, participations, badgeAwards);
    return { rule, effectiveness };
  });

  const ineffectiveRules = ruleStats.filter((r) => r.effectiveness < 0.2 && r.rule.is_active);

  // Generate AI suggestions using LLM
  const prompt = `You are a gamification expert analyzing employee engagement data. Generate 3-5 actionable suggestions to optimize the gamification system.

Platform Metrics:
- Total Users: ${totalUsers}
- Active Users (30 days): ${activeUsers}
- Engagement Rate: ${(engagementRate * 100).toFixed(1)}%
- Recent Event Participations: ${recentParticipations.length}
- Recent Badge Awards: ${recentBadgeAwards.length}
- Recent Recognitions: ${recentRecognitions.length}

Issues Identified:
- ${oversaturatedBadges.length} badges over-awarded (>70% of users)
- ${underutilizedBadges.length} badges under-utilized (<5% adoption)
- ${ineffectiveRules.length} rules with low effectiveness
- Emerging skills: ${emergingSkills.join(', ')}

Engagement Trend: ${engagementRate > 0.5 ? 'Healthy' : engagementRate > 0.3 ? 'Moderate' : 'Low'}

Generate suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "rule_adjustment|new_rule|new_badge|badge_adjustment|challenge_adjustment",
      "priority": "low|medium|high|critical",
      "title": "Brief title",
      "description": "Detailed explanation",
      "reasoning": "Why this matters based on data",
      "proposed_changes": {
        "entity_type": "GamificationRule|Badge|etc",
        "entity_id": "id if existing",
        "field_changes": {"field": "new_value"}
      },
      "expected_impact": {
        "engagement_lift": 0.15,
        "affected_user_count": 50,
        "risk_level": "low|medium|high"
      },
      "confidence_score": 0.85
    }
  ]
}`;

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              priority: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              reasoning: { type: "string" },
              proposed_changes: { type: "object" },
              expected_impact: { type: "object" },
              confidence_score: { type: "number" }
            }
          }
        }
      }
    }
  }) as { suggestions: LLMSuggestion[] };

  // Save suggestions to database
  const savedSuggestions: AIGamificationSuggestion[] = [];
  for (const suggestion of response.suggestions) {
    const created = await base44.asServiceRole.entities.AIGamificationSuggestion.create({
      suggestion_type: suggestion.type,
      priority: suggestion.priority,
      title: suggestion.title,
      description: suggestion.description,
      reasoning: suggestion.reasoning,
      proposed_changes: suggestion.proposed_changes,
      expected_impact: suggestion.expected_impact,
      confidence_score: suggestion.confidence_score,
      data_snapshot: {
        engagement_rate: engagementRate,
        affected_users: activeUsers,
        trend_direction: engagementRate > 0.4 ? 'up' : 'down',
        time_period: '30_days'
      },
      auto_implement: suggestion.confidence_score > 0.9 && suggestion.expected_impact.risk_level === 'low'
    });
    savedSuggestions.push(created as AIGamificationSuggestion);
  }

  const result: AnalysisResponse = {
    suggestions: savedSuggestions,
    metrics: {
      engagement_rate: engagementRate,
      active_users: activeUsers,
      total_users: totalUsers,
      issues_found: oversaturatedBadges.length + underutilizedBadges.length + ineffectiveRules.length
    }
  };

  return Response.json(result);
}

function calculateRuleEffectiveness(
  rule: GamificationRule,
  participations: Participation[],
  badgeAwards: BadgeAward[]
): number {
  // Simple effectiveness: how often does this rule trigger?
  const relevantData = rule.trigger_event === 'event_attendance' ? participations : badgeAwards;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const triggers = relevantData.filter((d) => {
    const dateField = 'awarded_date' in d ? d.awarded_date : d.event_id;
    return dateField && new Date(dateField) > thirtyDaysAgo;
  }).length;

  return Math.min(triggers / 100, 1);
}

async function approveSuggestion(
  base44: Base44Client,
  suggestionId: string,
  adminEmail: string,
  autoImplement?: boolean
): Promise<Response> {
  const suggestion = await base44.asServiceRole.entities.AIGamificationSuggestion.get(suggestionId) as AIGamificationSuggestion | null;

  if (!suggestion) {
    throw new Error('Suggestion not found');
  }

  await base44.asServiceRole.entities.AIGamificationSuggestion.update(suggestionId, {
    status: 'approved',
    reviewed_by: adminEmail,
    reviewed_at: new Date().toISOString()
  });

  // If auto-implement, execute changes immediately
  if (autoImplement && suggestion.confidence_score > 0.85) {
    return await implementSuggestion(base44, suggestionId, adminEmail);
  }

  return Response.json({ success: true, suggestion });
}

async function rejectSuggestion(
  base44: Base44Client,
  suggestionId: string,
  adminEmail: string
): Promise<Response> {
  await base44.asServiceRole.entities.AIGamificationSuggestion.update(suggestionId, {
    status: 'rejected',
    reviewed_by: adminEmail,
    reviewed_at: new Date().toISOString()
  });

  return Response.json({ success: true });
}

async function implementSuggestion(
  base44: Base44Client,
  suggestionId: string,
  adminEmail: string
): Promise<Response> {
  const suggestion = await base44.asServiceRole.entities.AIGamificationSuggestion.get(suggestionId) as AIGamificationSuggestion | null;

  if (!suggestion || suggestion.status === 'implemented') {
    throw new Error('Invalid suggestion or already implemented');
  }

  const { entity_type, entity_id, field_changes } = suggestion.proposed_changes;

  try {
    // Implement changes based on entity type
    switch (entity_type) {
      case 'GamificationRule':
        if (entity_id) {
          await base44.asServiceRole.entities.GamificationRule.update(entity_id, field_changes);
        } else {
          await base44.asServiceRole.entities.GamificationRule.create(field_changes as Partial<GamificationRule>);
        }
        break;

      case 'Badge':
        if (entity_id) {
          await base44.asServiceRole.entities.Badge.update(entity_id, field_changes);
        } else {
          await base44.asServiceRole.entities.Badge.create(field_changes as Partial<Badge>);
        }
        break;

      default:
        throw new Error(`Unknown entity type: ${entity_type}`);
    }

    // Mark as implemented
    await base44.asServiceRole.entities.AIGamificationSuggestion.update(suggestionId, {
      status: 'implemented',
      implemented_at: new Date().toISOString(),
      reviewed_by: adminEmail
    });

    return Response.json({ success: true, message: 'Suggestion implemented successfully' });
  } catch (error: unknown) {
    console.error('Implementation error:', error);
    throw new Error(`Failed to implement suggestion: ${getErrorMessage(error)}`);
  }
}
