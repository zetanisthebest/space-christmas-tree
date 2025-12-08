import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TreeState } from '../types';

interface AudioControllerProps {
  state: TreeState;
  isMuted: boolean;
  chaosAudio: HTMLAudioElement;
  treeAudio: HTMLAudioElement;
}

const AudioController: React.FC<AudioControllerProps> = ({ state, isMuted, chaosAudio, treeAudio }) => {
  
  // Volume Fading Logic (Per Frame) - Crossfade between chaos and tree modes
  useFrame((_, delta) => {
    const isTree = state === TreeState.TREE_SHAPE;
    const maxVolume = 0.6;
    
    // --- Chaos Audio (Scattered mode - plays from 0:00) ---
    if (chaosAudio) {
        const targetChaosVolume = (isMuted || isTree) ? 0.0 : maxVolume;
        const currentChaosVolume = chaosAudio.volume;

        // Smooth crossfade
        if (Math.abs(currentChaosVolume - targetChaosVolume) > 0.001) {
            if (currentChaosVolume < targetChaosVolume) {
                chaosAudio.volume = Math.min(targetChaosVolume, currentChaosVolume + delta * 1.5); // Fade in
            } else {
                chaosAudio.volume = Math.max(targetChaosVolume, currentChaosVolume - delta * 2.5); // Faster fade out for transition
            }
        } else {
            chaosAudio.volume = targetChaosVolume;
        }
    }

    // --- Tree Audio (Assembled mode - plays from 0:44) ---
    if (treeAudio) {
        const targetTreeVolume = (isMuted || !isTree) ? 0.0 : maxVolume;
        const currentTreeVolume = treeAudio.volume;

        // Smooth crossfade
        if (Math.abs(currentTreeVolume - targetTreeVolume) > 0.001) {
            if (currentTreeVolume < targetTreeVolume) {
                treeAudio.volume = Math.min(targetTreeVolume, currentTreeVolume + delta * 2.5); // Faster fade in for magical moment
            } else {
                treeAudio.volume = Math.max(targetTreeVolume, currentTreeVolume - delta * 1.5); // Fade out
            }
        } else {
            treeAudio.volume = targetTreeVolume;
        }
    }
  });

  return null;
};

export default AudioController;