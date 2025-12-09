import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TreeState } from '../types';

interface AudioControllerProps {
  state: TreeState;
  isMuted: boolean;
  audio: HTMLAudioElement;
}

const AudioController: React.FC<AudioControllerProps> = ({ state, isMuted, audio }) => {
  
  // Volume Fading Logic (Per Frame)
  useFrame((_, delta) => {
    const maxVolume = 0.6;
    
    // Target volume based on muted state
    const targetVolume = isMuted ? 0.0 : maxVolume;
    const currentVolume = audio.volume;

    // Smooth volume fade
    if (Math.abs(currentVolume - targetVolume) > 0.001) {
      if (currentVolume < targetVolume) {
        audio.volume = Math.min(targetVolume, currentVolume + delta * 1.5); // Fade in
      } else {
        audio.volume = Math.max(targetVolume, currentVolume - delta * 1.5); // Fade out
      }
    } else {
      audio.volume = targetVolume;
    }
  });

  return null;
};

export default AudioController;