# 06 — API Services & Security

## The Problem

AI Studio exposes API keys in client code and mixes prompts with service logic:

```ts
// examples/before/vite.config.ts — API key injected into client bundle
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
  };
});
```

```ts
// examples/before/services/geminiService.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeAndOptimizeCV(rawCVText: string): Promise<AnalysisResponse> {
  const prompt = `
    Tu es un expert en recrutement de haut niveau spécialisé dans le marché
    de l'emploi à Grenoble (Silicon Valley française).
    // ... 30+ lines of prompt inside the function
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
  });

  const rawJson = response.text;
  const data = JSON.parse(rawJson);  // No try/catch!
}
```

Issues:
- **API key in client bundle** — `define` inlines the key into JavaScript
- **No service abstraction** — AI SDK called directly with no error handling
- **Prompt mixed with code** — 30-line prompt string embedded in function
- **Unsafe JSON.parse** — no try/catch around parsing AI response
- **No typed API client** — no timeout, no abort, no error normalization

## The Standard

### Environment configuration

```ts
// src/config/env.ts
export const getApiUrl = (): string => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }
  return import.meta.env.VITE_API_URL || '/api';
};

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.DEV ? 'development' : 'production',
  appName: import.meta.env.VITE_APP_NAME || 'App',
} as const;
```

### Native fetch with timeout and abort

```ts
// src/features/cv-optimizer/services/cvService.ts
import { config } from '@/config/env';

const API_TIMEOUT_MS = 60_000;

export async function analyzeCV(
  cvText: string,
  additionalSkills: string,
  signal?: AbortSignal,
): Promise<AnalysisResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const combinedSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;

  try {
    const response = await fetch(`${config.apiUrl}/cv/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvText, additionalSkills }),
      signal: combinedSignal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as AnalysisResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

## Before / After

### Step 1: Remove API key from client

```ts
// BEFORE — vite.config.ts
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
}

// AFTER — remove define block entirely
// API key should NEVER be in the frontend.
// Move AI calls to a backend API proxy.
```

### Step 2: Replace axios with native fetch

```ts
// BEFORE — axios
import axios from 'axios';
const apiClient = axios.create({ baseURL: config.apiUrl, timeout: 60000 });
const response = await apiClient.post('/cv/analyze', { cvText });
return response.data;

// AFTER — native fetch + AbortController
const response = await fetch(`${config.apiUrl}/cv/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cvText }),
  signal: controller.signal,
});
if (!response.ok) throw new Error(`API error: ${response.status}`);
return await response.json();
```

### Step 3: Extract prompts to constants

```ts
// BEFORE — prompt inside function
const prompt = `Tu es un expert en recrutement...${rawCVText}`;

// AFTER — src/features/cv-optimizer/constants/prompts.ts
export const CV_ANALYSIS_PROMPT = `
Tu es un expert en recrutement de haut niveau...

CV Input :
{{cvText}}

Compétences additionnelles :
{{additionalSkills}}
`;
```

### Step 4: Safe JSON parsing

```ts
// BEFORE
const data = JSON.parse(rawJson);

// AFTER
function safeJsonParse<T>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    throw new Error(`Failed to parse API response: ${message}`);
  }
}
```

## Security Checklist

Before deploying, verify all security items:

### `.gitignore` template (minimum)

```gitignore
# Environment secrets
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependencies
node_modules/

# Build output
dist/
```

### Pre-deployment checks

| Check | Command | Expected |
|-------|---------|----------|
| `.env` in `.gitignore` | `grep "^\.env" .gitignore` | Match found |
| No secrets in `.env.example` | `grep -i "KEY\|SECRET\|TOKEN" .env.example` | Only placeholder values |
| No `VITE_.*KEY` in source | `grep -r "VITE_.*KEY" src/` | 0 results |
| No `process.env.API_KEY` | `grep -r "process.env.API_KEY" src/` | 0 results |
| Backend proxy configured | Check `VITE_API_URL` points to proxy | Not direct AI API |

### `.env.example` format

```env
# Public config (safe for client bundle)
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=MyApp

# Server-side only (NEVER prefix with VITE_)
# GEMINI_API_KEY=your-key-here  ← backend only
```

## Rules

1. **Never expose API keys in the frontend** — remove all `process.env.API_KEY` and Vite `define` blocks.
2. **Use `VITE_` prefix only for public config** — only `VITE_API_URL`, `VITE_APP_NAME`. Never `VITE_API_KEY`.
3. **Use native fetch** — no axios dependency needed. Use `AbortController` for timeouts and cancellation.
4. **Check `response.ok`** — fetch doesn't throw on HTTP errors, you must check manually.
5. **Extract prompts to `constants/`** — AI prompts are content, not code.
6. **Wrap JSON.parse in try/catch** — AI responses can be malformed.
7. **Type service responses** — every API call should have typed request and response interfaces.
8. **Move AI SDK calls to a backend** — client-side AI SDK usage exposes your API key.
9. **Ensure `.env` is in `.gitignore`** — never commit secret files. Check `.gitignore` includes `.env`, `.env.local`, and `.env.*.local` patterns.
