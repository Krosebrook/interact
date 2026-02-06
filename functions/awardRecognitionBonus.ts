import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This runs as scheduled automation - no user auth
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const allRecognitions = await base44.asServiceRole.entities.Recognition.filter({
      status: 'approved'
    });
    
    const weeklyRecognitions = allRecognitions.filter(r => 
      new Date(r.created_date) >= weekAgo
    );
    
    // Count recognitions per sender
    const senderCounts = weeklyRecognitions.reduce((acc, r) => {
      acc[r.sender_email] = (acc[r.sender_email] || 0) + 1;
      return acc;
    }, {});
    
    const bonuses = [];
    
    // Award bonuses for consistent recognizers
    for (const [email, count] of Object.entries(senderCounts)) {
      let bonusPoints = 0;
      let bonusReason = '';
      
      if (count >= 10) {
        bonusPoints = 150;
        bonusReason = 'Recognition Champion - 10+ recognitions this week!';
      } else if (count >= 5) {
        bonusPoints = 50;
        bonusReason = 'Consistent Recognizer - 5+ recognitions this week!';
      }
      
      if (bonusPoints > 0) {
        const [userPoints] = await base44.asServiceRole.entities.UserPoints.filter({ 
          user_email: email 
        });
        
        if (userPoints) {
          await base44.asServiceRole.entities.UserPoints.update(userPoints.id, {
            total_points: (userPoints.total_points || 0) + bonusPoints
          });
          
          // Create notification
          await base44.asServiceRole.entities.Notification.create({
            user_email: email,
            type: 'points_bonus',
            title: '🎉 Recognition Bonus Earned!',
            message: `${bonusReason} You've earned ${bonusPoints} bonus points!`,
            read: false
          });
          
          bonuses.push({ email, count, bonusPoints });
        }
      }
    }
    
    return Response.json({
      success: true,
      bonuses_awarded: bonuses.length,
      total_points_distributed: bonuses.reduce((sum, b) => sum + b.bonusPoints, 0),
      bonuses
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});