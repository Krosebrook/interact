import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle,
  Mail,
  MoreHorizontal,
  UserCheck,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ParticipantManager({ eventId }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: participations = [] } = useQuery({
    queryKey: ['participations', eventId],
    queryFn: () => base44.entities.Participation.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const { data: registrationForms = [] } = useQuery({
    queryKey: ['registration-forms', eventId],
    queryFn: () => base44.entities.RegistrationForm.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['registration-submissions', eventId],
    queryFn: () => base44.entities.RegistrationSubmission.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const updateParticipationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Participation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['participations', eventId]);
      toast.success('Participant updated');
    }
  });

  const filteredParticipations = participations.filter(p =>
    p.participant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.participant_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: participations.length,
    confirmed: participations.filter(p => p.rsvp_status === 'yes').length,
    attended: participations.filter(p => p.attended).length,
    maybe: participations.filter(p => p.rsvp_status === 'maybe').length
  };

  const exportParticipants = () => {
    const csv = [
      ['Name', 'Email', 'RSVP', 'Attended', 'Feedback Score', 'Registered'].join(','),
      ...participations.map(p => [
        p.participant_name,
        p.participant_email,
        p.rsvp_status,
        p.attended ? 'Yes' : 'No',
        p.engagement_score || '',
        format(new Date(p.created_date), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${eventId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Participant list exported');
  };

  const markAttended = (participationId) => {
    updateParticipationMutation.mutate({
      id: participationId,
      data: { attended: true }
    });
  };

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="participantmanager">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-int-orange" />
            Participant Management
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportParticipants}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500">Total RSVPs</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
            <p className="text-xs text-green-600">Confirmed</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{stats.attended}</p>
            <p className="text-xs text-blue-600">Attended</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">{stats.maybe}</p>
            <p className="text-xs text-yellow-600">Maybe</p>
          </div>
        </div>

        <Tabs defaultValue="participants">
          <TabsList className="mb-4">
            <TabsTrigger value="participants">Participants ({participations.length})</TabsTrigger>
            <TabsTrigger value="registrations">Custom Registrations ({submissions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="participants">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search participants..."
                className="pl-10"
              />
            </div>

            {/* Participant Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>RSVP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No participants found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipations.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.participant_name}</TableCell>
                        <TableCell className="text-slate-500">{p.participant_email}</TableCell>
                        <TableCell>
                          <Badge className={
                            p.rsvp_status === 'yes' ? 'bg-green-100 text-green-700' :
                            p.rsvp_status === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {p.rsvp_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.attended ? (
                            <Badge className="bg-blue-100 text-blue-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Attended
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {format(new Date(p.created_date), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!p.attended && (
                                <DropdownMenuItem onClick={() => markAttended(p.id)}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Mark as Attended
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => window.open(`mailto:${p.participant_email}`)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="registrations">
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No custom registration submissions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map(sub => (
                  <Card key={sub.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{sub.user_name}</p>
                        <p className="text-sm text-slate-500">{sub.user_email}</p>
                      </div>
                      <Badge className={
                        sub.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        sub.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {sub.status}
                      </Badge>
                    </div>
                    {Object.keys(sub.responses || {}).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Custom Responses:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(sub.responses).map(([key, value]) => (
                            <div key={key} className="bg-slate-50 p-2 rounded">
                              <span className="text-slate-500">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {sub.dietary_requirements && (
                      <p className="text-sm mt-2"><strong>Dietary:</strong> {sub.dietary_requirements}</p>
                    )}
                    {sub.accessibility_needs && (
                      <p className="text-sm mt-1"><strong>Accessibility:</strong> {sub.accessibility_needs}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}