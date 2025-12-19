/**
 * FACILITATOR-SPECIFIC ONBOARDING STEPS
 * Interactive components for facilitator onboarding
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Sparkles,
  BarChart3,
  CheckCircle2,
  Target,
  MessageSquare,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export function FacilitatorWelcomeContent() {
  const capabilities = [
    { icon: '🎯', text: 'Host interactive events', color: 'from-blue-400 to-blue-600' },
    { icon: '📊', text: 'Track real-time participation', color: 'from-emerald-400 to-emerald-600' },
    { icon: '💡', text: 'Get AI facilitation tips', color: 'from-purple-400 to-purple-600' },
    { icon: '🎉', text: 'Create memorable moments', color: 'from-pink-400 to-pink-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Welcome, Event Facilitator!
        </h3>
        <p className="text-slate-600">
          You're the key to creating engaging, memorable team experiences.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {capabilities.map((cap, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center"
          >
            <div className={`text-3xl mb-2 bg-gradient-to-br ${cap.color} bg-clip-text text-transparent`}>
              {cap.icon}
            </div>
            <p className="text-sm font-medium text-slate-700">{cap.text}</p>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-int-orange/10 to-int-gold/10 border-int-orange/30">
        <CardContent className="pt-4">
          <p className="text-sm text-slate-700 text-center">
            <strong>Let's get you set up!</strong> This quick tour will show you the tools you need.
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">
            Takes about 15-20 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function FacilitatorDashboardGuide() {
  const sections = [
    {
      title: 'Upcoming Events',
      icon: Calendar,
      description: 'Your scheduled events and preparation status',
      color: 'bg-blue-500'
    },
    {
      title: 'Pre-Event Checklist',
      icon: CheckCircle2,
      description: 'Tasks to complete before your event starts',
      color: 'bg-emerald-500'
    },
    {
      title: 'Live Event Tools',
      icon: Users,
      description: 'Monitor participation, Q&A, and engagement in real-time',
      color: 'bg-purple-500'
    },
    {
      title: 'Post-Event Analytics',
      icon: BarChart3,
      description: 'Review feedback and engagement metrics',
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-600">
        Your dashboard gives you everything you need to facilitate engaging events:
      </p>

      <div className="space-y-3">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{section.title}</h4>
                      <p className="text-sm text-slate-600">{section.description}</p>
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
              <p className="text-sm font-medium text-slate-900">Pro Tip</p>
              <p className="text-xs text-slate-600 mt-1">
                Use the AI assistant during live events for real-time suggestions and tips
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}