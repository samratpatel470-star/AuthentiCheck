import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AuthenticationResult {
  verdict: 'Real' | 'Fake' | 'Inconclusive';
  confidence: number;
  brand: string;
  productType: string;
  reasoning: string[];
  detailsToCheck: string[];
}

export async function authenticateProduct(imageUri: string, isPro: boolean = false): Promise<AuthenticationResult> {
  const model = "gemini-3-flash-preview";
  
  // Extract base64 data from data URI
  const base64Data = imageUri.split(',')[1];
  
  const prompt = `
    Analyze this product image to determine if it is a REAL brand item or a FAKE (1st copy/counterfeit).
    ${isPro ? "This is a PRO user request. Provide a deep, high-precision analysis of materials, stitching, and micro-details." : "Provide a standard authentication analysis."}
    
    Look for:
    1. Logo precision (alignment, font, spacing).
    2. Material quality (texture, sheen).
    3. Stitching quality (uniformity, loose threads).
    4. Hardware (zippers, buttons, engravings).
    5. Labels and tags.
    
    Return the result in JSON format with the following structure:
    {
      "verdict": "Real" | "Fake" | "Inconclusive",
      "confidence": number (0-100),
      "brand": "string",
      "productType": "string",
      "reasoning": ["point 1", "point 2", ...],
      "detailsToCheck": ["what the user should look for manually"]
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AuthenticationResult;
  } catch (error) {
    console.error("AI Authentication Error:", error);
    throw error;
  }
}
