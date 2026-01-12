import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUserData } from '@/components/hooks/useUserData';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TeamAutomationManager from '@/components/automation/TeamAutomationManager';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function TeamAutomation() {
  const { user, loading } = useUserData(true, false, true);
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('team_id');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-slate-600">No team selected</p>
          <Button asChild className="mt-4">
            <a href={createPageUrl('Teams')}>Back to Teams</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Button
        variant="ghost"
        asChild
        className="mb-6"
      >
        <a href={createPageUrl('Teams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </a>
      </Button>

      <TeamAutomationManager teamId={teamId} />
    </div>
  );
}