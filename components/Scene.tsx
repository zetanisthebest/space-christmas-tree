
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Ribbon from './Ribbon';
import AudioController from './AudioController';

interface SceneProps {
  treeState: TreeState;
  isMuted: boolean;
  audio: HTMLAudioElement;
}

const Scene: React.FC<SceneProps> = ({ treeState, isMuted, audio }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMappingExposure: 1.5 }}
      style={{ background: '#050505' }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={60} 
        autoRotate={true}
        // Subtle rotation when scattered (depth), faster when tree (display)
        autoRotateSpeed={treeState === TreeState.TREE_SHAPE ? 0.5 : 0.2}
      />

      {/* Audio System */}
      <AudioController 
        state={treeState} 
        isMuted={isMuted} 
        audio={audio}
      />

      {/* Lighting System for Luxury Look */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#F9E588" 
        castShadow 
      />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#004200" />
      {/* Rim light for gold sparkles */}
      <pointLight position={[0, 10, -10]} intensity={2} color="#D4AF37" />

      {/* Environment for reflections on metallic ornaments */}
      <Environment preset="city" />

      {/* The Christmas Tree Components - Vertically Centered */}
      <group position={[0, -0.5, 0]} scale={[1.5, 1.5, 1.5]}>
        <Foliage state={treeState} count={3000} />
        <Ornaments state={treeState} />
        <Ribbon state={treeState} />
      </group>

      {/* Background Stars - Shimmer more when tree is assembled */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={treeState === TreeState.TREE_SHAPE ? 6 : 4} 
        saturation={0} 
        fade 
        speed={treeState === TreeState.TREE_SHAPE ? 2 : 1}
      />
      
      {/* Additional star layer with different timing for depth */}
      <Stars 
        radius={120} 
        depth={60} 
        count={3000} 
        factor={treeState === TreeState.TREE_SHAPE ? 5 : 3} 
        saturation={0} 
        fade 
        speed={treeState === TreeState.TREE_SHAPE ? 1.5 : 0.7}
      />

      {/* Post Processing for Cinematic Feel */}
      <EffectComposer enableNormalPass={false}>
        {/* Depth of Field - Only in chaos mode for dimensional scattered look */}
        {treeState === TreeState.SCATTERED && (
          <DepthOfField 
            focusDistance={0} 
            focalLength={0.1} 
            bokehScale={0.8} 
            height={480}
          />
        )}
        {/* Strong Bloom for the lights and magical dust */}
        <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;