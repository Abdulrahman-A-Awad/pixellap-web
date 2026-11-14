'use client';

import { RoundedBoxGeometry } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { buildLayout, type CubeLayout } from './layouts';

export interface PointerState {
  /** Normalised device coords over the hero (−1…1). */
  x: number;
  y: number;
  /** performance.now() of the last move over the hero (0 = never). */
  lastMove: number;
}

interface PixelCubesProps {
  count: 64 | 32;
  /** Scroll progress 0→1 written by ScrollTrigger (read every frame, no React state). */
  progress: RefObject<number>;
  pointer: RefObject<PointerState>;
  /** Horizontal offset of the whole cluster (towards the inline-end side on desktop). */
  offsetX: number;
  /** Side of the screen holding the hero copy (−1 left / +1 right). */
  copySide: -1 | 0 | 1;
  envMapIntensity: number;
  onFirstFrame?: () => void;
}

const INTRO_SECONDS = 1.8;
const MAX_PARALLAX = THREE.MathUtils.degToRad(4);
const CAMERA_DISTANCE = 30;
const CAMERA_HEIGHT = 1.2;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeOutBack = (t: number) => {
  const c1 = 1.35;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Frame-rate independent lerp factor. */
const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

const MARK_COUNT = 16;

function createScratch() {
  return {
    matrix: new THREE.Matrix4(),
    pos: new THREE.Vector3(),
    rest: new THREE.Vector3(),
    quat: new THREE.Quaternion(),
    axis: new THREE.Vector3(),
    scale: new THREE.Vector3(),
    pointerWorld: new THREE.Vector3(),
    pointerLocal: new THREE.Vector3(),
    ray: new THREE.Raycaster(),
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    ndc: new THREE.Vector2(),
    target: new THREE.Vector3(0, 0, 0),
    pushTarget: new THREE.Vector3(),
  };
}

export function PixelCubes({
  count,
  progress,
  pointer,
  offsetX,
  copySide,
  envMapIntensity,
  onFirstFrame,
}: PixelCubesProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const layout: CubeLayout = useMemo(() => buildLayout(count, copySide), [count, copySide]);

  // All per-frame scratch state lives in refs — no React state per frame.
  const state = useRef({
    time: 0,
    started: false,
    smoothProgress: 0,
    parallax: new THREE.Vector2(),
    pointerWeight: 0,
  });
  // Scratch objects + per-instance pointer push, created lazily inside the frame loop
  // (refs, not memo values: the React Compiler forbids mutating memoised values).
  const scratch = useRef<ReturnType<typeof createScratch> | null>(null);
  const pushes = useRef<THREE.Vector3[]>([]);

  // Instance colours (once per layout).
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const color = new THREE.Color();
    layout.colors.forEach((hex, i) => m.setColorAt(i, color.set(hex)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [layout]);

  useFrame(({ camera }, delta) => {
    const m = mesh.current;
    const g = group.current;
    if (!m || !g) return;
    const s = state.current;
    const tmp = (scratch.current ??= createScratch());
    if (pushes.current.length !== layout.count) {
      pushes.current = Array.from({ length: layout.count }, () => new THREE.Vector3());
    }
    const dt = Math.min(delta, 1 / 20); // resumes after frameloop="never" without jumps

    if (!s.started) {
      s.started = true;
      onFirstFrame?.();
    }
    s.time += dt;
    const time = s.time;

    // ── Inputs ─────────────────────────────────────────────────────────
    s.smoothProgress += ((progress.current ?? 0) - s.smoothProgress) * damp(10, dt);
    const p = s.smoothProgress;
    const intro = clamp01(time / INTRO_SECONDS);
    const seg1 = clamp01(p / 0.4); // mark rotates + breaks apart
    const seg2 = clamp01((p - 0.4) / 0.45); // assemble the big cube
    const seg3 = smoothstep(0.85, 1, p); // pulled cubes + hand-over

    const ptr = pointer.current;
    const pointerActive = ptr && ptr.lastMove > 0 && performance.now() - ptr.lastMove < 2500 ? 1 : 0;
    s.pointerWeight += (pointerActive - s.pointerWeight) * damp(3, dt);

    // ── Camera parallax (max ~4°) ──────────────────────────────────────
    s.parallax.x += ((ptr?.x ?? 0) * s.pointerWeight - s.parallax.x) * damp(3, dt);
    s.parallax.y += ((ptr?.y ?? 0) * s.pointerWeight - s.parallax.y) * damp(3, dt);
    const yaw = s.parallax.x * MAX_PARALLAX;
    const pitch = s.parallax.y * MAX_PARALLAX;
    camera.position.set(
      Math.sin(yaw) * CAMERA_DISTANCE,
      CAMERA_HEIGHT + Math.sin(pitch) * CAMERA_DISTANCE,
      Math.cos(yaw) * CAMERA_DISTANCE,
    );
    camera.lookAt(tmp.target);

    // ── Group: idle auto-rotation, mark rotation, big-cube rotation ────
    const e1 = easeInOutCubic(seg1);
    const e2 = easeInOutCubic(seg2);
    const idleY = Math.sin(time * 0.25) * 0.14;
    const idleX = Math.sin(time * 0.18) * 0.05;
    const rotY = idleY + e1 * 0.6 + e2 * (Math.PI / 4 - 0.6) + e2 * time * 0.16;
    const rotX = idleX + e1 * 0.22 + e2 * (0.52 - 0.22) + seg3 * Math.sin(time * 0.3) * 0.05;
    g.rotation.set(rotX, rotY, 0);
    // Once the copy hands over, the big cube drifts to centre stage and grows a little.
    g.position.set(offsetX * (1 - e2 * 0.45 - seg3 * 0.55), e2 * 0.4, 0);
    g.scale.setScalar(1 + e2 * 0.1 + seg3 * 0.12);
    g.updateMatrixWorld();

    // Pointer on the z=0 plane, in group space (for the push-away effect).
    let hasPointer = false;
    if (ptr && s.pointerWeight > 0.01) {
      tmp.ndc.set(ptr.x, ptr.y);
      tmp.ray.setFromCamera(tmp.ndc, camera);
      if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.pointerWorld)) {
        tmp.pointerLocal.copy(tmp.pointerWorld);
        g.worldToLocal(tmp.pointerLocal);
        hasPointer = true;
      }
    }

    // ── Instances ─────────────────────────────────────────────────────
    const L = layout;
    for (let i = 0; i < L.count; i++) {
      const isMark = i < MARK_COUNT;

      // Rest pose (satellites orbit slowly).
      const [rx, ry, rz] = L.rest[i];
      if (isMark) {
        tmp.rest.set(rx, ry, rz);
      } else {
        const orbit = time * 0.045 * (0.5 + L.phase[i]);
        const c = Math.cos(orbit);
        const sn = Math.sin(orbit);
        tmp.rest.set(rx * c - rz * sn, ry, rx * sn + rz * c);
      }

      // Intro: scattered cloud → rest.
      const ti = clamp01((intro - L.introDelay[i]) / (1 - 0.4));
      const ei = isMark ? easeOutBack(ti) : easeOutCubic(ti);
      const [sx, sy, sz] = L.scatter[i];
      tmp.pos.set(sx + (tmp.rest.x - sx) * ei, sy + (tmp.rest.y - sy) * ei, sz + (tmp.rest.z - sz) * ei);

      // Break apart, pixel by pixel.
      let b = 0;
      if (isMark) {
        b = easeInOutCubic(clamp01((seg1 - L.breakDelay[i]) / 0.45));
        const [bx, by, bz] = L.broken[i];
        tmp.pos.x += (bx - rx) * b;
        tmp.pos.y += (by - ry) * b;
        tmp.pos.z += (bz - rz) * b;
      }

      // Assemble into the big cube (staggered by distance).
      const a = easeInOutCubic(clamp01((seg2 - L.assembleDelay[i]) / (1 - 0.45)));
      const [cx, cy, cz] = L.big[i];
      tmp.pos.x += (cx - tmp.pos.x) * a;
      tmp.pos.y += (cy - tmp.pos.y) * a;
      tmp.pos.z += (cz - tmp.pos.z) * a;

      // A few cubes pulled out of place at the end.
      const [px, py, pz] = L.pulled[i];
      tmp.pos.x += px * seg3;
      tmp.pos.y += py * seg3;
      tmp.pos.z += pz * seg3;

      // Idle float — never fully static, calmer once assembled.
      const ph = L.phase[i] * Math.PI * 2;
      const amp = (isMark ? 0.08 : 0.3) * (1 - a * 0.8) + 0.02;
      tmp.pos.y += Math.sin(time * 0.9 + ph) * amp;
      tmp.pos.x += Math.cos(time * 0.6 + ph * 1.7) * amp * 0.45;

      // Pointer push (lerped).
      tmp.pushTarget.set(0, 0, 0);
      if (hasPointer) {
        const dx = tmp.pos.x - tmp.pointerLocal.x;
        const dy = tmp.pos.y - tmp.pointerLocal.y;
        const d = Math.hypot(dx, dy);
        const radius = 2.8;
        if (d < radius && d > 1e-4) {
          const f = (1 - d / radius) ** 2 * 0.85 * s.pointerWeight * (1 - a * 0.55);
          tmp.pushTarget.set((dx / d) * f, (dy / d) * f, f * 0.6);
        }
      }
      const push = pushes.current[i];
      push.lerp(tmp.pushTarget, damp(6, dt));
      tmp.pos.add(push);

      // Rotation: tumble during the intro, spin while apart, square when assembled.
      const [ax, ay, az] = L.spinAxis[i];
      tmp.axis.set(ax, ay, az);
      const spin = isMark
        ? (1 - ei) * 2.4 + b * (0.6 + L.phase[i]) * (1 - a)
        : (time * (0.25 + L.phase[i] * 0.35) + ph) * (1 - a) + (1 - ei) * 2;
      tmp.quat.setFromAxisAngle(tmp.axis, spin);

      // Scale: grow in during the intro; satellites reach full size in the big cube.
      const sc = (L.scale[i] + (1 - L.scale[i]) * a) * (0.25 + 0.75 * Math.min(1, ti * 1.6));
      tmp.scale.setScalar(sc);

      tmp.matrix.compose(tmp.pos, tmp.quat, tmp.scale);
      m.setMatrixAt(i, tmp.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <RoundedBoxGeometry args={[1, 1, 1]} radius={0.06} smoothness={3} />
        <meshPhysicalMaterial
          metalness={0.35}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={envMapIntensity}
        />
      </instancedMesh>
    </group>
  );
}
