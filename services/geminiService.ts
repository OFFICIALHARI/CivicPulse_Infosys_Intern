
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize with direct process.env.API_KEY reference as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const autoCategorizeGrievance = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given the following smart city grievance description, categorize it into one of these: Waste Management, Water Supply, Street Lighting, Road Maintenance, Public Health, Traffic & Transport, Parks & Recreation, Electricity, Other. Also provide a short 5-word title for it. 
      
      Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            suggestedTitle: { type: Type.STRING }
          },
          required: ["category", "suggestedTitle"]
        }
      }
    });

    // response.text is a property, not a method.
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Categorization Error:", error);
    return null;
  }
};

export const generateSmartResolution = async (grievance: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a city department officer. A citizen reported this: "${grievance.title}: ${grievance.description}". 
      Write a professional 2-sentence resolution message that explains what was fixed.`,
      config: {
        // maxOutputTokens removed to follow recommendation of avoiding it unless necessary, 
        // especially when thinkingBudget is not explicitly required for this simple task.
      }
    });
    return response.text;
  } catch (error) {
    return "Issue resolved successfully as per department standards.";
  }
};
