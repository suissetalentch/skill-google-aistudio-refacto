import { config } from '@/config/env';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { CV_ANALYSIS_PROMPT } from '../constants/prompts';
import type { AnalysisResponse } from '../types';

const API_TIMEOUT_MS = 60_000;

function buildPrompt(cvText: string, additionalSkills: string): string {
  return CV_ANALYSIS_PROMPT.replace('{{cvText}}', cvText).replace(
    '{{additionalSkills}}',
    additionalSkills,
  );
}

export async function analyzeCV(
  cvText: string,
  additionalSkills: string,
  signal?: AbortSignal,
): Promise<AnalysisResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  // Combine external signal with timeout
  const combinedSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;

  try {
    const response = await fetch(`${config.apiUrl}/cv/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText,
        additionalSkills,
        prompt: buildPrompt(cvText, additionalSkills),
      }),
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

export function parseAnalysisResponse(raw: string): AnalysisResponse {
  return safeJsonParse<AnalysisResponse>(raw);
}
