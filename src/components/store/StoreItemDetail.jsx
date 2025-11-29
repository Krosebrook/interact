import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Coins, CreditCard, Sparkles, Clock, ShoppingCart, Check, Loader2 } from 'lucide-react';

const RARITY_COLORS = {
  common: 'bg-slate-100 text-slate-700',
  uncommon: 'bg-green-100 text-green-700',
  rare: 'bg-blue-100 text-blue-700',
  epic: 'bg-purple-100 text-purple-700',
  legendary: 'bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-800'
};

const CATEGORY_LABELS = {
  avatar_hat: 'Hat',
  avatar_glasses: 'Glasses',
  avatar_background: 'Background',
  avatar_frame: 'Frame',
  avatar_effect: 'Effect',
  power_up: 'Power-Up',
  badge_boost: 'Badge Boost'
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

export default function StoreItemDetail({
  item,
  open,
  onClose,
  userPoints = 0,
  owned = false,
  onPurchasePoints,
  onPurchaseStripe,
  isPurchasing = false
}) {
  const [purchaseType, setPurchaseType] = useState(null);
  
  if (!item) return null;

  const canAffordPoints = userPoints >= item.points_cost;
  const isLimited = item.stock_quantity !== null && item.stock_quantity !== undefined;
  const outOfStock = isLimited && item.stock_quantity <= 0;

  const handlePurchase = (type) => {
    setPurchaseType(type);
    if (type === 'points') {
      onPurchasePoints(item);
    } else {
      onPurchaseStripe(item);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{item.icon || CATEGORY_ICONS[item.category]}</span>
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Preview */}
          <div className="relative aspect-video rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-8xl">{item.icon || CATEGORY_ICONS[item.category]}</span>
            )}

            {/* Rarity badge */}
            <Badge className={`absolute top-3 right-3 ${RARITY_COLORS[item.rarity]} capitalize`}>
              {item.rarity}
            </Badge>

            {owned && (
              <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Check className="h-4 w-4" />
                Owned
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{CATEGORY_LABELS[item.category]}</Badge>
              {isLimited && (
                <Badge variant="secondary">
                  {outOfStock ? 'Sold Out' : `${item.stock_quantity} remaining`}
                </Badge>
              )}
              {item.purchase_count > 0 && (
                <span className="text-xs text-slate-500">
                  {item.purchase_count} purchased
                </span>
              )}
            </div>

            <p className="text-slate-600">
              {item.description || `A ${item.rarity} ${CATEGORY_LABELS[item.category].toLowerCase()} to customize your avatar.`}
            </p>

            {/* Power-up effects */}
            {item.category === 'power_up' && item.effect_config && (
              <div className="bg-purple-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 font-semibold">
                  <Sparkles className="h-4 w-4" />
                  Power-Up Effect
                </div>
                <div className="text-sm text-purple-600 space-y-1">
                  {item.effect_config.type === 'points_multiplier' && (
                    <p>• Earn {item.effect_config.multiplier}x points on all activities</p>
                  )}
                  {item.effect_config.type === 'visibility_boost' && (
                    <p>• Your recognitions appear at the top of the feed</p>
                  )}
                  {item.effect_config.type === 'badge_glow' && (
                    <p>• Your badges glow with special effects</p>
                  )}
                  {item.effect_config.type === 'streak_freeze' && (
                    <p>• Protect your streak for one missed day</p>
                  )}
                  {item.effect_config.duration_hours && (
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Duration: {item.effect_config.duration_hours} hours
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Pricing and Purchase */}
          {!owned && !outOfStock ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-700">Purchase Options</div>
              
              <div className="grid gap-3">
                {/* Points purchase */}
                {item.points_cost > 0 && (
                  <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    canAffordPoints ? 'border-int-orange bg-orange-50' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${canAffordPoints ? 'bg-int-orange text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <Coins className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{item.points_cost.toLocaleString()} Points</div>
                        <div className="text-xs text-slate-500">
                          {canAffordPoints 
                            ? `You have ${userPoints.toLocaleString()} points` 
                            : `Need ${(item.points_cost - userPoints).toLocaleString()} more points`}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePurchase('points')}
                      disabled={!canAffordPoints || isPurchasing}
                      className={canAffordPoints ? 'bg-int-orange hover:bg-[#C46322]' : ''}
                    >
                      {isPurchasing && purchaseType === 'points' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Stripe purchase */}
                {item.money_cost_cents > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg border-2 border-green-300 bg-green-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-500 text-white">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold">${(item.money_cost_cents / 100).toFixed(2)}</div>
                        <div className="text-xs text-slate-500">Secure payment via Stripe</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePurchase('stripe')}
                      disabled={isPurchasing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isPurchasing && purchaseType === 'stripe' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : owned ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg text-green-700">
              <Check className="h-5 w-5" />
              <span className="font-semibold">You own this item!</span>
            </div>
          ) : (
            <div className="text-center p-4 bg-slate-100 rounded-lg text-slate-500">
              This item is currently sold out
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}