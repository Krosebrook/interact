/**
 * Admin Hub - Central admin navigation and quick actions
 */

import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Shield,
  Users,
  BarChart3,
  Gift,
  Settings,
  Zap,
  FileText,
  Brain,
  TrendingUp,
  Award
} from 'lucide-react';

const ADMIN_FEATURES = [
  {
    title: 'AI Admin Insights',
    description: 'Proactive engagement monitoring and interventions',
    icon: Brain,
    page: 'AIAdminDashboard',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Analytics Dashboard',
    description: 'Comprehensive engagement metrics and reports',
    icon: BarChart3,
    page: 'Analytics',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Gamification Admin',
    description: 'Manage points, badges, and rewards',
    icon: Award,
    page: 'GamificationAdmin',
    color: 'from-amber-500 to-amber-600'
  },
  {
    title: 'Rule Engine',
    description: 'Create custom gamification rules',
    icon: Zap,
    page: 'GamificationRuleBuilder',
    color: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Content Moderation',
    description: 'Review flagged content and appeals',
    icon: Shield,
    page: 'ContentModerationAdmin',
    color: 'from-red-500 to-red-600'
  },
  {
    title: 'Team Analytics',
    description: 'Team performance and comparisons',
    icon: Users,
    page: 'TeamAnalyticsDashboard',
    color: 'from-teal-500 to-teal-600'
  },
  {
    title: 'Redemption Admin',
    description: 'Manage reward redemptions and approvals',
    icon: Gift,
    page: 'RedemptionAdmin',
    color: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Settings',
    description: 'Configure platform settings',
    icon: Settings,
    page: 'Settings',
    color: 'from-slate-500 to-slate-600'
  }
];

export default function AdminHub() {
  const { user } = useUserData(true, true); // Admin only

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Admin Control Panel</h1>
        <p className="text-slate-600 mt-1">Manage engagement, analytics, and platform settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADMIN_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.page} to={createPageUrl(feature.page)}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}