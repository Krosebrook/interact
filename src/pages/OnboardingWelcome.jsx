import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useUserData } from '../components/hooks/useUserData';
import PersonalizedOnboardingFlow from '../components/onboarding/PersonalizedOnboardingFlow';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  const { user, loading } = useUserData();

  useEffect(() => {
    // Redirect if already completed onboarding
    if (!loading && user?.email) {
      const completed = localStorage.getItem(`onboarding_completed_${user.email}`);
      if (completed) {
        navigate(createPageUrl('Dashboard'));
      }
    }
  }, [user, loading, navigate]);

  const handleComplete = () => {
    if (user?.email) {
      localStorage.setItem(`onboarding_completed_${user.email}`, 'true');
    }
    navigate(createPageUrl('Dashboard'));
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  const userRole = user?.role === 'admin' ? 'admin' : user?.user_type || 'participant';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-int-orange to-purple-500 text-white px-6 py-2 rounded-full mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="font-bold">Welcome to INTeract</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-int-navy mb-3">
            Let's Get You Started! 🚀
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your personalized onboarding journey powered by AI
          </p>
        </div>

        {/* AI-Powered Personalized Flow */}
        <PersonalizedOnboardingFlow 
          userEmail={user?.email} 
          userRole={userRole}
        />

        {/* Complete Onboarding CTA */}
        <Card className="mt-8 bg-gradient-to-br from-int-navy to-blue-900 text-white border-0">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Ready to dive in?</h3>
            <p className="text-white/80 mb-4">
              You can always revisit these tips from the Help menu
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleComplete}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                I'll explore on my own
              </Button>
              <Button
                onClick={handleComplete}
                className="bg-int-orange hover:bg-[#C46322]"
              >
                Take me to my dashboard <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}