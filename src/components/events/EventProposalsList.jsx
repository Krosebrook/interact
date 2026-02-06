import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, CheckCircle, XCircle, Calendar, Clock, MapPin, Video } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EventProposalsList({ isAdmin, userEmail }) {
  const [expandedId, setExpandedId] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const queryClient = useQueryClient();
  
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['eventProposals'],
    queryFn: () => base44.entities.EventProposal.list('-created_date')
  });
  
  const upvoteMutation = useMutation({
    mutationFn: async (proposalId) => {
      const proposal = proposals.find(p => p.id === proposalId);
      const upvotes = proposal.upvotes || [];
      const hasUpvoted = upvotes.includes(userEmail);
      
      await base44.entities.EventProposal.update(proposalId, {
        upvotes: hasUpvoted 
          ? upvotes.filter(email => email !== userEmail)
          : [...upvotes, userEmail],
        upvote_count: hasUpvoted ? proposal.upvote_count - 1 : proposal.upvote_count + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['eventProposals']);
    }
  });
  
  const reviewMutation = useMutation({
    mutationFn: async ({ proposalId, status, notes }) => {
      await base44.entities.EventProposal.update(proposalId, {
        status,
        admin_notes: notes,
        reviewed_by: userEmail,
        reviewed_at: new Date().toISOString()
      });
      
      // If approved, create event
      if (status === 'approved') {
        const proposal = proposals.find(p => p.id === proposalId);
        // Admin can manually schedule via Calendar after approval
        toast.success('Proposal approved! You can now schedule it from the Calendar.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['eventProposals']);
      setExpandedId(null);
      setAdminNote('');
    }
  });
  
  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const approvedProposals = proposals.filter(p => p.status === 'approved');
  
  if (isLoading) return <div className="text-center py-8">Loading proposals...</div>;
  
  return (
    <div className="space-y-6">
      {pendingProposals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Pending Proposals ({pendingProposals.length})</h3>
          <div className="space-y-4">
            {pendingProposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                isAdmin={isAdmin}
                userEmail={userEmail}
                isExpanded={expandedId === proposal.id}
                onToggleExpand={() => setExpandedId(expandedId === proposal.id ? null : proposal.id)}
                onUpvote={() => upvoteMutation.mutate(proposal.id)}
                onReview={(status) => reviewMutation.mutate({
                  proposalId: proposal.id,
                  status,
                  notes: adminNote
                })}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                upvoting={upvoteMutation.isPending}
                reviewing={reviewMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}
      
      {approvedProposals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-700">Approved ({approvedProposals.length})</h3>
          <div className="space-y-4">
            {approvedProposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                isAdmin={isAdmin}
                userEmail={userEmail}
                upvoting={upvoteMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}
      
      {proposals.length === 0 && (
        <p className="text-center text-slate-500 py-12">No event proposals yet.</p>
      )}
    </div>
  );
}

function ProposalCard({ 
  proposal, 
  isAdmin, 
  userEmail, 
  isExpanded, 
  onToggleExpand, 
  onUpvote, 
  onReview,
  adminNote,
  setAdminNote,
  upvoting,
  reviewing
}) {
  const hasUpvoted = (proposal.upvotes || []).includes(userEmail);
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{proposal.title}</CardTitle>
              <Badge className={statusColors[proposal.status]}>
                {proposal.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              Proposed by {proposal.proposer_name} • {format(new Date(proposal.created_date), 'MMM d, yyyy')}
            </p>
          </div>
          <Button
            variant={hasUpvoted ? "default" : "outline"}
            size="sm"
            onClick={onUpvote}
            disabled={upvoting}
            className={hasUpvoted ? 'bg-int-orange' : ''}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {proposal.upvote_count || 0}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-slate-700">{proposal.description}</p>
        
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {proposal.suggested_date 
              ? format(new Date(proposal.suggested_date), 'EEE, MMM d, h:mm a')
              : 'Date TBD'}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {proposal.duration_minutes} min
          </div>
          <div className="flex items-center gap-1">
            {proposal.is_virtual ? (
              <>
                <Video className="h-4 w-4 text-blue-600" />
                Virtual
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-green-600" />
                {proposal.location || 'In-Person'}
              </>
            )}
          </div>
        </div>
        
        <Badge variant="outline" className="capitalize">
          {proposal.activity_type?.replace('_', ' ')}
        </Badge>
        
        {isAdmin && proposal.status === 'pending' && (
          <div className="pt-4 border-t space-y-3">
            {isExpanded && (
              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add feedback for the proposer..."
                  rows={2}
                />
              </div>
            )}
            <div className="flex gap-2">
              {!isExpanded ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleExpand}
                  className="flex-1"
                >
                  Review Proposal
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReview('approved')}
                    disabled={reviewing}
                    className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReview('rejected')}
                    disabled={reviewing}
                    className="flex-1 border-red-500 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        
        {proposal.admin_notes && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <p className="text-xs font-semibold text-slate-700 mb-1">Admin Feedback:</p>
            <p className="text-sm text-slate-600">{proposal.admin_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}