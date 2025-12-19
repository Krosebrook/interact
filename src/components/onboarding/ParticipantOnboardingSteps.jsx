/**
 * PARTICIPANT-SPECIFIC ONBOARDING STEPS
 * Interactive components for participant onboarding
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Trophy, 
  Heart,
  Gift,
  Users,
  Sparkles,
  Star,
  Target,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export function ParticipantWelcomeContent() {
  const benefits = [
    { icon: '🎉', text: 'Join fun team events' },
    { icon: '🏆', text: 'Earn points & badges' },
    { icon: '💬', text: 'Give & receive recognition' },
    { icon: '🎁', text: 'Redeem awesome rewards' },
    { icon: '🤝', text: 'Connect with teammates' },
    { icon: '📈', text: 'Grow your skills' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">👋</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Welcome to INTeract!
        </h3>
        <p className="text-slate-600">
          Your hub for team connection, personal growth, and fun at work.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {benefits.map((benefit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center"
          >
            <div className="text-2xl mb-1">{benefit.icon}</div>
            <p className="text-xs font-medium text-slate-700">{benefit.text}</p>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-int-orange/10 to-int-gold/10 border-int-orange/30">
        <CardContent className="pt-4">
          <p className="text-sm text-slate-700 text-center">
            <strong>Let's get started!</strong> This quick tour will help you make the most of your experience.
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">
            Takes about 5 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function GamificationExplainerContent() {
  const elements = [
    {
      type: 'Points',
      icon: Star,
      color: 'from-amber-400 to-yellow-500',
      earnBy: ['Attending events', 'Giving feedback', 'Sending recognition'],
      value: '10-50 pts per action'
    },
    {
      type: 'Badges',
      icon: Trophy,
      color: 'from-purple-500 to-pink-500',
      earnBy: ['Completing milestones', 'Consistent participation', 'Team contributions'],
      value: 'Unlock achievements'
    },
    {
      type: 'Challenges',
      icon: Target,
      color: 'from-emerald-500 to-teal-500',
      earnBy: ['Accepting personal goals', 'Completing streaks', 'Team competitions'],
      value: 'Bonus rewards'
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-center mb-6">
        Engagement is more fun when you're earning rewards! Here's how it works:
      </p>

      <div className="space-y-4">
        {elements.map((element, idx) => {
          const Icon = element.icon;
          
          return (
            <motion.div
              key={element.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
            >
              <Card className="overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${element.color}`} />
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${element.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{element.type}</h4>
                        <Badge variant="outline" className="text-xs">
                          {element.value}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">How to earn:</p>
                      <ul className="space-y-1">
                        {element.earnBy.map((action, i) => (
                          <li key={i} className="text-xs text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">Quick Start</p>
              <p className="text-xs text-slate-600 mt-1">
                RSVP to your first event to earn 10 points and start your journey!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RecognitionGuideContent() {
  const categories = [
    { name: 'Teamwork', icon: '🤝', example: 'Helped debug critical issue' },
    { name: 'Innovation', icon: '💡', example: 'Proposed creative solution' },
    { name: 'Leadership', icon: '🌟', example: 'Mentored new team member' },
    { name: 'Excellence', icon: '⭐', example: 'Delivered exceptional work' }
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-600">
        Recognition builds culture. Use it to celebrate your teammates' contributions.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 rounded-lg bg-pink-50 border border-pink-200"
          >
            <div className="text-2xl mb-1">{cat.icon}</div>
            <p className="font-semibold text-sm text-slate-900">{cat.name}</p>
            <p className="text-xs text-slate-500 mt-1">{cat.example}</p>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <CardContent className="pt-4">
          <p className="text-sm text-slate-700">
            <strong>Pro Tip:</strong> Specific recognition is more meaningful. 
            Instead of "Great job!" try "Your presentation style made complex data easy to understand!"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminFeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-int-orange to-int-gold flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h4 className="font-semibold text-slate-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  );
}