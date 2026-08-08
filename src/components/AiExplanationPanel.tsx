"use client";

import { useEffect, useRef, useState } from "react";
import type { MirrorKind, Vec3 } from "@/types/physics";
import { dot } from "@/engine/vectors";
import { renderMarkdown } from "./markdown";

type AiExplanationPanelProps = {
  kind: MirrorKind;
  radius: number;
  lightPos: Vec3;
  hit: Vec3 | null;
  normal: Vec3 | null;
  incident: Vec3;
  reflected: Vec3 | null;
  reflectEnd: Vec3 | null;
  angle: number | null;
  focus: Vec3 | null;
};

const MIRROR_LABELS: Record<MirrorKind, string> = {
  plane: "espelho plano",
  concave: "espelho côncavo",
  convex: "espelho convexo",
};

const fmt = (v: Vec3) => `(${v.map((n) => n.toFixed(3)).join(", ")})`;

export function AiExplanationPanel({
  kind,
  radius,
  lightPos,
  hit,
  normal,
  incident,
  reflected,
  reflectEnd,
  angle,
  focus,
}: AiExplanationPanelProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dotProduct =
    hit && normal ? dot(incident, normal) : null;

  async function analyze() {
    controller.current?.abort();
    const abortController = new AbortController();
    controller.current = abortController;

    setText("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          mirror:
            `${MIRROR_LABELS[kind]}` +
            (kind !== "plane" ? ` (raio de curvatura ${radius})` : ""),
          lightPos: lightPos.map((n) => n.toFixed(2)).join(", "),
          hit: hit ? hit.map((n) => n.toFixed(2)).join(", ") : null,
          reflectEnd: reflectEnd
            ? reflectEnd.map((n) => n.toFixed(2)).join(", ")
            : null,
          angle,
          focus: focus ? focus.map((n) => n.toFixed(2)).join(", ") : null,
        }),
      });

      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setError("Não consegui consultar a IA. Verifique a GROQ_API_KEY.");
      }
    } finally {
      setLoading(false);
    }
  }

  function openAndAnalyze() {
    setOpen(true);
    analyze();
  }

  function close() {
    controller.current?.abort();
    setOpen(false);
    setText("");
    setError("");
    setLoading(false);
  }

  useEffect(() => () => controller.current?.abort(), []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [text]);

  return (
    <>
      <button
        type="button"
        onClick={openAndAnalyze}
        className="absolute top-4 right-4 z-10 rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg backdrop-blur transition hover:border-sky-500 hover:text-white"
      >
        Explicar reflexão
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="flex max-h-[95vh] w-full max-w-4xl flex-col rounded-xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-700/60 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  A reflexão nesta simulação
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {MIRROR_LABELS[kind]}
                  {kind !== "plane" ? `, R = ${radius}` : ""} · raio incidente
                  de {lightPos.map((n) => n.toFixed(1)).join(", ")} até{" "}
                  {hit ? fmt(hit) : "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-auto px-6 py-5"
            >
              {hit && normal && reflected ? (
                <CalculationSection
                  kind={kind}
                  lightPos={lightPos}
                  hit={hit}
                  normal={normal}
                  incident={incident}
                  reflected={reflected}
                  dotProduct={dotProduct}
                  angle={angle}
                  focus={focus}
                />
              ) : (
                <p className="text-sm text-slate-400">
                  O raio ainda não atinge o espelho. Feche este painel, mova a
                  luz e tente novamente.
                </p>
              )}

              <hr className="my-6 border-slate-700/60" />

              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">
                  Explicação em palavras
                </h3>
                {text && !loading && (
                  <button
                    type="button"
                    onClick={analyze}
                    className="text-xs text-slate-400 transition hover:text-white"
                  >
                    Gerar novamente
                  </button>
                )}
              </div>

              {error && <p className="text-sm text-rose-400">{error}</p>}

              {!text && !error && (
                <p className="text-sm text-slate-400">
                  {loading
                    ? "Pensando…"
                    : "Pressione o botão abaixo para gerar a explicação."}
                </p>
              )}

              {text && (
                <div className="space-y-2 text-[15px]">
                  {renderMarkdown(text)}
                  {loading && <span className="animate-pulse">▌</span>}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-700/60 px-6 py-4">
              <button
                type="button"
                onClick={loading ? () => controller.current?.abort() : analyze}
                disabled={!hit}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition enabled:hover:bg-sky-500 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Cancelar" : "Gerar explicação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CalculationSection({
  kind,
  lightPos,
  hit,
  normal,
  incident,
  reflected,
  dotProduct,
  angle,
  focus,
}: {
  kind: MirrorKind;
  lightPos: Vec3;
  hit: Vec3;
  normal: Vec3;
  incident: Vec3;
  reflected: Vec3;
  dotProduct: number | null;
  angle: number | null;
  focus: Vec3 | null;
}) {
  const hasFocus = kind !== "plane";

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-sky-300">
        Cálculo do raio refletido
      </h3>

      <ol className="space-y-2.5 text-sm">
        <StepRow label="1. Direção do raio incidente" formula="d = normalize(objetivo − origem)">
          <Var name="d" value={fmt(incident)} />
          <Var name="origem" value={fmt(lightPos)} />
          <Var name="objetivo (ponto do espelho)" value={fmt(hit)} />
        </StepRow>

        <StepRow label="2. Vetor normal no ponto" formula="n = vetor perpendicular à superfície">
          <Var name="n" value={fmt(normal)} />
        </StepRow>

        <StepRow label="3. Projeção do raio na normal" formula="d · n">
          <Var
            name="d · n"
            value={dotProduct !== null ? dotProduct.toFixed(4) : "—"}
          />
        </StepRow>

        <StepRow label="4. Reflexão" formula="r = d − 2 (d·n) n">
          <Var name="r" value={fmt(reflected)} />
          {angle !== null && <Var name="θ (ângulo de incidência)" value={`${angle.toFixed(1)}°`} />}
        </StepRow>

        {hasFocus ? (
          <StepRow label="5. Foco do espelho" formula="F = apex ± R/2">
            <Var name="F" value={focus ? fmt(focus) : "—"} />
          </StepRow>
        ) : null}
      </ol>
    </section>
  );
}

function StepRow({
  label,
  formula,
  children,
}: {
  label: string;
  formula: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-md border border-slate-700/60 bg-slate-800/50 px-3 py-2.5">
      <p className="mb-1.5 font-mono text-[11px] text-slate-400">{formula}</p>
      <p className="mb-1 text-xs font-medium text-slate-200">{label}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">{children}</div>
    </li>
  );
}

function Var({ name, value }: { name: string; value: string }) {
  return (
    <p className="font-mono text-[13px]">
      <span className="mr-1 text-slate-500">{name}=</span>
      <span className="text-slate-100">{value}</span>
    </p>
  );
}