import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import StarRating from '../components/feedback/StarRating';
import { format } from 'date-fns';

export default function FeedbackAdmin() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [editingNote, setEditingNote] = useState(null);
  const queryClient = useQueryClient();

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['admin-feedback', statusFilter, sortBy],
    queryFn: async () => {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      return await base44.entities.UserFeedback.filter(filters, sortBy);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, admin_notes }) => 
      base44.entities.UserFeedback.update(id, { status, admin_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-feedback']);
      setEditingNote(null);
    }
  });

  const avgRating = feedback.length > 0 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    reviewed: 'bg-yellow-100 text-yellow-800',
    addressed: 'bg-green-100 text-green-800',
    archived: 'bg-slate-100 text-slate-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--ink)]">User Feedback</h1>
          <p className="text-[var(--slate)] mt-1">Review and manage user feedback</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="addressed">Addressed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_date">Newest First</SelectItem>
              <SelectItem value="created_date">Oldest First</SelectItem>
              <SelectItem value="-rating">Highest Rated</SelectItem>
              <SelectItem value="rating">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--slate)]">Total Feedback</p>
                <p className="text-2xl font-bold">{feedback.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-[var(--orb-accent)]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--slate)]">Average Rating</p>
                <p className="text-2xl font-bold">{avgRating}</p>
              </div>
              <StarRating value={Math.round(avgRating)} readonly size="sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--slate)]">New Feedback</p>
                <p className="text-2xl font-bold">
                  {feedback.filter(f => f.status === 'new').length}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Needs Review</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--slate)]">
              Loading feedback...
            </CardContent>
          </Card>
        ) : feedback.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--slate)]">
              No feedback found
            </CardContent>
          </Card>
        ) : (
          feedback.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{item.page_name}</CardTitle>
                      <Badge className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--slate)]">
                      <span>{item.user_email}</span>
                      <span>•</span>
                      <span>{format(new Date(item.created_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <StarRating value={item.rating} readonly size="sm" />
                </div>
              </CardHeader>

              {item.feedback_text && (
                <CardContent className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-[var(--ink)]">{item.feedback_text}</p>
                  </div>

                  {editingNote === item.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add admin notes..."
                        defaultValue={item.admin_notes || ''}
                        id={`notes-${item.id}`}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const notes = document.getElementById(`notes-${item.id}`).value;
                            updateStatusMutation.mutate({
                              id: item.id,
                              status: item.status,
                              admin_notes: notes
                            });
                          }}
                        >
                          Save Notes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingNote(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select
                        value={item.status}
                        onValueChange={(status) =>
                          updateStatusMutation.mutate({ id: item.id, status, admin_notes: item.admin_notes })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="addressed">Addressed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNote(item.id)}
                      >
                        {item.admin_notes ? 'Edit Notes' : 'Add Notes'}
                      </Button>
                    </div>
                  )}

                  {item.admin_notes && editingNote !== item.id && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Admin Notes:</p>
                      <p className="text-sm text-blue-800">{item.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}