import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Run as scheduled automation - moderate pending proposals
    const pendingProposals = await base44.asServiceRole.entities.EventProposal.filter({ 
      status: 'pending' 
    });
    
    const moderationResults = [];
    
    for (const proposal of pendingProposals) {
      // Fetch existing events for conflict detection
      const existingEvents = await base44.asServiceRole.entities.Event.filter({
        scheduled_date: {
          $gte: new Date(new Date(proposal.suggested_date).getTime() - 60 * 60 * 1000).toISOString(),
          $lte: new Date(new Date(proposal.suggested_date).getTime() + 60 * 60 * 1000).toISOString()
        }
      });
      
      // AI Moderation
      const moderationPrompt = `Review this event proposal for potential issues:

Proposal Details:
- Title: ${proposal.title}
- Description: ${proposal.description}
- Type: ${proposal.activity_type}
- Suggested Date: ${proposal.suggested_date}
- Duration: ${proposal.duration_minutes} minutes
- Virtual: ${proposal.is_virtual}
- Location: ${proposal.location || 'N/A'}

Context:
- Existing events at similar time: ${existingEvents.length}
- Upvotes: ${proposal.upvote_count}

Check for:
1. Scheduling conflicts (overlapping events)
2. Inappropriate content
3. Policy violations (e.g., unrealistic duration, inappropriate location)
4. Spam or duplicate proposals

Provide moderation decision and reasoning.`;

      const moderation = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: moderationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            decision: {
              type: "string",
              enum: ["approve", "flag_for_review", "auto_reject"]
            },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string", enum: ["low", "medium", "high"] },
                  issue_type: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            reasoning: { type: "string" },
            suggested_changes: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      const result = {
        proposal_id: proposal.id,
        title: proposal.title,
        moderation_decision: moderation.decision,
        issues: moderation.issues,
        reasoning: moderation.reasoning
      };
      
      // Auto-approve if no issues
      if (moderation.decision === 'approve' && (!moderation.issues || moderation.issues.length === 0)) {
        await base44.asServiceRole.entities.EventProposal.update(proposal.id, {
          status: 'approved',
          admin_notes: 'Auto-approved by AI moderation (no issues found)',
          reviewed_by: 'system',
          reviewed_at: new Date().toISOString()
        });
        
        result.action = 'auto_approved';
      }
      // Flag for human review
      else if (moderation.decision === 'flag_for_review') {
        await base44.asServiceRole.entities.EventProposal.update(proposal.id, {
          admin_notes: `AI Moderation: ${moderation.reasoning}\n\nIssues Found:\n${moderation.issues.map(i => `- ${i.issue_type} (${i.severity}): ${i.description}`).join('\n')}`
        });
        
        // Notify admins
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
        for (const admin of admins) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: admin.email,
            type: 'proposal_review_needed',
            title: '🚨 Event Proposal Needs Review',
            message: `"${proposal.title}" flagged by AI: ${moderation.reasoning}`,
            action_url: '/Calendar?tab=proposals',
            read: false
          });
        }
        
        result.action = 'flagged_for_review';
      }
      // Auto-reject severe violations
      else if (moderation.decision === 'auto_reject') {
        await base44.asServiceRole.entities.EventProposal.update(proposal.id, {
          status: 'rejected',
          admin_notes: `Auto-rejected by AI moderation: ${moderation.reasoning}`,
          reviewed_by: 'system',
          reviewed_at: new Date().toISOString()
        });
        
        // Notify proposer
        await base44.asServiceRole.entities.Notification.create({
          user_email: proposal.proposed_by,
          type: 'proposal_rejected',
          title: '❌ Proposal Not Approved',
          message: `Your proposal "${proposal.title}" was not approved. Reason: ${moderation.reasoning}`,
          read: false
        });
        
        result.action = 'auto_rejected';
      }
      
      moderationResults.push(result);
    }
    
    return Response.json({
      success: true,
      proposals_reviewed: pendingProposals.length,
      results: moderationResults
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});