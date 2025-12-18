/**
 * CONTEXTUAL HELP SYSTEM
 * Reusable tooltips and help popovers for features
 */

import React, { useState } from 'react';
import { HelpCircle, BookOpen, Video, ExternalLink } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Simple help tooltip for inline context
 */
export function HelpTooltip({ title, description, learnMoreUrl, variant = 'default' }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center w-4 h-4 ml-1 text-slate-400 hover:text-int-orange transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
          {learnMoreUrl && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-int-orange"
              onClick={() => window.open(learnMoreUrl, '_blank')}
            >
              Learn more <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Feature card with tutorial link
 */
export function FeatureHelpCard({ 
  icon: Icon, 
  title, 
  description, 
  tutorialUrl, 
  videoUrl,
  isNew = false 
}) {
  return (
    <div className="relative p-4 rounded-lg border border-slate-200 bg-white hover:border-int-orange transition-all group">
      {isNew && (
        <Badge className="absolute -top-2 -right-2 bg-int-orange text-white">
          New
        </Badge>
      )}
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-int-orange/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-int-orange" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
          <p className="text-sm text-slate-600 mb-3">{description}</p>
          
          <div className="flex gap-2">
            {tutorialUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open(tutorialUrl, '_blank')}
              >
                <BookOpen className="w-3 h-3" />
                Tutorial
              </Button>
            )}
            {videoUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open(videoUrl, '_blank')}
              >
                <Video className="w-3 h-3" />
                Watch
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state with tutorial CTA
 */
export function EmptyStateWithTutorial({ 
  icon: Icon,
  title, 
  description, 
  tutorialLabel = "Learn How",
  onStartTutorial,
  primaryAction 
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 max-w-md mx-auto mb-6">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            className="bg-int-orange hover:bg-int-orange/90"
          >
            {primaryAction.label}
          </Button>
        )}
        
        {onStartTutorial && (
          <Button
            variant="outline"
            onClick={onStartTutorial}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            {tutorialLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline feature highlight badge
 */
export function FeatureHighlight({ label, variant = 'new' }) {
  const variants = {
    new: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    improved: 'bg-blue-100 text-blue-700 border-blue-200',
    beta: 'bg-purple-100 text-purple-700 border-purple-200'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${variants[variant]} text-xs font-medium px-2 py-0.5`}
    >
      {label === 'new' ? '🆕 New' : label === 'improved' ? '⚡ Improved' : '🔬 Beta'}
    </Badge>
  );
}