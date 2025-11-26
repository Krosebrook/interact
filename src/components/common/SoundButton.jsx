import React from 'react';
import { Button } from '@/components/ui/button';
import { playSound, initAudio } from '../utils/soundEffects';

/**
 * Button component with built-in sound effects
 */
export default function SoundButton({ 
  children, 
  onClick, 
  soundType = 'click',
  ...props 
}) {
  const handleClick = (e) => {
    initAudio();
    playSound(soundType);
    onClick?.(e);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}

/**
 * Higher-order component to add sound to any clickable element
 */
export function withSound(WrappedComponent, soundType = 'click') {
  return function SoundWrapper({ onClick, ...props }) {
    const handleClick = (e) => {
      initAudio();
      playSound(soundType);
      onClick?.(e);
    };

    return <WrappedComponent onClick={handleClick} {...props} />;
  };
}