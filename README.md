# Strix LLM Benchmark Results

Automated llama.cpp benchmark on AMD Strix Halo (MS-S1 Max, 128 GB unified memory, 96 GB GPU). 
Each model is asked to write a ~1,000 line `runEnterpriseSimulation()` function; the output is syntax-checked, executed and scored out of 100.

Last updated: 2026-09-21T17:01:53.118Z · Models tested: 2

| # | Model | Quant | Size GB | Score | Thinking | Gen tok/s | Prompt tok/s | Avg W | Wh/1k tok | $/1M tok | TTFT s | Tokens | Lines | Asserts | Syntax | Runs | Status |
|--:|-------|-------|--------:|------:|:-------:|----------:|-------------:|------:|----------:|---------:|-------:|-------:|------:|--------:|:------:|:----:|--------|
| 1 | [empero-ai/Qwen3.8-35B-A3B-Distill-GGUF](https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF) | Q4_K_M | 20.2 | **23** | low · ≤4096 tok | 63.4 | 664.7 | 70.3 | 0.310 | $0.064 | 1.80 | 32768 | 1840 | 421 | ❌ | – | length |
| 2 | [openbmb/MiniCPM5-2B-GGUF](https://huggingface.co/openbmb/MiniCPM5-2B-GGUF) | Q4_K_M | 1.4 | **0** | low · ≤4096 tok | 118.2 | – | 66.9 | 0.166 | $0.034 | 0.34 | 1280 | 0 | 0 | ✅ | – | loop |

Per-model raw output, extracted code and full metrics are in [`models/`](models/).

## Glossary

### Score (0–100)

- **Score** — Total of the checks below, out of 100. Half can be earned from the code as written (even if it does not run); the other half requires it to actually work. 100 needs a flawless, working answer. If the model produced no `runEnterpriseSimulation()` function at all (for example it ran out of tokens while thinking), the score is 0. Both `function runEnterpriseSimulation()` and `const runEnterpriseSimulation = () => …` count.
- **Syntax (10)** — The extracted code parses without errors (`node --check`). ✔ = valid.
- **Finished (5)** — The model ended on its own (finish reason `stop`) rather than being cut off by the token limit or aborted for looping.
- **Line count (5)** — Non-blank, non-comment lines within the requested 900–1,100 range. Partial credit the closer it is.
- **Nested functions (5)** — At least 25 helper functions defined inside `runEnterpriseSimulation()`. Pattern-based count that ignores comments and strings; object/class methods are not counted.
- **Assertions (5)** — At least 40 assertions written into the code: calls to an `assert…`/`expect…`/`invariant…` helper, or to a check-style helper such as `check(cond, msg)` that is used 5+ times with a condition. Comments, strings and the helper definition itself are not counted. An assertion inside a loop over a literal table of checks counts once per entry; one inside a loop over generated data (e.g. every customer) counts once.
- **Techniques (5)** — One point each for using generators, async/await, custom Error classes, Map and Set together, and Promises, as the prompt asked.
- **Systems covered (5)** — How many of the 20 requested systems (customers, invoices, tickets, tasks, …) appear at least 3 times in the code itself (comments and strings are ignored). A rough on-topic check: a model that drifts off-topic scores low here.
- **Output rules (5)** — The reply was only code: no Markdown fences and no prose before or after it. Code comments, `'use strict'` and a call to the function after it are fine.
- **No external deps (5)** — No `require`/`import` (even of Node built-ins), and no functions, classes or variables declared at the top level besides the one function. Calling or exporting the function is allowed. Code that loads a built-in with `require` still runs, so it loses only these 5 points.
- **Executes / Runs (25)** — The code runs in Node within the time limit. A clean run earns 25. If it ran but its own test suite failed (the error came from one of its assertion helpers as defined under Assertions, a test-suite function such as `runTests`, an assertion-type error class, or its message reports failed assertions/invariants) it earns 10. Any other error (ReferenceError, TypeError, an uncaught business error, …) or a timeout earns 0. ✔ = clean run.
- **Return shape (10)** — The returned object has all 11 required keys and the `metrics` object has all 18 required metrics. Needs a clean run.
- **Customers (5)** — The simulation created at least 100 customers. Needs a clean run.
- **Invariants (5)** — ARR equals MRR × 12 and the key metrics (revenue, counts, API totals) are non-negative. Needs a clean run.
- **Determinism / Determ. (5)** — Running the function twice gives identical values for the 18 required metrics, as the seeded random generator requirement demands. Extra metrics such as a timestamp are ignored. Needs a clean run.
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
