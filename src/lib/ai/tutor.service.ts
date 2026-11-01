import { getGroqClient, GROQ_CONFIG } from "./groq";
import { Message } from "@/types";

const TUTOR_SYSTEM_PROMPT = `You are Dumroo AI Tutor, an expert educational AI tutor.
Your core mission is to help students truly understand concepts, rather than handing them quick answers.

Pedagogical Directives:
1. Never give away the full final solution immediately on the first attempt.
2. Provide structured hints, guided questions, and step-by-step scaffolding.
3. If the student makes an error, evaluate it gently: point out where the misconception occurred, explain why, and guide them toward correcting it.
4. If the student asks for an explanation, explain concepts in clear, intuitive, and grade-appropriate language with concrete real-world examples.
5. If the student asks to expand on a topic, provide deeper insights, alternative methods, and practice prompts.
6. Maintain an encouraging, patient, and scholarly tone. Format using clean markdown with bolding for key terms.`;

export async function generateTutorResponse(
  userMessage: string,
  history: Message[] = []
): Promise<string> {
  const client = getGroqClient();

  const formattedMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: TUTOR_SYSTEM_PROMPT },
  ];

  for (const msg of history.slice(-15)) {
    formattedMessages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    });
  }

  formattedMessages.push({
    role: "user",
    content: userMessage,
  });

  // Model failover
  const modelsToTry = [GROQ_CONFIG.defaultModel, GROQ_CONFIG.advancedModel];

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GROQ_CONFIG.timeoutMs);

    try {
      const completion = await client.chat.completions.create(
        {
          model: currentModel,
          messages: formattedMessages,
          temperature: GROQ_CONFIG.temperature,
          max_tokens: GROQ_CONFIG.maxTokens,
        },
        { signal: controller.signal }
      );

      clearTimeout(timeout);
      const content = completion.choices[0]?.message?.content;
      if (content) return content;
    } catch (error: any) {
      clearTimeout(timeout);
      console.warn(`Model ${currentModel} returned:`, error.message);
      if (i === modelsToTry.length - 1) {
        throw new Error(error?.message || "Failed to communicate with Groq AI Tutor.");
      }
    }
  }

  throw new Error("Unable to generate tutor response from Groq.");
}
