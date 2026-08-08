"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Vec3 } from "@/types/physics";

type CylinderLineProps = {
  from: Vec3;
  to: Vec3;
  radius?: number;
  color?: string;
  opacity?: number;
  glow?: boolean;
};

export function CylinderLine({
  from,
  to,
  radius = 0.05,
  color = "#ffffff",
  opacity = 1,
  glow = false,
}: CylinderLineProps) {
  const geometry = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    if (len < 1e-6) return null;

    const midpoint = a.clone().add(b).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );

    return { length: len, midpoint, quaternion };
  }, [from, to]);

  if (!geometry) return null;

  return (
    <group position={geometry.midpoint} quaternion={geometry.quaternion}>
      <mesh>
        <cylinderGeometry args={[radius, radius, geometry.length, 8]} />
        {glow ? (
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            transparent
            opacity={opacity}
          />
        )}
      </mesh>

      {glow && (
        <mesh>
          <cylinderGeometry
            args={[radius * 2.6, radius * 2.6, geometry.length, 8]}
          />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity * 0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}