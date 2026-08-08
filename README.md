# Reflexão da Luz – Simulador 3D

Simulador 3D interativo da **reflexão da luz** em espelhos **plano**, **côncavo** e **convexo**, construído para um trabalho de Física.

Todo o traçado de raios é implementado **manualmente** com matemática vetorial (sem engine de física): a interseção raio–superfície e a fórmula da reflexão são resolvidas em código, passo a passo, em `src/engine/`.

<p align="center">
  <img src="/icon.svg" alt="Ícone do simulador" width="128" height="128" />
</p>

## Funcionalidades

- Fonte de luz móvel (esfera amarela) com posicionamento em `X`, `Y` e `Z`.
- Três tipos de espelho selecionáveis: **plano**, **côncavo** e **convexo**.
- **Raio incidente** (amarelo) e **raio refletido** (azul) desenhados em 3D.
- **Reta normal** (verde, tracejada) no ponto de impacto (alternável).
- **Ponto focal** (laranja) exibido nos espelhos esféricos.
- Ajuste do **raio de curvatura** (`R`) dos espelhos esféricos.
- Os feixes de luz **iluminam de verdade** a cena (point lights ao longo dos raios).
- **Modal "Explicar reflexão"**: mostra o **cálculo passo a passo** da reflexão (vetores, normal, d·n, r) e uma análise da IA (Groq) da simulação atual.
- Câmera orbitável (mover, girar e zoom) com mouse.
- Restrição de dispositivo: só funciona em **tablets e computadores** (mensagem de erro em celulares).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router) 16 |
| Linguagem | TypeScript |
| 3D | Three.js + React Three Fiber |
| Auxiliares 3D | @react-three/drei |
| Estilo | Tailwind CSS v4 |

## Estrutura do projeto

```
src/
├── app/           # layout, página e ícone (Next.js)
│   └── api/explain/route.ts   # API da IA (Groq, com streaming)
├── components/    # Componentes que apenas renderizam a cena
│   ├── Scene.tsx          # Composição geral + estado dos controles
│   ├── LightSource.tsx    # Esfera representando a fonte de luz
│   ├── Mirror.tsx         # Geometria do espelho (plano / esférico)
│   ├── Ray.tsx            # Raio como cilindro entre dois pontos
│   ├── NormalLine.tsx     # Reta normal no ponto de impacto
│   ├── FocusPoint.tsx     # Ponto focal dos espelhos esféricos
│   ├── ControlsPanel.tsx  # Painel de interface (HTML)
│   ├── AiExplanationPanel.tsx # Análise da reflexão via Groq
│   └── DeviceGate.tsx     # Guarda de devices (bloqueia celular)
├── engine/         # Matemática e física (vetores + reflexão)
│   ├── vectors.ts          # Operações vetoriais (dot, add, reflect…)
│   └── mirror.ts           # Interseção e reflexão de raios
├── hooks/
│   └── useIsDeviceSupported.ts
└── types/
    └── physics.ts          # Tipos compartilhados (Vec3, MirrorModel…)
```

## Instalação e execução

Requisitos: **Node.js ≥ 20** e `npm` (ou `pnpm`/`yarn`/`bun`).

```bash
# 1. Instalar as dependências
npm install

# 2. Ambiente de desenvolvimento
npm run dev
# abre em http://localhost:3000

# 3. Build de produção
npm run build
npm start # roda o servidor de produção

# 4. Verificação
npm run lint           # ESLint
npx tsc --noEmit       # TypeScript
```

> **Nota:** o aplicativo usa WebGL. Abra em tablets ou computadores; em celulares é exibida uma mensagem de bloqueio.

## IA que explica a reflexão (Groq)

O botão **"Explicar reflexão"** (canto superior direito) abre um modal com duas partes: o **cálculo passo a passo** da reflexão usando os valores reais da simulação (direção incidente `d`, normal `n`, produto escalar `d·n`, vetor refletido `r` e ângulo `θ`) e uma **explicação da IA** (Groq) gerada com os dados do simulado, exibida **em streaming**.

### Configurar a chave

A chamada ao Groq acontece no servidor (`api/explain/route.ts`) — a chave **nunca** vai ao navegador. Crie um arquivo `.env` na raiz:

```
GROQ_API_KEY=cole_a_sua_chave_aqui
```

