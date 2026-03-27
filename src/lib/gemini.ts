import { GoogleGenAI, Type } from "@google/genai";
import { Sentence } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function translateAndParse(text: string, sourceLang: 'ja' | 'en'): Promise<Sentence[]> {
  const targetLang = sourceLang === 'ja' ? 'English' : 'Japanese';
  const prompt = `
    Take the following ${sourceLang === 'ja' ? 'Japanese' : 'English'} text and translate it to ${targetLang}.
    Output the result EXACTLY as a JSON array of objects.
    Each object must represent a sentence and follow this structure:
    {
      "id": number,
      "ja_sentence": "The full Japanese sentence",
      "en_sentence": "The full English translation",
      "words": [
        { "ja": "Japanese word/phrase", "reading": "Hiragana reading", "en": "English equivalent" }
      ]
    }
    
    Ensure that the "words" array covers the entire sentence and maps Japanese words to their English equivalents accurately.
    Text to process:
    ${text}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            ja_sentence: { type: Type.STRING },
            en_sentence: { type: Type.STRING },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ja: { type: Type.STRING },
                  reading: { type: Type.STRING },
                  en: { type: Type.STRING }
                },
                required: ["ja", "reading", "en"]
              }
            }
          },
          required: ["id", "ja_sentence", "en_sentence", "words"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}
