"use client";

import { CylinderLine } from "./CylinderLine";
import type { Vec3 } from "@/types/physics";
import { add, scale } from "@/engine/vectors";

type NormalLineProps = {
  at: Vec3;
  dir: Vec3;
  length?: number;
};

export function NormalLine({ at, dir, length = 2.2 }: NormalLineProps) {
  return (
    <CylinderLine
      from={add(at, scale(dir, -length / 2))}
      to={add(at, scale(dir, length / 2))}
      radius={0.035}
      color="#69f0ae"
      opacity={0.85}
    />
  );
}