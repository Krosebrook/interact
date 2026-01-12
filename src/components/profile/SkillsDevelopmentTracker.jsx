/**
 * REFACTORED SKILLS DEVELOPMENT TRACKER
 * Production-grade with apiClient and memoization
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { queryKeys } from '../lib/queryKeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  BookOpen,
  Award,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const SKILL_COLORS = {
  beginner: { bg: 'bg-blue-100', text: 'text-blue-700', progress: 'bg-blue-500' },
  intermediate: { bg: 'bg-emerald-100', text: 'text-emerald-700', progress: 'bg-emerald-500' },
  advanced: { bg: 'bg-purple-100', text: 'text-purple-700', progress: 'bg-purple-500' },
  expert: { bg: 'bg-amber-100', text: 'text-amber-700', progress: 'bg-amber-500' }
};

const SKILL_PROGRESS = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100
};

export default function SkillsDevelopmentTracker({ userEmail, profile }) {
  // Optimized queries
  const { data: participations = [] } = useQuery({
    queryKey: queryKeys.profile.participations(userEmail),
    queryFn: () => apiClient.list('Participation', { 
      filters: { participant_email: userEmail },
      limit: 100 
    }),
    enabled: !!userEmail,
    staleTime: 30000
  });

  const { data: skillTracking = [] } = useQuery({
    queryKey: queryKeys.profile.skillTracking(userEmail),
    queryFn: () => apiClient.list('SkillTracking', { 
      filters: { user_email: userEmail } 
    }),
    enabled: !!userEmail,
    staleTime: 60000
  });

  // Memoized profile data
  const { skillLevels, skillInterests, expertiseAreas, learningGoals } = useMemo(() => ({
    skillLevels: profile?.skill_levels || [],
    skillInterests: profile?.skill_interests || [],
    expertiseAreas: profile?.expertise_areas || [],
    learningGoals: profile?.learning_goals || []
  }), [profile]);

  // Memoized skills from events calculation
  const topSkillsFromEvents = useMemo(() => {
    const skillsFromEvents = participations
      .flatMap(p => p.skills_gained || [])
      .reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(skillsFromEvents)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [participations]);

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="skillsdevelopmenttracker">
      {/* Skills Progress Overview */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Development
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {skillLevels.length === 0 ? (
            <div className="text-center py-6">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No skills tracked yet</p>
              <p className="text-sm text-slate-500">Add skills in the Interests tab to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {skillLevels.map((skillItem, idx) => {
                const colors = SKILL_COLORS[skillItem.level] || SKILL_COLORS.beginner;
                const progress = SKILL_PROGRESS[skillItem.level] || 25;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800">{skillItem.skill}</span>
                      <Badge className={`${colors.bg} ${colors.text}`}>
                        {skillItem.level}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills from Events */}
      {topSkillsFromEvents.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Skills Gained from Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {topSkillsFromEvents.map(([skill, count], idx) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
                >
                  <p className="font-medium text-slate-800">{skill}</p>
                  <p className="text-sm text-blue-600">{count} event{count > 1 ? 's' : ''}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expertise Areas (Can Mentor) */}
      {expertiseAreas.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-amber-600" />
              Expertise Areas
              <Badge variant="outline" className="ml-auto text-xs">Can Mentor</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expertiseAreas.map((area, idx) => (
                <Badge 
                  key={idx} 
                  className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 px-3 py-1"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Goals */}
      {learningGoals.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {learningGoals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{goal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Skills Interested In */}
      {skillInterests.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-emerald-600" />
              Skills I Want to Develop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillInterests.map((skill, idx) => (
                <Badge 
                  key={idx}
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}