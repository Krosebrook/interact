import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Calendar } from 'lucide-react';

export default function CohortAnalysis() {
  const { data: users } = useQuery({
    queryKey: ['all-users-cohort'],
    queryFn: () => base44.entities.User.list('created_date', 500)
  });

  const { data: events } = useQuery({
    queryKey: ['analytics-events-cohort'],
    queryFn: async () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return await base44.entities.AnalyticsEvent.list('-created_date', 10000);
    }
  });

  const cohortData = useMemo(() => {
    if (!users || !events) return [];

    // Group users by cohort (month they joined)
    const cohorts = {};
    
    users.forEach(user => {
      const cohort = getCohort(user.created_date);
      if (!cohorts[cohort]) {
        cohorts[cohort] = {
          cohort,
          users: [],
          totalUsers: 0
        };
      }
      cohorts[cohort].users.push(user.email);
      cohorts[cohort].totalUsers += 1;
    });

    // Calculate retention for each cohort
    const today = new Date();
    const cohortArray = Object.values(cohorts)
      .sort((a, b) => b.cohort.localeCompare(a.cohort))
      .slice(0, 12); // Last 12 months

    cohortArray.forEach(cohort => {
      const cohortDate = new Date(cohort.cohort + '-01');
      
      // Calculate retention by month since joining
      cohort.retention = {};
      for (let month = 0; month <= 6; month++) {
        const targetDate = new Date(cohortDate);
        targetDate.setMonth(targetDate.getMonth() + month);
        
        if (targetDate > today) break;

        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

        const activeUsers = new Set(
          events
            .filter(e => {
              const eventDate = new Date(e.created_date);
              return cohort.users.includes(e.user_email) &&
                     eventDate >= startOfMonth &&
                     eventDate <= endOfMonth;
            })
            .map(e => e.user_email)
        );

        cohort.retention[`month_${month}`] = {
          count: activeUsers.size,
          percentage: ((activeUsers.size / cohort.totalUsers) * 100).toFixed(1)
        };
      }
    });

    return cohortArray;
  }, [users, events]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Cohort Retention Analysis
        </CardTitle>
        <CardDescription>
          User retention by signup month (% of cohort still active)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Cohort</th>
                <th className="text-left p-2">Users</th>
                <th className="text-center p-2">Month 0</th>
                <th className="text-center p-2">Month 1</th>
                <th className="text-center p-2">Month 2</th>
                <th className="text-center p-2">Month 3</th>
                <th className="text-center p-2">Month 4</th>
                <th className="text-center p-2">Month 5</th>
                <th className="text-center p-2">Month 6</th>
              </tr>
            </thead>
            <tbody>
              {cohortData.map(cohort => (
                <tr key={cohort.cohort} className="border-b hover:bg-slate-50">
                  <td className="p-2 font-medium">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {cohort.cohort}
                  </td>
                  <td className="p-2">{cohort.totalUsers}</td>
                  {[0, 1, 2, 3, 4, 5, 6].map(month => {
                    const data = cohort.retention[`month_${month}`];
                    if (!data) return <td key={month} className="p-2 text-center text-slate-300">-</td>;
                    
                    const pct = parseFloat(data.percentage);
                    return (
                      <td key={month} className="p-2 text-center">
                        <Badge
                          variant="outline"
                          className={`${
                            pct >= 70 ? 'bg-green-50 text-green-700 border-green-300' :
                            pct >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                            'bg-red-50 text-red-700 border-red-300'
                          }`}
                        >
                          {data.percentage}%
                        </Badge>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-700">
                {calculateAvgRetention(cohortData, 3)}%
              </div>
              <div className="text-sm text-green-600">3-Month Avg Retention</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-700">
                {calculateAvgRetention(cohortData, 6)}%
              </div>
              <div className="text-sm text-blue-600">6-Month Avg Retention</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {calculateRetentionTrend(cohortData)}%
              </div>
              <div className="text-sm text-purple-600">Retention Trend</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function getCohort(createdDate) {
  const date = new Date(createdDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function calculateAvgRetention(cohortData, month) {
  const retentions = cohortData
    .map(c => c.retention[`month_${month}`]?.percentage)
    .filter(p => p !== undefined)
    .map(p => parseFloat(p));
  
  if (retentions.length === 0) return 0;
  return (retentions.reduce((sum, p) => sum + p, 0) / retentions.length).toFixed(1);
}

function calculateRetentionTrend(cohortData) {
  if (cohortData.length < 2) return 0;
  
  const latest = parseFloat(cohortData[0].retention.month_1?.percentage || 0);
  const previous = parseFloat(cohortData[1].retention.month_1?.percentage || 0);
  
  return (latest - previous).toFixed(1);
}