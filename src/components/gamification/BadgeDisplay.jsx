import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const rarityColors = {
  common: "bg-slate-100 border-slate-300 text-slate-700",
  rare: "bg-blue-100 border-blue-300 text-blue-700",
  epic: "bg-purple-100 border-purple-300 text-purple-700",
  legendary: "bg-gradient-to-br from-yellow-400 to-orange-500 border-orange-400 text-white"
};

export default function BadgeDisplay({ badge, earned, progress }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className={`p-4 text-center border-2 transition-all cursor-pointer ${
              earned 
                ? rarityColors[badge.rarity] 
                : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
            }`}>
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="text-xs font-semibold truncate">
                {badge.name}
              </div>
              {!earned && progress !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(progress * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {Math.round(progress * 100)}%
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-semibold mb-1">{badge.name}</div>
            <div className="text-xs text-slate-600">{badge.description}</div>
            {badge.criteria_value && (
              <div className="text-xs text-slate-500 mt-1">
                Requirement: {badge.criteria_value} {badge.criteria_type.replace('_', ' ')}
              </div>
            )}
            <Badge variant="outline" className="mt-2 text-xs">
              {badge.rarity}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}