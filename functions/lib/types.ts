/**
 * SHARED API TYPES
 * Type definitions for Deno functions and frontend integration
 */

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// =============================================================================
// USER & AUTH TYPES
// =============================================================================

export type UserRole = 'admin' | 'user';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  user_type?: string;
}

// =============================================================================
// USER POINTS & GAMIFICATION
// =============================================================================

export interface PointsHistoryEntry {
  amount: number;
  reason: string;
  source: string;
  event_id?: string;
  timestamp: string;
}

export interface UserPoints {
  id: string;
  user_email: string;
  total_points: number;
  available_points: number;
  lifetime_points: number;
  events_attended: number;
  activities_completed: number;
  feedback_submitted: number;
  peer_recognitions: number;
  badges_earned: string[];
  level: number;
  streak_days: number;
  last_activity_date?: string;
  team_id?: string;
  points_history?: PointsHistoryEntry[];
  points_this_month?: number;
}

export interface PointsConfig {
  points: number;
  field: string | null;
  reason: string;
}

export type ActionType =
  | 'attendance'
  | 'activity_completion'
  | 'feedback'
  | 'high_engagement'
  | 'recognition_sent'
  | 'recognition_received';

// =============================================================================
// GAMIFICATION RULES
// =============================================================================

export type ConditionOperator =
  | 'equals'
  | 'contains'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'in'
  | 'exists';

