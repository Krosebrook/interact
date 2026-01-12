/**
 * ACTIVITIES HEADER
 * Header component for Activities page with action buttons
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Plus } from 'lucide-react';

export default function ActivitiesHeader({
  activityCount,
  onOpenPlanner,
  onOpenSuggester,
  onOpenModuleBuilder,
  onOpenGenerator,
  canCreate = true
}) {
  return (
    <div data-b44-sync="true" data-feature="activities" data-component="activitiesheader" className="glass-panel-solid relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-int-navy/5 via-transparent to-int-orange/5 pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-int-navy mb-1 font-display">
            <span className="text-highlight">Activity Library</span>
          </h1>
          <p className="text-slate-600 font-medium">
            <span className="text-int-orange font-bold">{activityCount}</span> activities available
          </p>
        </div>
        {canCreate && (
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={onOpenPlanner} className="bg-gradient-purple text-slate-950 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 hover:opacity-90 shadow-lg hover:shadow-xl transition-all press-effect">


              <Brain className="h-4 w-4 mr-2" />
              AI Activity Planner
            </Button>
            <Button
              onClick={onOpenSuggester}
              variant="outline"
              className="border-int-navy text-int-navy hover:bg-int-navy/5 font-medium">

              <Plus className="h-4 w-4 mr-2" />
              AI Suggestions
            </Button>
            <Button
              onClick={onOpenModuleBuilder}
              variant="outline"
              className="border-int-navy text-int-navy hover:bg-int-navy/5 font-medium">

              <Plus className="h-4 w-4 mr-2" />
              Build from Modules
            </Button>
            <Button
              onClick={onOpenGenerator}
              className="bg-int-orange hover:bg-int-orange/90 text-slate-900 font-semibold shadow-md hover:shadow-lg transition-all">

              <Plus className="h-4 w-4 mr-2" />
              Generate Custom
            </Button>
          </div>
        )}
      </div>
    </div>);

}