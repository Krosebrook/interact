import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { SLOT_CONFIG, RARITY_BORDER } from './hooks/useAvatarCustomization';

/**
 * Inventory selector component for choosing avatar items
 * Displays owned items organized by slot category
 */
export default function InventorySelector({
  activeSlot,
  onSlotChange,
  selectedItems,
  getSlotItems,
  onSelectItem
}) {
  return (
    <Card className="glass-card-solid">
      <CardHeader>
        <CardTitle>Your Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSlot} onValueChange={onSlotChange}>
          {/* Slot tabs */}
          <TabsList className="grid grid-cols-5 mb-4">
            {Object.entries(SLOT_CONFIG).map(([slot, config]) => (
              <TabsTrigger key={slot} value={slot} className="text-xs">
                <span className="mr-1">{config.icon}</span>
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content for each slot */}
          {Object.entries(SLOT_CONFIG).map(([slot, config]) => (
            <TabsContent key={slot} value={slot}>
              <SlotItems
                slot={slot}
                config={config}
                items={getSlotItems(slot)}
                selectedItemId={selectedItems[slot]}
                onSelectItem={(itemId) => onSelectItem(slot, itemId)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function SlotItems({ slot, config, items, selectedItemId, onSelectItem }) {
  if (items.length === 0) {
    return (
      <EmptySlot icon={config.icon} label={config.label} />
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <InventoryItem
            key={item.id}
            item={item}
            icon={config.icon}
            isSelected={selectedItemId === item.item_id}
            onSelect={() => onSelectItem(item.item_id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function EmptySlot({ icon, label }) {
  return (
    <div className="text-center py-8 text-slate-500">
      <div className="text-4xl mb-2">{icon}</div>
      <p>No {label.toLowerCase()} items owned</p>
      <p className="text-sm">Visit the store to get some!</p>
    </div>
  );
}

function InventoryItem({ item, icon, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`relative p-3 rounded-lg border-2 transition-all ${
        isSelected 
          ? 'border-int-orange bg-orange-50 ring-2 ring-int-orange/30' 
          : `${RARITY_BORDER[item.item_rarity] || RARITY_BORDER.common} hover:border-int-orange/50 bg-white`
      }`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-int-orange rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
      
      {/* Item icon */}
      <div className="text-3xl mb-1">
        {item.storeItem?.icon || icon}
      </div>
      
      {/* Item name */}
      <div className="text-xs font-medium truncate">
        {item.item_name}
      </div>
      
      {/* Rarity badge */}
      <Badge className="text-[10px] mt-1 capitalize" variant="outline">
        {item.item_rarity}
      </Badge>
    </button>
  );
}