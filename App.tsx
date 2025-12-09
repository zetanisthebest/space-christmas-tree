import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import { TreeState } from './types';

// Main Song: Local Christmas Music
const AUDIO_URL = '/christmas-music.mp3';
const CHAOS_START_TIME = 0; // Chaos mode starts at 0:00
const TREE_START_TIME = 44; // Tree mode starts at 0:44

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);
  // Start muted by default to comply with browser autoplay policies
  const [isMuted, setIsMuted] = useState(true);
  const [hasAssembled, setHasAssembled] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize single audio element for better mobile compatibility
  const [audio] = useState(() => {
    const audioElement = new Audio(AUDIO_URL);
    audioElement.loop = true;
    audioElement.volume = 0;
    audioElement.preload = "auto";
    // Mobile Safari specific settings
    audioElement.setAttribute('playsinline', 'true');
    audioElement.load();
    return audioElement;
  });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audio]);

  // Initialize audio on first user interaction (mobile Safari requirement)
  const initializeAudio = async () => {
    if (!audioInitialized) {
      try {
        audio.currentTime = CHAOS_START_TIME;
        // Must call play() synchronously in user gesture for mobile Safari
        await audio.play();
        setAudioInitialized(true);
      } catch (e) {
        console.warn("Audio autoplay blocked:", e);
      }
    }
  };

  const toggleState = async () => {
    const newState = treeState === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED;
    
    // Initialize and play audio on first click (mobile Safari requirement)
    if (!audioInitialized) {
      try {
        audio.currentTime = newState === TreeState.TREE_SHAPE ? TREE_START_TIME : CHAOS_START_TIME;
        await audio.play();
        setAudioInitialized(true);
      } catch (e) {
        console.warn("Audio play blocked:", e);
      }
    } else {
      // Change playback position for subsequent clicks
      audio.currentTime = newState === TreeState.TREE_SHAPE ? TREE_START_TIME : CHAOS_START_TIME;
      if (audio.paused) {
        try {
          await audio.play();
        } catch (e) {
          console.warn("Audio play blocked:", e);
        }
      }
    }
    
    if (newState === TreeState.TREE_SHAPE && !hasAssembled) {
      setHasAssembled(true);
    }
    
    setTreeState(newState);
  };

  const toggleMute = async () => {
    // Initialize audio on mute toggle if not already done
    if (!audioInitialized) {
      try {
        audio.currentTime = CHAOS_START_TIME;
        await audio.play();
        setAudioInitialized(true);
      } catch (e) {
        console.warn("Audio play blocked:", e);
      }
    }
    
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-screen bg-neutral-900 overflow-hidden">
      <Scene 
        treeState={treeState} 
        isMuted={isMuted} 
        audio={audio}
      />
      <UIOverlay 
        currentState={treeState} 
        onToggle={toggleState} 
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    </div>
  );
};

export default App;