
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface RibbonProps {
  state: TreeState;
}

// Custom Satin Shader with Growth Reveal, Matte Finish (No Glow)
const SatinMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#8B0000') }, // Deep Red
    uGrowth: { value: 0 }, // 0 to 1, controls reveal length
    uShimmerTime: { value: -5.0 },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      
      // Dynamic Sine Wave Fluctuation
      // Reduced Amplitude (50% of previous 0.2) -> 0.1
      float waveAmp = 0.1; 
      float waveFreq = 10.0;
      float waveSpeed = 2.0;
      
      // Apply wave to local Normal or Y axis? 
      // For a flat ribbon, applying along normal makes it "breathe" in/out.
      // Applying along Y makes it ripple up/down.
      // Since it's a strip, simple Y displacement works well for "floating".
      pos.y += sin(vUv.x * waveFreq + uTime * waveSpeed) * waveAmp;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uShimmerTime;
    uniform float uGrowth;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // GROWTH LOGIC: Discard fragments beyond current growth progress
      if (vUv.x > uGrowth) {
        discard;
      }

      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);
      if (!gl_FrontFacing) normal = -normal; // Handle double-sided lighting

      // Matte / Soft Satin look
      float dotNV = dot(normal, viewDir);
      float rim = 1.0 - abs(dotNV);
      float satin = pow(rim, 2.0) * 0.5; // Reduced intensity
      
      vec3 baseColor = uColor;
      
      // Basic diffuse-like mix, no harsh specular
      vec3 finalColor = baseColor + vec3(satin * 0.2);

      // Gold Shimmer Effect logic
      float shimmerPos = uShimmerTime; 
      float dist = abs(vUv.x - shimmerPos);
      float shimmerWidth = 0.05;
      float shimmer = smoothstep(shimmerWidth, 0.0, dist);
      vec3 gold = vec3(1.0, 0.8, 0.2);
      
      finalColor += shimmer * gold * 3.0; // Shimmer still bright

      // Output color without bloom boost (alpha 1.0)
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const Ribbon: React.FC<RibbonProps> = ({ state }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // State tracking
  const growthRef = useRef(0);
  const delayTimerRef = useRef(0);
  const shimmerProgressRef = useRef(-1);

  // Generate Flat Strip Geometry
  const geometry = useMemo(() => {
    // 1. Define Curve Parameters
    const segments = 400; // Resolution of the strip
    // Increased by 5% (0.6 -> 0.63)
    const width = 0.63;    
    const turns = 4.5;
    const height = 11;
    // Increased by 5% (6.5 -> 6.85)
    const radiusBase = 6.85; 
    
    // Create CatmullRom Curve first to sample smoothly
    const curvePoints: THREE.Vector3[] = [];
    const curveCtrlPoints = 50; 
    for (let i = 0; i <= curveCtrlPoints; i++) {
        const t = i / curveCtrlPoints;
        const angle = t * Math.PI * 2 * turns;
        const y = (t * height) - (height / 2) - 1.5; 
        // Radius logic: taper from bottom to top
        // Increased offset to 1.0 to ensure top floats better
        const r = (1 - t) * radiusBase + 1.0;
        curvePoints.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
    }
    const curve = new THREE.CatmullRomCurve3(curvePoints);

    // 2. Generate Strip Vertices
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      
      // Calculate Radial vector (Pointing Outwards from Y axis)
      // This will be our face normal
      const radial = new THREE.Vector3(point.x, 0, point.z).normalize();
      
      // Calculate Binormal (Width direction)
      // Perpendicular to Tangent and Radial Normal
      // This creates a ribbon that stands "vertically" relative to the surface normal,
      // creating a wall-like or ribbon-on-edge look which is best for side viewing.
      const widthDir = new THREE.Vector3().crossVectors(tangent, radial).normalize();
      
      // Vertices with dovetail V-cut at the beginning
      let halfWidth = width / 2;
      
      // Create V-shaped dovetail cut at the beginning (first 10% of ribbon)
      if (t < 0.1) {
        const dovetailProgress = 1 - (t / 0.1); // 1 to 0 (reverse)
        // Create V-shape by moving edges toward the center
        const vCutDepth = dovetailProgress * halfWidth * 1.5; // How deep the V goes
        
        // Adjust vertices to create the V-cut
        // Top edge moves down and in
        const v1Offset = halfWidth - (dovetailProgress * halfWidth);
        const v1 = new THREE.Vector3().copy(point)
          .addScaledVector(widthDir, v1Offset)
          .addScaledVector(tangent, vCutDepth); // Push forward for V-cut
        
        // Bottom edge moves up and in  
        const v2Offset = -(halfWidth - (dovetailProgress * halfWidth));
        const v2 = new THREE.Vector3().copy(point)
          .addScaledVector(widthDir, v2Offset)
          .addScaledVector(tangent, vCutDepth); // Push forward for V-cut
        
        positions.push(v1.x, v1.y, v1.z);
        positions.push(v2.x, v2.y, v2.z);
      } else {
        // Regular ribbon (no cut)
        const v1 = new THREE.Vector3().copy(point).addScaledVector(widthDir, halfWidth);
        const v2 = new THREE.Vector3().copy(point).addScaledVector(widthDir, -halfWidth);
        
        positions.push(v1.x, v1.y, v1.z);
        positions.push(v2.x, v2.y, v2.z);
      }

      // Normals (Radial Out)
      normals.push(radial.x, radial.y, radial.z);
      normals.push(radial.x, radial.y, radial.z);

      // UVs
      uvs.push(t, 1);
      uvs.push(t, 0);

      // Indices
      if (i < segments) {
        const base = i * 2;
        // Two triangles forming a quad
        // 0, 2, 1
        indices.push(base, base + 2, base + 1);
        // 1, 2, 3
        indices.push(base + 1, base + 2, base + 3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    return geo;
  }, []);

  useFrame((stateObj, delta) => {
    if (!shaderRef.current) return;

    shaderRef.current.uniforms.uTime.value = stateObj.clock.elapsedTime;

    // ANIMATION LOGIC
    if (state === TreeState.TREE_SHAPE) {
        // ASSEMBLE:
        if (delayTimerRef.current < 1.5) {
            delayTimerRef.current += delta;
        } else {
            growthRef.current += delta * 0.4; // Growth speed
        }
    } else {
        // DISASSEMBLE:
        delayTimerRef.current = 0;
        growthRef.current -= delta * 1.5; // Shrink speed
    }

    // Clamp
    growthRef.current = Math.max(0, Math.min(1, growthRef.current));
    shaderRef.current.uniforms.uGrowth.value = growthRef.current;

    // SHIMMER LOGIC
    if (growthRef.current > 0.99 && state === TreeState.TREE_SHAPE) {
         shimmerProgressRef.current += delta * 0.4;
         if(shimmerProgressRef.current > 1.5) shimmerProgressRef.current = 1.5;
    } else {
         shimmerProgressRef.current = -0.2;
    }
    shaderRef.current.uniforms.uShimmerTime.value = shimmerProgressRef.current;
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial 
        ref={shaderRef} 
        args={[SatinMaterial]} 
        side={THREE.DoubleSide} 
        transparent={false}
        depthWrite={true}
      />
    </mesh>
  );
};

export default Ribbon;
