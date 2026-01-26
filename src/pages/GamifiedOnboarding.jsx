import { useUserData } from '@/components/hooks/useUserData';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import GamifiedOnboardingQuest from '../components/onboarding/GamifiedOnboardingQuest';
import AIOnboardingBuddy from '../components/ai/AIOnboardingBuddy';
import { Sparkles, Trophy } from 'lucide-react';

export default function GamifiedOnboarding() {
  const { user, loading } = useUserData();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-int-orange/5 to-purple-500/5 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-int-orange to-purple-500 text-white px-6 py-3 rounded-full mb-4">
            <Trophy className="h-5 w-5" />
            <span className="font-bold">Welcome to INTeract!</span>
          </div>
          <h1 className="text-4xl font-bold text-int-navy mb-2">
            Start Your Journey
          </h1>
          <p className="text-slate-600 text-lg">
            Complete quests, earn points, and get help from your AI buddy
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GamifiedOnboardingQuest userEmail={user.email} />
          <AIOnboardingBuddy userEmail={user.email} userName={user.full_name} />
        </div>
        
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Quick Tips for Success</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✨ <strong>Earn points fast:</strong> Complete your profile, send recognition, and register for events</li>
                <li>🏆 <strong>Unlock badges:</strong> Each milestone awards you exclusive badges</li>
                <li>💬 <strong>Ask your AI buddy:</strong> Get instant answers to any questions about the platform</li>
                <li>🎯 <strong>Complete the quest:</strong> Finish all tasks to earn 600+ points and the "Quick Learner" badge</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}