
import { GoogleGenAI, Type } from "@google/genai";
import { CVData, AnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeAndOptimizeCV(rawCVText: string, additionalSkillsInput?: string): Promise<AnalysisResponse> {
  const prompt = `
    Tu es un expert en recrutement de haut niveau spécialisé dans le marché de l'emploi à Grenoble (Silicon Valley française).
    
    IMPORTANT : L'utilisateur vient d'obtenir son Master 2. Il n'est plus étudiant. C'est un jeune cadre.
    
    INSTRUCTIONS POUR LE CV :
    1. Analyse le texte du CV fourni.
    2. Supprime impérativement toute expérience liée à "Comfort Hotel Meylan".
    3. Assure-toi que l'expérience chez "Flex" (ou "Flex Cuisine") est marquée comme le poste actuel (jusqu'à aujourd'hui).
    4. RÉÉCRITURE DES MISSIONS : Transforme chaque point de description en une réalisation orientée "résultats" et "leadership".
       - Utilise des verbes d'action puissants.
       - Puisque l'utilisateur est maintenant titulaire d'un Master 2, valorise la dimension stratégique, l'autonomie et la capacité à gérer des projets complexes.
    5. Intègre ces compétences additionnelles : ${additionalSkillsInput || 'Aucune'}.
    6. Traduis le tout dans un format JSON structuré.

    ANALYSE DE MARCHÉ (GRENOBLE) :
    1. Identifie le métier le plus rémunérateur accessible pour un TITULAIRE de Master 2 Management/Commerce à Grenoble (ne propose plus de stages ou d'alternance).
    2. Considère les leaders locaux (Schneider Electric, STMicroelectronics, Caterpillar, Rossignol, ou Business Units Tech).
    3. Donne une fourchette de salaire de "Jeune Cadre" réaliste pour l'Isère.

    CV Input :
    ${rawCVText}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
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
                    description: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    school: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    year: { type: Type.STRING }
                  }
                }
              },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              additionalSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["fullName", "email", "experiences", "skills"]
          },
          insight: {
            type: Type.OBJECT,
            properties: {
              jobTitle: { type: Type.STRING },
              estimatedSalary: { type: Type.STRING },
              reasoning: { type: Type.STRING }
            }
          }
        },
        required: ["updatedCV", "insight"]
      }
    }
  });

  const rawJson = response.text;
  const data = JSON.parse(rawJson);

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.web)
    ?.map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri
    })) || [];

  return {
    updatedCV: data.updatedCV,
    insight: {
      ...data.insight,
      sources: sources
    }
  };
}
