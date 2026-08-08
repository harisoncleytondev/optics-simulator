"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { LightSource } from "./LightSource";
import { Ray } from "./Ray";
import { Mirror } from "./Mirror";
import { NormalLine } from "./NormalLine";
import { FocusPoint } from "./FocusPoint";
import { ControlsPanel } from "./ControlsPanel";
import { AiExplanationPanel } from "./AiExplanationPanel";
import { resolveMirror, getMirrorFocus, MIRROR_DISK_RADIUS } from "@/engine/mirror";
import { add, angleDeg, scale } from "@/engine/vectors";
import type { MirrorKind, MirrorModel, Vec3 } from "@/types/physics";

const RAY_LENGTH = 6;

export function Scene() {
  const [kind, setKind] = useState<MirrorKind>("plane");
  const [lightPos, setLightPos] = useState<Vec3>([0.8, 2.4, 5]);
  const [radius, setRadius] = useState(3.5);
  const [showNormal, setShowNormal] = useState(true);

  const mirror: MirrorModel = useMemo(
    () => ({
      kind,
      apex: [0, 1.6, 0],
      axis: [0, 0, 1],
      radius,
      diskRadius: MIRROR_DISK_RADIUS,
    }),
    [kind, radius],
  );

  const result = useMemo(
    () => resolveMirror(lightPos, mirror),
    [lightPos, mirror],
  );

  const reflectedEnd: Vec3 | null =
    result.hit && result.reflected
      ? add(result.hit, scale(result.reflected, RAY_LENGTH))
      : null;

  const focus = useMemo(() => getMirrorFocus(mirror), [mirror]);

  const angleOfIncidence =
    result.hit && result.normal
      ? angleDeg(result.incident, result.normal)
      : null;

  return (
    <div className="relative h-screen w-full">
      <ControlsPanel
        kind={kind}
        onKind={setKind}
        lightPos={lightPos}
        onLightPos={setLightPos}
        radius={radius}
        onRadius={setRadius}
        showNormal={showNormal}
        onShowNormal={setShowNormal}
      />

      <AiExplanationPanel
        kind={kind}
        radius={radius}
        lightPos={lightPos}
        hit={result.hit}
        normal={result.normal}
        incident={result.incident}
        reflected={result.reflected}
        reflectEnd={reflectedEnd}
        angle={angleOfIncidence}
        focus={focus}
      />

      <a
        href="https://harisoncleyton.tech"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-4 z-10 text-xs font-medium text-slate-400 transition hover:text-white"
      >
        by harisoncleytondev
      </a>

      <Canvas camera={{ position: [7, 5, 10], fov: 50 }}>
        <color attach="background" args={["#04060c"]} />
        <ambientLight intensity={0.08} />

        <Mirror mirror={mirror} />

        {result.hit && result.normal && showNormal && (
          <NormalLine at={result.hit} dir={result.normal} />
        )}

        {result.hit && (
          <Ray from={lightPos} to={result.hit} color="#ffca28" />
        )}

        {result.hit && reflectedEnd && (
          <Ray from={result.hit} to={reflectedEnd} color="#4fc3f7" />
        )}

        {kind !== "plane" && <FocusPoint mirror={mirror} />}

        <LightSource position={lightPos} />

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}