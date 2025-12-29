import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIFeedbackPanel({ feedback, onClose }) {
  if (!feedback) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className="max-w-2xl w-full bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg">Task Completed! 🎉</p>
              <p className="text-sm font-normal text-slate-500">AI-Powered Feedback</p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Celebration */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <p className="text-purple-900 leading-relaxed">{feedback.celebration}</p>
          </div>

          {/* Skills Developed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h4 className="font-semibold text-slate-900">Skills You're Developing</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {feedback.skills_developed?.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Next Task Suggestion */}
          {feedback.next_task_suggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Recommended Next Step</h4>
              </div>
              <p className="text-sm text-blue-800">{feedback.next_task_suggestion}</p>
            </div>
          )}

          {/* Success Tip */}
          {feedback.success_tip && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <h4 className="font-semibold text-amber-900">Pro Tip</h4>
              </div>
              <p className="text-sm text-amber-800">{feedback.success_tip}</p>
            </div>
          )}

          {/* Encouragement */}
          {feedback.encouragement && (
            <div className="text-center">
              <p className="text-slate-600 italic">"{feedback.encouragement}"</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Continue Learning
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}