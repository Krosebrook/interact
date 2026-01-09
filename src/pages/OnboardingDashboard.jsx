import React from 'react';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GuidedOnboardingWizard from '../components/onboarding/GuidedOnboardingWizard';
import PersonalizedTaskList from '../components/onboarding/PersonalizedTaskList';
import AIConnectionSuggestions from '../components/onboarding/AIConnectionSuggestions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket } from 'lucide-react';

export default function OnboardingDashboard() {
  const { user, loading } = useUserData(true);

  if (loading) {
    return <LoadingSpinner message="Loading onboarding..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <Card className="border-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardContent className="py-8">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Welcome to INTeract, {user?.full_name}! 🎉</h1>
          </div>
          <p className="text-lg text-purple-100 mb-4">
            Let's get you started with everything you need to thrive in our remote-first culture.
          </p>
          <div className="flex items-center gap-2 text-sm text-purple-100">
            <Sparkles className="h-4 w-4" />
            AI-powered personalized onboarding experience
          </div>
        </CardContent>
      </Card>

      {/* Main Onboarding Wizard */}
      <GuidedOnboardingWizard
        user={user}
        onComplete={() => {
          window.location.href = '/pages/Dashboard';
        }}
      />

      {/* Side-by-side Additional Resources */}
      <div className="grid md:grid-cols-2 gap-6">
        <PersonalizedTaskList user={user} />
        <AIConnectionSuggestions user={user} />
      </div>

      {/* Quick Links */}
      <Card>
        <CardContent className="py-6">
          <h3 className="font-semibold text-slate-900 mb-4">Quick Links to Get Started</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/pages/UserProfile'}
              className="h-auto py-3 flex-col"
            >
              <span className="text-2xl mb-1">👤</span>
              <span className="text-xs">My Profile</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/pages/ParticipantPortal'}
              className="h-auto py-3 flex-col"
            >
              <span className="text-2xl mb-1">📅</span>
              <span className="text-xs">Events</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/pages/Channels'}
              className="h-auto py-3 flex-col"
            >
              <span className="text-2xl mb-1">💬</span>
              <span className="text-xs">Channels</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/pages/Recognition'}
              className="h-auto py-3 flex-col"
            >
              <span className="text-2xl mb-1">🌟</span>
              <span className="text-xs">Recognition</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}