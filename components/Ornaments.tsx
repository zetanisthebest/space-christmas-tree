
import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, OrnamentData } from '../types';
import { getScatterPosition, getTreePosition } from '../utils/math';

interface OrnamentsProps {
  count?: number;
  state: TreeState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ count = 600, state }) => {
  const baublesRef = useRef<THREE.InstancedMesh>(null);
  const giftsRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Group>(null);
  
  // Use a ref to track animation progress (0 = scattered, 1 = tree)
  const progressRef = useRef(0);
  
  // Separate counts for variety
  const baubleCount = Math.floor(count * 0.7);
  const giftCount = count - baubleCount;

  // Star Data
  const starData = useMemo(() => {
    return {
      scatterPos: getScatterPosition(),
      treePos: [0, 6.5, 0] as [number, number, number],
      scatterRotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
    };
  }, []);

  // Generate Rounded 5-Pointed Star Shape
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.55; // Slightly fatter for cuteness
    const cornerRadius = 0.2; // Radius for rounded corners

    // 1. Calculate raw vertices
    const vertices: THREE.Vector2[] = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2; // +PI/2 to point up
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      vertices.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
    }

    // 2. Draw with rounded corners
    const len = vertices.length;
    for (let i = 0; i < len; i++) {
        const curr = vertices[i];
        const prev = vertices[(i - 1 + len) % len];
        const next = vertices[(i + 1) % len];
        
        // Vectors pointing towards neighbors
        const vPrev = new THREE.Vector2().subVectors(prev, curr).normalize();
        const vNext = new THREE.Vector2().subVectors(next, curr).normalize();
        
        // Limit radius to fit half the segment length to prevent overlap
        const distPrev = curr.distanceTo(prev);
        const distNext = curr.distanceTo(next);
        const r = Math.min(cornerRadius, distPrev * 0.45, distNext * 0.45);

        // Calculate start and end points for the curve
        const start = curr.clone().addScaledVector(vPrev, r);
        const end = curr.clone().addScaledVector(vNext, r);

        if (i === 0) shape.moveTo(start.x, start.y);
        else shape.lineTo(start.x, start.y);
        
        // Quadratic curve for the rounded corner
        shape.quadraticCurveTo(curr.x, curr.y, end.x, end.y);
    }
    
    shape.closePath();
    return shape;
  }, []);

  // Generate Data for Baubles
  const baublesData = useMemo(() => {
    const data: OrnamentData[] = [];
    const goldWhiteColors = ['#D4AF37', '#F9E588', '#B8860B', '#FFFFFF']; // Golds and White
    const redColor = '#8B0000';
    const greenColor = '#006400';
    
    for (let i = 0; i < baubleCount; i++) {
      const [tx, ty, tz] = getTreePosition(i, baubleCount, 0.3);
      const [sx, sy, sz] = getScatterPosition();
      
      // Calculate normalized height (0 at bottom, 1 at top)
      const heightRatio = i / baubleCount; 
      
      // Scale logic: Larger at bottom, smaller at top
      // PREVIOUS: 0.25 to 0.8 (Spread 0.55)
      // NEW: Reduced variation by ~20%. Spread target ~0.44.
      // New Range: 0.36 to 0.80
      const baseScale = 0.36 + ((1 - heightRatio) * 0.44); 
      
      // Add +/- 30% variation
      const variation = 1 + (Math.random() * 0.6 - 0.3);
      
      // Apply variation and global boost
      // Previously 1.8. Now +10% -> 1.98
      const finalScale = baseScale * variation * 1.98;

      // Weighted Color Selection: 20% Red, 20% Green, 60% Gold/White
      let color;
      const r = Math.random();
      if (r < 0.2) {
        color = redColor;
      } else if (r < 0.4) {
        color = greenColor;
      } else {
        color = goldWhiteColors[Math.floor(Math.random() * goldWhiteColors.length)];
      }

      data.push({
        treePos: [tx, ty, tz],
        scatterPos: [sx, sy, sz],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scatterRotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        color: color,
        type: 'bauble',
        scale: finalScale
      });
    }
    return data;
  }, [baubleCount]);

  // Generate Data for Gifts
  const giftsData = useMemo(() => {
    const data: OrnamentData[] = [];
    
    // Rich greens for the majority
    const greenColors = ['#005c00', '#007500', '#1a4f1a', '#004200'];
    // Variations (Dark Red, Dark Orange, Darker Red/Brown, Gold)
    const variationColors = ['#5a1a1a', '#964B00', '#7c4a16', '#3b0b0b', '#D4AF37']; 

    for (let i = 0; i < giftCount; i++) {
      // Limit height to bottom 60% (ratio 0.6) to prevent clustering at the tip and reduce density in top area
      const maxRatio = 0.6;
      const totalForCalc = giftCount / maxRatio;
      const [tx, ty, tz] = getTreePosition(i, totalForCalc, 0.9); 
      
      const [sx, sy, sz] = getScatterPosition();
      
      // 70% Green, 30% Variation
      const isVariation = Math.random() < 0.3;
      const color = isVariation 
        ? variationColors[Math.floor(Math.random() * variationColors.length)]
        : greenColors[Math.floor(Math.random() * greenColors.length)];

      // Scale Logic: Inversely proportional to height
      const relativeHeight = i / giftCount; // 0 to 1 within the gift section
      
      // Bottom (0) -> Scale ~1.2
      // Top (1) -> Scale ~0.4
      // PREVIOUS: 0.4 to 1.2 (Spread 0.8)
      // NEW: Reduced variation by 20%. Spread target ~0.64.
      // New Range: 0.56 to 1.2
      const scaleGradient = 0.56 + ((1 - relativeHeight) * 0.64);
      
      // Increased size by 30%: 1.2 * 1.3 = 1.56
      const finalScale = (scaleGradient + (Math.random() * 0.3)) * 1.56;

      data.push({
        treePos: [tx, ty, tz],
        scatterPos: [sx, sy, sz],
        rotation: [0, Math.random() * Math.PI * 2, 0], // Gifts usually sit flat-ish
        scatterRotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        color: color,
        type: 'gift',
        scale: finalScale
      });
    }
    return data;
  }, [giftCount]);

  // Helper object for calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Initialize Colors
  useLayoutEffect(() => {
    if (baublesRef.current) {
      baublesData.forEach((d, i) => {
        // Boost color intensity for "lit from within" feel without desaturating (white emissive)
        const c = new THREE.Color(d.color);
        // Multiply color to create HDR values (> 1.0) which will bloom, 
        // effectively making the ornament glow in its own color.
        c.multiplyScalar(2.0); 
        baublesRef.current!.setColorAt(i, c);
      });
      baublesRef.current.instanceColor!.needsUpdate = true;
    }
    if (giftsRef.current) {
      giftsData.forEach((d, i) => {
        giftsRef.current!.setColorAt(i, new THREE.Color(d.color));
      });
      giftsRef.current.instanceColor!.needsUpdate = true;
    }
  }, [baublesData, giftsData]);

  // Animation Loop
  useFrame((stateObj, delta) => {
    const time = stateObj.clock.elapsedTime;
    const isTree = state === TreeState.TREE_SHAPE;
    
    const target = isTree ? 1 : 0;
    const speed = 1.2;
    
    // Smoothly interpolate progress
    const diff = target - progressRef.current;
    
    if (Math.abs(diff) > 0.001) {
        progressRef.current += diff * delta * speed;
    } else {
        progressRef.current = target;
    }
    
    // Clamp between 0 and 1
    const progress = Math.max(0, Math.min(1, progressRef.current));
    
    // Cubic bezier ease
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    // --- Update Star ---
    if (starRef.current) {
        const { scatterPos, treePos, scatterRotation } = starData;
        
        const x = THREE.MathUtils.lerp(scatterPos[0], treePos[0], ease);
        const y = THREE.MathUtils.lerp(scatterPos[1], treePos[1], ease);
        const z = THREE.MathUtils.lerp(scatterPos[2], treePos[2], ease);

        starRef.current.position.set(x, y, z);

        // Rotation: Spin continuously when tree, otherwise chaotic
        const spinSpeed = 0.7; // Slowed down by 30%
        if (isTree) {
             starRef.current.rotation.y += delta * spinSpeed;
             starRef.current.rotation.z = 0; 
             starRef.current.rotation.x = 0;
        } else {
             starRef.current.rotation.set(
                scatterRotation[0] + time * 0.2,
                scatterRotation[1] + time * 0.2,
                0
             );
        }

        // Reduced star size by 20% (was 0.85 -> now 0.68)
        const scale = THREE.MathUtils.lerp(0.1, 0.68, ease);
        starRef.current.scale.setScalar(scale);
    }


    // --- Update Baubles ---
    if (baublesRef.current) {
      baublesData.forEach((data, i) => {
        const { treePos, scatterPos, rotation, scatterRotation, scale: baseScale } = data;
        
        // Position Lerp
        const x = THREE.MathUtils.lerp(scatterPos[0], treePos[0], ease);
        const y = THREE.MathUtils.lerp(scatterPos[1], treePos[1], ease);
        const z = THREE.MathUtils.lerp(scatterPos[2], treePos[2], ease);
        
        // Floating noise - Applies to BOTH states now for "living" feel
        // Subtle offset when tree, larger when scattered
        const floatY = Math.sin(time + x * 0.5) * (isTree ? 0.05 : 0.5); 
        const floatRot = time * 0.2 * (1 - ease);

        dummy.position.set(x, y + floatY, z);
        
        // Rotation Lerp
        dummy.rotation.set(
            THREE.MathUtils.lerp(scatterRotation[0] + floatRot, rotation[0], ease),
            THREE.MathUtils.lerp(scatterRotation[1] + floatRot, rotation[1], ease),
            THREE.MathUtils.lerp(scatterRotation[2] + floatRot, rotation[2], ease)
        );
        
        const scaleState = isTree ? 1 : 0.8;
        dummy.scale.setScalar(baseScale * scaleState);
        
        dummy.updateMatrix();
        baublesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      baublesRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- Update Gifts ---
    if (giftsRef.current) {
      giftsData.forEach((data, i) => {
         const { treePos, scatterPos, rotation, scatterRotation, scale: baseScale } = data;

        const x = THREE.MathUtils.lerp(scatterPos[0], treePos[0], ease);
        const y = THREE.MathUtils.lerp(scatterPos[1], treePos[1], ease);
        const z = THREE.MathUtils.lerp(scatterPos[2], treePos[2], ease);

        const floatY = Math.cos(time + z * 0.5) * (isTree ? 0.03 : 0.5);

        dummy.position.set(x, y + floatY, z);
         dummy.rotation.set(
            THREE.MathUtils.lerp(scatterRotation[0], rotation[0], ease),
            THREE.MathUtils.lerp(scatterRotation[1], rotation[1], ease),
            THREE.MathUtils.lerp(scatterRotation[2], rotation[2], ease)
        );

        const scaleState = 0.5 + (0.5 * ease); // Small when scattered
        dummy.scale.setScalar(baseScale * scaleState);

        dummy.updateMatrix();
        giftsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      giftsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={baublesRef} args={[undefined, undefined, baubleCount]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.75} 
            emissive="#000000"
            emissiveIntensity={0}
            envMapIntensity={1.5}
        />
      </instancedMesh>

      <instancedMesh ref={giftsRef} args={[undefined, undefined, giftCount]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial 
            roughness={0.3} 
            metalness={0.6} 
        />
      </instancedMesh>

      {/* Golden Star at the top */}
      <group ref={starRef}>
          {/* Offset Mesh to center Z-rotation. Depth is 0.4, so center offset is -0.2 */}
          <mesh position={[0, 0, -0.2]}>
             <extrudeGeometry 
                args={[
                    starShape, 
                    { 
                        depth: 0.4, 
                        bevelEnabled: true, // Enable bevel for 3D look
                        bevelThickness: 0.1,
                        bevelSize: 0.1,
                        bevelSegments: 4 // Smooth bevel for rounded star
                    }
                ]} 
             />
             <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700" 
                emissiveIntensity={2.0} 
                roughness={0.3} 
                metalness={0.8}
                toneMapped={false}
             />
          </mesh>
          <pointLight color="#FFD700" intensity={2} distance={15} decay={2} />
      </group>
    </>
  );
};

export default Ornaments;
