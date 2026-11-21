'use client';

import { useState } from 'react';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Soft elliptical shadow: a dense core fading out with a long tail (no render target, no blur pass).
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = length((vUv - 0.5) * 2.0);
    float a = (1.0 - smoothstep(0.0, 1.0, d));
    a = a * a * uOpacity;
    if (a < 0.002) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

/**
 * Cheap grounding shadow for the light theme on the low tier (one textured-free quad on the floor).
 * The high tier uses drei ContactShadows instead (real silhouettes, follows the cubes).
 */
export function ShadowBlob({
  x,
  y = -5.58,
  width = 15,
  depth = 8,
  color = '#3a119e',
  opacity = 0.22,
}: {
  x: number;
  y?: number;
  width?: number;
  depth?: number;
  color?: string;
  opacity?: number;
}) {
  const [uniforms] = useState(() => ({
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: opacity },
  }));

  return (
    <mesh rotation-x={-Math.PI / 2} position={[x, y, 0]} renderOrder={0}>
      <planeGeometry args={[width, depth, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
