import { useState, useRef } from 'react';
import { Trash2, Check, X } from 'lucide-react';

export default function SwipeableListItem({ 
  children, 
  onDelete, 
  onComplete,
  showDelete = true,
  showComplete = false 
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Limit swipe range
    if (diff < -150) {
      setSwipeOffset(-150);
    } else if (diff > 150) {
      setSwipeOffset(150);
    } else {
      setSwipeOffset(diff);
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Trigger action if swiped far enough
    if (swipeOffset < -100 && showDelete) {
      onDelete?.();
    } else if (swipeOffset > 100 && showComplete) {
      onComplete?.();
    }
    
    // Reset position
    setTimeout(() => setSwipeOffset(0), 100);
  };
  
  return (
    <div className="relative overflow-hidden touch-pan-y">
      {/* Delete action (swipe left) */}
      {showDelete && swipeOffset < -50 && (
        <div className="absolute right-0 top-0 h-full flex items-center justify-end px-6 bg-red-500 rounded-r-lg">
          <Trash2 className="h-5 w-5 text-white" />
        </div>
      )}
      
      {/* Complete action (swipe right) */}
      {showComplete && swipeOffset > 50 && (
        <div className="absolute left-0 top-0 h-full flex items-center justify-start px-6 bg-green-500 rounded-l-lg">
          <Check className="h-5 w-5 text-white" />
        </div>
      )}
      
      {/* Main content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="transition-transform duration-200 ease-out"
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {children}
      </div>
    </div>
  );
}