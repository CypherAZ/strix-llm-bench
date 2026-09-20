# Strix LLM Benchmark Results

Automated llama.cpp benchmark on AMD Strix Halo (MS-S1 Max, 128 GB unified memory, 96 GB GPU). 
Each model is asked to write a ~1,000 line `runEnterpriseSimulation()` function; the output is syntax-checked, executed and scored out of 100.

Last updated: 2026-09-20T23:51:32.717Z · Models tested: 4

| # | Model | Quant | Size GB | Score | Gen tok/s | Prompt tok/s | Avg W | Wh/1k tok | $/1M tok | TTFT s | Tokens | Lines | Asserts | Syntax | Runs | Status |
|--:|-------|-------|--------:|------:|----------:|-------------:|------:|----------:|---------:|-------:|-------:|------:|--------:|:------:|:----:|--------|
| 1 | [OBLITERATUS/Qwen3.8-27B-OBLITERATED](https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED) | Q4_K_M | 15.7 | **26** | 12.6 | 246.6 | 89.4 | 1.997 | $0.414 | 4.91 | 4120 | 168 | 27 | ✅ | ❌ | stop |
| 2 | [JonathanColetti/Qwen3.8-27B-Uncensored-GGUF](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF) | Q4_K_M | 15.4 | **25** | 12.0 | 214.0 | 90.5 | 2.092 | $0.433 | 5.77 | 32768 | 0 | 0 | ✅ | – | length |
| 3 | [openbmb/MiniCPM5-2B-GGUF](https://huggingface.co/openbmb/MiniCPM5-2B-GGUF) | Q4_K_M | 1.4 | **10** | 113.9 | – | 71.6 | 0.184 | $0.038 | 0.33 | 3840 | 189 | 3 | ❌ | – | loop |
| 4 | [empero-ai/Qwen3.8-35B-A3B-Distill-GGUF](https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF) | Q4_K_M | 20.2 | **10** | 63.3 | 595.9 | 70.0 | 0.308 | $0.064 | 2.01 | 32768 | 2103 | 0 | ❌ | – | length |

Per-model raw output, extracted code and full metrics are in [`models/`](models/).
