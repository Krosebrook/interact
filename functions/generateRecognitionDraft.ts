/**
 * AI Recognition Draft Generator
 * Suggests recognition messages aligned with company values
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await req.json();

    // Get user's activity profile
    const userProfile = await base44.entities.UserProfile.filter({
      user_email: user_id
    });

    const recognitionHistory = await base44.entities.Recognition.filter({
      recipient_email: user_id
    });

    // Use AI to generate personalized draft
    const draft = await generateDraft(userProfile[0], recognitionHistory);

    return Response.json({ draft });
  } catch (error) {
    console.error('[RECOGNITION_DRAFT]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateDraft(userProfile, history) {
  const recentRecognitions = history.slice(-5);
  const categories = extractCommonCategories(recentRecognitions);

  // Template-based generation (in production, call LLM)
  const templates = {
    teamwork: `I'm impressed by [Name]'s collaborative spirit. Their willingness to jump in and support the team has been invaluable.`,
    innovation: `[Name] shows exceptional creativity and thinking. Their fresh perspective has really helped us solve problems.`,
    leadership: `[Name] exemplifies leadership qualities. They've been a great mentor and guide for the team.`,
    going_above: `[Name] consistently goes above and beyond expectations. Their dedication and effort don't go unnoticed.`
  };

  const selectedCategory = categories[0] || 'teamwork';
  const message = templates[selectedCategory] || templates.teamwork;

  return {
    message,
    category: selectedCategory,
    values: ['collaboration', 'excellence', 'integrity'],
    suggested_variations: [
      message.replace('[Name]', 'their'),
      'Your impact on this team is invaluable. Thank you for...',
      'What a fantastic example of teamwork and dedication!'
    ]
  };
}

function extractCommonCategories(recognitions) {
  const categories = recognitions.map(r => r.category);
  const counts = {};

  categories.forEach(cat => {
    counts[cat] = (counts[cat] || 0) + 1;
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat);
}