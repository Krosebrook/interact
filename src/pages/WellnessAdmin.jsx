import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '@/components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import WellnessInsightsPanel from '@/components/wellness/WellnessInsightsPanel';
import { Plus, Activity, Droplet, Brain, Moon, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function WellnessAdmin() {
  const { user, loading: userLoading, isAdmin } = useUserData();
  const [showDialog, setShowDialog] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [aiIdeas, setAiIdeas] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: 'steps',
    goal_value: 10000,
    goal_unit: 'steps',
    frequency: 'daily',
    points_reward: 50,
    start_date: '',
    end_date: '',
    team_based: false
  });
  const queryClient = useQueryClient();
  
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['wellnessChallenges'],
    queryFn: () => base44.entities.WellnessChallenge.filter({})
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WellnessChallenge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['wellnessChallenges']);
      toast.success('Challenge created!');
      setShowDialog(false);
      setFormData({
        title: '',
        description: '',
        challenge_type: 'steps',
        goal_value: 10000,
        goal_unit: 'steps',
        frequency: 'daily',
        points_reward: 50,
        start_date: '',
        end_date: '',
        team_based: false
      });
    }
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.WellnessChallenge.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['wellnessChallenges']);
      toast.success('Challenge updated!');
    }
  });
  
  if (userLoading || isLoading) return <LoadingSpinner />;
  
  if (!isAdmin) {
    return <div className="text-center py-12"><p>Admin access required</p></div>;
  }
  
  const handleSubmit = () => {
    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    createMutation.mutate({
      ...formData,
      status: 'draft'
    });
  };
  
  const generateChallengeIdeas = async () => {
    setGeneratingIdeas(true);
    try {
      const response = await base44.functions.invoke('generateWellnessChallengeIdeas', {
        theme: formData.challenge_type,
        duration: '30 days',
        teamBased: formData.team_based
      });
      
      if (response.data.success) {
        setAiIdeas(response.data.challenges);
        toast.success('AI generated challenge ideas!');
      }
    } catch (error) {
      toast.error('Failed to generate ideas');
    } finally {
      setGeneratingIdeas(false);
    }
  };
  
  const selectIdea = (idea) => {
    setFormData({
      ...formData,
      title: idea.title,
      description: idea.description,
      challenge_type: idea.challenge_type,
      goal_value: idea.goal_value,
      goal_unit: idea.goal_unit,
      points_reward: idea.points_reward
    });
    setAiIdeas([]);
    toast.success('Challenge idea applied!');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-int-navy">Wellness Challenge Admin</h1>
          <p className="text-slate-600">Create and manage wellness challenges</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-int-orange hover:bg-int-orange-dark">
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Create Wellness Challenge</DialogTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateChallengeIdeas}
                  disabled={generatingIdeas}
                  className="text-purple-600"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {generatingIdeas ? 'Generating...' : 'AI Ideas'}
                </Button>
              </div>
            </DialogHeader>
            
            {aiIdeas.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 space-y-3 border border-purple-200">
                <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI-Generated Challenge Ideas
                </p>
                {aiIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-3 space-y-2 cursor-pointer hover:border-purple-300 border border-purple-100"
                    onClick={() => selectIdea(idea)}
                  >
                    <p className="font-semibold text-sm">{idea.title}</p>
                    <p className="text-xs text-slate-600">{idea.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {idea.goal_value} {idea.goal_unit}
                      </Badge>
                      <Badge className="text-xs bg-int-orange">
                        {idea.points_reward} points
                      </Badge>
                    </div>
                    {idea.promotional_copy && (
                      <p className="text-xs italic text-purple-700">"{idea.promotional_copy}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label>Challenge Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="30-Day Step Challenge"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Walk 10,000 steps daily for 30 days"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Challenge Type</Label>
                  <Select
                    value={formData.challenge_type}
                    onValueChange={(v) => setFormData({
                      ...formData,
                      challenge_type: v,
                      goal_unit: v === 'steps' ? 'steps' : v === 'hydration' ? 'glasses' : 'minutes'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steps">Steps</SelectItem>
                      <SelectItem value="meditation">Meditation</SelectItem>
                      <SelectItem value="hydration">Hydration</SelectItem>
                      <SelectItem value="sleep">Sleep</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(v) => setFormData({...formData, frequency: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Goal Value</Label>
                  <Input
                    type="number"
                    value={formData.goal_value}
                    onChange={(e) => setFormData({...formData, goal_value: parseInt(e.target.value)})}
                  />
                </div>
                
                <div>
                  <Label>Points Reward</Label>
                  <Input
                    type="number"
                    value={formData.points_reward}
                    onChange={(e) => setFormData({...formData, points_reward: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>
              
              <Button onClick={handleSubmit} disabled={createMutation.isLoading} className="w-full">
                {createMutation.isLoading ? 'Creating...' : 'Create Challenge'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <WellnessInsightsPanel />
      
      <div className="grid grid-cols-1 gap-4">
        {challenges.map(challenge => (
          <Card key={challenge.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </div>
                <Badge variant={challenge.status === 'active' ? 'default' : 'outline'}>
                  {challenge.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="font-semibold capitalize">{challenge.challenge_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Goal</p>
                  <p className="font-semibold">{challenge.goal_value} {challenge.goal_unit}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Participants</p>
                  <p className="font-semibold">{challenge.participant_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reward</p>
                  <p className="font-semibold text-int-orange">{challenge.points_reward} pts</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {challenge.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: challenge.id, status: 'active' })}
                  >
                    Activate
                  </Button>
                )}
                {challenge.status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatusMutation.mutate({ id: challenge.id, status: 'completed' })}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}