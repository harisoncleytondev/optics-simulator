export type Vec3 = [number, number, number];

export type MirrorKind = "plane" | "concave" | "convex";

export interface MirrorModel {
  kind: MirrorKind;
  apex: Vec3;
  axis: Vec3;
  radius: number;
  diskRadius: number;
}

export interface MirrorResult {
  hit: Vec3 | null;
  normal: Vec3 | null;
  incident: Vec3;
  reflected: Vec3 | null;
}