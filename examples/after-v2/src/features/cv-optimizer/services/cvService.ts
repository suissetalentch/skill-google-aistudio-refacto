import { GoogleGenAI, Type } from '@google/genai';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { CV_ANALYSIS_PROMPT } from '../constants/prompts';
import type { AnalysisResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function analyzeAndOptimizeCV(
  rawCVText: string,
  additionalSkillsInput?: string,
): Promise<AnalysisResponse> {
  const prompt = CV_ANALYSIS_PROMPT
    .replace('{{cvText}}', rawCVText)
    .replace('{{additionalSkills}}', additionalSkillsInput || 'Aucune');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          updatedCV: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              summary: { type: Type.STRING },
              experiences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    location: { type: Type.STRING },
                    period: { type: Type.STRING },
                    description: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    school: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    year: { type: Type.STRING },
                  },
                },
              },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              additionalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['fullName', 'email', 'experiences', 'skills'],
          },
          insight: {
            type: Type.OBJECT,
            properties: {
              jobTitle: { type: Type.STRING },
              estimatedSalary: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
          },
        },
        required: ['updatedCV', 'insight'],
      },
    },
  });

  const rawJson = response.text;
  const data = safeJsonParse<AnalysisResponse>(rawJson ?? '');

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

  const sources = chunks
    .filter((chunk) => chunk.web?.title && chunk.web?.uri)
    .map((chunk) => ({
      title: chunk.web!.title!,
      uri: chunk.web!.uri!,
    }));

  return {
    updatedCV: data.updatedCV,
    insight: {
      ...data.insight,
      sources,
    },
  };
}
