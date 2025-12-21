import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * AI-Powered Gamification Intelligence Engine
 * Dynamically adjusts challenges, suggests badges, and recommends events
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, context } = await req.json();

    // Fetch comprehensive gamification data
    const [allUsers, userPoints, challenges, rules, participations, recognitions, teams] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.UserPoints.filter({}),
      base44.asServiceRole.entities.PersonalChallenge.filter({}),
      base44.asServiceRole.entities.GamificationRule.filter({ is_active: true }),
      base44.asServiceRole.entities.Participation.filter({}),
      base44.asServiceRole.entities.Recognition.filter({ status: 'approved' }),
      base44.asServiceRole.entities.Team.filter({})
    ]);

    switch (action) {
      case 'adjust_challenge_difficulty': {
        const { team_id, challenge_id } = context;

        // Analyze team performance over last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const teamMembers = allUsers.filter(u => {
          const points = userPoints.find(p => p.user_email === u.email);
          return points?.team_id === team_id;
        });

        const teamParticipations = participations.filter(p => 
          teamMembers.some(m => m.email === p.user_email) &&
          new Date(p.created_date) > thirtyDaysAgo
        );

        const teamRecognitions = recognitions.filter(r =>
          teamMembers.some(m => m.email === r.recipient_email) &&
          new Date(r.created_date) > thirtyDaysAgo
        );

        const activeTeamChallenges = challenges.filter(c =>
          teamMembers.some(m => m.email === c.user_email) &&
          c.status === 'in_progress'
        );

        const avgPoints = userPoints
          .filter(p => p.team_id === team_id)
          .reduce((sum, p) => sum + (p.total_points || 0), 0) / (teamMembers.length || 1);

        const engagementRate = (teamParticipations.length / teamMembers.length) / 30;
        const challengeCompletionRate = activeTeamChallenges.filter(c => c.progress >= 100).length / 
          (activeTeamChallenges.length || 1);

        const prompt = `You are an AI gamification expert analyzing team performance to adjust challenge parameters.

Team Metrics (Last 30 Days):
- Team Size: ${teamMembers.length} members
- Average Points: ${Math.round(avgPoints)}
- Daily Engagement Rate: ${(engagementRate * 100).toFixed(1)}%
- Challenge Completion Rate: ${(challengeCompletionRate * 100).toFixed(1)}%
- Total Participations: ${teamParticipations.length}
- Recognitions Received: ${teamRecognitions.length}
- Active Challenges: ${activeTeamChallenges.length}

Based on this data, recommend:
1. Challenge difficulty adjustment (easy/medium/hard)
2. Point reward multiplier (0.5x - 2.0x)
3. Reasoning for adjustments
4. Optimal challenge duration (1-4 weeks)

Rules:
- If engagement is low (<50%), make challenges easier and more rewarding
- If completion rate is high (>80%), increase difficulty
- If team is highly active, introduce competitive elements
- Balance between achievable and motivating`;

        const adjustment = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
              point_multiplier: { type: "number" },
              duration_weeks: { type: "number" },
              reasoning: { type: "string" },
              recommendations: { type: "array", items: { type: "string" } }
            }
          }
        });

        return Response.json({ 
          success: true, 
          adjustment,
          metrics: {
            team_size: teamMembers.length,
            avg_points: Math.round(avgPoints),
            engagement_rate: (engagementRate * 100).toFixed(1),
            completion_rate: (challengeCompletionRate * 100).toFixed(1)
          }
        });
      }

      case 'suggest_personal_badges': {
        const { user_email } = context;

        const targetUser = allUsers.find(u => u.email === user_email);
        if (!targetUser) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const userParticipations = participations.filter(p => p.user_email === user_email);
        const userRecognitionsSent = recognitions.filter(r => r.sender_email === user_email);
        const userRecognitionsReceived = recognitions.filter(r => r.recipient_email === user_email);
        const userPointsData = userPoints.find(p => p.user_email === user_email);
        const userChallenges = challenges.filter(c => c.user_email === user_email);

        // Get user profile for skills/interests
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({
          user_email: user_email
        });
        const profile = profiles[0];

        const prompt = `You are an AI gamification designer creating personalized badge criteria for an employee.

Employee Profile:
- Name: ${targetUser.full_name}
- Role: ${targetUser.user_type || 'Participant'}
- Total Points: ${userPointsData?.total_points || 0}
- Level: ${userPointsData?.level || 1}
- Events Attended: ${userParticipations.filter(p => p.attendance_status === 'attended').length}
- Recognitions Sent: ${userRecognitionsSent.length}
- Recognitions Received: ${userRecognitionsReceived.length}
- Challenges Completed: ${userChallenges.filter(c => c.status === 'completed').length}
- Skills/Interests: ${profile?.skill_interests?.join(', ') || 'None specified'}
- Department: ${profile?.department || 'Not specified'}

Activity Patterns:
- Most active in: ${userParticipations.length > 0 ? 'Events' : 'Recognition'}
- Engagement trend: ${userParticipations.length > 10 ? 'High' : 'Growing'}

Create 3-5 personalized badge suggestions that:
1. Align with their role and skills
2. Recognize their unique contribution patterns
3. Encourage growth in new areas
4. Are achievable but challenging
5. Have creative, motivating names

For each badge provide:
- Badge name (creative and role-specific)
- Description
- Criteria (specific, measurable)
- Difficulty level
- Why it's personalized for them`;

        const badges = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              badges: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    criteria: { type: "string" },
                    difficulty: { type: "string", enum: ["bronze", "silver", "gold", "platinum"] },
                    personalization_reason: { type: "string" },
                    icon_suggestion: { type: "string" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, badges: badges.badges, user_stats: {
          total_points: userPointsData?.total_points || 0,
          events_attended: userParticipations.length,
          recognitions_given: userRecognitionsSent.length
        }});
      }

      case 'recommend_team_challenges': {
        const { team_id } = context;

        const team = teams.find(t => t.id === team_id);
        if (!team) {
          return Response.json({ error: 'Team not found' }, { status: 404 });
        }

        const teamMembers = allUsers.filter(u => {
          const points = userPoints.find(p => p.user_email === u.email);
          return points?.team_id === team_id;
        });

        // Analyze team weaknesses
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentParticipations = participations.filter(p =>
          teamMembers.some(m => m.email === p.user_email) &&
          new Date(p.created_date) > thirtyDaysAgo
        );

        const recentRecognitions = recognitions.filter(r =>
          teamMembers.some(m => m.email === r.sender_email) &&
          new Date(r.created_date) > thirtyDaysAgo
        );

        const teamChallenges = challenges.filter(c =>
          teamMembers.some(m => m.email === c.user_email)
        );

        // Calculate engagement metrics
        const avgEventAttendance = recentParticipations.length / teamMembers.length;
        const recognitionRate = recentRecognitions.length / teamMembers.length;
        const challengeParticipation = teamChallenges.length / teamMembers.length;

        // Identify skill gaps from profiles
        const teamProfiles = await base44.asServiceRole.entities.UserProfile.filter({});
        const memberProfiles = teamProfiles.filter(p => 
          teamMembers.some(m => m.email === p.user_email)
        );

        const allSkills = memberProfiles.flatMap(p => p.skill_interests || []);
        const skillCoverage = [...new Set(allSkills)];

        const prompt = `You are an AI team coach analyzing a team's performance to recommend targeted challenges.

Team: ${team.team_name}
Size: ${teamMembers.length} members

Performance Analysis (Last 30 Days):
- Event Attendance: ${avgEventAttendance.toFixed(1)} events per member
- Recognition Activity: ${recognitionRate.toFixed(1)} recognitions per member
- Challenge Participation: ${(challengeParticipation * 100).toFixed(0)}%
- Skill Diversity: ${skillCoverage.length} unique skills across team

Areas to Address:
${avgEventAttendance < 3 ? '- Low event attendance' : ''}
${recognitionRate < 2 ? '- Limited peer recognition' : ''}
${challengeParticipation < 0.5 ? '- Low challenge engagement' : ''}
${skillCoverage.length < 5 ? '- Limited skill diversity' : ''}

Recommend 3-5 team challenges/events that:
1. Target identified weaknesses
2. Promote collaboration and skill sharing
3. Are specific and measurable
4. Build on team strengths
5. Create visible impact

For each recommendation:
- Challenge/event name
- Type (challenge/workshop/social/competitive)
- Goal and success criteria
- Duration
- Expected impact
- Why it addresses team needs`;

        const recommendations = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    goal: { type: "string" },
                    success_criteria: { type: "array", items: { type: "string" } },
                    duration: { type: "string" },
                    expected_impact: { type: "string" },
                    addresses_weakness: { type: "string" }
                  }
                }
              },
              priority_areas: { type: "array", items: { type: "string" } }
            }
          }
        });

        return Response.json({ 
          success: true, 
          recommendations: recommendations.recommendations,
          priority_areas: recommendations.priority_areas,
          team_metrics: {
            team_name: team.team_name,
            size: teamMembers.length,
            avg_attendance: avgEventAttendance.toFixed(1),
            recognition_rate: recognitionRate.toFixed(1)
          }
        });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Gamification AI Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to process AI request' 
    }, { status: 500 });
  }
});