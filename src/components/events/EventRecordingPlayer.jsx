import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Play, 
  Video, 
  Upload, 
  Eye, 
  Clock,
  FileVideo,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EventRecordingPlayer({ eventId, eventTitle, isHost, userEmail }) {
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: eventTitle ? `${eventTitle} - Recording` : 'Event Recording',
    recording_url: '',
    thumbnail_url: '',
    duration_seconds: 0
  });
  const [isUploading, setIsUploading] = useState(false);

  const { data: recordings = [] } = useQuery({
    queryKey: ['event-recordings', eventId],
    queryFn: () => base44.entities.EventRecording.filter({ event_id: eventId })
  });

  const uploadMutation = useMutation({
    mutationFn: (data) => base44.entities.EventRecording.create({
      ...data,
      event_id: eventId,
      uploaded_by_email: userEmail
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-recordings', eventId]);
      setShowUploadDialog(false);
      setUploadForm({ title: '', recording_url: '', thumbnail_url: '', duration_seconds: 0 });
      toast.success('Recording uploaded!');
    }
  });

  const incrementViewMutation = useMutation({
    mutationFn: ({ id, currentViews }) => 
      base44.entities.EventRecording.update(id, { view_count: (currentViews || 0) + 1 })
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadForm(prev => ({ ...prev, recording_url: file_url }));
      toast.success('Video uploaded!');
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlayRecording = (recording) => {
    setSelectedRecording(recording);
    setShowPlayer(true);
    incrementViewMutation.mutate({ id: recording.id, currentViews: recording.view_count });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown duration';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4" data-b44-sync="true" data-feature="events" data-component="eventrecordingplayer">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Video className="h-5 w-5 text-int-orange" />
          Event Recordings
        </h3>
        {isHost && (
          <Button size="sm" onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-1" /> Upload Recording
          </Button>
        )}
      </div>

      {recordings.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <FileVideo className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No recordings available yet</p>
          {isHost && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowUploadDialog(true)}>
              Upload Recording
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {recordings.map(recording => (
            <Card key={recording.id} className="overflow-hidden">
              <div className="flex">
                <div 
                  className="w-40 h-24 bg-slate-200 flex items-center justify-center cursor-pointer relative group"
                  onClick={() => handlePlayRecording(recording)}
                >
                  {recording.thumbnail_url ? (
                    <img src={recording.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Video className="h-8 w-8 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-10 w-10 text-white fill-white" />
                  </div>
                </div>
                <CardContent className="flex-1 p-4">
                  <h4 className="font-medium mb-1">{recording.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(recording.duration_seconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {recording.view_count || 0} views
                    </span>
                    <span>{format(new Date(recording.created_date), 'MMM d, yyyy')}</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handlePlayRecording(recording)}
                  >
                    <Play className="h-3 w-3 mr-1" /> Watch
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Event Recording</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Recording Title</Label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Team Building Session - Full Recording"
              />
            </div>
            <div>
              <Label>Video File</Label>
              <div className="mt-2">
                {isUploading ? (
                  <div className="flex items-center gap-2 p-4 border rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : uploadForm.recording_url ? (
                  <div className="p-4 border rounded-lg bg-green-50 text-green-700">
                    Video uploaded successfully!
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                  />
                )}
              </div>
            </div>
            <div>
              <Label>Or paste video URL</Label>
              <Input
                value={uploadForm.recording_url}
                onChange={(e) => setUploadForm(prev => ({ ...prev, recording_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={Math.floor(uploadForm.duration_seconds / 60) || ''}
                onChange={(e) => setUploadForm(prev => ({ ...prev, duration_seconds: parseInt(e.target.value || 0) * 60 }))}
                placeholder="30"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => uploadMutation.mutate(uploadForm)}
              disabled={!uploadForm.recording_url || uploadMutation.isLoading}
              className="flex-1"
            >
              Upload Recording
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedRecording?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {selectedRecording?.recording_url && (
              <video
                src={selectedRecording.recording_url}
                controls
                autoPlay
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}