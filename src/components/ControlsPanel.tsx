"use client";

import type { MirrorKind, Vec3 } from "@/types/physics";

type ControlsPanelProps = {
  kind: MirrorKind;
  onKind: (kind: MirrorKind) => void;
  lightPos: Vec3;
  onLightPos: (pos: Vec3) => void;
  radius: number;
  onRadius: (radius: number) => void;
showNormal: boolean;
  onShowNormal: (show: boolean) => void;
};

const KINDS: { value: MirrorKind; label: string }[] = [
  { value: "plane", label: "Plano" },
  { value: "concave", label: "Côncavo" },
  { value: "convex", label: "Convexo" },
];

const AXES: { key: 0 | 1 | 2; label: string; min: number; max: number }[] = [
  { key: 0, label: "X", min: -3, max: 3 },
  { key: 1, label: "Y", min: 0.5, max: 6 },
  { key: 2, label: "Z", min: 2, max: 8 },
];

export function ControlsPanel({
  kind,
  onKind,
  lightPos,
  onLightPos,
  radius,
  onRadius,
  showNormal,
  onShowNormal,
}: ControlsPanelProps) {
  return (
    <div className="absolute top-4 left-4 z-10 w-72 rounded-lg border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur">
      <p className="mb-3 font-semibold">Simulador de Reflexão</p>

      <div className="mb-4 flex overflow-hidden rounded-md border border-slate-600">
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            onClick={() => onKind(k.value)}
            className={`flex-1 px-2 py-1.5 transition ${
              kind === k.value
                ? "bg-sky-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {AXES.map((axis) => (
          <SliderRow
            key={axis.key}
            label={`Luz ${axis.label}`}
            value={lightPos[axis.key]}
            min={axis.min}
            max={axis.max}
            step={0.1}
            onChange={(value) => {
              const next: Vec3 = [...lightPos];
              next[axis.key] = value;
              onLightPos(next);
            }}
          />
        ))}

        {kind !== "plane" && (
          <SliderRow
            label="Raio de curvatura"
            value={radius}
            min={2}
            max={6}
            step={0.2}
            onChange={onRadius}
          />
        )}

        <label className="flex items-center gap-2 pt-1 text-slate-300">
          <input
            type="checkbox"
            checked={showNormal}
            onChange={(e) => onShowNormal(e.target.checked)}
            className="h-4 w-4"
          />
          Mostrar reta normal
        </label>
      </div>
    </div>
  );
}

type SliderRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function SliderRow({ label, value, min, max, step, onChange }: SliderRowProps) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span className="tabular-nums">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}