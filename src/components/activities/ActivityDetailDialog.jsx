/**
 * ACTIVITY DETAIL DIALOG
 * Modal for viewing full activity details
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GraduationCap } from 'lucide-react';

export default function ActivityDetailDialog({
  activity,
  onClose,
  onSchedule,
  onDuplicate
}) {
  if (!activity) return null;

  const handleSchedule = () => {
    onSchedule(activity);
    onClose();
  };

  const handleDuplicate = () => {
    onDuplicate(activity);
    onClose();
  };

  return (
    <Dialog data-b44-sync="true" data-feature="activities" data-component="activitydetaildialog" open={!!activity} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{activity.title}</DialogTitle>
          <DialogDescription>
            <div className="flex gap-2 mt-2">
              <Badge>{activity.type}</Badge>
              <Badge variant="outline">{activity.duration}</Badge>
              {activity.skill_level && (
                <Badge variant="secondary">{activity.skill_level}</Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-slate-600">{activity.description}</p>
          </div>
          
          {activity.instructions && (
            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{activity.instructions}</p>
            </div>
          )}
          
          {activity.materials_needed && (
            <div>
              <h4 className="font-semibold mb-2">Materials Needed</h4>
              <p className="text-slate-600">{activity.materials_needed}</p>
            </div>
          )}
          
          {activity.skills_developed?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Skills Developed
              </h4>
              <div className="flex flex-wrap gap-2">
                {activity.skills_developed.map(skill => (
                  <Badge key={skill} className="bg-int-navy text-white">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {activity.learning_outcomes?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Learning Outcomes</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                {activity.learning_outcomes.map((outcome, i) => (
                  <li key={i}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSchedule}
              className="flex-1 bg-int-orange hover:bg-[#C46322] text-white"
            >
              Schedule This Activity
            </Button>
            <Button
              onClick={handleDuplicate}
              variant="outline"
            >
              Duplicate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}