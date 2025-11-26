/**
 * Sound Effects System for PWA
 * Provides audio feedback for user interactions
 */

// Pre-defined sound frequencies and durations
const SOUNDS = {
  click: { frequency: 800, duration: 50, type: 'square', volume: 0.1 },
  sparkle: { frequencies: [1200, 1400, 1600], duration: 100, type: 'sine', volume: 0.08 },
  zap: { frequency: 200, endFrequency: 1000, duration: 80, type: 'sawtooth', volume: 0.1 },
  keypress: { frequency: 600, duration: 30, type: 'square', volume: 0.08 },
  success: { frequencies: [523, 659, 784], duration: 150, type: 'sine', volume: 0.1 },
  error: { frequencies: [200, 150], duration: 200, type: 'square', volume: 0.08 },
  levelUp: { frequencies: [392, 523, 659, 784, 1047], duration: 120, type: 'sine', volume: 0.12 },
  badge: { frequencies: [659, 784, 1047, 1319], duration: 100, type: 'sine', volume: 0.1 },
  points: { frequency: 880, duration: 60, type: 'sine', volume: 0.08 },
  whoosh: { frequency: 400, endFrequency: 100, duration: 150, type: 'sine', volume: 0.06 },
  pop: { frequency: 1000, duration: 40, type: 'sine', volume: 0.1 },
  notification: { frequencies: [880, 1100], duration: 100, type: 'sine', volume: 0.1 }
};

let audioContext = null;
let soundEnabled = true;

/**
 * Initialize the audio context (must be called after user interaction)
 */
export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Enable or disable sounds
 */
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  localStorage.setItem('soundEnabled', enabled ? 'true' : 'false');
}

/**
 * Check if sounds are enabled
 */
export function isSoundEnabled() {
  const stored = localStorage.getItem('soundEnabled');
  if (stored !== null) {
    soundEnabled = stored === 'true';
  }
  return soundEnabled;
}

/**
 * Play a single tone
 */
function playTone(frequency, duration, type = 'sine', volume = 0.1, endFrequency = null) {
  if (!soundEnabled || !audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        endFrequency, 
        audioContext.currentTime + duration / 1000
      );
    }
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (e) {
    // Silently fail if audio isn't available
  }
}

/**
 * Play a sequence of tones
 */
function playSequence(frequencies, duration, type = 'sine', volume = 0.1) {
  if (!soundEnabled || !audioContext) return;
  
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      playTone(freq, duration, type, volume);
    }, index * (duration * 0.7));
  });
}

/**
 * Play a specific sound effect
 */
export function playSound(soundName) {
  if (!soundEnabled) return;
  
  // Initialize audio context on first sound
  if (!audioContext) {
    initAudio();
  }
  
  // Resume audio context if suspended
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const sound = SOUNDS[soundName];
  if (!sound) return;
  
  if (sound.frequencies) {
    playSequence(sound.frequencies, sound.duration, sound.type, sound.volume);
  } else if (sound.endFrequency) {
    playTone(sound.frequency, sound.duration, sound.type, sound.volume, sound.endFrequency);
  } else {
    playTone(sound.frequency, sound.duration, sound.type, sound.volume);
  }
}

/**
 * Sound effect hooks for common interactions
 */
export const SoundEffects = {
  click: () => playSound('click'),
  sparkle: () => playSound('sparkle'),
  zap: () => playSound('zap'),
  keypress: () => playSound('keypress'),
  success: () => playSound('success'),
  error: () => playSound('error'),
  levelUp: () => playSound('levelUp'),
  badge: () => playSound('badge'),
  points: () => playSound('points'),
  whoosh: () => playSound('whoosh'),
  pop: () => playSound('pop'),
  notification: () => playSound('notification')
};

/**
 * React hook for click sounds on buttons
 */
export function useClickSound() {
  return () => {
    playSound('click');
  };
}

/**
 * Add click sound to an element's onClick handler
 */
export function withClickSound(onClick) {
  return (e) => {
    playSound('click');
    onClick?.(e);
  };
}

export default SoundEffects;