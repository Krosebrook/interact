import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  Shield,
  Users,
  Calendar,
  Award,
  Target,
  Gift,
  BarChart3,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const ROLE_GUIDES = {
  admin: {
    title: 'Admin Quick Start Guide',
    icon: Shield,
    color: 'from-red-500 to-red-600',
    steps: [
      {
        number: 1,
        title: 'Invite Your Team',
        description: 'Add users with appropriate roles (admin, facilitator, participant)',
        action: 'Go to User Management',
        page: 'UserManagement',
        icon: Users,
        estimatedTime: '5 min'
      },
      {
        number: 2,
        title: 'Configure Gamification',
        description: 'Set up points, badges, and rewards to match your company culture',
        action: 'Configure Settings',
        page: 'GamificationSettings',
        icon: Award,
        estimatedTime: '10 min'
      },
      {
        number: 3,
        title: 'Create First Rewards',
        description: 'Add tangible rewards employees can redeem with points',
        action: 'Add Rewards',
        page: 'GamificationAdmin',
        icon: Gift,
        estimatedTime: '5 min'
      },
      {
        number: 4,
        title: 'Schedule Kickoff Event',
        description: 'Plan your first team activity to introduce the platform',
        action: 'Schedule Event',
        page: 'Calendar',
        icon: Calendar,
        estimatedTime: '3 min'
      },
      {
        number: 5,
        title: 'Monitor Engagement',
        description: 'Use the analytics dashboard to track adoption and participation',
        action: 'View Analytics',
        page: 'Analytics',
        icon: BarChart3,
        estimatedTime: 'Ongoing'
      }
    ]
  },
  facilitator: {
    title: 'Facilitator Quick Start',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    steps: [
      {
        number: 1,
        title: 'Explore Activity Library',
        description: 'Browse 50+ pre-built activities for team building and engagement',
        action: 'Browse Activities',
        page: 'Activities',
        icon: Sparkles,
        estimatedTime: '3 min'
      },
      {
        number: 2,
        title: 'Schedule Your First Event',
        description: 'Pick an activity and schedule it for your team',
        action: 'Create Event',
        page: 'Calendar',
        icon: Calendar,
        estimatedTime: '5 min'
      },
      {
        number: 3,
        title: 'Create or Join a Team',
        description: 'Build your team to compete in challenges together',
        action: 'Manage Teams',
        page: 'Teams',
        icon: Users,
        estimatedTime: '2 min'
      },
      {
        number: 4,
        title: 'Launch a Challenge',
        description: 'Motivate your team with skill-building or wellness challenges',
        action: 'Create Challenge',
        page: 'Challenges',
        icon: Target,
        estimatedTime: '3 min'
      },
      {
        number: 5,
        title: 'Track Team Performance',
        description: 'Monitor participation and engagement through your facilitator dashboard',
        action: 'View Dashboard',
        page: 'FacilitatorDashboard',
        icon: BarChart3,
        estimatedTime: 'Ongoing'
      }
    ]
  },
  participant: {
    title: 'Your Quick Start Guide',
    icon: Sparkles,
    color: 'from-int-orange to-purple-500',
    steps: [
      {
        number: 1,
        title: 'Complete Your Profile',
        description: 'Add your photo, bio, skills, and interests',
        action: 'Edit Profile',
        page: 'UserProfile',
        icon: Users,
        estimatedTime: '3 min',
        points: 50
      },
      {
        number: 2,
        title: 'Join a Team',
        description: 'Find teammates with shared interests or join your department team',
        action: 'Browse Teams',
        page: 'Teams',
        icon: Users,
        estimatedTime: '2 min',
        points: 30
      },
      {
        number: 3,
        title: 'Give Your First Recognition',
        description: 'Celebrate a colleague with a public shoutout',
        action: 'Give Recognition',
        page: 'Recognition',
        icon: Gift,
        estimatedTime: '1 min',
        points: 20
      },
      {
        number: 4,
        title: 'RSVP for an Event',
        description: 'Register for an upcoming team activity',
        action: 'View Calendar',
        page: 'Calendar',
        icon: Calendar,
        estimatedTime: '1 min',
        points: 10
      },
      {
        number: 5,
        title: 'Join a Challenge',
        description: 'Take on a personal or team challenge to earn extra points',
        action: 'Browse Challenges',
        page: 'Challenges',
        icon: Target,
        estimatedTime: '2 min',
        points: 40
      }
    ]
  }
};

export default function RoleBasedQuickStart({ userRole, onStepComplete }) {
  const guide = ROLE_GUIDES[userRole] || ROLE_GUIDES.participant;
  const Icon = guide.icon;

  return (
    <Card className="border-2 border-int-orange/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${guide.color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-int-navy">{guide.title}</div>
            <div className="text-sm text-slate-600 font-normal">Complete these steps to get started</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {guide.steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <Card key={step.number} className="border border-slate-200 hover:border-int-orange/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-int-orange/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-int-orange">{step.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-slate-900">{step.title}</h4>
                      <Badge variant="outline" className="text-xs">{step.estimatedTime}</Badge>
                      {step.points && (
                        <Badge className="bg-int-orange text-white text-xs">
                          +{step.points} pts
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                    <Link to={createPageUrl(step.page)}>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto gap-2">
                        <StepIcon className="h-3 w-3" />
                        {step.action}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Completion Reward */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 mb-1">Complete All Steps</h4>
            <p className="text-sm text-slate-600 mb-2">
              Finish onboarding to earn the "Quick Learner" badge
            </p>
            {userRole === 'participant' && (
              <Badge className="bg-green-600 text-white">
                Total Reward: 150 points + badge
              </Badge>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}