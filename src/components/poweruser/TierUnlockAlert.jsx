import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TIER_CONFIGS = {
  tier1_discovery: {
    name: 'Advanced Discovery Unlocked',
    description: 'Your deal momentum earned deeper analysis tools.',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    features: ['Deal comparisons', 'Saved collections', 'Strategy insights']
  },
  tier2_intelligence: {
    name: 'Portfolio Intelligence Unlocked',
    description: 'Your analytics engagement unlocked forecasting.',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    features: ['Scenario modeling', 'Projections', 'Goal mapping']
  },
  tier3_network: {
    name: 'Network Access Unlocked',
    description: 'Your community engagement opened expert circles.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    features: ['Expert access', 'Signal boosting', 'Premium communities']
  }
};

export default function TierUnlockAlert({ tier, onDismiss }) {
  if (!tier) return null;

  const config = TIER_CONFIGS[tier];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={`bg-gradient-to-br ${config.color} text-white border-0 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-6 h-6" />
            {config.name}
          </CardTitle>
          <p className="text-sm text-white/80 mt-2">{config.description}</p>
        </CardHeader>

        <CardContent className="relative">
          <div className="space-y-3">
            <div className="bg-white/15 rounded-lg p-3">
              <p className="text-xs font-semibold text-white/90 mb-2">Now available:</p>
              <ul className="space-y-1">
                {config.features.map(feature => (
                  <li key={feature} className="text-sm text-white/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full bg-white/20 hover:bg-white/30 text-white"
              onClick={onDismiss}
            >
              Explore New Features
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}