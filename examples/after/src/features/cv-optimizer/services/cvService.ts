import axios from 'axios';
import { config } from '@/config/env';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { CV_ANALYSIS_PROMPT } from '../constants/prompts';
import type { AnalysisResponse } from '../types';

const API_TIMEOUT_MS = 60_000;

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

function buildPrompt(cvText: string, additionalSkills: string): string {
  return CV_ANALYSIS_PROMPT.replace('{{cvText}}', cvText).replace(
    '{{additionalSkills}}',
    additionalSkills,
  );
}

export async function analyzeCV(
  cvText: string,
  additionalSkills: string,
): Promise<AnalysisResponse> {
  const response = await apiClient.post<AnalysisResponse>('/cv/analyze', {
    cvText,
    additionalSkills,
    prompt: buildPrompt(cvText, additionalSkills),
  });
  return response.data;
}

export function parseAnalysisResponse(raw: string): AnalysisResponse {
  return safeJsonParse<AnalysisResponse>(raw);
}
