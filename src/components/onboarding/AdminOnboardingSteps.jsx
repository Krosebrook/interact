/**
 * ADMIN-SPECIFIC ONBOARDING STEPS
 * Interactive components for admin/facilitator onboarding
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Trophy,
  BarChart3,
  Shield,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminWelcomeContent() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Welcome to Your Admin Command Center
        </h3>
        <p className="text-slate-600">
          You have the power to drive employee engagement, foster culture, and build stronger teams.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AdminFeatureCard
          icon={Calendar}
          title="Event Management"
          description="Schedule & automate team activities"
        />
        <AdminFeatureCard
          icon={Trophy}
          title="Gamification"
          description="Configure badges, points & rewards"
        />
        <AdminFeatureCard
          icon={BarChart3}
          title="Analytics"
          description="Track engagement & ROI"
        />
        <AdminFeatureCard
          icon={Users}
          title="Team Building"
          description="Organize teams & channels"
        />
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-slate-700">
            <strong>Estimated time:</strong> 30-40 minutes to complete full setup
          </p>
          <p className="text-xs text-slate-500 mt-1">
            You can pause anytime and resume later
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ActivityLibraryGuide() {
  const activityTypes = [
    { type: 'Icebreaker', icon: '🎯', color: 'bg-blue-100 text-blue-700', count: 12 },
    { type: 'Creative', icon: '🎨', color: 'bg-purple-100 text-purple-700', count: 8 },
    { type: 'Wellness', icon: '🧘', color: 'bg-emerald-100 text-emerald-700', count: 10 },
    { type: 'Learning', icon: '📚', color: 'bg-cyan-100 text-cyan-700', count: 15 },
    { type: 'Social', icon: '🎉', color: 'bg-pink-100 text-pink-700', count: 9 },
    { type: 'Competitive', icon: '🏆', color: 'bg-amber-100 text-amber-700', count: 7 }
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-600">
        Browse our curated library of engagement activities designed for remote teams.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {activityTypes.map((activity, idx) => (
          <motion.div
            key={activity.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-3 rounded-lg ${activity.color} border border-current/20`}
          >
            <div className="text-2xl mb-1">{activity.icon}</div>
            <p className="font-semibold text-sm">{activity.type}</p>
            <p className="text-xs opacity-75">{activity.count} activities</p>
          </motion.div>
        ))}
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">Pro Tip</p>
              <p className="text-xs text-slate-600 mt-1">
                Click "Duplicate" on any activity to customize it for your team's unique culture
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function GamificationSetupGuide() {
  const features = [
    {
      title: 'Badges',
      description: 'Create achievement badges with custom criteria',
      icon: Trophy,
      example: 'Example: "First Event" badge for attending first activity'
    },
    {
      title: 'Points System',
      description: 'Reward actions with customizable point values',
      icon: Target,
      example: 'Example: 10 points for attendance, 5 for feedback'
    },
    {
      title: 'Challenges',
      description: 'Set personal and team goals to drive engagement',
      icon: CheckCircle2,
      example: 'Example: "Attend 3 events this week"'
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-600">
        Gamification increases engagement by 48%. Configure these elements to motivate your team:
      </p>

      <div className="space-y-3">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-int-orange/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-int-orange" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                      <p className="text-xs text-slate-500 italic">{feature.example}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AdminFeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-int-orange to-int-gold flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h4 className="font-semibold text-slate-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  );
}