import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import { TreeState } from './types';

// Main Song: Local Christmas Music
const CHAOS_AUDIO_URL = '/christmas-music.mp3'; // Chaos mode audio
const TREE_AUDIO_URL = '/christmas-music.mp3'; // Tree mode audio (you can change this to a different file)

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);
  // Start muted by default to comply with browser autoplay policies
  const [isMuted, setIsMuted] = useState(true);
  const [hasAssembled, setHasAssembled] = useState(false);

  // Initialize Main Audio - Chaos mode (starts at 0:00)
  const [chaosAudio] = useState(() => {
    const audio = new Audio(CHAOS_AUDIO_URL + '?t=' + Date.now());
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audio.load(); // Force load
    return audio;
  });

  // Initialize Tree Audio - Assembled mode (different soundtrack)
  const [treeAudio] = useState(() => {
    const audio = new Audio(TREE_AUDIO_URL + '?t=' + Date.now() + '1');
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audio.load(); // Force load
    return audio;
  });

  // Start chaos audio playing immediately when component mounts
  useEffect(() => {
    chaosAudio.currentTime = 0;
    chaosAudio.play().catch(e => console.warn("Chaos audio autoplay blocked:", e));
  }, [chaosAudio]);

  const toggleState = () => {
    const newState = treeState === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED;
    
    if (newState === TreeState.TREE_SHAPE) {
      // Assembling: Start tree audio at 0:44
      if (!hasAssembled) {
        setHasAssembled(true);
      }
      treeAudio.currentTime = 44;
      if (treeAudio.paused) {
        treeAudio.play().catch(e => console.warn("Tree audio play blocked:", e));
      }
    } else {
      // Scattering: Start chaos audio from beginning
      chaosAudio.currentTime = 0;
      if (chaosAudio.paused) {
        chaosAudio.play().catch(e => console.warn("Chaos audio play blocked:", e));
      }
    }
    
    setTreeState(newState);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Volume is controlled by AudioController based on isMuted state
    // Audio keeps playing in background
  };

  return (
    <div className="relative w-full h-screen bg-neutral-900 overflow-hidden">
      <Scene 
        treeState={treeState} 
        isMuted={isMuted} 
        chaosAudio={chaosAudio}
        treeAudio={treeAudio}
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