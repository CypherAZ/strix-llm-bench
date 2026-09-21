# Strix LLM Benchmark Results

Automated llama.cpp benchmark on AMD Strix Halo (MS-S1 Max, 128 GB unified memory, 96 GB GPU). 
Each model is asked to write a ~1,000 line `runEnterpriseSimulation()` function; the output is syntax-checked, executed and scored out of 100.

Last updated: 2026-09-21T00:16:20.860Z · Models tested: 0

| # | Model | Quant | Size GB | Score | Thinking | Gen tok/s | Prompt tok/s | Avg W | Wh/1k tok | $/1M tok | TTFT s | Tokens | Lines | Asserts | Syntax | Runs | Status |
|--:|-------|-------|--------:|------:|:-------:|----------:|-------------:|------:|----------:|---------:|-------:|-------:|------:|--------:|:------:|:----:|--------|

Per-model raw output, extracted code and full metrics are in [`models/`](models/).

## Glossary

### Score (0–100)

- **Score** — Total of the eleven checks below. It measures how well the model followed the benchmark prompt and whether its code actually works — not general intelligence. Failed runs show ERR.
- **Syntax (15)** — The extracted code parses without errors (`node --check`). ✔ = valid.
- **Executes / Runs (25)** — The code runs to completion in Node within the time limit. Because the prompt requires a built-in test suite, any failed assertion or thrown error counts as a failure. ✔ = ran cleanly.
- **Line count (10)** — Non-blank, non-comment lines within the requested 900–1,100 range. Partial credit the further outside the range it is.
- **Nested functions (5)** — At least 25 helper functions defined inside `runEnterpriseSimulation()` (regex-based count).
- **Assertions (10)** — At least 40 `assert…(` calls in the code (regex-based count). Only scored if the code runs.
- **Output rules (5)** — The reply was only code: no Markdown fences and no explanation before or after it.
- **No external deps (5)** — No `require`/`import`, and nothing declared at the top level besides the one function.
- **Return shape (10)** — The returned object has all 11 required keys and the `metrics` object has all 18 required metrics.
- **Customers (5)** — The simulation created at least 100 customers.
- **Invariants (5)** — ARR equals MRR × 12 and the key metrics (revenue, counts, API totals) are non-negative.
- **Determinism / Determ. (5)** — Running the function twice gives identical metrics, as the seeded random generator requirement demands.
- **Lines / Asserts** — The raw counts behind the line-count and assertions checks.

### Speed

- **Gen tok/s** — Generation speed: output tokens produced per second, as reported by llama.cpp. This is the number that feels like “how fast it types”.
- **Prompt tok/s** — Prompt-processing speed: how fast the model reads the input prompt before it starts answering.
- **TTFT** — Time to first token: seconds from sending the prompt until the first token (including reasoning tokens) arrives.
- **Tokens** — Output tokens generated, including any hidden “thinking” tokens. The cap is `maxTokens` (32,768 by default).
- **Gen time** — Total wall-clock time of the generation step.
- **Prompt tokens** — Size of the input prompt in tokens.
- **Reasoning chars** — Characters of chain-of-thought (thinking) output, separate from the code itself.

### How a run ended

- **stop** — The model finished on its own — the normal, good outcome.
- **length** — The model hit the token cap before finishing. Usually a reasoning model that spent its budget thinking, or a truncated file; often scores low.
- **loop** — Strix detected the model repeating itself endlessly and aborted early to save time.
- **timeout** — Generation exceeded the time limit and was cut off.
- **error: <stage>** — The run failed before producing a result, at download, load, generate or evaluate (for example an architecture llama.cpp cannot load).

### Memory

- **Peak GB** — Highest GPU memory in use during generation: VRAM plus GTT (system memory the GPU can address). On this unified-memory machine both count.
- **Peak VRAM / Peak GTT** — The two parts of Peak GB, separately.
- **Process RSS** — Regular RAM used by the llama-server process itself.

### Power & cost

- **Avg W / Peak W** — Average and highest power draw of the chip (SoC package, from the amdgpu sensor) sampled during generation. This is not wall power.
- **Energy (Wh)** — Watt-hours used during generation (power integrated over time).
- **Wh/1k tok** — Watt-hours per 1,000 output tokens — an efficiency figure; lower is better. Tokens per Wh is the same thing inverted.
- **$/1M tok** — Estimated electricity cost to generate a million tokens: energy × your $/kWh rate (APS E-12 marginal rates, chosen by season). Ignores fixed charges and idle draw.
- **Run cost** — The estimated electricity cost of that one generation run.

### Model & setup

- **Quant** — Quantization: how the weights are compressed. Q4_K_M (4-bit) is the default so models are compared fairly; smaller numbers are smaller and faster but can lose quality.
- **Size GB** — Size of the downloaded model file(s).
- **Trending score** — Hugging Face’s trending score when the model was picked; models are tested from most to least trending.
- **Download MB/s / Load time** — Network speed while downloading, and seconds to load the model into GPU memory.
- **Thinking** — The reasoning limits applied to that run: the effort hint (for example “low”) and the maximum number of thinking tokens. Every model in a batch gets the same limits, so comparisons stay fair; “default” means no limits (older results). Models without a thinking mode simply ignore it.
- **Prefetched** — The model was downloaded in the background during the previous model’s test.
