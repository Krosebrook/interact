import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard, Sparkles, Clock, Lock } from 'lucide-react';

const RARITY_COLORS = {
  common: 'bg-slate-100 text-slate-700 border-slate-300',
  uncommon: 'bg-green-100 text-green-700 border-green-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-amber-100 text-amber-700 border-amber-300'
};

const RARITY_GLOW = {
  common: '',
  uncommon: 'hover:shadow-green-200',
  rare: 'hover:shadow-blue-200',
  epic: 'hover:shadow-purple-300',
  legendary: 'hover:shadow-amber-300 ring-2 ring-amber-200'
};

const CATEGORY_ICONS = {
  avatar_hat: '🎩',
  avatar_glasses: '👓',
  avatar_background: '🖼️',
  avatar_frame: '✨',
  avatar_effect: '🌟',
  power_up: '⚡',
  badge_boost: '🏅'
};

export default function StoreItemCard({ 
  item, 
  userPoints = 0, 
  owned = false,
  onViewDetails,
  onQuickBuy
}) {
  const canAffordPoints = userPoints >= item.points_cost;
  const isLimited = item.stock_quantity !== null && item.stock_quantity !== undefined;
  const outOfStock = isLimited && item.stock_quantity <= 0;

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl ${RARITY_GLOW[item.rarity]} cursor-pointer`}
      onClick={() => onViewDetails(item)}
    >
      {/* Rarity indicator stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        item.rarity === 'legendary' ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400' :
        item.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
        item.rarity === 'rare' ? 'bg-blue-500' :
        item.rarity === 'uncommon' ? 'bg-green-500' : 'bg-slate-300'
      }`} />

      <CardContent className="p-4">
        {/* Item Image/Icon */}
        <div className="relative aspect-square mb-3 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <span className="text-5xl">{item.icon || CATEGORY_ICONS[item.category]}</span>
          )}

          {/* Owned badge */}
          {owned && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Owned
            </div>
          )}

          {/* Limited stock badge */}
          {isLimited && !outOfStock && (
            <div className="absolute top-2 left-2 bg-int-orange text-white px-2 py-1 rounded-full text-xs font-semibold">
              {item.stock_quantity} left
            </div>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold">SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
            <Badge className={`${RARITY_COLORS[item.rarity]} text-xs capitalize shrink-0`}>
              {item.rarity}
            </Badge>
          </div>

          <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
            {item.description || `A ${item.rarity} ${item.category.replace('avatar_', '')} for your avatar`}
          </p>

          {/* Power-up info */}
          {item.category === 'power_up' && item.effect_config && (
            <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              <Sparkles className="h-3 w-3" />
              {item.effect_config.type === 'points_multiplier' && `${item.effect_config.multiplier}x Points`}
              {item.effect_config.type === 'visibility_boost' && 'Visibility Boost'}
              {item.effect_config.duration_hours && (
                <span className="flex items-center gap-1 ml-1">
                  <Clock className="h-3 w-3" />
                  {item.effect_config.duration_hours}h
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex flex-col gap-1">
              {item.points_cost > 0 && (
                <div className={`flex items-center gap-1 ${canAffordPoints ? 'text-int-orange' : 'text-slate-400'}`}>
                  <Coins className="h-4 w-4" />
                  <span className="font-bold">{item.points_cost.toLocaleString()}</span>
                </div>
              )}
              {item.money_cost_cents > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-bold">${(item.money_cost_cents / 100).toFixed(2)}</span>
                </div>
              )}
            </div>

            {!owned && !outOfStock && (
              <Button
                size="sm"
                variant={canAffordPoints ? 'default' : 'outline'}
                className={canAffordPoints ? 'bg-int-orange hover:bg-[#C46322]' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canAffordPoints) {
                    onQuickBuy(item, 'points');
                  } else if (item.money_cost_cents) {
                    onQuickBuy(item, 'stripe');
                  }
                }}
                disabled={!canAffordPoints && !item.money_cost_cents}
              >
                {canAffordPoints ? 'Buy' : item.money_cost_cents ? 'Buy $' : <Lock className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}