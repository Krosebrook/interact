import React from 'react';
import { Trophy, Award, Crown, Gem, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_CONFIG = {
  bronze: {
    icon: Award,
    colors: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white',
    borderColor: 'border-amber-600',
    glowColor: 'shadow-amber-500/50',
  },
  silver: {
    icon: Trophy,
    colors: 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900',
    borderColor: 'border-slate-400',
    glowColor: 'shadow-slate-400/50',
  },
  gold: {
    icon: Crown,
    colors: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900',
    borderColor: 'border-yellow-500',
    glowColor: 'shadow-yellow-400/50',
  },
  platinum: {
    icon: Gem,
    colors: 'bg-gradient-to-br from-cyan-200 to-cyan-400 text-cyan-900',
    borderColor: 'border-cyan-300',
    glowColor: 'shadow-cyan-300/50',
  },
  diamond: {
    icon: Sparkles,
    colors: 'bg-gradient-to-br from-blue-400 to-purple-600 text-white',
    borderColor: 'border-purple-500',
    glowColor: 'shadow-purple-500/50',
  },
};

const SIZE_CONFIG = {
  small: {
    container: 'h-6 w-6',
    icon: 'h-3 w-3',
    text: 'text-xs',
  },
  medium: {
    container: 'h-10 w-10',
    icon: 'h-5 w-5',
    text: 'text-sm',
  },
  large: {
    container: 'h-16 w-16',
    icon: 'h-8 w-8',
    text: 'text-base',
  },
};

export default function TierBadge({ tier, size = 'medium', showLabel = false, className }) {
  if (!tier || !tier.tier_name) return null;

  const config = TIER_CONFIG[tier.tier_name] || TIER_CONFIG.bronze;
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'rounded-full flex items-center justify-center border-2 shadow-lg',
            config.colors,
            config.borderColor,
            config.glowColor,
            sizeConfig.container
          )}
        >
          <Icon className={sizeConfig.icon} />
        </div>
        <span className={cn('font-semibold', sizeConfig.text)}>
          {tier.display_name || tier.tier_name}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center border-2 shadow-lg',
        config.colors,
        config.borderColor,
        config.glowColor,
        sizeConfig.container,
        className
      )}
      title={tier.display_name || tier.tier_name}
    >
      <Icon className={sizeConfig.icon} />
    </div>
  );
}