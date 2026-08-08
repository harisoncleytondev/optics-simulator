import type { MirrorModel, MirrorResult, Vec3 } from "@/types/physics";
import { add, dot, EPSILON, normalize, reflect, scale, sub } from "./vectors";

export const MIRROR_DISK_RADIUS = 1.5;

function raySphereIntersection(
  origin: Vec3,
  dir: Vec3,
  center: Vec3,
  radius: number,
): number[] {
  const oc = sub(origin, center);
  const b = dot(oc, dir);
  const c = dot(oc, oc) - radius * radius;
  const discriminant = b * b - c;
  if (discriminant < 0) return [];

  const sqrt = Math.sqrt(discriminant);
  return [-b - sqrt, -b + sqrt]
    .filter((t) => t > EPSILON)
    .sort((a, b) => a - b);
}

export function getMirrorFocus(mirror: MirrorModel): Vec3 | null {
  if (mirror.kind === "plane") return null;
  const axis = normalize(mirror.axis);
  if (mirror.kind === "concave") return add(mirror.apex, scale(axis, mirror.radius / 2));
  return sub(mirror.apex, scale(axis, mirror.radius / 2));
}

export function resolveMirror(source: Vec3, mirror: MirrorModel): MirrorResult {
  const axis = normalize(mirror.axis);
  const incident = normalize(sub(mirror.apex, source));

  let hit: Vec3 | null = null;
  let normal: Vec3 | null = null;

  if (mirror.kind === "plane") {
    const t = dot(sub(mirror.apex, source), axis) / dot(incident, axis);
    if (t > EPSILON) {
      hit = add(source, scale(incident, t));
      normal = axis;
    }
  } else {
    const concave = mirror.kind === "concave";
    const center = concave
      ? add(mirror.apex, scale(axis, mirror.radius))
      : sub(mirror.apex, scale(axis, mirror.radius));
    const pole = concave ? scale(axis, -1) : axis;

    const maxAngle = Math.asin(
      Math.min(mirror.diskRadius / mirror.radius, 1),
    );
    const cosAperture = Math.cos(maxAngle);

    for (const t of raySphereIntersection(source, incident, center, mirror.radius)) {
      const point = add(source, scale(incident, t));
      const geometricNormal = normalize(sub(point, center));

      if (dot(geometricNormal, pole) < cosAperture) continue;

      let n = concave ? scale(geometricNormal, -1) : geometricNormal;
      if (dot(n, incident) > 0) n = scale(n, -1);

      hit = point;
      normal = n;
      break;
    }
  }

  const reflected = hit && normal ? reflect(incident, normal) : null;
  return { hit, normal, incident, reflected };
}