1. Gere uma chave gratuita em [console.groq.com](https://console.groq.com/keys).
2. Salve no arquivo `.env` (o `.env*` já está no `.gitignore`, portanto não vaza para o git).
3. Reinicie o `npm run dev` e clique em **"Analisar reflexão"**.

Sem a chave, a build continua funcionando; só o botão de análise retorna erro.

## Conceitos físicos

### Leis da reflexão

1. O raio incidente, a normal e o raio refletido estão no **mesmo plano** (plano de incidência).
2. O **ângulo de reflexão** é igual ao **ângulo de incidência**: `θr = θi`.

Matematicamente, dado o vetor de incidência (`d`) e o vetor normal (`n`, unitário), o vetor refletido é:

```
r = d − 2 (d · n) n
```

Este é exatamente o `reflect()` em `engine/vectors.ts` — a dedução da reflexão por projeção sobre a normal.

### Vocábulos-chave
- **Vértice (apex):** o ponto central do espelho sobre o **eixo principal**.
- **Eixo principal:** a reta que passa pelo vértice e pelo centro de curvatura.
- **Centro de curvatura (`C`):** centro da esfera que o espelho esférico copia; está distante `R` dele.
- **Foco (`F`):** ponto onde se encontram os raios paralelos ao eixo; fica a `f = R/2` do vértice, **na frente** do côncavo (real) e **atrás** do convexo (virtual).
- **Normal:** a reta perpendicular à superfície no ponto de reflexão.

## A matemática do motor

Todo o traçado está em `src/engine/`. Não usamos `THREE.Raycaster` nem engine de física — apenas aritmética de vetores.

### 1. Vetores (funções em `vectors.ts`)

Um vetor é uma tupla `Vec3 = [x, y, z]`. As funções básicas usadas:

- **Soma/subtração:** `A ± B = (Ax ± Bx, Ay ± By, Az ± Bz)`
- **Multiplicação por escalar:** `s·A`
- **Produto escalar (dot):** `A·B = Ax·Bx + Ay·By + Az·Bz` — mede a projeção de um vetor sobre o outro (cos do ângulo entre eles).
- **Comprimento:** `|A| = √(A·A)`
- **Normalização:** `Â = A / |A|` (faz o vetor unitário).
- **Reflexo:** `reflect(d, n) = d − 2 (d·n) n`

### 2. Direção do raio

O raio sai da fonte em direção ao vértice do espelho:

```
d = normalize(apex − source)
```

### 3a. Interseção com espelho plano

Parametriza-se o raio por `P(t) = source + t·d` e acha-se `t` que satisfaz o plano (toda a superfície definida pelo vértice e pela normal `n`):

```
t = ((apex − source) · n) / (d · n)
hit = source + t·d
```

Nesse caso a normal no impacto é a própria `n` (constante).

### 3b. Interseção com espelho esférico (côncavo/convexo)

Modela-se o espelho como uma **calota de esfera**:
- **Côncavo:** o centro de curvatura fica **na frente** do espelho → `C = apex + R·n`
- **Convexo:** o centro fica **atrás** → `C = apex − R·n`

Interseção raio–esfera: resolver `|P(t) − C|² = R²` para `t`:

```
(P − C)² = R²  →  t²(d·d) + 2t·d·(source − C) + (source−C)² − R² = 0
```

com `d` unitário, `d·d = 1`, então a fórmula de Bhaskara resolve as duas raízes:

```
b = d · (source − C)
c = |source − C|² − R²
disc = b² − c
t = −b ± √disc
```

**Aceitação da calota:** o ponto de impacto precisa estar dentro do disco visível do espelho. O espelho é representado por um raio de disco `diskRadius`; o ângulo do fim da calota é `θmax = asin(diskRadius/R)`. Só aceita pontos em que o coseno da normal geométrica com o polo de aceitação é ≥ `cos(θmax)`.

A **normal da superfície** no ponto `P` é `n = (P − C)/R` (geométrica). Para **côncavo** essa normal é invertida (reflexão no interior da cavidade):

```
normalRefletida = − nGeométrica   (côncavo)   |   normalRefletida = nGeométrica   (convexo)
```

Garante-se ainda que a normal aponte **contra** o raio incidente (se `n·d > 0`, inverte-se o sinal).

### 4. Reflexão final

Com `n` unitário:

```
r = d − 2 (d·n) n
```

O raio refletido é desenhado de `hit` até `hit + r · comprimento`.

## Controles da interface

- **Botões do tipo de espelho:** `Plano`, `Côncavo` (disco), `Convexo` (calota).
- **Luz X / Y / Z:** move a fonte de luz — o raio se re-aponta automaticamente.
- **Raio de curvatura (`R`):** visível para espelhos esféricos; muda a profundidade da calota e a posição do foco.
- **Mostrar reta normal:** alterna a visualização da reta verde no ponto de reflexão.
- **Reiniciar posição da luz:** volta a fonte ao ponto inicial.
- **Explicar reflexão:** abre o modal com o cálculo da reflexão e a análise da IA (requer `GROQ_API_KEY`). A resposta chega em streaming e é exibida com formatação Markdown.

## Licença

Uso educacional. Projeto do autor para estudo de Física (Óptica) e aprendizado de Three.js.