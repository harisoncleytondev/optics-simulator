import { NextRequest } from "next/server";
import { Groq } from "groq-sdk";

export const runtime = "nodejs";

function getGroq() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("A variavel de ambiente GROQ_API_KEY nao esta definida.");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

type ExplainBody = {
  mirror: string;
  lightPos: string;
  hit: string | null;
  reflectEnd: string | null;
  angle: number | null;
  focus: string | null;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ExplainBody;

  const system = [
    "Você é um professor de física paciente e uso linguagem simples,",
    "perfeita para alunos do ensino médio.",
    "Um simulador 3D mostra, em tempo real, a reflexão da luz em um espelho.",
    `Espelho atual: ${body.mirror}.`,
    `Posição da fonte de luz (x, y, z): ${body.lightPos}.`,
    body.hit
      ? `O raio atinge o espelho no ponto (${body.hit}).`
      : "O raio ainda não atingiu o espelho.",
    body.reflectEnd
      ? `O raio é refletido e segue até o ponto (${body.reflectEnd}).`
      : "",
    body.angle !== null
      ? `O ângulo de incidência é ${body.angle.toFixed(1)}°.`
      : "",
    body.focus ? `O foco do espelho está em (${body.focus}).` : "",
    "",
    "Escreva uma explicação curta e acolhedora em pt-BR, em formato Markdown leve:",
    "- Comece com **O que está acontecendo:** em uma ou duas frases.",
    "- Depois **Para onde a luz vai:** outra frase curta.",
    "- Se for espelho esférico, cite o foco em **Detalhe físico:**.",
    "- Termine com **Dica:** uma curiosidade didática.",
    "- No máximo 120 palavras. Sem listas longas. Direto ao ponto.",
  ]
    .filter(Boolean)
    .join(" ");

  const chatCompletion = await getGroq().chat.completions.create({
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: "Analise a reflexão atual do simulador e explique ao aluno.",
      },
    ],
    model: "qwen/qwen3.6-27b",
    temperature: 0.6,
    max_completion_tokens: 2048,
    top_p: 0.95,
    stream: true,
    reasoning_effort: "none",
    stop: null,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of chatCompletion) {
          const delta = chunk.choices[0]?.delta;
          const text = delta?.content || "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}