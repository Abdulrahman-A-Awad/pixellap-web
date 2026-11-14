'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface GridFloorProps {
  lineColor: string;
  dotColor: string;
  /** Overall strength (lower in light mode). */
  opacity: number;
  y?: number;
}

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Thin anti-aliased grid lines + soft glowing dots at intersections, fading with distance.
const fragmentShader = /* glsl */ `
  uniform vec3 uLine;
  uniform vec3 uDot;
  uniform float uOpacity;
  uniform float uCell;
  uniform float uFade;
  varying vec3 vWorld;

  void main() {
    vec2 coord = vWorld.xz / uCell;
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);

    vec2 nearest = abs(fract(coord + 0.5) - 0.5);
    float dotDist = length(nearest);
    float dots = smoothstep(0.09, 0.0, dotDist) + smoothstep(0.32, 0.0, dotDist) * 0.25;

    float dist = length(vWorld.xz);
    float fade = 1.0 - smoothstep(uFade * 0.25, uFade, dist);

    vec3 color = uLine * line * 0.55 + uDot * dots;
    float alpha = (line * 0.45 + dots) * fade * uOpacity;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Brand-style grid floor (custom shader, no textures). */
export function GridFloor({ lineColor, dotColor, opacity, y = -5.6 }: GridFloorProps) {
  const material = useRef<THREE.ShaderMaterial>(null);

  // Initial uniforms only; theme changes update them in place through the ref (no recompile).
  const [uniforms] = useState(() => ({
    uLine: { value: new THREE.Color(lineColor) },
    uDot: { value: new THREE.Color(dotColor) },
    uOpacity: { value: opacity },
    uCell: { value: 1.6 },
    uFade: { value: 34 },
  }));

  useEffect(() => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uLine.value.set(lineColor);
    u.uDot.value.set(dotColor);
    u.uOpacity.value = opacity;
  }, [lineColor, dotColor, opacity]);

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={y} renderOrder={-1}>
      <planeGeometry args={[120, 120, 1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
