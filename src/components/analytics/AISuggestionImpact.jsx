import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Brain, Sparkles, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

const STATUS_COLORS = {
  accepted: '#10b981',
  rejected: '#ef4444',
  pending: '#f59e0b'
};

export default function AISuggestionImpact({ aiRecommendations, events }) {
  const { statusData, impactData, stats, recentSuggestions } = useMemo(() => {
    if (!aiRecommendations.length) {
      return { 
        statusData: [], 
        impactData: [], 
        stats: { total: 0, accepted: 0, rejected: 0, pending: 0, acceptanceRate: 0 },
        recentSuggestions: []
      };
    }

    // Status distribution
    const statusCounts = { accepted: 0, rejected: 0, pending: 0 };
    aiRecommendations.forEach(rec => {
      statusCounts[rec.status || 'pending']++;
    });

    const status = [
      { name: 'Accepted', value: statusCounts.accepted, color: STATUS_COLORS.accepted },
      { name: 'Rejected', value: statusCounts.rejected, color: STATUS_COLORS.rejected },
      { name: 'Pending', value: statusCounts.pending, color: STATUS_COLORS.pending }
    ];

    // Impact by event type (for accepted suggestions)
    const acceptedByType = {};
    aiRecommendations
      .filter(rec => rec.status === 'accepted')
      .forEach(rec => {
        const type = rec.activity_type || rec.suggestion_type || 'other';
        acceptedByType[type] = (acceptedByType[type] || 0) + 1;
      });

    const impact = Object.entries(acceptedByType).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }));

    // Recent suggestions
    const recent = aiRecommendations
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 5);

    // Calculate stats
    const acceptanceRate = aiRecommendations.length > 0
      ? ((statusCounts.accepted / aiRecommendations.length) * 100).toFixed(1)
      : 0;

    return {
      statusData: status,
      impactData: impact,
      stats: {
        total: aiRecommendations.length,
        accepted: statusCounts.accepted,
        rejected: statusCounts.rejected,
        pending: statusCounts.pending,
        acceptanceRate
      },
      recentSuggestions: recent
    };
  }, [aiRecommendations]);

  // Empty state
  if (stats.total === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-purple-100 mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No AI Suggestions Yet
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-md">
            Start using the AI Event Suggestion Engine to generate personalized event recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-600">Total Suggestions</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600">{stats.accepted}</div>
            <p className="text-xs text-slate-600">Accepted</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-slate-600">Pending Review</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-int-orange/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-int-orange" />
            </div>
            <div className="text-3xl font-bold text-int-orange">{stats.acceptanceRate}%</div>
            <p className="text-xs text-slate-600">Acceptance Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Suggestion Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Impact by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Accepted by Activity Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {impactData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={impactData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="type" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500">
                No accepted suggestions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Recent AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSuggestions.map((suggestion, index) => {
              const statusConfig = {
                accepted: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
              }[suggestion.status || 'pending'];

              const StatusIcon = statusConfig.icon;

              return (
                <div 
                  key={suggestion.id || index}
                  className={`p-4 rounded-lg border-2 ${statusConfig.border} ${statusConfig.bg}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {suggestion.title || suggestion.suggestion_text || 'AI Suggestion'}
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        {suggestion.description || suggestion.recommendation_reason || 'No description available'}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {suggestion.activity_type || suggestion.suggestion_type || 'General'}
                        </Badge>
                        {suggestion.engagement_score && (
                          <Badge className="bg-purple-100 text-purple-700">
                            {suggestion.engagement_score}% predicted
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                      <StatusIcon className="h-5 w-5" />
                      <span className="text-sm font-medium capitalize">{suggestion.status || 'pending'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}