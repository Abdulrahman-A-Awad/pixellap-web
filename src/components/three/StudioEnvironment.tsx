'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

export interface Former {
  color: string;
  intensity: number;
  position: [number, number, number];
  /** Panel size (width, height). */
  scale: [number, number];
  /** Panels face this point (default: origin). */
  target?: [number, number, number];
}

/**
 * Studio reflections from emissive "lightformer" panels only — rendered ONCE into a PMREM
 * environment map (cube-UV, 256px faces), like drei's <Environment><Lightformer/></Environment>
 * but without drei's HDR/EXR/gain-map loaders in the bundle. No network assets.
 * Rebuilt only when the formers change (theme switch).
 */
export function StudioEnvironment({ formers }: { formers: Former[] }) {
  const get = useThree((s) => s.get);
  const key = JSON.stringify(formers);

  useEffect(() => {
    const { gl, scene } = get();
    const room = new THREE.Scene();
    room.background = new THREE.Color('#05030c');

    const geometry = new THREE.PlaneGeometry(1, 1);
    const materials: THREE.Material[] = [];
    for (const f of JSON.parse(key) as Former[]) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(f.color).multiplyScalar(f.intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      materials.push(material);
      const panel = new THREE.Mesh(geometry, material);
      panel.position.set(...f.position);
      panel.scale.set(f.scale[0], f.scale[1], 1);
      panel.lookAt(...(f.target ?? [0, 0, 0]));
      room.add(panel);
    }

    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(room, 0.02, 0.1, 100);
    scene.environment = target.texture;

    return () => {
      if (scene.environment === target.texture) scene.environment = null;
      target.dispose();
      pmrem.dispose();
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [get, key]);

  return null;
}
