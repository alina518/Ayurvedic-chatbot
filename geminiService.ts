
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Dosha, AssessmentResult, Language, Question, ImageValidationResult } from "./types";

/**
 * The API key is obtained exclusively from the environment variable.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Helper to wrap API calls with exponential backoff retry logic.
 * Specifically tuned for 429 (Resource Exhausted) errors.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 3000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorString = JSON.stringify(error).toUpperCase();
    const isQuotaError = 
      error?.status === 429 || 
      error?.error?.code === 429 || 
      errorString.includes("429") ||
      errorString.includes("RESOURCE_EXHAUSTED") ||
      errorString.includes("QUOTA_EXCEEDED");

    if (isQuotaError && retries > 0) {
      // Add a random jitter to the delay to prevent thundering herd issues
      const jitter = Math.random() * 2000;
      const totalDelay = delay + jitter;
      
      console.warn(`The Celestial Wisdom is currently in high demand (Quota 429). The Vaidya is meditating for ${Math.round(totalDelay / 1000)}s before trying again... (${retries} attempts remaining)`);
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));
      // Increase delay for next retry (exponential backoff)
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Simple persistent cache for translations to avoid redundant API calls
 */
const getCachedTranslation = (language: Language): any | null => {
  try {
    const cached = localStorage.getItem(`ayurveda_trans_${language}`);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
};

const setCachedTranslation = (language: Language, data: any): void => {
  try {
    localStorage.setItem(`ayurveda_trans_${language}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to cache translation locally.");
  }
};

export const translateAllQuestions = async (
  questions: Question[],
  language: Language
): Promise<{ text: string; options: { label: string; text: string }[] }[]> => {
  // Always return original questions for English to save quota
  if (language === 'English') {
    return questions.map(q => ({
      text: q.text,
      options: q.options.map(o => ({ label: o.label, text: o.text }))
    }));
  }

  // Check cache first to stay under quota
  const cached = getCachedTranslation(language);
  if (cached && Array.isArray(cached) && cached.length === questions.length) {
    console.log(`Using cached translation for ${language}`);
    return cached;
  }

  const prompt = `
    You are a revered Ayurvedic scholar. Translate the following Prakriti assessment into ${language}.
    Maintain a gentle, wise, and traditional tone. Use culturally appropriate terms.
    
    Return a JSON array of objects with "text" and "options" (each option has "label" and "text").
    Original Questions:
    ${questions.map((q, i) => `Q${i+1}: ${q.text} | Options: A:${q.options[0].text}, B:${q.options[1].text}, C:${q.options[2].text}`).join('\n')}
  `;

  try {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ["label", "text"]
                }
              }
            },
            required: ["text", "options"]
          }
        }
      }
    }));
    
    const parsed = JSON.parse(response.text?.trim() || "[]");
    if (parsed.length === 0) throw new Error("Empty translation received");
    
    // Save to cache for future use
    setCachedTranslation(language, parsed);
    
    return parsed;
  } catch (error) {
    console.error("Translation capacity exceeded. Falling back to English.", error);
    // Silent fallback to English ensures the app remains usable even if quota is dead
    return questions.map(q => ({
      text: q.text,
      options: q.options.map(o => ({ label: o.label, text: o.text }))
    }));
  }
};

export const validateImageQuality = async (imageBase64: string): Promise<ImageValidationResult> => {
  const prompt = `
    Perform a quick Darsana (observation) analysis check.
    Is the image clear enough for facial feature observation?
    Return JSON: { "isValid": boolean, "feedback": "string" }
  `;
  try {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isValid", "feedback"]
        }
      }
    }), 2, 2000); // Lower retries for validation to keep UX snappy
    
    return JSON.parse(response.text?.trim() || '{"isValid": true, "feedback": "Vision accepted."}');
  } catch (error) {
    // Non-critical: allow user to proceed even if validation fails due to quota
    return { isValid: true, feedback: "Observation complete. Proceed with your journey." };
  }
};

export const getMultimodalAssessment = async (
  language: Language,
  scores: { [key in Dosha]?: number },
  userAnswers: { category: string; answer: string }[],
  imageBase64?: string
): Promise<AssessmentResult> => {
  const vata = scores[Dosha.VATA] || 0;
  const pitta = scores[Dosha.PITTA] || 0;
  const kapha = scores[Dosha.KAPHA] || 0;

  let promptParts: any[] = [
    {
      text: `
    Persona: Master Ayurvedic Vaidya.
    Objective: Comprehensive Prakriti analysis for a seeker.
    Language: ${language}.
    Scores: Vata(${vata}), Pitta(${pitta}), Kapha(${kapha}).
    Inquiry Details: ${userAnswers.map(ua => `${ua.category}: ${ua.answer}`).join(', ')}.

    Requirement:
    Synthesize the Panchamahabhutas. Speak of Gunas and Dhatus.
    JSON Structure:
    - prakritiType: Sanskrit Name (English).
    - explanation: Wise 6-line synthesis.
    - detectedFacialFeatures: 3 Guna-based observations.
    - keyTraits: 4 characteristics.
    - lifestyleAdvice: 5 Dinacharya tips.
    - dietaryAdvice: 5 Ahara tips.
    `
    }
  ];

  if (imageBase64) {
    promptParts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  try {
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: promptParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prakritiType: { type: Type.STRING },
            explanation: { type: Type.STRING },
            detectedFacialFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
            lifestyleAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
            dietaryAdvice: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["prakritiType", "explanation", "detectedFacialFeatures", "keyTraits", "lifestyleAdvice", "dietaryAdvice"]
        }
      }
    }));
    return JSON.parse(response.text?.trim() || "{}");
  } catch (error) {
    console.error("Assessment synthesis failed due to capacity limits.", error);
    throw error;
  }
};
