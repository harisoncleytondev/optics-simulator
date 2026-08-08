"use client";

import type { Vec3 } from "@/types/physics";

type LightSourceProps = {
  position: Vec3;
};

export function LightSource({ position }: LightSourceProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial
        color="#ffd54a"
        emissive="#ffb300"
        emissiveIntensity={1.4}
      />
    </mesh>
  );
}