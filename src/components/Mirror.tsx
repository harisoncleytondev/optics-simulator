"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MirrorModel, Vec3 } from "@/types/physics";
import { MIRROR_DISK_RADIUS } from "@/engine/mirror";

type MirrorProps = {
  mirror: MirrorModel;
};

const PROFILE_SEGMENTS = 48;

function alignZ(axis: Vec3): THREE.Quaternion {
  const target = new THREE.Vector3(...axis).normalize();
  if (target.length() < 1e-6) return new THREE.Quaternion();
  return new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    target,
  );
}

export function Mirror({ mirror }: MirrorProps) {
  const quaternion = useMemo(() => alignZ(mirror.axis), [mirror.axis]);

  const sphericalGeometry = useMemo(() => {
    if (mirror.kind === "plane") return null;
    const concave = mirror.kind === "concave";
    return buildLatheProfile(concave, mirror.radius, MIRROR_DISK_RADIUS);
  }, [mirror.kind, mirror.radius]);

  const prevGeometryRef = useRef<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (prevGeometryRef.current) prevGeometryRef.current.dispose();
    prevGeometryRef.current = sphericalGeometry;
    return () => {
      if (prevGeometryRef.current) prevGeometryRef.current.dispose();
    };
  }, [sphericalGeometry]);

  return (
    <group position={mirror.apex} quaternion={quaternion}>
      {mirror.kind === "plane" ? (
        <mesh>
          <boxGeometry args={[3.2, 3.2, 0.07]} />
          <meshStandardMaterial
            color="#cfd8e3"
            metalness={0.95}
            roughness={0.12}
          />
        </mesh>
      ) : (
        <mesh
          key={`${mirror.kind}-${mirror.radius}`}
          geometry={sphericalGeometry ?? undefined}
        >
          <meshStandardMaterial
            color="#9fd8c8"
            metalness={0.9}
            roughness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function buildLatheProfile(
  concave: boolean,
  curvatureRadius: number,
  apertureRadius: number,
): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const steps = 40;

  for (let i = 0; i <= steps; i++) {
    const r = (i / steps) * apertureRadius;
    const s = r / curvatureRadius;
    const z =
      concave
        ? curvatureRadius * (1 - Math.sqrt(1 - s * s))
        : curvatureRadius * (Math.sqrt(1 - s * s) - 1);
    points.push(new THREE.Vector2(r, z));
  }

  const geometry = new THREE.LatheGeometry(points, PROFILE_SEGMENTS);
  geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  return geometry;
}