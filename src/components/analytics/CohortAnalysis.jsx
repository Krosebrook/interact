/**
 * Cohort Analysis
 * Track how user cohorts progress over time
 */

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CohortAnalysis({ filters }) {
  const { data: cohortData, isLoading } = useQuery({
    queryKey: ['cohorts', filters],
    queryFn: () => fetchCohortData(filters)
  });

  if (isLoading) return <div>Loading cohorts...</div>;
  if (!cohortData) return null;

  return (
    <div className="space-y-6">
      {/* Cohort Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Retention by Signup Cohort</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Cohort</th>
                  <th className="text-center py-2">Day 1</th>
                  <th className="text-center py-2">Day 7</th>
                  <th className="text-center py-2">Day 30</th>
                  <th className="text-center py-2">Day 90</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.retention_cohorts?.map((cohort, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="py-2 font-medium">{cohort.cohort_name}</td>
                    <td className="text-center py-2">
                      <RetentionCell value={cohort.day1} />
                    </td>
                    <td className="text-center py-2">
                      <RetentionCell value={cohort.day7} />
                    </td>
                    <td className="text-center py-2">
                      <RetentionCell value={cohort.day30} />
                    </td>
                    <td className="text-center py-2">
                      <RetentionCell value={cohort.day90} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Growth by Cohort */}
      <Card>
        <CardHeader>
          <CardTitle>Points Earned by Cohort Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cohortData.engagement_growth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {['Q4 2025', 'Q1 2026', 'Q2 2026'].map((cohort, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={cohort}
                  stroke={['#D97230', '#10B981', '#06B6D4'][idx]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cohort Insights */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Performing Cohort</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{cohortData.best_cohort?.name}</p>
            <p className="text-sm text-slate-600 mt-2">
              {cohortData.best_cohort?.retention_rate}% retention at 90 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Highest Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-int-orange">{cohortData.highest_growth?.growth_rate}%</p>
            <p className="text-sm text-slate-600 mt-2">{cohortData.highest_growth?.cohort_name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cohortData.cohort_comparison?.map((cohort, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{cohort.name}</p>
                  <p className="text-sm text-slate-600">{cohort.size} users</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-int-orange h-2 rounded-full"
                      style={{ width: `${cohort.engagement_percentage}%` }}
                    />
                  </div>
                  <p className="font-medium w-12 text-right">{cohort.engagement_percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RetentionCell({ value }) {
  const bgColor = value >= 80 ? 'bg-green-100' : value >= 50 ? 'bg-yellow-100' : 'bg-red-100';
  const textColor = value >= 80 ? 'text-green-900' : value >= 50 ? 'text-yellow-900' : 'text-red-900';
  return (
    <span className={`px-2 py-1 rounded font-medium ${bgColor} ${textColor}`}>
      {value}%
    </span>
  );
}

async function fetchCohortData(filters) {
  try {
    const response = await base44.functions.invoke('cohortAnalysis', { filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch cohort data:', error);
    return null;
  }
}