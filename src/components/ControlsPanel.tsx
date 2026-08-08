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
    <div className="absolute top-4 left-4 z-10 w-72 rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-slate-100 shadow-lg backdrop-blur">
      <div className="border-b border-slate-700/60 px-4 py-3">
        <p className="font-semibold">Simulador de Reflexão</p>
        <p className="text-[11px] text-slate-400">
          Mova a luz e observe os raios em 3D
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-300">Espelho</p>
          <div className="flex overflow-hidden rounded-md border border-slate-600">
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                onClick={() => onKind(k.value)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium transition ${
                  kind === k.value
                    ? "bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-inner"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-300">Fonte de luz</p>
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
          </div>
          <button
            type="button"
            onClick={() => onLightPos([0.8, 2.4, 5])}
            className="mt-2 w-full rounded-md border border-slate-600 bg-slate-800 py-1 text-xs text-slate-300 transition hover:bg-slate-700"
          >
            Reiniciar posição da luz
          </button>
        </div>

        {kind !== "plane" && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-300">
              Raio de curvatura
            </p>
            <SliderRow
              label="R"
              value={radius}
              min={2}
              max={6}
              step={0.2}
              onChange={onRadius}
            />
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={showNormal}
            onChange={(e) => onShowNormal(e.target.checked)}
            className="h-4 w-4 rounded accent-sky-500"
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
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span className="tabular-nums text-slate-400">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
        style={{
          background: `linear-gradient(to right, #38bdf8 ${pct}%, #334155 ${pct}%)`,
        }}
      />
    </div>
  );
}