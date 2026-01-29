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

    IMPORTANT : L'utilisateur vient d'obtenir son Master 2...
    // ... 30+ lines of prompt inside the function
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    // ...
  });

  const rawJson = response.text;
  const data = JSON.parse(rawJson);  // No try/catch!
  // ...
}
```

Issues:
- **API key in client bundle** — `define` in vite.config.ts inlines the key into JavaScript. Anyone can extract it from browser DevTools.
- **No service abstraction** — AI SDK called directly with no error handling layer.
- **Prompt mixed with code** — 30-line prompt string embedded in the function makes it unmaintainable.
- **Unsafe JSON.parse** — no try/catch around parsing AI response.
- **No typed API client** — no interceptors, no auth headers, no error normalization.

## The Standard

### Environment configuration (place2work pattern)

```ts
// place2work/frontend/src/config/env.ts
export const getApiUrl = (): string => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';
  }
  return import.meta.env.VITE_API_URL || '/api/v1';
};

export const config = {
  apiUrl: getApiUrl(),
  environment: import.meta.env.DEV ? 'development' : 'production',
} as const;
```

### Axios client with interceptors (place2work pattern)

```ts
// place2work/frontend/src/services/apiClient.ts
import axios from 'axios';
import { config } from '@/config/env';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401, network errors, transform to standard format
    // ...
  }
);
```

## Before / After

### Step 1: Remove API key from client

```ts
// BEFORE — vite.config.ts
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
}

// AFTER — vite.config.ts (remove define block entirely)
// API key should NEVER be in the frontend.
// Move AI calls to a backend API proxy.
```

If no backend exists yet, create a minimal proxy:

```ts
// AFTER — src/config/env.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
} as const;
```

### Step 2: Extract prompts to constants

```ts
// BEFORE — prompt inside function
const prompt = `Tu es un expert en recrutement...${rawCVText}`;

// AFTER — src/features/cv-optimizer/constants/prompts.ts
export const CV_ANALYSIS_PROMPT = `
Tu es un expert en recrutement de haut niveau spécialisé dans le marché
de l'emploi à Grenoble (Silicon Valley française).

INSTRUCTIONS POUR LE CV :
1. Analyse le texte du CV fourni.
2. Réécriture des missions en réalisations orientées résultats.
3. Intègre les compétences additionnelles fournies.

CV Input :
{{cvText}}

Compétences additionnelles :
{{additionalSkills}}
`;
```

### Step 3: Create a typed service layer

```ts
// AFTER — src/features/cv-optimizer/services/cvService.ts
import { apiClient } from '@/services/apiClient';
import type { AnalysisResponse } from '../types';

export async function analyzeCV(
  cvText: string,
  additionalSkills: string
): Promise<AnalysisResponse> {
  const response = await apiClient.post<AnalysisResponse>('/cv/analyze', {
    cvText,
    additionalSkills,
  });
  return response.data;
}
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

## Rules

1. **Never expose API keys in the frontend** — remove all `process.env.API_KEY` and Vite `define` blocks that inject secrets.
2. **Use `VITE_` prefix only for public config** — only `VITE_API_URL`, `VITE_APP_NAME` etc. Never `VITE_API_KEY`.
3. **Create `config/env.ts`** — centralize environment configuration following the place2work pattern.
4. **Create `services/apiClient.ts`** — use Axios with interceptors for auth, error handling, and logging.
5. **Extract prompts to `constants/`** — AI prompts are content, not code. Keep them in dedicated constant files.
6. **Wrap JSON.parse in try/catch** — AI responses can be malformed. Always handle parse failures.
7. **Type service responses** — every API call should have typed request and response interfaces.
8. **Move AI SDK calls to a backend** — client-side AI SDK usage exposes your API key. Proxy through your own API.
