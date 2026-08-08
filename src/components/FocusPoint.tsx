"use client";

import type { MirrorModel, Vec3 } from "@/types/physics";
import { getMirrorFocus } from "@/engine/mirror";

type FocusPointProps = {
  mirror: MirrorModel;
};

export function FocusPoint({ mirror }: FocusPointProps) {
  const focus: Vec3 | null = getMirrorFocus(mirror);
  if (!focus) return null;

  return (
    <mesh position={focus}>
      <sphereGeometry args={[0.16, 16, 16]} />
      <meshStandardMaterial color="#ff7043" emissive="#ff5722" emissiveIntensity={1} />
    </mesh>
  );
}