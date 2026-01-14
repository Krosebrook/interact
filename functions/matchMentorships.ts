/**
 * AI-Powered Mentorship Matching
 * Match mentors with mentees based on skills, interests, and compatibility
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all user profiles
    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    // Separate mentors and mentees
    const mentors = profiles.filter(p => p.mentorship_preferences?.open_to_mentoring);
    const mentees = profiles.filter(p => p.mentorship_preferences?.open_to_being_mentored);

    const matches = [];

    // For each mentee, find best mentor matches
    for (const mentee of mentees) {
      const menteeInterests = mentee.mentorship_preferences?.mentorship_interests || [];

      for (const mentor of mentors) {
        if (mentor.user_email === mentee.user_email) continue; // Skip self

        const mentorAreas = mentor.mentorship_preferences?.mentoring_areas || [];

        // Calculate compatibility score
        const score = calculateCompatibility(
          mentee,
          mentor,
          menteeInterests,
          mentorAreas
        );

        if (score > 50) {
          // Only include matches > 50%
          matches.push({
            mentor_email: mentor.user_email,
            mentee_email: mentee.user_email,
            match_score: score,
            match_reason: generateMatchReason(mentee, mentor, menteeInterests, mentorAreas),
            mentorship_areas: findOverlap(menteeInterests, mentorAreas)
          });
        }
      }
    }

    // Sort by score and limit to top matches
    const topMatches = matches.sort((a, b) => b.match_score - a.match_score).slice(0, 20);

    // Check for existing matches to avoid duplicates
    const existingMatches = await base44.asServiceRole.entities.MentorshipMatch.filter({
      status: { $in: ['pending', 'active'] }
    });

    const newMatches = topMatches.filter(
      m =>
        !existingMatches.some(
          e =>
            (e.mentor_email === m.mentor_email && e.mentee_email === m.mentee_email)
        )
    );

    // Create new matches
    const createdMatches = [];
    for (const match of newMatches) {
      const created = await base44.asServiceRole.entities.MentorshipMatch.create({
        mentor_email: match.mentor_email,
        mentee_email: match.mentee_email,
        status: 'pending',
        match_score: match.match_score,
        match_reason: match.match_reason,
        mentorship_areas: match.mentorship_areas,
        started_date: new Date().toISOString()
      });
      createdMatches.push(created);

      // Notify both parties
      await base44.integrations.Core.SendEmail({
        to: match.mentee_email,
        subject: '🤝 Mentorship Match Found!',
        body: `Great news! We've matched you with a mentor who can help you with: ${match.mentorship_areas.join(', ')}\n\nReason: ${match.match_reason}\n\nScore: ${match.match_score}/100`
      });

      await base44.integrations.Core.SendEmail({
        to: match.mentor_email,
        subject: '🤝 Mentorship Opportunity',
        body: `You've been matched with a mentee seeking guidance in: ${match.mentorship_areas.join(', ')}`
      });
    }

    return Response.json({
      success: true,
      matches_found: topMatches.length,
      new_matches_created: createdMatches.length,
      sample_matches: topMatches.slice(0, 5)
    });
  } catch (error) {
    console.error('[MATCH_MENTORSHIPS]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateCompatibility(mentee, mentor, menteeInterests, mentorAreas) {
  let score = 0;

  // Skill overlap (40%)
  const overlap = findOverlap(menteeInterests, mentorAreas);
  const skillMatch = (overlap.length / Math.max(menteeInterests.length, 1)) * 40;
  score += skillMatch;

  // Same department bonus (15%)
  if (mentee.department === mentor.department) {
    score += 10;
  } else if (mentee.department) {
    score += 5; // Cross-department is OK
  }

  // Career level compatibility (20%)
  const menteeYears = mentee.years_at_company || 0;
  const mentorYears = mentor.years_at_company || 0;

  if (mentorYears > menteeYears * 1.5) {
    score += 20; // Mentor more experienced
  } else if (mentorYears > menteeYears) {
    score += 15;
  }

  // Mentorship style match (15%)
  const menteeStyle = mentee.mentorship_preferences?.preferred_mentorship_style;
  const mentorStyle = mentor.mentorship_preferences?.preferred_mentorship_style;

  if (menteeStyle === mentorStyle || mentorStyle === 'mixed') {
    score += 15;
  } else {
    score += 5;
  }

  // Geographic/timezone (10%)
  if (mentee.location && mentor.location) {
    // Simplified: same timezone bonus
    const sameTz = mentee.location.split(',').pop() === mentor.location.split(',').pop();
    if (sameTz) score += 10;
  }

  return Math.round(Math.min(score, 100));
}

function findOverlap(arr1, arr2) {
  return arr1.filter(item => arr2.some(item2 => item.toLowerCase() === item2.toLowerCase()));
}

function generateMatchReason(mentee, mentor, menteeInterests, mentorAreas) {
  const overlap = findOverlap(menteeInterests, mentorAreas);

  let reason = `${mentor.display_name} has expertise in ${overlap.join(', ')}`;

  if (mentee.department === mentor.department) {
    reason += ` and understands your department context`;
  }

  const yearsDiff = (mentor.years_at_company || 0) - (mentee.years_at_company || 0);
  if (yearsDiff > 2) {
    reason += ` with ${yearsDiff}+ more years of experience`;
  }

  return reason + '.';
}