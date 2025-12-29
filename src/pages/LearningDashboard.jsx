import React from 'react';
import { useUserData } from '../components/hooks/useUserData';
import GamifiedLearningDashboard from '../components/learning/GamifiedLearningDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LearningDashboard() {
  const { user, loading } = useUserData(true);

  if (loading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }
  const [activeTab, setActiveTab] = useState('my-paths');
  const [targetSkill, setTargetSkill] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [targetLevel, setTargetLevel] = useState('intermediate');

  // Fetch user's learning paths
  const { data: myPaths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ['my-learning-paths', user?.email],
    queryFn: async () => {
      return await base44.entities.LearningPath.filter({
        created_for: user?.email
      });
    },
    enabled: !!user?.email
  });

  // Fetch learning progress
  const { data: myProgress = [] } = useQuery({
    queryKey: ['learning-progress', user?.email],
    queryFn: async () => {
      return await base44.entities.LearningPathProgress.filter({
        user_email: user?.email
      });
    },
    enabled: !!user?.email
  });

  // Analyze skill gaps
  const analyzeGapsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'analyze_skill_gaps',
        context: { user_email: user?.email }
      });
      return response.data;
    },
    onSuccess: () => toast.success('Skill gaps analyzed!')
  });

  // Generate learning path
  const generatePathMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'generate_learning_path',
        context: {
          target_skill: targetSkill,
          current_level: currentLevel,
          target_level: targetLevel,
          user_email: user?.email
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Learning path created!');
      setTargetSkill('');
      queryClient.invalidateQueries(['my-learning-paths']);
    }
  });

  // Recommend resources
  const recommendMutation = useMutation({
    mutationFn: async (skillGaps) => {
      const response = await base44.functions.invoke('learningPathAI', {
        action: 'recommend_resources',
        context: {
          skill_gaps: skillGaps,
          user_email: user?.email
        }
      });
      return response.data;
    }
  });

  const queryClient = useQueryClient();

  const activePaths = myPaths.filter(p => {
    const prog = myProgress.find(pr => pr.learning_path_id === p.id);
    return prog?.status === 'in_progress';
  });

  const completedPaths = myPaths.filter(p => {
    const prog = myProgress.find(pr => pr.learning_path_id === p.id);
    return prog?.status === 'completed';
  });

  const notStartedPaths = myPaths.filter(p => {
    return !myProgress.some(pr => pr.learning_path_id === p.id);
  });

  if (pathsLoading) {
    return <LoadingSpinner className="min-h-[60vh]" message="Loading learning paths..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Learning & Development</h1>
        <p className="text-slate-600 mt-1">Grow your skills with gamified learning paths</p>
      </div>

      <GamifiedLearningDashboard userEmail={user?.email} />
    </div>
  );
}