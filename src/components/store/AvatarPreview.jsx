import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Sparkles, RotateCcw, Save } from 'lucide-react';
import { SLOT_CONFIG } from './hooks/useAvatarCustomization';

/**
 * Avatar preview component showing equipped items
 * Displays layered avatar with accessories
 */
export default function AvatarPreview({
  userName,
  selectedItems,
  getEquippedItem,
  hasChanges,
  onReset,
  onSave,
  isSaving
}) {
  return (
    <Card className="glass-card-solid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-int-orange" />
          Avatar Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Avatar Display Area */}
        <div className="aspect-square max-w-sm mx-auto relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {/* Background layer */}
          <BackgroundLayer item={getEquippedItem('background')} />
          
          {/* Frame layer */}
          {selectedItems.frame && <FrameLayer />}
          
          {/* Avatar base with accessories */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* User avatar circle */}
              <div className="w-32 h-32 rounded-full bg-int-orange flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {userName?.charAt(0) || '?'}
              </div>

              {/* Hat layer */}
              <HatLayer item={getEquippedItem('hat')} />
              
              {/* Glasses layer */}
              <GlassesLayer item={getEquippedItem('glasses')} />
            </div>
          </div>

          {/* Effect layer */}
          {selectedItems.effect && <EffectLayer />}
        </div>

        {/* Equipment summary badges */}
        <EquipmentSummary 
          selectedItems={selectedItems}
          getEquippedItem={getEquippedItem}
        />

        {/* Action buttons */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={!hasChanges}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            className="flex-1 bg-int-orange hover:bg-[#C46322]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Avatar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Layer sub-components
function BackgroundLayer({ item }) {
  if (!item) return null;
  
  return item.storeItem?.image_url ? (
    <img 
      src={item.storeItem.image_url} 
      alt="Background"
      className="absolute inset-0 w-full h-full object-cover"
    />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
      {item.storeItem?.icon || '🖼️'}
    </div>
  );
}

function FrameLayer() {
  return (
    <div className="absolute inset-0 border-8 border-amber-400 rounded-2xl pointer-events-none" />
  );
}

function HatLayer({ item }) {
  if (!item) return null;
  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl">
      {item.storeItem?.icon || '🎩'}
    </div>
  );
}

function GlassesLayer({ item }) {
  if (!item) return null;
  return (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-4xl">
      {item.storeItem?.icon || '👓'}
    </div>
  );
}

function EffectLayer() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <Sparkles className="h-full w-full text-amber-400 opacity-30 animate-pulse" />
    </div>
  );
}

function EquipmentSummary({ selectedItems, getEquippedItem }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 justify-center">
      {Object.entries(SLOT_CONFIG).map(([slot, config]) => {
        const equipped = getEquippedItem(slot);
        return (
          <Badge 
            key={slot}
            variant={equipped ? 'default' : 'outline'}
            className={equipped ? 'bg-int-orange' : 'text-slate-400'}
          >
            {config.icon} {equipped ? equipped.item_name : 'None'}
          </Badge>
        );
      })}
    </div>
  );
}