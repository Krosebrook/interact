import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Video, Heart, Upload, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function EventMediaGallery({ eventId, canUpload = false }) {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploadData, setUploadData] = useState({ caption: '', file: null });
  const [uploading, setUploading] = useState(false);

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['event-media', eventId],
    queryFn: () => base44.entities.EventMedia.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const likeMutation = useMutation({
    mutationFn: async (mediaId) => {
      const user = await base44.auth.me();
      const mediaItem = media.find(m => m.id === mediaId);
      const likes = mediaItem.likes || [];
      const newLikes = likes.includes(user.email)
        ? likes.filter(e => e !== user.email)
        : [...likes, user.email];
      return base44.entities.EventMedia.update(mediaId, { likes: newLikes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-media', eventId]);
    }
  });

  const handleUpload = async () => {
    if (!uploadData.file) return;
    
    try {
      setUploading(true);
      const user = await base44.auth.me();
      
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadData.file });
      
      // Create media record
      await base44.entities.EventMedia.create({
        event_id: eventId,
        uploaded_by_email: user.email,
        uploaded_by_name: user.full_name,
        media_type: uploadData.file.type.startsWith('video') ? 'video' : 'photo',
        media_url: file_url,
        caption: uploadData.caption
      });

      queryClient.invalidateQueries(['event-media', eventId]);
      setShowUpload(false);
      setUploadData({ caption: '', file: null });
      toast.success('Media uploaded! 📸');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading gallery...</div>;
  }

  const photos = media.filter(m => m.media_type === 'photo');
  const videos = media.filter(m => m.media_type === 'video');

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="events" data-component="eventmediagallery">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Event Gallery</h3>
          <p className="text-sm text-slate-600">
            {photos.length} photos • {videos.length} videos
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowUpload(true)} className="bg-int-orange hover:bg-[#C46322]">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        )}
      </div>

      {media.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No media yet</h3>
          <p className="text-slate-600">
            {canUpload ? 'Upload photos and videos from this event!' : 'Photos will appear here'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                {item.media_type === 'photo' ? (
                  <img 
                    src={item.media_url} 
                    alt={item.caption} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video src={item.media_url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
              {item.is_featured && (
                <Star className="absolute top-2 right-2 h-5 w-5 text-yellow-400 fill-yellow-400" />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between text-white text-xs">
                  <span>{item.uploaded_by_name.split(' ')[0]}</span>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{item.likes?.length || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files[0] }))}
              />
            </div>
            <div>
              <Textarea
                placeholder="Add a caption..."
                value={uploadData.caption}
                onChange={(e) => setUploadData(prev => ({ ...prev, caption: e.target.value }))}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!uploadData.file || uploading}
              className="w-full bg-int-orange hover:bg-[#C46322]"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Media Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedMedia?.uploaded_by_name}</DialogTitle>
                <p className="text-sm text-slate-600">{selectedMedia?.caption}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => likeMutation.mutate(selectedMedia?.id)}
              >
                <Heart 
                  className={`h-5 w-5 ${selectedMedia?.likes?.includes(selectedMedia?.uploaded_by_email) ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
            </div>
          </DialogHeader>
          {selectedMedia?.media_type === 'photo' ? (
            <img src={selectedMedia.media_url} alt="" className="w-full rounded-lg" />
          ) : (
            <video src={selectedMedia?.media_url} controls className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}