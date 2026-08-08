import type { Vec3 } from "@/types/physics";

export const EPSILON = 1e-6;

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function scale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function length(a: Vec3): number {
  return Math.sqrt(dot(a, a));
}

export function normalize(a: Vec3): Vec3 {
  const l = length(a);
  if (l < EPSILON) return [0, 0, 0];
  return scale(a, 1 / l);
}

export function reflect(d: Vec3, n: Vec3): Vec3 {
  const k = dot(d, n);
  return [d[0] - 2 * k * n[0], d[1] - 2 * k * n[1], d[2] - 2 * k * n[2]];
}

export function angleDeg(a: Vec3, b: Vec3): number {
  const denom = length(a) * length(b);
  if (denom < EPSILON) return 0;
  const cos = Math.min(1, Math.max(-1, dot(a, b) / denom));
  return (Math.acos(cos) * 180) / Math.PI;
}