"use client";

import type { Vec3 } from "@/types/physics";

type LightSourceProps = {
  position: Vec3;
};

export function LightSource({ position }: LightSourceProps) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color="#ffd54a"
          emissive="#ffb300"
          emissiveIntensity={2}
        />
      </mesh>

      <pointLight color="#ffd54a" intensity={30} distance={20} decay={2} />
    </group>
  );
}