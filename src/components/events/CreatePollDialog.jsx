/**
 * CREATE POLL DIALOG
 * Extracted dialog for creating time slot polls
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TimeSlotPollCreator from './TimeSlotPollCreator';

export default function CreatePollDialog({
  open,
  onOpenChange,
  activities = [],
  onSubmit,
  isSubmitting = false
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-b44-sync="true" data-feature="events" data-component="createpolldialog">
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Time Slot Poll</DialogTitle>
          <DialogDescription>
            Let participants vote on their preferred meeting time
          </DialogDescription>
        </DialogHeader>
        <TimeSlotPollCreator
          activities={activities}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}