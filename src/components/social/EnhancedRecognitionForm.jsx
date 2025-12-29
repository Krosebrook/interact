import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Award, Star, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'teamwork', label: 'Teamwork', icon: '🤝', points: 10 },
  { value: 'innovation', label: 'Innovation', icon: '💡', points: 15 },
  { value: 'leadership', label: 'Leadership', icon: '👑', points: 15 },
  { value: 'going_above', label: 'Going Above & Beyond', icon: '🚀', points: 20 },
  { value: 'customer_focus', label: 'Customer Focus', icon: '🎯', points: 10 },
  { value: 'problem_solving', label: 'Problem Solving', icon: '🧩', points: 15 },
  { value: 'mentorship', label: 'Mentorship', icon: '🌟', points: 15 },
  { value: 'culture_champion', label: 'Culture Champion', icon: '💝', points: 20 }
];

export default function EnhancedRecognitionForm({ currentUser, onSuccess }) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [awardBadge, setAwardBadge] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [bonusPoints, setBonusPoints] = useState(0);
  const queryClient = useQueryClient();

  // Fetch available badges
  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list()
  });

  // Fetch user's point balance
  const { data: userPoints } = useQuery({
    queryKey: ['user-points', currentUser?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: currentUser?.email });
      return points[0];
    },
    enabled: !!currentUser?.email
  });

  const createRecognitionMutation = useMutation({
    mutationFn: async (data) => {
      // Calculate total points
      const categoryPoints = CATEGORIES.find(c => c.value === data.category)?.points || 10;
      const totalPoints = categoryPoints + (data.bonusPoints || 0);

      // Create recognition
      const recognition = await base44.entities.Recognition.create({
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        recipient_email: data.recipientEmail,
        recipient_name: data.recipientEmail, // Will be enriched by backend
        message: data.message,
        category: data.category,
        points_awarded: totalPoints,
        visibility: data.visibility
      });

      // Award badge if selected
      if (data.awardBadge && data.selectedBadge) {
        await base44.entities.BadgeAward.create({
          user_email: data.recipientEmail,
          badge_id: data.selectedBadge,
          awarded_by: currentUser.email,
          reason: data.message,
          reference_id: recognition.id
        });
      }

      // Award points via backend function
      await base44.functions.invoke('recordPointsTransaction', {
        user_email: data.recipientEmail,
        amount: totalPoints,
        transaction_type: 'recognition_received',
        reference_type: 'Recognition',
        reference_id: recognition.id,
        description: `Recognition from ${currentUser.full_name}: ${data.category}`
      });

      // Deduct bonus points from sender if applicable
      if (data.bonusPoints > 0) {
        await base44.functions.invoke('recordPointsTransaction', {
          user_email: currentUser.email,
          amount: -data.bonusPoints,
          transaction_type: 'recognition_given',
          reference_type: 'Recognition',
          reference_id: recognition.id,
          description: `Bonus points gifted to ${data.recipientEmail}`
        });
      }

      return recognition;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recognitions']);
      queryClient.invalidateQueries(['user-points']);
      toast.success('Recognition sent! 🎉');
      
      // Reset form
      setRecipientEmail('');
      setMessage('');
      setCategory('');
      setAwardBadge(false);
      setSelectedBadge(null);
      setBonusPoints(0);
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to send recognition: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!recipientEmail || !message || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (bonusPoints > (userPoints?.total_points || 0)) {
      toast.error('Insufficient points for bonus');
      return;
    }

    createRecognitionMutation.mutate({
      recipientEmail,
      message,
      category,
      visibility,
      awardBadge,
      selectedBadge,
      bonusPoints
    });
  };

  const categoryPoints = CATEGORIES.find(c => c.value === category)?.points || 0;
  const totalPoints = categoryPoints + bonusPoints;
  const availablePoints = userPoints?.total_points || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-600" />
          Give Recognition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient */}
          <div>
            <Label htmlFor="recipient">Recipient Email *</Label>
            <Input
              id="recipient"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Recognition Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <Badge variant="outline" className="ml-auto">
                        +{cat.points} pts
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share what they did that deserves recognition..."
              rows={4}
              required
            />
          </div>

          {/* Bonus Points */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Label htmlFor="bonus-points" className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-blue-600" />
              Add Bonus Points (Optional)
            </Label>
            <p className="text-xs text-slate-600 mb-2">
              Gift extra points from your balance • Available: {availablePoints} pts
            </p>
            <Input
              id="bonus-points"
              type="number"
              min="0"
              max={availablePoints}
              value={bonusPoints}
              onChange={(e) => setBonusPoints(Number(e.target.value))}
            />
          </div>

          {/* Award Badge */}
          {badges?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  id="award-badge"
                  checked={awardBadge}
                  onCheckedChange={setAwardBadge}
                />
                <Label htmlFor="award-badge" className="flex items-center gap-2 cursor-pointer">
                  <Award className="h-4 w-4 text-amber-600" />
                  Award a Badge
                </Label>
              </div>
              {awardBadge && (
                <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select badge..." />
                  </SelectTrigger>
                  <SelectContent>
                    {badges.slice(0, 10).map((badge) => (
                      <SelectItem key={badge.id} value={badge.id}>
                        {badge.badge_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Visibility */}
          <div>
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">🌐 Public (Everyone)</SelectItem>
                <SelectItem value="team_only">👥 Team Only</SelectItem>
                <SelectItem value="private">🔒 Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {category && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm font-medium text-emerald-900 mb-1">Recognition Summary:</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-700">Category Points:</span>
                <span className="font-semibold text-emerald-900">+{categoryPoints}</span>
              </div>
              {bonusPoints > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-700">Bonus Points:</span>
                  <span className="font-semibold text-emerald-900">+{bonusPoints}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-bold border-t border-emerald-300 mt-2 pt-2">
                <span className="text-emerald-900">Total Award:</span>
                <span className="text-emerald-900">+{totalPoints} points</span>
              </div>
              {awardBadge && selectedBadge && (
                <p className="text-xs text-emerald-700 mt-2">
                  + 1 Badge will be awarded
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={createRecognitionMutation.isPending}
            className="w-full"
          >
            {createRecognitionMutation.isPending ? (
              'Sending...'
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Send Recognition
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}