import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePictureUpload({ currentImageUrl, userEmail, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      
      // Upload file to storage
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      return file_url;
    },
    onSuccess: (fileUrl) => {
      onUploadSuccess(fileUrl);
      toast.success('Profile picture updated');
      setUploading(false);
    },
    onError: (error) => {
      toast.error('Failed to upload image');
      setUploading(false);
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    uploadMutation.mutate(file);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
        <AvatarImage src={currentImageUrl} />
        <AvatarFallback className="text-4xl bg-gradient-purple text-white">
          {userEmail?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <Button
        size="icon"
        variant="outline"
        className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-white shadow-lg hover:bg-slate-50"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}