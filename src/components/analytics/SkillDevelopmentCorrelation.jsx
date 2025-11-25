import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import { GraduationCap, TrendingUp, Users, Target } from 'lucide-react';

export default function SkillDevelopmentCorrelation({ participations, userProfiles, events, activities }) {
  // Build participation-skill correlation data
  const userMetrics = {};
  
  participations.forEach(p => {
    if (!userMetrics[p.participant_email]) {
      const profile = userProfiles.find(up => up.user_email === p.participant_email);
      userMetrics[p.participant_email] = {
        email: p.participant_email,
        name: p.participant_name,
        eventsAttended: 0,
        totalEngagement: 0,
        engagementCount: 0,
        skillLevels: profile?.skill_levels || [],
        learningGoals: profile?.learning_goals || [],
        activityTypes: {}
      };
    }
    
    if (p.attended) {
      userMetrics[p.participant_email].eventsAttended += 1;
      
      // Track activity type participation
      const event = events.find(e => e.id === p.event_id);
      const activity = activities.find(a => a.id === event?.activity_id);
      if (activity?.type) {
        userMetrics[p.participant_email].activityTypes[activity.type] = 
          (userMetrics[p.participant_email].activityTypes[activity.type] || 0) + 1;
      }
    }
    
    if (p.engagement_score) {
      userMetrics[p.participant_email].totalEngagement += p.engagement_score;
      userMetrics[p.participant_email].engagementCount += 1;
    }
  });

  // Calculate averages and skill counts
  const userData = Object.values(userMetrics).map(u => ({
    ...u,
    avgEngagement: u.engagementCount > 0 ? parseFloat((u.totalEngagement / u.engagementCount).toFixed(1)) : 0,
    skillCount: u.skillLevels.length,
    advancedSkills: u.skillLevels.filter(s => s.level === 'advanced' || s.level === 'expert').length,
    goalCount: u.learningGoals.length
  }));

  // Scatter plot data: Events attended vs Engagement
  const scatterData = userData
    .filter(u => u.eventsAttended > 0 && u.avgEngagement > 0)
    .map(u => ({
      x: u.eventsAttended,
      y: u.avgEngagement,
      z: u.skillCount * 10 + 20, // Size based on skills
      name: u.name
    }));

  // Correlation: Events attended vs Skill levels
  const participationBrackets = [
    { range: '1-2 events', min: 1, max: 2 },
    { range: '3-5 events', min: 3, max: 5 },
    { range: '6-10 events', min: 6, max: 10 },
    { range: '10+ events', min: 10, max: 1000 }
  ];

  const skillCorrelation = participationBrackets.map(bracket => {
    const usersInBracket = userData.filter(u => 
      u.eventsAttended >= bracket.min && u.eventsAttended <= bracket.max
    );
    
    const avgSkills = usersInBracket.length > 0
      ? usersInBracket.reduce((sum, u) => sum + u.skillCount, 0) / usersInBracket.length
      : 0;
    
    const avgAdvanced = usersInBracket.length > 0
      ? usersInBracket.reduce((sum, u) => sum + u.advancedSkills, 0) / usersInBracket.length
      : 0;
    
    const avgEngagement = usersInBracket.length > 0
      ? usersInBracket.reduce((sum, u) => sum + u.avgEngagement, 0) / usersInBracket.length
      : 0;

    return {
      range: bracket.range,
      avgSkills: parseFloat(avgSkills.toFixed(1)),
      avgAdvanced: parseFloat(avgAdvanced.toFixed(1)),
      avgEngagement: parseFloat(avgEngagement.toFixed(1)),
      userCount: usersInBracket.length
    };
  });

  // Activity type impact on skill development
  const activitySkillImpact = {};
  userData.forEach(u => {
    Object.entries(u.activityTypes).forEach(([type, count]) => {
      if (!activitySkillImpact[type]) {
        activitySkillImpact[type] = {
          type,
          totalSkills: 0,
          totalAdvanced: 0,
          userCount: 0
        };
      }
      activitySkillImpact[type].totalSkills += u.skillCount;
      activitySkillImpact[type].totalAdvanced += u.advancedSkills;
      activitySkillImpact[type].userCount += 1;
    });
  });

  const activityImpactData = Object.values(activitySkillImpact)
    .map(a => ({
      type: a.type.charAt(0).toUpperCase() + a.type.slice(1),
      avgSkills: parseFloat((a.totalSkills / a.userCount).toFixed(1)),
      avgAdvanced: parseFloat((a.totalAdvanced / a.userCount).toFixed(1)),
      participants: a.userCount
    }))
    .sort((a, b) => b.avgSkills - a.avgSkills);

  // Most common learning goals
  const goalCounts = {};
  userData.forEach(u => {
    u.learningGoals.forEach(goal => {
      goalCounts[goal] = (goalCounts[goal] || 0) + 1;
    });
  });

  const topGoals = Object.entries(goalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([goal, count]) => ({ goal, count }));

  // Calculate correlation coefficient
  const calculateCorrelation = () => {
    const validUsers = userData.filter(u => u.eventsAttended > 0 && u.skillCount > 0);
    if (validUsers.length < 3) return 'N/A';
    
    const n = validUsers.length;
    const sumX = validUsers.reduce((s, u) => s + u.eventsAttended, 0);
    const sumY = validUsers.reduce((s, u) => s + u.skillCount, 0);
    const sumXY = validUsers.reduce((s, u) => s + (u.eventsAttended * u.skillCount), 0);
    const sumX2 = validUsers.reduce((s, u) => s + (u.eventsAttended * u.eventsAttended), 0);
    const sumY2 = validUsers.reduce((s, u) => s + (u.skillCount * u.skillCount), 0);
    
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 'N/A';
    return (numerator / denominator).toFixed(2);
  };

  const correlationCoeff = calculateCorrelation();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Correlation Coefficient</p>
              <p className="text-3xl font-bold">{correlationCoeff}</p>
              <p className="text-xs opacity-70">Events ↔ Skills</p>
            </div>
            <TrendingUp className="h-8 w-8 opacity-60" />
          </div>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <p className="text-sm text-slate-500">Users with Skills</p>
          <p className="text-2xl font-bold text-slate-900">
            {userData.filter(u => u.skillCount > 0).length}
          </p>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <p className="text-sm text-slate-500">Learning Goals Set</p>
          <p className="text-2xl font-bold text-green-600">
            {userData.filter(u => u.goalCount > 0).length}
          </p>
        </Card>
        
        <Card className="p-4 border-0 shadow-lg">
          <p className="text-sm text-slate-500">Advanced Skill Users</p>
          <p className="text-2xl font-bold text-purple-600">
            {userData.filter(u => u.advancedSkills > 0).length}
          </p>
        </Card>
      </div>

      {/* Scatter Plot */}
      <Card className="p-6 border-0 shadow-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Participation vs Engagement (bubble size = skill count)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="x" 
                  name="Events Attended" 
                  stroke="#64748b"
                  label={{ value: 'Events Attended', position: 'bottom', offset: -5 }}
                />
                <YAxis 
                  dataKey="y" 
                  name="Avg Engagement" 
                  stroke="#64748b" 
                  domain={[0, 10]}
                  label={{ value: 'Avg Engagement', angle: -90, position: 'left' }}
                />
                <ZAxis dataKey="z" range={[20, 200]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-slate-500">Events: {data.x}</p>
                          <p className="text-sm text-slate-500">Engagement: {data.y}/10</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-slate-500">
              Not enough participation data
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Development by Participation */}
        <Card className="p-6 border-0 shadow-lg">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              Skills by Participation Level
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillCorrelation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgSkills" fill="#6366f1" name="Avg Skills" />
                <Bar dataKey="avgAdvanced" fill="#8b5cf6" name="Avg Advanced" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Type Impact */}
        <Card className="p-6 border-0 shadow-lg">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Activity Type Impact on Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityImpactData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="type" type="category" stroke="#64748b" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgSkills" fill="#10b981" name="Avg Skills" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Learning Goals */}
      <Card className="p-6 border-0 shadow-lg">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Most Common Learning Goals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-wrap gap-2">
            {topGoals.map((item, i) => (
              <Badge 
                key={item.goal}
                className={`text-sm py-1.5 px-3 ${
                  i < 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.goal} ({item.count})
              </Badge>
            ))}
            {topGoals.length === 0 && (
              <p className="text-slate-500">No learning goals data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}