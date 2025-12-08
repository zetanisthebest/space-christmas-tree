export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface ParticleData {
  treePos: [number, number, number];
  scatterPos: [number, number, number];
  scale: number;
}

export interface OrnamentData {
  treePos: [number, number, number];
  scatterPos: [number, number, number];
  rotation: [number, number, number];
  scatterRotation: [number, number, number];
  color: string;
  type: 'bauble' | 'gift';
  scale: number;
}

interface ThreeJSXElements {
  ambientLight: any;
  pointLight: any;
  spotLight: any;
  group: any;
  points: any;
  bufferGeometry: any;
  bufferAttribute: any;
  shaderMaterial: any;
  instancedMesh: any;
  sphereGeometry: any;
  meshStandardMaterial: any;
  boxGeometry: any;
  octahedronGeometry: any;
  extrudeGeometry: any;
  mesh: any;
  primitive: any;
  [elemName: string]: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeJSXElements {}
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeJSXElements {}
  }
}
