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
    audioElement.load();
    return audioElement;
  });

  // Initialize audio on first user interaction (mobile Safari requirement)
  const initializeAudio = () => {
    if (!audioInitialized) {
      audio.currentTime = CHAOS_START_TIME;
      audio.play().catch(e => console.warn("Audio autoplay blocked:", e));
      setAudioInitialized(true);
    }
  };

  const toggleState = () => {
    // Initialize audio on first click
    initializeAudio();
    
    const newState = treeState === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED;
    
    if (newState === TreeState.TREE_SHAPE) {
      // Assembling: Jump to tree section
      if (!hasAssembled) {
        setHasAssembled(true);
      }
      audio.currentTime = TREE_START_TIME;
      if (audio.paused) {
        audio.play().catch(e => console.warn("Audio play blocked:", e));
      }
    } else {
      // Scattering: Jump back to chaos section
      audio.currentTime = CHAOS_START_TIME;
      if (audio.paused) {
        audio.play().catch(e => console.warn("Audio play blocked:", e));
      }
    }
    
    setTreeState(newState);
  };

  const toggleMute = () => {
    // Initialize audio on mute toggle
    initializeAudio();
    
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