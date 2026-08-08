"use client";

import { CylinderLine } from "./CylinderLine";
import type { Vec3 } from "@/types/physics";

type RayProps = {
  from: Vec3;
  to: Vec3;
  color?: string;
};

export function Ray({ from, to, color = "#ffca28" }: RayProps) {
  return (
    <group>
      <CylinderLine from={from} to={to} color={color} />
      <mesh position={from}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={to}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}