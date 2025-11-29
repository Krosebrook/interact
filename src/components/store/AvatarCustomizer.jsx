import React from 'react';
import { useAvatarCustomization } from './hooks/useAvatarCustomization';
import AvatarPreview from './AvatarPreview';
import InventorySelector from './InventorySelector';

/**
 * Avatar customizer component - main entry point
 * Orchestrates avatar preview and inventory selection
 * Uses custom hook for all business logic
 */
export default function AvatarCustomizer({ userEmail, userName }) {
  const {
    activeSlot,
    setActiveSlot,
    selectedItems,
    hasChanges,
    getSlotItems,
    getEquippedItem,
    handleSelectItem,
    handleReset,
    saveMutation,
    saveAvatar
  } = useAvatarCustomization(userEmail);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AvatarPreview
        userName={userName}
        selectedItems={selectedItems}
        getEquippedItem={getEquippedItem}
        hasChanges={hasChanges}
        onReset={handleReset}
        onSave={saveAvatar}
        isSaving={saveMutation.isLoading}
      />

      <InventorySelector
        activeSlot={activeSlot}
        onSlotChange={setActiveSlot}
        selectedItems={selectedItems}
        getSlotItems={getSlotItems}
        onSelectItem={handleSelectItem}
      />
    </div>
  );
}