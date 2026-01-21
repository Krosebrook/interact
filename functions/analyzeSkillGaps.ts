import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.user_type !== 'facilitator')) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { department, project_needs } = await req.json();

    // Fetch all users, skills, and user skills
    const [users, skills, userSkills, profiles] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.Skill.list(),
      base44.entities.UserSkill.list(),
      base44.entities.UserProfile.list()
    ]);

    // Filter by department if specified
    let targetUsers = users;
    if (department) {
      const deptProfiles = profiles.filter(p => p.department === department);
      const deptEmails = deptProfiles.map(p => p.user_email);
      targetUsers = users.filter(u => deptEmails.includes(u.email));
    }

    // Calculate skill distribution
    const skillDistribution = {};
    skills.forEach(skill => {
      const usersWithSkill = userSkills.filter(us => 
        us.skill_id === skill.id && 
        targetUsers.some(u => u.email === us.user_email)
      );
      
      const proficiencyBreakdown = {
        beginner: usersWithSkill.filter(us => us.proficiency === 'beginner').length,
        intermediate: usersWithSkill.filter(us => us.proficiency === 'intermediate').length,
        advanced: usersWithSkill.filter(us => us.proficiency === 'advanced').length,
        expert: usersWithSkill.filter(us => us.proficiency === 'expert').length
      };

      skillDistribution[skill.id] = {
        skill_name: skill.skill_name,
        category: skill.category,
        total_users: usersWithSkill.length,
        coverage_percentage: ((usersWithSkill.length / targetUsers.length) * 100).toFixed(1),
        proficiency_breakdown: proficiencyBreakdown,
        demand_level: skill.demand_level
      };
    });

    // AI-powered gap analysis
    const prompt = `You are a skills gap analyst for a tech company. Analyze this data and identify critical skill gaps.

Department: ${department || 'All Departments'}
Total Employees: ${targetUsers.length}

Current Skill Distribution:
${Object.values(skillDistribution).map(s => `
- ${s.skill_name} (${s.category}): ${s.total_users} employees (${s.coverage_percentage}%)
  Demand: ${s.demand_level}
  Proficiency: ${s.proficiency_breakdown.expert} experts, ${s.proficiency_breakdown.advanced} advanced, ${s.proficiency_breakdown.intermediate} intermediate, ${s.proficiency_breakdown.beginner} beginners
`).join('\n')}

${project_needs ? `Project Requirements: ${project_needs}` : ''}

Identify:
1. Critical skill gaps (high demand, low coverage)
2. Skills needing depth (many beginners, few experts)
3. Recommended training priorities
4. Hiring recommendations

Respond with JSON: {
  "critical_gaps": [{"skill_name": "...", "reason": "...", "priority": "high|critical"}],
  "depth_gaps": [{"skill_name": "...", "current_level": "...", "target_level": "..."}],
  "training_priorities": ["skill1", "skill2"],
  "hiring_recommendations": ["role1", "role2"],
  "summary": "brief overview"
}`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          critical_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          depth_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                current_level: { type: "string" },
                target_level: { type: "string" }
              }
            }
          },
          training_priorities: {
            type: "array",
            items: { type: "string" }
          },
          hiring_recommendations: {
            type: "array",
            items: { type: "string" }
          },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({
      skill_distribution: skillDistribution,
      ai_analysis: aiAnalysis,
      team_size: targetUsers.length,
      department: department || 'All Departments'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});