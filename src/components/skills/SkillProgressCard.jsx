import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, BookOpen, Users, CheckCircle } from 'lucide-react';

const LEVEL_THRESHOLDS = {
  novice: { min: 0, max: 20, color: 'bg-slate-500' },
  beginner: { min: 20, max: 40, color: 'bg-blue-500' },
  intermediate: { min: 40, max: 60, color: 'bg-green-500' },
  advanced: { min: 60, max: 80, color: 'bg-purple-500' },
  expert: { min: 80, max: 100, color: 'bg-int-orange' }
};

export default function SkillProgressCard({ skill, onViewResources, onFindMentor, compact = false }) {
  const levelInfo = LEVEL_THRESHOLDS[skill.proficiency_level] || LEVEL_THRESHOLDS.beginner;
  
  const getTrendIcon = () => {
    const recentGrowth = skill.growth_history?.slice(-3) || [];
    const avgChange = recentGrowth.reduce((sum, h) => sum + (h.score_change || 0), 0) / (recentGrowth.length || 1);
    
    if (avgChange > 2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (avgChange < -2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-8 rounded-full ${levelInfo.color}`} />
          <div>
            <div className="font-medium text-sm">{skill.skill_name}</div>
            <div className="text-xs text-slate-500 capitalize">{skill.proficiency_level}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className="text-sm font-semibold">{skill.proficiency_score || 0}%</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-l-4" style={{ borderLeftColor: levelInfo.color.replace('bg-', '#') }}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {skill.skill_name}
              {skill.is_verified && <CheckCircle className="h-4 w-4 text-green-500" />}
            </CardTitle>
            <Badge variant="outline" className="capitalize mt-1">
              {skill.skill_category?.replace('_', ' ') || 'General'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-xl font-bold">{skill.proficiency_score || 0}</span>
            <span className="text-sm text-slate-500">/100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize">{skill.proficiency_level}</span>
            <span className="text-slate-500">{skill.events_contributed || 0} events</span>
          </div>
          <Progress value={skill.proficiency_score || 0} className="h-2" />
        </div>

        {skill.last_practiced && (
          <p className="text-xs text-slate-500">
            Last practiced: {new Date(skill.last_practiced).toLocaleDateString()}
          </p>
        )}

        {skill.mentorship_status !== 'none' && (
          <Badge className={
            skill.mentorship_status === 'is_mentor' ? 'bg-purple-100 text-purple-700' :
            skill.mentorship_status === 'has_mentor' ? 'bg-green-100 text-green-700' :
            'bg-yellow-100 text-yellow-700'
          }>
            {skill.mentorship_status === 'is_mentor' ? '🎓 Mentoring Others' :
             skill.mentorship_status === 'has_mentor' ? '👥 Has Mentor' :
             '🔍 Seeking Mentor'}
          </Badge>
        )}

        <div className="flex gap-2 pt-2">
          {onViewResources && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewResources(skill)}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Resources
            </Button>
          )}
          {onFindMentor && skill.mentorship_status === 'seeking_mentor' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onFindMentor(skill)}
            >
              <Users className="h-4 w-4 mr-1" />
              Find Mentor
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}