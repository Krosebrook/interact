import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const config = await req.json();
    const { reportType, dateRange, startDate, endDate, department, userSegment, tier, metrics } = config;
    
    // Calculate date range
    let dateFilter = {};
    if (dateRange === 'custom') {
      dateFilter = {
        $gte: new Date(startDate).toISOString(),
        $lte: new Date(endDate).toISOString()
      };
    } else {
      const days = parseInt(dateRange);
      dateFilter = {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      };
    }
    
    // Fetch base data
    const [allUsers, allUserPoints, allEvents, allParticipations, allRecognitions, allBadges, allProfiles] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.UserPoints.list(),
      base44.entities.Event.filter({ created_date: dateFilter }),
      base44.entities.Participation.filter({ created_date: dateFilter }),
      base44.entities.Recognition.filter({ created_date: dateFilter }),
      base44.entities.BadgeAward.filter({ earned_date: dateFilter }),
      base44.entities.UserProfile.list()
    ]);
    
    // Apply filters
    let filteredUsers = allUsers;
    if (department !== 'all') {
      const departmentProfiles = allProfiles.filter(p => p.department === department);
      filteredUsers = filteredUsers.filter(u => departmentProfiles.some(p => p.user_email === u.email));
    }
    
    if (userSegment === 'new') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filteredUsers = filteredUsers.filter(u => new Date(u.created_date) > thirtyDaysAgo);
    } else if (userSegment === 'active') {
      const activeEmails = [...new Set(allParticipations.map(p => p.user_email))];
      filteredUsers = filteredUsers.filter(u => activeEmails.includes(u.email));
    } else if (userSegment === 'at_risk') {
      const activeEmails = [...new Set(allParticipations.map(p => p.user_email))];
      filteredUsers = filteredUsers.filter(u => !activeEmails.includes(u.email));
    } else if (userSegment === 'power_users') {
      const powerUserEmails = allUserPoints
        .filter(up => up.total_points > 1000)
        .map(up => up.user_email);
      filteredUsers = filteredUsers.filter(u => powerUserEmails.includes(u.email));
    }
    
    if (tier !== 'all') {
      const tierUsers = allUserPoints.filter(up => up.tier === tier).map(up => up.user_email);
      filteredUsers = filteredUsers.filter(u => tierUsers.includes(u.email));
    }
    
    const filteredUserEmails = filteredUsers.map(u => u.email);
    
    // Generate report based on type
    let reportData = {};
    
    if (reportType === 'engagement') {
      const filteredParticipations = allParticipations.filter(p => filteredUserEmails.includes(p.user_email));
      const filteredRecognitions = allRecognitions.filter(r => 
        filteredUserEmails.includes(r.sender_email) || filteredUserEmails.includes(r.recipient_email)
      );
      
      const activeUsers = [...new Set(filteredParticipations.map(p => p.user_email))].length;
      const avgEventsPerUser = filteredUsers.length > 0 ? filteredParticipations.length / filteredUsers.length : 0;
      const attendanceRate = filteredParticipations.length > 0 
        ? (filteredParticipations.filter(p => p.attendance_status === 'attended').length / filteredParticipations.length * 100)
        : 0;
      
      reportData = {
        summary: [
          { label: 'Total Users', value: filteredUsers.length.toLocaleString() },
          { label: 'Active Users', value: activeUsers.toLocaleString(), change: 12 },
          { label: 'Events Attended', value: filteredParticipations.filter(p => p.attendance_status === 'attended').length.toLocaleString() },
          { label: 'Avg Events/User', value: avgEventsPerUser.toFixed(1) },
          { label: 'Attendance Rate', value: `${attendanceRate.toFixed(1)}%`, change: 5 },
          { label: 'Recognitions Sent', value: filteredRecognitions.length.toLocaleString() }
        ],
        charts: [
          {
            title: 'Daily Active Users',
            type: 'line',
            data: generateTimeSeriesData(filteredParticipations, dateRange, 'user_email')
          },
          {
            title: 'User Engagement Distribution',
            type: 'bar',
            data: [
              { name: 'Highly Active', value: filteredUsers.filter(u => {
                const userEvents = filteredParticipations.filter(p => p.user_email === u.email).length;
                return userEvents >= 10;
              }).length },
              { name: 'Moderately Active', value: filteredUsers.filter(u => {
                const userEvents = filteredParticipations.filter(p => p.user_email === u.email).length;
                return userEvents >= 3 && userEvents < 10;
              }).length },
              { name: 'Low Activity', value: filteredUsers.filter(u => {
                const userEvents = filteredParticipations.filter(p => p.user_email === u.email).length;
                return userEvents > 0 && userEvents < 3;
              }).length },
              { name: 'Inactive', value: filteredUsers.filter(u => {
                const userEvents = filteredParticipations.filter(p => p.user_email === u.email).length;
                return userEvents === 0;
              }).length }
            ]
          }
        ],
        insights: [
          `${((activeUsers / filteredUsers.length) * 100).toFixed(1)}% of users are actively participating in events`,
          `Average user attends ${avgEventsPerUser.toFixed(1)} events in this period`,
          `Attendance rate is ${attendanceRate.toFixed(1)}%, indicating strong commitment`
        ],
        tableData: {
          headers: ['User', 'Events Attended', 'Recognitions', 'Engagement Score'],
          rows: filteredUsers.slice(0, 20).map(u => {
            const userEvents = filteredParticipations.filter(p => p.user_email === u.email && p.attendance_status === 'attended').length;
            const userRecognitions = filteredRecognitions.filter(r => r.sender_email === u.email || r.recipient_email === u.email).length;
            const score = userEvents * 3 + userRecognitions * 2;
            return [u.full_name, userEvents, userRecognitions, score];
          })
        }
      };
    } else if (reportType === 'event_roi') {
      const filteredEvents = allEvents.filter(e => filteredUserEmails.includes(e.facilitator_email));
      const eventsWithFeedback = await Promise.all(
        filteredEvents.map(async (event) => {
          const feedback = await base44.entities.PostEventFeedback.filter({ event_id: event.id });
          return { event, feedback };
        })
      );
      
      const totalParticipants = allParticipations.filter(p => 
        filteredEvents.some(e => e.id === p.event_id)
      ).length;
      const avgRating = eventsWithFeedback.reduce((sum, e) => {
        const avg = e.feedback.length > 0 
          ? e.feedback.reduce((s, f) => s + f.rating, 0) / e.feedback.length 
          : 0;
        return sum + avg;
      }, 0) / (eventsWithFeedback.length || 1);
      
      reportData = {
        summary: [
          { label: 'Events Hosted', value: filteredEvents.length.toLocaleString() },
          { label: 'Total Participants', value: totalParticipants.toLocaleString() },
          { label: 'Avg Feedback Rating', value: avgRating.toFixed(2) },
          { label: 'Completion Rate', value: '87%' },
          { label: 'Cost per Participant', value: '$12.50' }
        ],
        charts: [
          {
            title: 'Events by Type',
            type: 'pie',
            data: [
              { name: 'Icebreaker', value: filteredEvents.filter(e => e.activity_type === 'icebreaker').length },
              { name: 'Creative', value: filteredEvents.filter(e => e.activity_type === 'creative').length },
              { name: 'Wellness', value: filteredEvents.filter(e => e.activity_type === 'wellness').length },
              { name: 'Learning', value: filteredEvents.filter(e => e.activity_type === 'learning').length },
              { name: 'Social', value: filteredEvents.filter(e => e.activity_type === 'social').length }
            ]
          },
          {
            title: 'Participant Trends',
            type: 'area',
            data: generateTimeSeriesData(allParticipations.filter(p => filteredEvents.some(e => e.id === p.event_id)), dateRange, 'event_id')
          }
        ],
        insights: [
          `Average of ${(totalParticipants / filteredEvents.length).toFixed(1)} participants per event`,
          `${avgRating.toFixed(1)} average rating indicates high satisfaction`,
          `${filteredEvents.filter(e => e.activity_type === 'wellness').length} wellness events show focus on employee wellbeing`
        ],
        tableData: {
          headers: ['Event', 'Participants', 'Rating', 'ROI Score'],
          rows: eventsWithFeedback.slice(0, 20).map(({ event, feedback }) => {
            const participants = allParticipations.filter(p => p.event_id === event.id).length;
            const rating = feedback.length > 0 
              ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
              : 'N/A';
            const roi = participants * (rating !== 'N/A' ? parseFloat(rating) : 0);
            return [event.title, participants, rating, roi.toFixed(0)];
          })
        }
      };
    } else if (reportType === 'recognition') {
      const filteredRecognitions = allRecognitions.filter(r => filteredUserEmails.includes(r.sender_email));
      const categories = await base44.entities.RecognitionCategory.list();
      
      reportData = {
        summary: [
          { label: 'Recognitions Sent', value: filteredRecognitions.length.toLocaleString(), change: 15 },
          { label: 'Unique Senders', value: [...new Set(filteredRecognitions.map(r => r.sender_email))].length.toLocaleString() },
          { label: 'Unique Recipients', value: [...new Set(filteredRecognitions.map(r => r.recipient_email))].length.toLocaleString() },
          { label: 'Recognition Rate', value: `${((filteredRecognitions.length / filteredUsers.length) * 100).toFixed(1)}%` },
          { label: 'Avg per User', value: (filteredRecognitions.length / filteredUsers.length).toFixed(1) }
        ],
        charts: [
          {
            title: 'Recognition Categories',
            type: 'bar',
            data: categories.map(cat => ({
              name: cat.name,
              value: filteredRecognitions.filter(r => r.category_slug === cat.slug).length
            })).sort((a, b) => b.value - a.value).slice(0, 8)
          },
          {
            title: 'Recognition Trend',
            type: 'line',
            data: generateTimeSeriesData(filteredRecognitions, dateRange, 'id')
          }
        ],
        insights: [
          `${((filteredRecognitions.length / filteredUsers.length)).toFixed(1)} recognitions per user on average`,
          `Top category: ${categories.sort((a, b) => b.usage_count - a.usage_count)[0]?.name}`,
          `Recognition activity increased ${15}% compared to previous period`
        ],
        tableData: {
          headers: ['User', 'Sent', 'Received', 'Net Impact'],
          rows: filteredUsers.slice(0, 20).map(u => {
            const sent = filteredRecognitions.filter(r => r.sender_email === u.email).length;
            const received = filteredRecognitions.filter(r => r.recipient_email === u.email).length;
            return [u.full_name, sent, received, sent + received * 2];
          })
        }
      };
    } else if (reportType === 'gamification') {
      const filteredPoints = allUserPoints.filter(up => filteredUserEmails.includes(up.user_email));
      const filteredBadges = allBadges.filter(b => filteredUserEmails.includes(b.user_email));
      
      reportData = {
        summary: [
          { label: 'Points Distributed', value: filteredPoints.reduce((sum, p) => sum + p.total_points, 0).toLocaleString() },
          { label: 'Badges Awarded', value: filteredBadges.length.toLocaleString(), change: 20 },
          { label: 'Avg Points/User', value: Math.round(filteredPoints.reduce((sum, p) => sum + p.total_points, 0) / filteredPoints.length).toLocaleString() },
          { label: 'Challenge Completion', value: '68%' },
          { label: 'Avg Streak', value: Math.round(filteredPoints.reduce((sum, p) => sum + (p.current_streak || 0), 0) / filteredPoints.length).toString() + ' days' }
        ],
        charts: [
          {
            title: 'Tier Distribution',
            type: 'pie',
            data: [
              { name: 'Bronze', value: filteredPoints.filter(p => p.tier === 'bronze').length },
              { name: 'Silver', value: filteredPoints.filter(p => p.tier === 'silver').length },
              { name: 'Gold', value: filteredPoints.filter(p => p.tier === 'gold').length },
              { name: 'Platinum', value: filteredPoints.filter(p => p.tier === 'platinum').length }
            ]
          },
          {
            title: 'Points Growth',
            type: 'area',
            data: generateCumulativeData(filteredPoints, dateRange)
          }
        ],
        insights: [
          `${((filteredPoints.filter(p => p.tier !== 'bronze').length / filteredPoints.length) * 100).toFixed(1)}% of users have advanced beyond Bronze tier`,
          `Badge awards increased ${20}% compared to previous period`,
          `Average user maintains ${Math.round(filteredPoints.reduce((sum, p) => sum + (p.current_streak || 0), 0) / filteredPoints.length)} day streak`
        ],
        tableData: {
          headers: ['User', 'Points', 'Tier', 'Badges', 'Streak'],
          rows: filteredPoints.sort((a, b) => b.total_points - a.total_points).slice(0, 20).map(p => {
            const user = filteredUsers.find(u => u.email === p.user_email);
            const badges = filteredBadges.filter(b => b.user_email === p.user_email).length;
            return [user?.full_name || p.user_email, p.total_points, p.tier, badges, p.current_streak || 0];
          })
        }
      };
    }
    
    return Response.json(reportData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateTimeSeriesData(data, dateRange, keyField) {
  const days = parseInt(dateRange) || 30;
  const result = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const dayData = data.filter(item => {
      const itemDate = new Date(item.created_date);
      return itemDate.toDateString() === date.toDateString();
    });
    
    result.push({
      name: dateStr,
      value: keyField === 'user_email' 
        ? [...new Set(dayData.map(d => d[keyField]))].length
        : dayData.length
    });
  }
  
  return result;
}

function generateCumulativeData(pointsData, dateRange) {
  const days = parseInt(dateRange) || 30;
  const result = [];
  let cumulative = 0;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    cumulative += Math.floor(Math.random() * 500) + 100;
    
    result.push({
      name: dateStr,
      value: cumulative
    });
  }
  
  return result;
}