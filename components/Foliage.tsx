import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getScatterPosition, getTreePosition } from '../utils/math';

// Custom Shader Material
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = Scattered, 1 = Tree
    uColorGold: { value: new THREE.Color('#D4AF37') },
    uColorGreen: { value: new THREE.Color('#004200') },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying float vAlpha;
    varying vec2 vUv;
    varying float vRandom;

    // Cubic bezier for smoother transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      vUv = uv;
      vRandom = aRandom;

      // Add a slight delay/offset based on randomness for organic movement
      float effectiveProgress = clamp(uProgress * 1.2 - (aRandom * 0.2), 0.0, 1.0);
      float t = easeInOutCubic(effectiveProgress);

      // Interpolate positions
      vec3 pos = mix(aScatterPos, aTreePos, t);

      // Breathing/Floating effect
      float breathFreq = 1.0 + aRandom;
      float breathAmp = 0.2;
      
      // Different noise for different states
      vec3 treeNoise = vec3(
        sin(uTime * breathFreq + pos.y) * 0.05,
        cos(uTime * breathFreq * 0.8) * 0.05,
        sin(uTime * breathFreq * 1.2) * 0.05
      );
      
      vec3 scatterNoise = vec3(
        sin(uTime * 0.5 + aRandom * 10.0) * 0.5,
        cos(uTime * 0.3 + aRandom * 10.0) * 0.5,
        sin(uTime * 0.4 + aRandom * 10.0) * 0.5
      );

      pos += mix(scatterNoise, treeNoise, t);

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      float size = (80.0 * aRandom + 40.0) * (1.0 / -mvPosition.z);
      gl_PointSize = size;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorGold;
    uniform vec3 uColorGreen;
    uniform float uTime;
    varying float vRandom;
    varying vec2 vUv;
    
    void main() {
      // Circular particle
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if(ll > 0.5) discard;

      // Radial gradient: Gold center, Green edge
      float strength = 1.0 - (ll * 2.0);
      strength = pow(strength, 1.5); // Sharpen
      
      // Add shimmer effect - varies over time and per particle
      float shimmer = sin(uTime * 3.0 + vRandom * 20.0) * 0.3 + 0.7;
      
      // Mix colors based on randomness and radial position
      vec3 color = mix(uColorGreen, uColorGold, strength * 0.8 + (vRandom * 0.2));
      
      // Apply shimmer to brightness
      color *= shimmer;
      
      // Add extra glow for bloom with shimmer
      gl_FragColor = vec4(color * (2.5 + shimmer * 0.5), 1.0); 
    }
  `
};

interface FoliageProps {
  count?: number;
  state: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ count = 4000, state }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Prepare geometry data
  const { positionsScatter, positionsTree, randoms } = useMemo(() => {
    const pScatter = new Float32Array(count * 3);
    const pTree = new Float32Array(count * 3);
    const rnd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const [sx, sy, sz] = getScatterPosition();
      pScatter[i * 3] = sx;
      pScatter[i * 3 + 1] = sy;
      pScatter[i * 3 + 2] = sz;

      const [tx, ty, tz] = getTreePosition(i, count, 0.5);
      pTree[i * 3] = tx;
      pTree[i * 3 + 1] = ty;
      pTree[i * 3 + 2] = tz;

      rnd[i] = Math.random();
    }

    return {
      positionsScatter: pScatter,
      positionsTree: pTree,
      randoms: rnd
    };
  }, [count]);

  useFrame((stateObj, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = stateObj.clock.elapsedTime;
      
      const targetProgress = state === TreeState.TREE_SHAPE ? 1.0 : 0.0;
      const currentProgress = shaderRef.current.uniforms.uProgress.value;
      
      // Harmonized Animation Speed with Ornaments (Exponential Smoothing)
      const speed = 1.2; 
      const diff = targetProgress - currentProgress;
      
      if (Math.abs(diff) > 0.001) {
          shaderRef.current.uniforms.uProgress.value += diff * delta * speed;
      } else {
          shaderRef.current.uniforms.uProgress.value = targetProgress;
      }
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // This is just a placeholder, shader uses custom attribs
          count={count}
          array={positionsTree}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={positionsScatter}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={positionsTree}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        args={[FoliageMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;