export interface RuleCondition {
  entity: string;
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface RuleActions {
  award_points?: number;
  award_badge?: string;
  send_notification?: boolean;
}

export interface GamificationRule {
  id: string;
  rule_name: string;
  is_active: boolean;
  trigger_event: string;
  conditions: RuleCondition[];
  actions: RuleActions;
  logic: 'AND' | 'OR';
  cooldown_hours?: number;
  max_triggers_per_month?: number;
  execution_count?: number;
}

export interface RuleExecutionResult {
  rule_id: string;
  actions: Record<string, unknown>;
  conditions_met: string[];
}

// =============================================================================
// EVENTS & ACTIVITIES
// =============================================================================

export interface Event {
  id: string;
  title: string;
  activity_id: string;
  scheduled_date: string;
  duration_minutes?: number;
  magic_link?: string;
  status?: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  type?: string;
  duration?: string;
  instructions?: string;
}

export interface Participation {
  id: string;
  event_id: string;
  participant_email: string;
  rsvp_status?: 'yes' | 'no' | 'maybe';
  attended?: boolean;
  points_awarded?: boolean;
  activity_completed?: boolean;
  feedback_submitted?: boolean;
  engagement_score?: number;
  feedback?: string;
}

// =============================================================================
// BADGES
// =============================================================================

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface BadgeAwardCriteria {
  type: string;
  threshold: number;
}

export interface Badge {
  id: string;
  badge_name: string;
  rarity?: BadgeRarity;
  is_active?: boolean;
  is_manual_award?: boolean;
  award_criteria?: BadgeAwardCriteria;
  points_value?: number;
}

export interface BadgeAward {
  id: string;
  badge_id: string;
  user_email: string;
  awarded_date: string;
  award_type?: string;
  earned_through?: string;
  points_awarded?: number;
}

// =============================================================================
// RECOGNITIONS
// =============================================================================

export interface Recognition {
  id: string;
  from_user: string;
  to_user: string;
  message: string;
  created_date: string;
  recognition_type?: string;
}

// =============================================================================
// TEAMS
// =============================================================================

export interface Team {
  id: string;
  name: string;
  total_points?: number;
  member_count?: number;
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export type NotificationType = 'announcement' | 'reminder' | 'recap';

export interface Notification {
  id: string;
  user_email: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_date?: string;
}

export interface TeamsConfig {
  id: string;
  webhook_url: string;
  notifications_enabled: boolean;
  send_announcement?: boolean;
  send_reminder?: boolean;
  send_recap?: boolean;
  announcement_template?: string;
}

// =============================================================================
// TEAMS CARD (MS TEAMS ADAPTIVE CARDS)
// =============================================================================

export interface TeamsCardTextBlock {
  type: 'TextBlock';
  text: string;
  size?: 'Small' | 'Default' | 'Medium' | 'Large' | 'ExtraLarge';
  weight?: 'Lighter' | 'Default' | 'Bolder';
  color?: 'Default' | 'Dark' | 'Light' | 'Accent' | 'Good' | 'Warning' | 'Attention';
  wrap?: boolean;
  spacing?: 'None' | 'Small' | 'Default' | 'Medium' | 'Large' | 'ExtraLarge';
  separator?: boolean;
}

export interface TeamsCardFact {
  title: string;
  value: string;
}

export interface TeamsCardFactSet {
  type: 'FactSet';
  facts: TeamsCardFact[];
}

export interface TeamsCardColumn {
  type: 'Column';
  width: string;
  items: (TeamsCardTextBlock | TeamsCardFactSet)[];
}

export interface TeamsCardColumnSet {
  type: 'ColumnSet';
  columns: TeamsCardColumn[];
}

export interface TeamsCardAction {
  type: 'Action.OpenUrl' | 'Action.Submit';
  title: string;
  url?: string;
  style?: 'default' | 'positive' | 'destructive';
}

export type TeamsCardBodyElement = TeamsCardTextBlock | TeamsCardFactSet | TeamsCardColumnSet;

export interface TeamsAdaptiveCard {
  type: 'AdaptiveCard';
  version: string;
  body: TeamsCardBodyElement[];
  actions?: TeamsCardAction[];
}

export interface TeamsCardAttachment {
  contentType: string;
  content: TeamsAdaptiveCard;
}

export interface TeamsCard {
  type: 'message';
  attachments: TeamsCardAttachment[];
}

// =============================================================================
// SURVEYS
// =============================================================================

export type SurveyQuestionType = 'rating' | 'scale' | 'multiple_choice' | 'yes_no' | 'text';

export interface SurveyQuestion {
  id: string;
  question_text: string;
  question_type: SurveyQuestionType;
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  survey_type?: string;
  is_anonymous?: boolean;
  questions: SurveyQuestion[];
  anonymization_threshold?: number;
}

export interface SurveyResponseAnswer {
  question_id: string;
  answer: string | number | boolean;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  user_email?: string;
  responses: SurveyResponseAnswer[];
  metadata?: {
    department?: string;
    tenure_bucket?: string;
    role?: string;
  };
}

export interface AggregatedQuestionResult {
  question_id: string;
  question_text: string;
  question_type: SurveyQuestionType;
  response_count: number;
  average?: number;
  median?: number;
  distribution?: Array<{ value: number; count: number }> | Array<{ option: string; count: number; percentage: number }>;
  note?: string;
}

// =============================================================================
// AI GAMIFICATION SUGGESTIONS
// =============================================================================

export type SuggestionType =
  | 'rule_adjustment'
  | 'new_rule'
  | 'new_badge'
  | 'badge_adjustment'
  | 'challenge_adjustment';

export type SuggestionPriority = 'low' | 'medium' | 'high' | 'critical';

export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'implemented';

export interface ProposedChanges {
  entity_type: string;
  entity_id?: string;
  field_changes: Record<string, unknown>;
}

export interface ExpectedImpact {
  engagement_lift: number;
  affected_user_count: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface AIGamificationSuggestion {
  id: string;
  suggestion_type: SuggestionType;
  priority: SuggestionPriority;
  title: string;
  description: string;
  reasoning: string;
  proposed_changes: ProposedChanges;
  expected_impact: ExpectedImpact;
  confidence_score: number;
  status: SuggestionStatus;
  data_snapshot?: {
    engagement_rate: number;
    affected_users: number;
    trend_direction: 'up' | 'down';
    time_period: string;
  };
  auto_implement?: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  implemented_at?: string;
}

// =============================================================================
// ANALYTICS
// =============================================================================

export interface ChurnPrediction {
  risk_level: string;
  user_count: number;
  churn_probability: number;
}

export interface EngagementTrajectory {
  day: number;
  current_score: number;
  predicted_score: number;
}

export interface RiskSegment {
  name: string;
  description: string;
  user_count: number;
  risk_score: number;
  churn_probability: number;
}

export interface ActionTrend {
  day: string;
  recognition_given: number;
  events_attended: number;
  challenges_completed: number;
}

export interface BadgeTrend {
  name: string;
  earned_count: number;
}

export interface ChallengeTrend {
  name: string;
  participants: number;
  completion_rate: number;
  growth: number;
}

export interface TrendingItem {
  name: string;
  type: string;
  emoji: string;
  momentum: number;
}

export interface AdvancedAnalyticsResult {
  engagement_score: number;
  active_users_7d: number;
  avg_points: number;
  participation_rate: number;
  churn_prediction: ChurnPrediction[];
  engagement_trajectory: EngagementTrajectory[];
  risk_segments: RiskSegment[];
  action_trends: ActionTrend[];
  badge_trends: BadgeTrend[];
  challenge_trends: ChallengeTrend[];
  top_trending: TrendingItem[];
}

// =============================================================================
// LLM INTEGRATION TYPES (GEMINI/CLAUDE)
// =============================================================================

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_urls?: string[];
  image_url?: string;
  video_url?: string;
}

export interface LLMGenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface LLMFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface LLMUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export interface GeminiRequestPayload {
  action?: 'chat' | 'vision' | 'video' | 'thinking' | 'embedding' | 'code' | 'function_calling' | 'count_tokens';
  prompt?: string;
  model?: string;
  messages?: LLMMessage[];
  system?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: Record<string, unknown>[];
  safety_settings?: Record<string, unknown>[];
  generation_config?: LLMGenerationConfig;
}

export interface GeminiResponse {
  success: boolean;
  content?: string;
  function_calls?: LLMFunctionCall[];
  finish_reason?: string;
  safety_ratings?: Record<string, unknown>[];
  usage?: LLMUsageMetadata;
  model?: string;
  embedding?: number[];
  token_count?: number;
}

// =============================================================================
// LEARNING PATH
// =============================================================================

export type LearningPathStatus = 'not_started' | 'in_progress' | 'completed';

export interface LearningPathProgress {
  id: string;
  user_email: string;
  learning_path_id: string;
  status: LearningPathStatus;
  progress_percentage?: number;
  started_at?: string;
  completed_at?: string;
}

// =============================================================================
// RULE EXECUTION
// =============================================================================

export interface RuleExecution {
  id: string;
  rule_id: string;
  rule_name: string;
  user_email: string;
  trigger_entity: string;
  trigger_entity_id: string;
  executed_date: string;
  actions_executed: Record<string, unknown>;
  conditions_met: string[];
  success: boolean;
}

// =============================================================================
// LEADERBOARD
// =============================================================================

export interface LeaderboardSnapshot {
  id: string;
  user_email: string;
  rank: number;
  total_points: number;
  snapshot_date: string;
}

// =============================================================================
// INTEGRATIONS
// =============================================================================

export interface Integration {
  id: string;
  integration_key: string;
  status: 'active' | 'inactive' | 'error';
  last_used?: string;
  usage_count?: number;
  config?: Record<string, unknown>;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface ValidationRule {
  required?: boolean;
  type?: FieldType;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: unknown) => boolean;
}

export type ValidationSchema = Record<string, ValidationRule>;

// =============================================================================
// BASE44 CLIENT TYPES
// =============================================================================

export interface Base44Entity<T> {
  list(): Promise<T[]>;
  filter(query: Record<string, unknown>): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface Base44Auth {
  me(): Promise<AuthenticatedUser | null>;
}

export interface Base44Entities {
  UserPoints: Base44Entity<UserPoints>;
  Event: Base44Entity<Event>;
  Activity: Base44Entity<Activity>;
  Participation: Base44Entity<Participation>;
  Badge: Base44Entity<Badge>;
  BadgeAward: Base44Entity<BadgeAward>;
  Recognition: Base44Entity<Recognition>;
  Team: Base44Entity<Team>;
  Notification: Base44Entity<Notification>;
  TeamsConfig: Base44Entity<TeamsConfig>;
  Survey: Base44Entity<Survey>;
  SurveyResponse: Base44Entity<SurveyResponse>;
  GamificationRule: Base44Entity<GamificationRule>;
  RuleExecution: Base44Entity<RuleExecution>;
  AIGamificationSuggestion: Base44Entity<AIGamificationSuggestion>;
  LearningPathProgress: Base44Entity<LearningPathProgress>;
  LeaderboardSnapshot: Base44Entity<LeaderboardSnapshot>;
  Integration: Base44Entity<Integration>;
  [key: string]: Base44Entity<unknown>;
}

export interface Base44Integrations {
  Core: {
    InvokeLLM(params: { prompt: string; response_json_schema?: Record<string, unknown> }): Promise<Record<string, unknown>>;
  };
}

export interface Base44Client {
  auth: Base44Auth;
  entities: Base44Entities;
  asServiceRole: {
    entities: Base44Entities;
    integrations: Base44Integrations;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

export const NOTIFICATION_TYPES = {
  ANNOUNCEMENT: 'announcement',
  REMINDER: 'reminder',
  RECAP: 'recap'
} as const;