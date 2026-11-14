'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { lazy, Suspense, type RefObject } from 'react';
import * as THREE from 'three';
import { GridFloor } from './GridFloor';
import { PixelCubes, type PointerState } from './PixelCubes';
import { StudioEnvironment } from './StudioEnvironment';

const Effects = lazy(() => import('./Effects'));

export type SceneTier = 'high' | 'low';
export type SceneTheme = 'dark' | 'light';

export interface PixelSceneProps {
  tier: SceneTier;
  theme: SceneTheme;
  /** Page background (CSS var --bg), used as clear colour + fog so the scene melts into the page. */
  background: string;
  progress: RefObject<number>;
  pointer: RefObject<PointerState>;
  offsetX: number;
  copySide: -1 | 0 | 1;
  frameloop: 'always' | 'never';
  onReady: () => void;
  /** Sustained low FPS: the gate switches to the low tier (once per session). */
  onDecline: () => void;
}

const PALETTE = {
  dark: {
    key: '#7aa2ff',
    rim: '#8152f8',
    top: '#ffffff',
    keyIntensity: 7,
    rimIntensity: 10,
    topIntensity: 2,
    directional: 2.4,
    envMap: 1.2,
    floorLine: '#8152f8',
    floorDot: '#b9a2ff',
    floorOpacity: 0.9,
  },
  light: {
    key: '#9bb8ff',
    rim: '#a58bff',
    top: '#ffffff',
    keyIntensity: 4,
    rimIntensity: 4.5,
    topIntensity: 5,
    directional: 1.6,
    envMap: 1,
    floorLine: '#3a119e',
    floorDot: '#612fe2',
    floorOpacity: 0.32,
  },
} as const;

function SceneBackground({ color }: { color: string }) {
  return (
    <>
      <color attach="background" args={[color]} />
      <fog attach="fog" args={[color, 30, 62]} />
    </>
  );
}

export default function PixelScene({
  tier,
  theme,
  background,
  progress,
  pointer,
  offsetX,
  copySide,
  frameloop,
  onReady,
  onDecline,
}: PixelSceneProps) {
  const p = PALETTE[theme];
  const high = tier === 'high';

  return (
    <Canvas
      frameloop={frameloop}
      dpr={high ? [1, 1.75] : [1, 1.25]}
      flat={false}
      camera={{ fov: 35, position: [0, 1.2, 30], near: 0.5, far: 140 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: theme === 'dark' ? 1.3 : 1.15,
        alpha: false,
        stencil: false,
      }}
      aria-hidden="true"
    >
      <SceneBackground color={background} />

      {high && (
        <PerformanceMonitor bounds={() => [40, 1000]} flipflops={1} onDecline={onDecline} onFallback={onDecline} />
      )}

      {/* Studio reflections from lightformer panels only — no HDR / network assets. */}
      <StudioEnvironment
        formers={[
          { color: p.key, intensity: p.keyIntensity, position: [-8, 3, 9], scale: [10, 7] }, // cool blue key
          { color: p.rim, intensity: p.rimIntensity, position: [9, 1, -7], scale: [6, 14] }, // violet rim
          { color: p.top, intensity: p.topIntensity, position: [0, 10, 0], scale: [14, 14] }, // soft white top
        ]}
      />
      <directionalLight position={[6, 9, 7]} intensity={p.directional} color="#ffffff" />
      {/* Faint fill so shadow faces keep their violet instead of going black. */}
      <hemisphereLight args={['#c9b8ff', '#1a0b40', theme === 'dark' ? 0.35 : 0.6]} />

      <PixelCubes
        count={high ? 64 : 32}
        progress={progress}
        pointer={pointer}
        offsetX={offsetX}
        copySide={copySide}
        envMapIntensity={p.envMap}
        onFirstFrame={onReady}
      />

      <GridFloor lineColor={p.floorLine} dotColor={p.floorDot} opacity={p.floorOpacity} />

      {/* Dropping to 'low' unmounts postprocessing immediately. */}
      {high && theme === 'dark' && (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      )}
    </Canvas>
  );
}
