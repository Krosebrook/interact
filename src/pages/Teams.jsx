import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, Plus } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useUserData } from '../components/hooks/useUserData.jsx';
import { useTeamData } from '../components/hooks/useTeamData';
import { useTeamActions } from '../components/teams/useTeamActions';
import MyTeamCard from '../components/teams/MyTeamCard';
import TeamCard from '../components/teams/TeamCard';
import CreateTeamDialog from '../components/teams/CreateTeamDialog';
import TeamMemberManager from '../components/teams/TeamMemberManager';
import TeamAnalytics from '../components/teams/TeamAnalytics';

export default function Teams() {
  const navigate = useNavigate();
  const { user, loading, userPoints } = useUserData(true);
  const { teams } = useTeamData();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const myTeam = userPoints?.team_id ? teams.find(t => t.id === userPoints.team_id) : null;
  
  const { 
    createTeam, 
    joinTeam, 
    leaveTeam, 
    isCreating, 
    isJoining, 
    isLeaving 
  } = useTeamActions(user, userPoints, myTeam);

  const handleCreateTeam = (formData) => {
    createTeam(formData, {
      onSuccess: () => setShowCreateDialog(false)
    });
  };

  const handleViewDashboard = (teamId) => {
    navigate(createPageUrl('TeamDashboard') + `?teamId=${teamId}`);
  };

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading teams..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-int-navy mb-2">Teams</h1>
          <p className="text-slate-600">Join or create a team to compete together</p>
        </div>
        {!myTeam && (
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            className="bg-int-orange hover:bg-[#C46322] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        )}
      </div>

      {/* My Team */}
      {myTeam && (
        <MyTeamCard
          team={myTeam}
          user={user}
          onNavigateToDashboard={() => handleViewDashboard(myTeam.id)}
          onManageMembers={() => setShowMemberManager(true)}
          onViewAnalytics={() => setShowAnalytics(true)}
          onLeaveTeam={leaveTeam}
          isLeaving={isLeaving}
        />
      )}

      {/* All Teams Leaderboard */}
      <div>
        <h2 className="text-2xl font-bold text-int-navy mb-4">Team Leaderboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              index={index}
              isMyTeam={team.id === myTeam?.id}
              isLeader={team.team_leader_email === user?.email}
              currentUserEmail={user?.email}
              onJoin={joinTeam}
              onViewDashboard={handleViewDashboard}
              isJoining={isJoining}
            />
          ))}
        </div>
      </div>

      {/* Create Team Dialog */}
      <CreateTeamDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateTeam}
        isSubmitting={isCreating}
      />

      {/* Member Manager Dialog */}
      <Dialog open={showMemberManager} onOpenChange={setShowMemberManager}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Team Member Management</DialogTitle>
            <DialogDescription>Manage roles and invite new members</DialogDescription>
          </DialogHeader>
          {myTeam && (
            <TeamMemberManager
              teamId={myTeam.id}
              team={myTeam}
              currentUserEmail={user?.email}
              isLeader={myTeam.team_leader_email === user?.email}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Team Analytics</DialogTitle>
            <DialogDescription>Performance metrics and insights</DialogDescription>
          </DialogHeader>
          {myTeam && <TeamAnalytics teamId={myTeam.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}