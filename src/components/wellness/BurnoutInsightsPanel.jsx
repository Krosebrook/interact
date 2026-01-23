import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingDown, 
  Moon, 
  Calendar,
  Heart,
  Users,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BurnoutInsightsPanel({ teamView = false }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: burnoutRisks, isLoading } = useQuery({
    queryKey: ['burnoutRisks', teamView, user?.email],
    queryFn: async () => {
      if (teamView && user?.role === 'admin') {
        // Get all team members' risks
        const profiles = await base44.entities.UserProfile.filter({
          manager_email: user.email
        });
        
        const risks = [];
        for (const profile of profiles) {
          const risk = await base44.entities.BurnoutRisk.filter({
            user_email: profile.user_email,
            created_date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
          });
          if (risk.length > 0) {
            risks.push({ ...risk[0], profile });
          }
        }
        return risks.sort((a, b) => b.risk_score - a.risk_score);
      } else {
        // Get current user's risk
        const risks = await base44.entities.BurnoutRisk.filter({
          user_email: user.email,
          created_date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
        });
        return risks;
      }
    },
    enabled: !!user
  });

  const riskLevelConfig = {
    low: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Low Risk' },
    moderate: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Moderate Risk' },
    high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: 'High Risk' },
    critical: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Critical Risk' }
  };

  const factorIcons = {
    late_night_activity: Moon,
    weekend_work: Calendar,
    engagement_decline: TrendingDown,
    low_recognition: Heart,
    social_isolation: Users
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Activity className="h-5 w-5 animate-spin" />
            <span>Analyzing wellness data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!burnoutRisks || burnoutRisks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {teamView ? 'Team Wellness Looks Good' : 'You\'re Doing Great!'}
          </h3>
          <p className="text-slate-600">
            {teamView 
              ? 'No significant burnout risk detected in your team'
              : 'No burnout risk indicators detected. Keep up the healthy work-life balance!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (teamView) {
    // Manager view: Show team members at risk
    const criticalRisks = burnoutRisks.filter(r => r.risk_level === 'critical');
    const highRisks = burnoutRisks.filter(r => r.risk_level === 'high');

    return (
      <div className="space-y-4">
        {criticalRisks.length > 0 && (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="h-5 w-5" />
                Critical Attention Needed ({criticalRisks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalRisks.map((risk, idx) => (
                <TeamMemberRiskCard key={idx} risk={risk} />
              ))}
            </CardContent>
          </Card>
        )}

        {highRisks.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertTriangle className="h-5 w-5" />
                Monitor Closely ({highRisks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {highRisks.map((risk, idx) => (
                <TeamMemberRiskCard key={idx} risk={risk} />
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {burnoutRisks[0]?.manager_interventions?.map((intervention, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <div className={`p-2 rounded-lg ${
                  intervention.urgency === 'urgent' ? 'bg-red-100' :
                  intervention.urgency === 'soon' ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{intervention.message}</p>
                  <p className="text-sm text-slate-600 mt-1">{intervention.action}</p>
                </div>
                <Badge variant={intervention.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                  {intervention.urgency}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Individual view: Show personal wellness insights
  const currentRisk = burnoutRisks[0];
  const config = riskLevelConfig[currentRisk.risk_level];
  const RiskIcon = config.icon;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Wellness Check
              </CardTitle>
              <CardDescription>
                Based on your activity patterns over the last 7 days
              </CardDescription>
            </div>
            <Badge className={config.color}>
              <RiskIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Wellness Score</span>
              <span className="text-sm font-semibold text-slate-900">
                {100 - currentRisk.risk_score}/100
              </span>
            </div>
            <Progress value={100 - currentRisk.risk_score} className="h-2" />
          </div>

          {/* Contributing Factors */}
          {currentRisk.contributing_factors?.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Areas to Watch</h4>
              <div className="space-y-2">
                {currentRisk.contributing_factors.map((factor, idx) => {
                  const FactorIcon = factorIcons[factor.factor] || Activity;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <FactorIcon className="h-5 w-5 text-slate-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {factor.description}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        factor.severity === 'high' ? 'border-red-300 text-red-700' :
                        factor.severity === 'medium' ? 'border-orange-300 text-orange-700' :
                        'border-slate-300 text-slate-700'
                      }>
                        {factor.severity}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personalized Interventions */}
          {currentRisk.employee_interventions?.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Suggested Actions</h4>
              <div className="space-y-3">
                {currentRisk.employee_interventions.map((intervention, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <p className="text-sm text-slate-900 mb-2">{intervention.message}</p>
                    {intervention.action_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={intervention.action_url}>Take Action</a>
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TeamMemberRiskCard({ risk }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
      <div className="flex-1">
        <h4 className="font-semibold text-slate-900">{risk.profile?.full_name || risk.user_email}</h4>
        <p className="text-sm text-slate-600 mt-1">
          {risk.contributing_factors?.length || 0} risk factors identified
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {risk.contributing_factors?.slice(0, 2).map((factor, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {factor.factor.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-slate-900">{risk.risk_score}</div>
        <div className="text-xs text-slate-500">risk score</div>
      </div>
    </div>
  );
}