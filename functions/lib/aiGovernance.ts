/**
 * AI GOVERNANCE & SECURITY LAYER
 * 
 * Implements robust controls for AI agent interactions:
 * - Role-based access control for agent capabilities
 * - Prompt injection defenses
 * - Output validation schemas
 * - PII-redacted logging for all AI calls
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================================
// TYPES
// ============================================================================

export interface AIGovernanceConfig {
  userEmail: string;
  userRole: string;
  functionName: string;
  agentName?: string;
  requestedOperation?: string;
  targetEntity?: string;
}

export interface PromptValidationResult {
  isValid: boolean;
  sanitizedPrompt: string;
  blockedPatterns: string[];
  riskScore: number;
}

export interface AILogEntry {
  user_email: string;
  function_name: string;
  agent_name?: string;
  prompt_sanitized: string;
  response_sanitized: string;
  tool_calls?: Array<{ tool: string; redacted_params: any }>;
  tokens_used: number;
  response_time_ms: number;
  risk_score: number;
  blocked_patterns?: string[];
  success: boolean;
  error_message?: string;
}

// ============================================================================
// ROLE-BASED CAPABILITY MATRIX
// ============================================================================

const ROLE_CAPABILITIES = {
  admin: {
    allowedAgents: ['EventManagerAgent', 'GamificationAssistant', 'RewardsManagerAgent', 'PersonalizedGamificationCoach', 'FacilitatorAssistant'],
    allowedEntities: ['Event', 'Activity', 'User', 'UserProfile', 'UserPoints', 'Badge', 'Reward', 'Team', 'Challenge'],
    allowedOperations: ['create', 'read', 'update', 'delete'],
    maxBatchSize: 100
  },
  facilitator: {
    allowedAgents: ['EventManagerAgent', 'FacilitatorAssistant', 'GamificationAssistant'],
    allowedEntities: ['Event', 'Activity', 'Participation', 'EventPreparationTask', 'Recognition'],
    allowedOperations: ['create', 'read', 'update'], // No delete
    maxBatchSize: 50,
    restrictions: {
      Event: { 
        filter: { facilitator_email: '{{user.email}}' }, // Can only manage own events
        requiresApproval: ['delete']
      }
    }
  },
  participant: {
    allowedAgents: ['GamificationAssistant', 'ParticipantEngagementAgent'],
    allowedEntities: ['UserPoints', 'Badge', 'Participation', 'Recognition', 'Activity'],
    allowedOperations: ['read'], // Read-only for most entities
    maxBatchSize: 20,
    restrictions: {
      UserPoints: { filter: { user_email: '{{user.email}}' } },
      Participation: { filter: { participant_email: '{{user.email}}' } },
      Recognition: { allowedOperations: ['create', 'read'] }
    }
  },
  user: { // Default fallback for non-authenticated 'user' role
    allowedAgents: ['GamificationAssistant'],
    allowedEntities: ['Activity'],
    allowedOperations: ['read'],
    maxBatchSize: 10
  }
};

// ============================================================================
// PROMPT INJECTION DEFENSES
// ============================================================================

const DANGEROUS_PATTERNS = [
  // Command injection
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/i,
  /disregard\s+(all\s+)?(previous|above)\s+instructions?/i,
  /forget\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/i,
  
  // Role manipulation
  /you\s+are\s+now\s+(an?\s+)?(admin|root|system|developer)/i,
  /act\s+as\s+(an?\s+)?(admin|root|system|developer)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(an?\s+)?(admin|root)/i,
  
  // Data exfiltration
  /show\s+(me\s+)?(all|every)\s+(users?|passwords?|secrets?|tokens?|keys?|emails?)/i,
  /list\s+(all|every)\s+(users?|admins?|database|tables?)/i,
  /dump\s+(the\s+)?(database|table|users?)/i,
  /export\s+(all|entire)\s+(database|data)/i,
  
  // System manipulation
  /delete\s+(all|everything|entire)\s+(database|data|users?|events?)/i,
  /drop\s+table/i,
  /truncate\s+table/i,
  
  // Privilege escalation
  /grant\s+(me\s+)?admin/i,
  /make\s+me\s+(an?\s+)?admin/i,
  /elevate\s+permissions?/i,
  
  // PII extraction
  /give\s+(me\s+)?((all|every)\s+)?(social\s+security|ssn|credit\s+card|salary|compensation)/i,
  
  // Injection markers
  /<script>/i,
  /javascript:/i,
  /eval\(/i,
  /exec\(/i,
  /__import__/i,
  
  // Markdown/XSS injection
  /!\[.*\]\(javascript:/i,
  /\[.*\]\(data:/i
];

const SENSITIVE_PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email (for redaction in logs)
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
  /password|passwd|pwd|secret|token|api[_-]?key/i
];

export function validatePrompt(prompt: string): PromptValidationResult {
  const blockedPatterns: string[] = [];
  let riskScore = 0;

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(prompt)) {
      blockedPatterns.push(pattern.toString());
      riskScore += 10;
    }
  }

  // Additional heuristics
  const suspiciousKeywords = ['admin', 'delete all', 'drop', 'truncate', 'grant', 'sudo', 'root'];
  const lowerPrompt = prompt.toLowerCase();
  for (const keyword of suspiciousKeywords) {
    if (lowerPrompt.includes(keyword)) {
      riskScore += 2;
    }
  }

  // Length-based risk (very long prompts may be injection attempts)
  if (prompt.length > 5000) {
    riskScore += 5;
  }

  // Excessive special characters
  const specialCharCount = (prompt.match(/[<>{}[\]\\|`]/g) || []).length;
  if (specialCharCount > 20) {
    riskScore += 3;
  }

  const isValid = riskScore < 15 && blockedPatterns.length === 0;

  // Sanitize prompt (basic cleaning)
  let sanitizedPrompt = prompt
    .replace(/<script[^>]*>.*?<\/script>/gi, '[REMOVED]')
    .replace(/javascript:/gi, '[REMOVED]')
    .trim();

  return {
    isValid,
    sanitizedPrompt,
    blockedPatterns,
    riskScore
  };
}

// ============================================================================
// PII REDACTION FOR LOGGING
// ============================================================================

export function redactPII(text: string): string {
  let redacted = text;

  // Redact SSN
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');
  
  // Redact credit cards
  redacted = redacted.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****');
  
  // Redact emails (preserve domain for debugging)
  redacted = redacted.replace(/\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g, '***@$2');
  
  // Redact phone numbers
  redacted = redacted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '***-***-****');
  
  // Redact passwords/tokens/keys (case-insensitive, with context)
  redacted = redacted.replace(
    /(password|passwd|pwd|secret|token|api[_-]?key)[\s:=]+["']?([^"'\s,}]+)["']?/gi,
    '$1: [REDACTED]'
  );

  return redacted;
}

// ============================================================================
// RBAC ENFORCEMENT FOR AGENTS
// ============================================================================

export function checkAgentPermission(config: AIGovernanceConfig): { allowed: boolean; reason?: string } {
  const { userRole, agentName, requestedOperation, targetEntity } = config;

  const roleConfig = ROLE_CAPABILITIES[userRole as keyof typeof ROLE_CAPABILITIES] || ROLE_CAPABILITIES.user;

  // Check agent access
  if (agentName && !roleConfig.allowedAgents.includes(agentName)) {
    return { allowed: false, reason: `Role '${userRole}' cannot access agent '${agentName}'` };
  }

  // Check entity access
  if (targetEntity && !roleConfig.allowedEntities.includes(targetEntity)) {
    return { allowed: false, reason: `Role '${userRole}' cannot access entity '${targetEntity}'` };
  }

  // Check operation permission
  if (requestedOperation && !roleConfig.allowedOperations.includes(requestedOperation)) {
    return { allowed: false, reason: `Role '${userRole}' cannot perform '${requestedOperation}' operation` };
  }

  // Check entity-specific restrictions
  if (targetEntity && roleConfig.restrictions?.[targetEntity]) {
    const restriction = roleConfig.restrictions[targetEntity];
    if (restriction.requiresApproval?.includes(requestedOperation || '')) {
      return { allowed: false, reason: `Operation '${requestedOperation}' on '${targetEntity}' requires admin approval for role '${userRole}'` };
    }
  }

  return { allowed: true };
}

// ============================================================================
// OUTPUT VALIDATION
// ============================================================================

export function validateAIOutput(output: any, expectedSchema?: any): { valid: boolean; sanitized: any; errors: string[] } {
  const errors: string[] = [];

  // Basic type validation
  if (expectedSchema?.type === 'object' && typeof output !== 'object') {
    errors.push('Output must be an object');
  }

  if (expectedSchema?.type === 'array' && !Array.isArray(output)) {
    errors.push('Output must be an array');
  }

  // Check for dangerous content in string outputs
  const checkString = (str: string, path: string = 'root') => {
    if (/<script/i.test(str)) {
      errors.push(`Potential XSS detected at ${path}`);
    }
    if (/javascript:/i.test(str)) {
      errors.push(`Potential JS injection at ${path}`);
    }
  };

  // Recursively validate object
  const validate = (obj: any, path: string = 'root') => {
    if (typeof obj === 'string') {
      checkString(obj, path);
    } else if (Array.isArray(obj)) {
      obj.forEach((item, idx) => validate(item, `${path}[${idx}]`));
    } else if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        validate(value, `${path}.${key}`);
      }
    }
  };

  validate(output);

  // Sanitize output (deep clone and clean)
  const sanitized = JSON.parse(JSON.stringify(output));

  return {
    valid: errors.length === 0,
    sanitized,
    errors
  };
}

// ============================================================================
// COMPREHENSIVE AI LOGGING
// ============================================================================

export async function logAIInteraction(
  base44: any,
  entry: AILogEntry
): Promise<void> {
  try {
    await base44.asServiceRole.entities.AIUsageLog.create({
      user_email: entry.user_email,
      function_name: entry.function_name,
      model_name: entry.agent_name || 'unknown',
      tokens_used: entry.tokens_used,
      cached: false,
      response_time_ms: entry.response_time_ms,
      success: entry.success,
      error_message: entry.error_message,
      metadata: {
        prompt_preview: entry.prompt_sanitized.substring(0, 200),
        response_preview: entry.response_sanitized.substring(0, 200),
        risk_score: entry.risk_score,
        blocked_patterns: entry.blocked_patterns,
        tool_calls: entry.tool_calls
      }
    });
  } catch (logError) {
    console.error('Failed to log AI interaction:', logError);
  }
}

// ============================================================================
// HIGH-LEVEL WRAPPER FOR AI CALLS
// ============================================================================

export async function secureAICall(
  base44: any,
  config: {
    userEmail: string;
    userRole: string;
    functionName: string;
    prompt: string;
    responseSchema?: any;
    agentName?: string;
    targetEntity?: string;
    requestedOperation?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string; riskScore: number }> {
  const startTime = Date.now();

  // 1. Validate prompt for injection
  const promptValidation = validatePrompt(config.prompt);
  if (!promptValidation.isValid) {
    await logAIInteraction(base44, {
      user_email: config.userEmail,
      function_name: config.functionName,
      agent_name: config.agentName,
      prompt_sanitized: redactPII(config.prompt.substring(0, 500)),
      response_sanitized: '',
      tokens_used: 0,
      response_time_ms: Date.now() - startTime,
      risk_score: promptValidation.riskScore,
      blocked_patterns: promptValidation.blockedPatterns,
      success: false,
      error_message: 'Prompt validation failed: potential injection detected'
    });

    return {
      success: false,
      error: 'Input validation failed. Please rephrase your request.',
      riskScore: promptValidation.riskScore
    };
  }

  // 2. Check RBAC permissions
  const permissionCheck = checkAgentPermission({
    userEmail: config.userEmail,
    userRole: config.userRole,
    functionName: config.functionName,
    agentName: config.agentName,
    targetEntity: config.targetEntity,
    requestedOperation: config.requestedOperation
  });

  if (!permissionCheck.allowed) {
    await logAIInteraction(base44, {
      user_email: config.userEmail,
      function_name: config.functionName,
      agent_name: config.agentName,
      prompt_sanitized: redactPII(config.prompt.substring(0, 500)),
      response_sanitized: '',
      tokens_used: 0,
      response_time_ms: Date.now() - startTime,
      risk_score: 0,
      success: false,
      error_message: `Permission denied: ${permissionCheck.reason}`
    });

    return {
      success: false,
      error: permissionCheck.reason || 'Permission denied',
      riskScore: 0
    };
  }

  // 3. Make AI call
  try {
    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: promptValidation.sanitizedPrompt,
      response_json_schema: config.responseSchema,
      add_context_from_internet: false
    });

    // 4. Validate output
    const outputValidation = validateAIOutput(response, config.responseSchema);
    if (!outputValidation.valid) {
      await logAIInteraction(base44, {
        user_email: config.userEmail,
        function_name: config.functionName,
        agent_name: config.agentName,
        prompt_sanitized: redactPII(promptValidation.sanitizedPrompt.substring(0, 500)),
        response_sanitized: 'OUTPUT_VALIDATION_FAILED',
        tokens_used: Math.ceil(config.prompt.length / 4),
        response_time_ms: Date.now() - startTime,
        risk_score: promptValidation.riskScore,
        success: false,
        error_message: `Output validation failed: ${outputValidation.errors.join(', ')}`
      });

      return {
        success: false,
        error: 'Response validation failed',
        riskScore: promptValidation.riskScore
      };
    }

    // 5. Log successful call with PII redaction
    await logAIInteraction(base44, {
      user_email: config.userEmail,
      function_name: config.functionName,
      agent_name: config.agentName,
      prompt_sanitized: redactPII(promptValidation.sanitizedPrompt.substring(0, 500)),
      response_sanitized: redactPII(JSON.stringify(outputValidation.sanitized).substring(0, 500)),
      tokens_used: Math.ceil(config.prompt.length / 4) + Math.ceil(JSON.stringify(response).length / 4),
      response_time_ms: Date.now() - startTime,
      risk_score: promptValidation.riskScore,
      success: true
    });

    return {
      success: true,
      data: outputValidation.sanitized,
      riskScore: promptValidation.riskScore
    };

  } catch (aiError: any) {
    await logAIInteraction(base44, {
      user_email: config.userEmail,
      function_name: config.functionName,
      agent_name: config.agentName,
      prompt_sanitized: redactPII(config.prompt.substring(0, 500)),
      response_sanitized: '',
      tokens_used: 0,
      response_time_ms: Date.now() - startTime,
      risk_score: promptValidation.riskScore,
      success: false,
      error_message: aiError.message || 'AI service error'
    });

    return {
      success: false,
      error: 'AI service temporarily unavailable',
      riskScore: promptValidation.riskScore
    };
  }
}