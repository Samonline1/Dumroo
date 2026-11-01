import Groq from "groq-sdk";

let groqClientInstance: Groq | null = null;

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_groq_api_key_here") {
    throw new Error(
      "GROQ_API_KEY is missing or empty. Please set GROQ_API_KEY in your .env.local file."
    );
  }

  const baseURL = process.env.GROQ_BASE_URL?.trim() || undefined;

  if (!groqClientInstance) {
    groqClientInstance = new Groq({
      apiKey,
      baseURL,
    });
  }

  return groqClientInstance;
}

export const GROQ_CONFIG = {
  // Model config
  defaultModel: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
  advancedModel: process.env.GROQ_ADVANCED_MODEL || "openai/gpt-oss-120b",
  temperature: 0.7,
  maxTokens: 2048,
  timeoutMs: 45000,
};
