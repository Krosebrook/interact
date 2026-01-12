import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Video, 
  Upload, 
  Play, 
  Trash2, 
  Eye, 
  Link2,
  Loader2,
  FileVideo,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function RecordingUploader({ eventId, eventTitle, userEmail }) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: eventTitle ? `${eventTitle} - Recording` : '',
    recording_url: '',
    duration_seconds: 0
  });

  const { data: recordings = [] } = useQuery({
    queryKey: ['event-recordings', eventId],
    queryFn: () => base44.entities.EventRecording.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const uploadMutation = useMutation({
    mutationFn: (data) => base44.entities.EventRecording.create({
      ...data,
      event_id: eventId,
      uploaded_by_email: userEmail
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-recordings', eventId]);
      setFormData({ title: '', recording_url: '', duration_seconds: 0 });
      toast.success('Recording uploaded successfully!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EventRecording.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-recordings', eventId]);
      toast.success('Recording deleted');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      clearInterval(progressInterval);
      setUploadProgress(100);
      setFormData(prev => ({ ...prev, recording_url: file_url }));
      toast.success('Video file uploaded!');
    } catch (error) {
      clearInterval(progressInterval);
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <Card className="border-0 shadow-lg" data-b44-sync="true" data-feature="facilitator" data-component="recordinguploader">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-int-orange" />
          Event Recordings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Form */}
        <div className="p-4 bg-slate-50 rounded-lg space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Upload className="h-4 w-4" /> Upload New Recording
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Recording Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Session Recording"
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={Math.floor(formData.duration_seconds / 60) || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  duration_seconds: parseInt(e.target.value || 0) * 60 
                }))}
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <Label>Video File</Label>
            <div className="mt-2">
              {isUploading ? (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-slate-500">Uploading... {uploadProgress}%</p>
                </div>
              ) : formData.recording_url ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <FileVideo className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700 flex-1">Video ready to save</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, recording_url: '' }))}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload video file</p>
                    <p className="text-xs text-slate-400">MP4, MOV, WebM supported</p>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Or paste video URL</Label>
            <Input
              value={formData.recording_url}
              onChange={(e) => setFormData(prev => ({ ...prev, recording_url: e.target.value }))}
              placeholder="https://youtube.com/... or direct video URL"
            />
          </div>

          <Button
            onClick={() => uploadMutation.mutate(formData)}
            disabled={!formData.title || !formData.recording_url || uploadMutation.isLoading}
            className="w-full"
          >
            {uploadMutation.isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Save Recording
          </Button>
        </div>

        {/* Existing Recordings */}
        <div>
          <h4 className="font-medium mb-3">Uploaded Recordings ({recordings.length})</h4>
          {recordings.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileVideo className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No recordings uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map(recording => (
                <div key={recording.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                    {recording.thumbnail_url ? (
                      <img src={recording.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Video className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{recording.title}</h5>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
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
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(recording.recording_url, '_blank')}
                      title="Play"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyLink(recording.recording_url)}
                      title="Copy link"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteMutation.mutate(recording.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}