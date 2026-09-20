# Strix LLM Benchmark Results

Automated llama.cpp benchmark on AMD Strix Halo (MS-S1 Max, 128 GB unified memory, 96 GB GPU). 
Each model is asked to write a ~1,000 line `runEnterpriseSimulation()` function; the output is syntax-checked, executed and scored out of 100.

Last updated: 2026-09-20T22:21:08.268Z · Models tested: 1

| # | Model | Quant | Size GB | Score | Gen tok/s | Prompt tok/s | Avg W | Wh/1k tok | TTFT s | Tokens | Lines | Asserts | Syntax | Runs | Status |
|--:|-------|-------|--------:|------:|----------:|-------------:|------:|----------:|-------:|-------:|------:|--------:|:------:|:----:|--------|
| 1 | [openbmb/MiniCPM5-2B-GGUF](https://huggingface.co/openbmb/MiniCPM5-2B-GGUF) | Q4_K_M | 1.4 | **10** | 113.9 | – | 71.6 | 0.184 | 0.33 | 3840 | 189 | 3 | ❌ | – | loop |

Per-model raw output, extracted code and full metrics are in [`models/`](models/).
