# Agent Task: AI-Powered Activity Recommendation Engine

## Context
Project: Interact - Employee Engagement Platform
Stack: React 18 + Vite 6 + Base44 SDK + OpenAI/Claude/Gemini
Current State: Basic activity library, no personalization
Goal: AI recommendation engine for activities (Roadmap Q2 2025 - Feature 4)

## Task Instructions
You are an AI/ML engineer specializing in recommendation systems. Build Feature 4:

1. **Architecture & Foundation (Week 1)**
   - Design recommendation service architecture
   - Create feature engineering pipeline for user/team context
   - Setup model orchestration layer (OpenAI primary, Claude/Gemini fallback)
   - Implement caching layer (Redis or in-memory)
   - Define recommendation API contract

2. **AI Integration (Week 2)**
   - Integrate OpenAI GPT-4 Turbo for activity recommendations
   - Create prompt templates for context-aware suggestions
   - Implement Anthropic Claude for validation/alternative suggestions
   - Add Google Gemini for team dynamics analysis
   - Build ensemble logic to combine model outputs

3. **Personalization Features (Week 3)**
   - Implement user preference modeling
   - Add team size and composition analysis
   - Create temporal pattern detection (time of day/week)
   - Build participation history analyzer
   - Add remote/hybrid team considerations
   - Generate explanation for each recommendation

4. **Testing & Optimization (Week 4)**
   - Create recommendation quality metrics
   - Implement A/B testing framework
   - Add bias detection and mitigation
   - Performance optimization (< 2s latency)
   - Build admin monitoring dashboard
   - Write integration tests

## Standards to Follow
- Recommendation latency < 2 seconds (P95)
- Cache hit rate > 80%
- Model accuracy > 75% (user acceptance)
- Cost optimization via caching and tiered models
- Transparent recommendation explanations

## Success Criteria
- [ ] Recommendation API endpoint functional
- [ ] OpenAI, Claude, Gemini integrated
- [ ] Ensemble logic working
- [ ] Personalization factors implemented
- [ ] Caching layer functional (>80% hit rate)
- [ ] Recommendation latency < 2 seconds
- [ ] Admin monitoring dashboard
- [ ] Documentation and integration tests complete

## Files to Reference
- functions/ (Base44 backend functions)
- src/api/ (API client configuration)
- FEATURE_ROADMAP.md (Feature 4: AI Recommendation Engine)
- PRD.md (AI integration requirements)

## AI Service Environment Variables Required
- OPENAI_API_KEY
- ANTHROPIC_API_KEY
- GOOGLE_GEMINI_API_KEY
