"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { CylinderLine } from "./CylinderLine";
import { add, scale, sub } from "@/engine/vectors";
import type { Vec3 } from "@/types/physics";

type RayProps = {
  from: Vec3;
  to: Vec3;
  color?: string;
  intensity?: number;
};

const LIGHT_FRACTIONS = [0.2, 0.4, 0.6, 0.8];

export function Ray({ from, to, color = "#ffca28", intensity = 8 }: RayProps) {
  const lightPositions = useMemo(() => {
    const dir = sub(to, from);
    return LIGHT_FRACTIONS.map((f) => add(from, scale(dir, f)));
  }, [from, to]);

  return (
    <group>
      <CylinderLine from={from} to={to} color={color} glow />

      <mesh position={from}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={to}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {lightPositions.map((pos, i) => (
        <pointLight
          key={i}
          position={pos}
          color={color}
          intensity={intensity}
          distance={10}
          decay={2}
        />
      ))}
    </group>
  );
}