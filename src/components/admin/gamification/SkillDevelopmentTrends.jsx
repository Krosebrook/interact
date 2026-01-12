import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Target, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../../common/LoadingSpinner';

export default function SkillDevelopmentTrends() {
  const { data: learningProgress, isLoading: loadingProgress } = useQuery({
    queryKey: ['skill-learning-progress'],
    queryFn: () => base44.entities.LearningPathProgress.list()
  });

  const { data: moduleCompletions, isLoading: loadingModules } = useQuery({
    queryKey: ['skill-module-completions'],
    queryFn: () => base44.entities.ModuleCompletion.list()
  });

  const { data: learningPaths, isLoading: loadingPaths } = useQuery({
    queryKey: ['skill-learning-paths'],
    queryFn: () => base44.entities.LearningPath.list()
  });

  const { data: userProfiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ['skill-user-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  // Calculate analytics - must be called before any early returns
  const analytics = useMemo(() => {
    // Total learners
    const uniqueLearners = new Set(learningProgress?.map(p => p.user_email) || []).size;

    // Completion stats
    const totalPaths = learningProgress?.length || 0;
    const completedPaths = learningProgress?.filter(p => p.status === 'completed').length || 0;
    const inProgressPaths = learningProgress?.filter(p => p.status === 'in_progress').length || 0;
    const completionRate = totalPaths > 0 ? ((completedPaths / totalPaths) * 100).toFixed(1) : 0;

    // Module stats
    const totalModules = moduleCompletions?.length || 0;
    const completedModules = moduleCompletions?.filter(m => m.status === 'completed').length || 0;
    const avgQuizScore = moduleCompletions?.filter(m => m.quiz_score > 0)
      .reduce((sum, m) => sum + m.quiz_score, 0) / 
      (moduleCompletions?.filter(m => m.quiz_score > 0).length || 1);

    // Popular skills with validation
    const skillCounts = {};
    learningPaths?.forEach(path => {
      if (path.target_skill) {
        const enrollments = learningProgress?.filter(p => p.learning_path_id === path.id).length || 0;
        if (enrollments > 0) {
          skillCounts[path.target_skill] = (skillCounts[path.target_skill] || 0) + enrollments;
        }
      }
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, learners]) => ({ skill, learners }));

    // Difficulty distribution
    const difficultyStats = {
      beginner: learningPaths?.filter(p => p.difficulty_level === 'beginner').length || 0,
      intermediate: learningPaths?.filter(p => p.difficulty_level === 'intermediate').length || 0,
      advanced: learningPaths?.filter(p => p.difficulty_level === 'advanced').length || 0,
      expert: learningPaths?.filter(p => p.difficulty_level === 'expert').length || 0
    };

    // Most popular paths
    const pathPopularity = learningPaths?.map(path => ({
      title: path.title,
      enrollments: learningProgress?.filter(p => p.learning_path_id === path.id).length || 0,
      completions: learningProgress?.filter(p => p.learning_path_id === path.id && p.status === 'completed').length || 0
    })).sort((a, b) => b.enrollments - a.enrollments).slice(0, 10);

    // Skill interests from profiles
    const allSkillInterests = userProfiles?.flatMap(p => p.skill_interests || []) || [];
    const skillInterestCounts = {};
    allSkillInterests.forEach(skill => {
      skillInterestCounts[skill] = (skillInterestCounts[skill] || 0) + 1;
    });
    const topInterests = Object.entries(skillInterestCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, users: count }));

    return {
      uniqueLearners,
      totalPaths,
      completedPaths,
      inProgressPaths,
      completionRate,
      totalModules,
      completedModules,
      avgQuizScore,
      topSkills,
      difficultyStats,
      pathPopularity,
      topInterests
    };
  }, [learningProgress, moduleCompletions, learningPaths, userProfiles]);

  // Check loading state after all hooks are called
  if (loadingProgress || loadingModules || loadingPaths || loadingProfiles) {
    return <LoadingSpinner />;
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
            <p className="text-2xl font-bold text-int-navy">{analytics.uniqueLearners}</p>
            <p className="text-xs text-slate-600">Active Learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-8 w-8 text-purple-600 opacity-20" />
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                {analytics.completionRate}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-int-navy">{analytics.completedPaths}</p>
            <p className="text-xs text-slate-600">Paths Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-emerald-600 opacity-20" />
            </div>
            <p className="text-2xl font-bold text-int-navy">{analytics.inProgressPaths}</p>
            <p className="text-xs text-slate-600">In Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-amber-600 opacity-20" />
            </div>
            <p className="text-2xl font-bold text-int-navy">{Math.round(analytics.avgQuizScore)}%</p>
            <p className="text-xs text-slate-600">Avg Quiz Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Skills Being Learned */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Skills</CardTitle>
            <CardDescription>Top skills users are learning</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topSkills}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="learners" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Path Difficulty Distribution</CardTitle>
            <CardDescription>Learning paths by difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Beginner', value: analytics.difficultyStats.beginner },
                    { name: 'Intermediate', value: analytics.difficultyStats.intermediate },
                    { name: 'Advanced', value: analytics.difficultyStats.advanced },
                    { name: 'Expert', value: analytics.difficultyStats.expert }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Most Popular Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Learning Paths</CardTitle>
          <CardDescription>Paths with the most enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.pathPopularity?.map((path, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{path.title}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                    <span>{path.enrollments} enrollments</span>
                    <span>•</span>
                    <span>{path.completions} completions</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">
                      {path.enrollments > 0 ? Math.round((path.completions / path.enrollments) * 100) : 0}% completion rate
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Top Skill Interests</CardTitle>
          <CardDescription>Skills users want to develop</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.topInterests?.map((interest, idx) => (
              <Badge
                key={idx}
                className="text-sm py-2 px-3"
                style={{ backgroundColor: COLORS[idx % COLORS.length], color: 'white' }}
              >
                {interest.skill} ({interest.users} users)
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}