import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function BookmarkButton({ eventId, userEmail, variant = 'ghost', size = 'icon', showLabel = false }) {
  const queryClient = useQueryClient();

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', userEmail],
    queryFn: () => base44.entities.EventBookmark.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const isBookmarked = bookmarks.some(b => b.event_id === eventId);
  const bookmark = bookmarks.find(b => b.event_id === eventId);

  const addBookmarkMutation = useMutation({
    mutationFn: () => base44.entities.EventBookmark.create({
      event_id: eventId,
      user_email: userEmail
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks', userEmail]);
      toast.success('Event bookmarked!');
    }
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: () => base44.entities.EventBookmark.delete(bookmark.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks', userEmail]);
      toast.success('Bookmark removed');
    }
  });

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isBookmarked) {
      removeBookmarkMutation.mutate();
    } else {
      addBookmarkMutation.mutate();
    }
  };

  const isLoading = addBookmarkMutation.isLoading || removeBookmarkMutation.isLoading;

  if (showLabel) {
    return (
      <Button
        variant={isBookmarked ? 'default' : variant}
        size={size}
        onClick={handleToggle}
        disabled={isLoading}
        className={isBookmarked ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
      >
        <Bookmark className={`h-4 w-4 ${showLabel ? 'mr-2' : ''} ${isBookmarked ? 'fill-current' : ''}`} />
        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={isBookmarked ? 'text-yellow-500' : ''}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
    </Button>
  );
}