import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User, 
  MapPin, 
  Building, 
  Camera,
  Edit,
  Award,
  Flame,
  TrendingUp,
  Calendar,
  Loader2,
  Star,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { LEVEL_THRESHOLDS } from '@/components/lib/constants';
import { compressImage, formatFileSize } from '@/components/lib/imageUtils';

// File upload constraints
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ProfileHeader({ user, profile, userPoints, onUpdate }) {
  const queryClient = useQueryClient();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editForm, setEditForm] = useState({
    display_name: profile?.display_name || user?.full_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    department: profile?.department || '',
    location: profile?.location || '',
    job_title: profile?.job_title || ''
  });

  const level = userPoints?.level || 1;
  const totalPoints = userPoints?.total_points || 0;
  const xp = userPoints?.experience_points || 0;
  const streakDays = userPoints?.streak_days || 0;
  const badgesCount = userPoints?.badges_earned?.length || 0;
  const eventsAttended = userPoints?.events_attended || 0;

  // Calculate XP progress to next level
  const currentLevelThreshold = LEVEL_THRESHOLDS?.find(t => t.level === level)?.points || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS?.find(t => t.level === level + 1)?.points || currentLevelThreshold + 500;
  const xpProgress = Math.min(100, Math.round(((totalPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100));
  const levelTitle = LEVEL_THRESHOLDS?.find(t => t.level === level)?.title || 'Newcomer';

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return base44.entities.UserProfile.update(profile.id, data);
      } else {
        return base44.entities.UserProfile.create({ ...data, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      onUpdate?.();
      setShowEditDialog(false);
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to update profile')
  });

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, or WebP images only.');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size (${formatFileSize(file.size)}) exceeds the 5MB limit. Please choose a smaller file.`);
      e.target.value = ''; // Reset input
      return;
    }

    // Create preview URL for immediate feedback
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploadingAvatar(true);
    try {
      // Compress image before upload for better performance
      const originalSize = file.size;
      const compressedFile = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85
      });
      
      // Show compression info if size was reduced significantly
      if (originalSize > compressedFile.size * 1.2) {
        toast.info(`Image optimized: ${formatFileSize(originalSize)} → ${formatFileSize(compressedFile.size)}`);
      }

      const { file_url } = await base44.integrations.Core.UploadFile({ file: compressedFile });
      setEditForm(prev => ({ ...prev, avatar_url: file_url }));
      toast.success('Profile photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      
      // Better error messages based on error type
      if (error.message?.includes('Failed to compress')) {
        toast.error('Image file is corrupted or invalid. Please try a different image.');
      } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to upload photo. Please try again.');
      }
    } finally {
      // Clean up preview and memory
      setPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
      setUploadingAvatar(false);
      e.target.value = ''; // Reset input for re-upload
    }
  };

  return (
    <>
      <motion.div
        data-b44-sync="true"
        data-feature="profile"
        data-component="profileheader"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-0 shadow-xl bg-white">
          {/* Header Banner with Gradient */}
          <div className="h-32 bg-gradient-to-r from-int-navy via-purple-700 to-int-orange relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
            
            {/* Edit Button */}
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>

            {/* Level Badge */}
            <div className="absolute top-3 left-3 glass-badge">
              <Star className="h-3 w-3 mr-1 inline text-yellow-300" />
              Level {level} • {levelTitle}
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Avatar with Level Ring */}
            <div className="relative -mt-16 mb-4 flex items-end gap-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-yellow-400 via-int-orange to-purple-600 shadow-xl">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.display_name || 'User'}
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center border-4 border-white">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
                {/* Level indicator */}
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-sm font-bold text-white border-3 border-white shadow-lg">
                  {level}
                </div>
              </div>

              {/* Name & Title */}
              <div className="flex-1 pb-2">
                <h1 className="text-2xl font-bold text-int-navy">
                  {profile?.display_name || user?.full_name || 'New User'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {profile?.job_title && (
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <Briefcase className="h-4 w-4 text-int-orange" />
                      {profile.job_title}
                    </span>
                  )}
                  {profile?.department && (
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <Building className="h-4 w-4" />
                      {profile.department}
                    </span>
                  )}
                  {profile?.location && (
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* XP Progress Bar */}
            <div className="mb-5 p-3 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Level Progress</span>
                <span className="text-purple-600 font-semibold">
                  {totalPoints.toLocaleString()} / {nextLevelThreshold.toLocaleString()} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-2" />
              <p className="text-xs text-slate-600 mt-1">
                {nextLevelThreshold - totalPoints} XP to Level {level + 1}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              <StatsBox
                icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                value={totalPoints.toLocaleString()}
                label="Total Points"
                gradient="from-purple-100 to-purple-50"
              />
              <StatsBox
                icon={<Calendar className="h-5 w-5 text-blue-600" />}
                value={eventsAttended}
                label="Events"
                gradient="from-blue-100 to-blue-50"
              />
              <StatsBox
                icon={<Award className="h-5 w-5 text-amber-600" />}
                value={badgesCount}
                label="Badges"
                gradient="from-amber-100 to-amber-50"
              />
              <StatsBox
                icon={<Flame className="h-5 w-5 text-orange-600" />}
                value={streakDays}
                label="Day Streak"
                gradient="from-orange-100 to-orange-50"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {(previewUrl || editForm.avatar_url) ? (
                  <div className="relative">
                    <img 
                      src={previewUrl || editForm.avatar_url} 
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                    />
                    {previewUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-slate-500" />
                  </div>
                )}
                <label className={`absolute bottom-0 right-0 w-7 h-7 ${uploadingAvatar ? 'bg-slate-400' : 'bg-int-orange hover:bg-[#C46322]'} text-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg ${uploadingAvatar ? 'cursor-wait' : ''}`}>
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    className="hidden" 
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">Profile Photo</p>
                <p className="text-xs text-slate-600">JPEG, PNG, or WebP (max 5MB)</p>
                {uploadingAvatar && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Uploading...
                  </p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="text-sm font-medium text-slate-700">Display Name</label>
              <Input
                value={editForm.display_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Your name"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Job Title</label>
              <Input
                value={editForm.job_title}
                onChange={(e) => setEditForm(prev => ({ ...prev, job_title: e.target.value }))}
                placeholder="e.g. Software Engineer"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Department</label>
                <Input
                  value={editForm.department}
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g. Engineering"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Location</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. New York, NY"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Bio</label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="mt-1 h-24"
                maxLength={300}
              />
              <p className="text-xs text-slate-600 mt-1 text-right">
                {editForm.bio.length}/300
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold" 
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatsBox({ icon, value, label, gradient }) {
  return (
    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-center`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-700 font-medium">{label}</p>
    </div>
  );
}