import * as THREE from 'three';

// Constants for the tree shape
const TREE_HEIGHT = 12;
const TREE_RADIUS_BASE = 5;
const SCATTER_RADIUS = 25;

/**
 * Generates a random position inside a sphere
 */
export const getScatterPosition = (): [number, number, number] => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  const r = Math.cbrt(Math.random()) * SCATTER_RADIUS;

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  return [x, y, z];
};

/**
 * Generates a position on a conical spiral (Christmas Tree shape)
 */
export const getTreePosition = (
  index: number, 
  total: number, 
  jitter: number = 0
): [number, number, number] => {
  // Normalize height from 0 (top) to 1 (bottom) or vice versa
  // Let's make 0 bottom, 1 top
  const ratio = index / total;
  
  // Height calculation: linearly map ratio to height, but biased towards bottom for volume
  const y = (ratio * TREE_HEIGHT) - (TREE_HEIGHT / 2);
  
  // Radius at this height (Cone logic)
  // Top of tree (y = height/2) -> radius = 0
  // Bottom of tree (y = -height/2) -> radius = max
  const heightFactor = 1 - ratio; // 1 at bottom, 0 at top
  const r = heightFactor * TREE_RADIUS_BASE;

  // Spiral angle
  const angle = index * 0.5 + (Math.random() * 0.5); // Golden angle approximation-ish

  // Add some jitter for realism
  const jitterX = (Math.random() - 0.5) * jitter;
  const jitterY = (Math.random() - 0.5) * jitter;
  const jitterZ = (Math.random() - 0.5) * jitter;

  const x = Math.cos(angle) * r + jitterX;
  const z = Math.sin(angle) * r + jitterZ;
  
  return [x, y + jitterY, z];
};

export const randomColor = (colors: string[]) => {
  return colors[Math.floor(Math.random() * colors.length)];
};