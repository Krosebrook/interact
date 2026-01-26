import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Video, ExternalLink, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function VideoConferencePanel({ eventId, isHost }) {
  const [platform, setPlatform] = useState('teams');
  const [meetingUrl, setMeetingUrl] = useState('');
  const queryClient = useQueryClient();
  
  const { data: conference } = useQuery({
    queryKey: ['videoConference', eventId],
    queryFn: async () => {
      const results = await base44.entities.VideoConference.filter({ event_id: eventId });
      return results[0];
    },
    enabled: !!eventId
  });
  
  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.VideoConference.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['videoConference']);
      toast.success('Video conference added!');
      setMeetingUrl('');
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return base44.entities.VideoConference.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['videoConference']);
      toast.success('Updated!');
    }
  });
  
  const handleCreate = () => {
    if (!meetingUrl) {
      toast.error('Please enter a meeting URL');
      return;
    }
    
    createMutation.mutate({
      event_id: eventId,
      platform,
      meeting_url: meetingUrl,
      host_email: base44.auth.me().email,
      status: 'scheduled'
    });
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };
  
  if (!conference && !isHost) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-slate-500">
          <Video className="h-8 w-8 mx-auto mb-2 text-slate-400" />
          <p>No video conference scheduled yet</p>
        </CardContent>
      </Card>
    );
  }
  
  if (conference) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Conference
            </CardTitle>
            <Badge className="capitalize">{conference.platform}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Meeting Link</p>
            <div className="flex items-center gap-2">
              <a
                href={conference.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex-1 truncate"
              >
                {conference.meeting_url}
              </a>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(conference.meeting_url)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {conference.passcode && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Passcode</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-bold">{conference.passcode}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(conference.passcode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <Button asChild className="w-full bg-int-orange hover:bg-int-orange-dark">
            <a href={conference.meeting_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Video Call
            </a>
          </Button>
          
          {conference.breakout_rooms?.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Breakout Rooms ({conference.breakout_rooms.length})
              </p>
              <div className="space-y-2">
                {conference.breakout_rooms.map((room, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded text-sm">
                    <p className="font-medium">{room.room_name}</p>
                    <p className="text-xs text-slate-500">
                      {room.participants?.length || 0} participants
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Video Conference</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="teams">Microsoft Teams</SelectItem>
              <SelectItem value="meet">Google Meet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Meeting URL</Label>
          <Input
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://teams.microsoft.com/..."
          />
        </div>
        
        <Button
          onClick={handleCreate}
          disabled={createMutation.isLoading}
          className="w-full"
        >
          {createMutation.isLoading ? 'Adding...' : 'Add Video Conference'}
        </Button>
      </CardContent>
    </Card>
  );
}