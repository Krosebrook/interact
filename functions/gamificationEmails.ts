import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Gamification Email Notifications
 * Sends beautifully formatted emails for achievements, level ups, challenges, etc.
 */

// Email HTML templates
const EMAIL_TEMPLATES = {
  levelUp: (data) => ({
    subject: `🎉 Congratulations! You've reached Level ${data.newLevel}!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #D97230 0%, #C46322 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">⬆️</div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Level Up!</h1>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #334155; font-size: 18px; margin: 0 0 24px;">
        Hey ${data.userName}! 👋
      </p>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        You've just reached <strong style="color: #D97230;">Level ${data.newLevel}</strong>! 
        Your dedication to team engagement is truly inspiring.
      </p>
      
      <!-- Stats Box -->
      <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-size: 32px; font-weight: bold; color: #14294D;">${data.totalPoints.toLocaleString()}</div>
            <div style="font-size: 14px; color: #64748b;">Total Points</div>
          </div>
          <div style="width: 1px; background: #e2e8f0;"></div>
          <div>
            <div style="font-size: 32px; font-weight: bold; color: #D97230;">${data.badgesEarned}</div>
            <div style="font-size: 14px; color: #64748b;">Badges</div>
          </div>
          <div style="width: 1px; background: #e2e8f0;"></div>
          <div>
            <div style="font-size: 32px; font-weight: bold; color: #8B5CF6;">${data.eventsAttended}</div>
            <div style="font-size: 14px; color: #64748b;">Events</div>
          </div>
        </div>
      </div>
      
      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0;">
        Keep participating in events and challenges to unlock more rewards and climb the leaderboard!
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #D97230 0%, #C46322 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Your Progress
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0 0 8px;">Team Engage - Making remote work engaging</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} Intinc. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
  }),

  badgeEarned: (data) => ({
    subject: `🏆 You've earned the "${data.badgeName}" badge!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <div style="font-size: 72px; margin-bottom: 16px;">${data.badgeIcon || '🏆'}</div>
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">${data.badgeName}</h1>
      <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; margin-top: 12px;">
        <span style="color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">${data.badgeRarity}</span>
      </div>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #334155; font-size: 18px; margin: 0 0 24px;">
        Congratulations, ${data.userName}! 🎉
      </p>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        You've unlocked a new achievement:
      </p>
      
      <div style="background: #f5f3ff; border: 2px solid #8B5CF6; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="color: #5B21B6; font-size: 16px; line-height: 1.6; margin: 0;">
          <strong>${data.badgeDescription}</strong>
        </p>
      </div>
      
      ${data.pointsBonus ? `
      <div style="text-align: center; background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <span style="color: #92400e; font-size: 16px;">⚡ Bonus: <strong>+${data.pointsBonus} points</strong> added to your balance!</span>
      </div>
      ` : ''}
      
      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
        You now have <strong>${data.totalBadges} badges</strong> in your collection. Keep up the amazing work!
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${data.badgesUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View All Badges
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0;">Team Engage - Making remote work engaging</p>
    </div>
  </div>
</body>
</html>`
  }),

  challengeWon: (data) => ({
    subject: `🏅 Your team won the "${data.challengeName}" challenge!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">🏅</div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Challenge Victory!</h1>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #334155; font-size: 18px; margin: 0 0 24px;">
        Amazing news, ${data.userName}! 🎊
      </p>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Your team <strong style="color: #D97706;">${data.teamName}</strong> has won the 
        <strong>"${data.challengeName}"</strong> challenge!
      </p>
      
      <!-- Results Box -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <div style="font-size: 14px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Final Score</div>
        <div style="font-size: 48px; font-weight: bold; color: #78350f;">${data.finalScore.toLocaleString()}</div>
        <div style="font-size: 14px; color: #92400e;">points</div>
      </div>
      
      <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
        <span style="color: #065f46; font-size: 16px;">🎁 Reward: <strong>+${data.pointsReward} bonus points</strong> for all team members!</span>
      </div>
      
      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
        Competed against ${data.totalTeams - 1} other teams. Your teamwork made the difference!
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${data.challengeUrl}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Challenge Results
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0;">Team Engage - Making remote work engaging</p>
    </div>
  </div>
</body>
</html>`
  }),

  streakMilestone: (data) => ({
    subject: `🔥 ${data.streakDays}-Day Streak Achieved!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">🔥</div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">${data.streakDays}-Day Streak!</h1>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #334155; font-size: 18px; margin: 0 0 24px;">
        You're on fire, ${data.userName}! 🔥
      </p>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        You've maintained a <strong style="color: #DC2626;">${data.streakDays}-day engagement streak</strong>! 
        Your consistency is inspiring the whole team.
      </p>
      
      <div style="background: #fef2f2; border: 2px solid #EF4444; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">🔥</div>
        <div style="color: #991b1b; font-size: 14px;">Next milestone: <strong>${data.nextMilestone} days</strong></div>
      </div>
      
      ${data.bonusPoints ? `
      <div style="text-align: center; background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <span style="color: #92400e; font-size: 16px;">⚡ Streak Bonus: <strong>+${data.bonusPoints} points</strong></span>
      </div>
      ` : ''}
      
      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
        Keep the momentum going! Every day counts towards your next reward.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Keep the Streak Going
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0;">Team Engage - Making remote work engaging</p>
    </div>
  </div>
</body>
</html>`
  }),

  weeklyDigest: (data) => ({
    subject: `📊 Your Weekly Team Engage Summary`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #14294D 0%, #1e3a6d 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Your Weekly Summary</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Week of ${data.weekStart}</p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #334155; font-size: 16px; margin: 0 0 24px;">
        Hi ${data.userName}, here's your weekly engagement recap:
      </p>
      
      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #D97230;">${data.pointsEarned}</div>
          <div style="font-size: 14px; color: #64748b;">Points Earned</div>
        </div>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #14294D;">${data.eventsAttended}</div>
          <div style="font-size: 14px; color: #64748b;">Events Attended</div>
        </div>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #8B5CF6;">${data.badgesEarned}</div>
          <div style="font-size: 14px; color: #64748b;">Badges Earned</div>
        </div>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #EF4444;">${data.currentStreak}</div>
          <div style="font-size: 14px; color: #64748b;">Day Streak</div>
        </div>
      </div>
      
      <!-- Leaderboard Position -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <div style="font-size: 14px; color: #92400e; margin-bottom: 8px;">Your Leaderboard Position</div>
        <div style="font-size: 36px; font-weight: bold; color: #78350f;">#${data.leaderboardPosition}</div>
        ${data.positionChange !== 0 ? `
        <div style="font-size: 14px; color: ${data.positionChange > 0 ? '#059669' : '#DC2626'};">
          ${data.positionChange > 0 ? '↑' : '↓'} ${Math.abs(data.positionChange)} from last week
        </div>
        ` : ''}
      </div>
      
      <!-- Upcoming Events -->
      ${data.upcomingEvents?.length > 0 ? `
      <div style="margin: 24px 0;">
        <h3 style="color: #334155; font-size: 16px; margin: 0 0 16px;">📅 Upcoming Events</h3>
        ${data.upcomingEvents.map(event => `
        <div style="background: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 8px; border-left: 4px solid #D97230;">
          <div style="font-weight: 600; color: #334155;">${event.title}</div>
          <div style="font-size: 14px; color: #64748b;">${event.date} • +${event.points} pts</div>
        </div>
        `).join('')}
      </div>
      ` : ''}
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #14294D 0%, #1e3a6d 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Dashboard
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0 0 8px;">Team Engage - Making remote work engaging</p>
      <p style="margin: 0;">
        <a href="${data.unsubscribeUrl}" style="color: #94a3b8;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`
  })
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, data, recipientEmail } = await req.json();

    const templateFn = EMAIL_TEMPLATES[type];
    if (!templateFn) {
      return Response.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    const { subject, html } = templateFn(data);

    // Send email using Base44's built-in SendEmail integration
    await base44.integrations.Core.SendEmail({
      to: recipientEmail || data.userEmail,
      subject,
      body: html
    });

    return Response.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});