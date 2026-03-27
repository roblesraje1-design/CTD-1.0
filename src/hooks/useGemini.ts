import { GoogleGenAI } from "@google/genai";
import { useState, useCallback } from "react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    setLoading(true);
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
      });
      const text = result.text;
      setResponse(text);
      return text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Sorry, I encountered an error.";
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendMessage, loading, response };
}
