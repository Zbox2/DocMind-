import { GoogleGenAI } from "@google/genai";

// Standardize GoogleGenAI initialization to strictly use process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askDocumentQuestion = async (documentContext: string, question: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a document assistant. Here is the context from a document:
      ---
      ${documentContext}
      ---
      User question: ${question}`,
      config: {
        temperature: 0.2,
        systemInstruction: "You are a professional DMS AI assistant. Provide concise, accurate answers based only on the provided context. If the answer is not in the context, state that you don't know.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I couldn't process that request at the moment.";
  }
};

export const summarizeDocument = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Please provide a 3-bullet point executive summary of the following document content:
      ---
      ${text}`,
    });
    return response.text;
  } catch (error) {
    return "Summary generation failed.";
  }
};