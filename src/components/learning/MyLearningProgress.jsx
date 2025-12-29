import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock, Award } from 'lucide-react';
import LearningPathCard from './LearningPathCard';

export default function MyLearningProgress({ userEmail, progress, allPaths }) {
  const inProgress = progress?.filter(p => p.status === 'in_progress') || [];
  const completed = progress?.filter(p => p.status === 'completed') || [];

  return (
    <div className="space-y-6">
      {/* In Progress */}
      {inProgress.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            In Progress ({inProgress.length})
          </h3>
          <div className="grid gap-4">
            {inProgress.map((prog) => {
              const path = allPaths?.find(p => p.id === prog.learning_path_id);
              return path ? (
                <LearningPathCard
                  key={prog.id}
                  path={path}
                  userEmail={userEmail}
                  isEnrolled={true}
                  progress={prog}
                />
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Completed ({completed.length})
          </h3>
          <div className="grid gap-4">
            {completed.map((prog) => {
              const path = allPaths?.find(p => p.id === prog.learning_path_id);
              return path ? (
                <CompletedPathCard key={prog.id} path={path} progress={prog} />
              ) : null;
            })}
          </div>
        </div>
      )}

      {inProgress.length === 0 && completed.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600">No learning paths enrolled yet</p>
            <p className="text-sm text-slate-500 mt-1">Explore the catalog to start learning!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompletedPathCard({ path, progress }) {
  return (
    <Card className="border-2 border-emerald-200 bg-emerald-50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <h4 className="font-bold text-lg">{path.title}</h4>
            </div>
            <p className="text-sm text-slate-600">{path.description}</p>
          </div>
          <Badge className="bg-emerald-600 ml-3">Completed</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-white rounded-lg p-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
              <Award className="h-4 w-4" />
              <p className="font-bold text-lg">{path.points_reward}</p>
            </div>
            <p className="text-xs text-slate-600">Points Earned</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-700 mb-1">
              <Clock className="h-4 w-4" />
              <p className="font-bold text-lg">{progress.time_spent_hours || 0}</p>
            </div>
            <p className="text-xs text-slate-600">Hours Spent</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-purple-700">
              {progress.completed_date ? new Date(progress.completed_date).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-slate-600">Completed On</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}