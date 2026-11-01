import { getGroqClient, GROQ_CONFIG } from "./groq";
import { SearchSource } from "@/types";

export interface NormalizedSearchResponse {
  answer: string;
  sources: SearchSource[];
}

const SEARCH_SYSTEM_PROMPT = `You are Dumroo AI Education Researcher, an assistant designed for teachers and administrators.
Your objective is to provide comprehensive, factual, research-grounded answers to educational and pedagogical questions.
Use authoritative educational sources, research papers, curriculum guidelines, and reliable publications.
Structure your answers with:
1. Executive Summary
2. Core Pedagogical / Subject Insights
3. Practical Classroom or Administrative Takeaways
4. References & Sources (include real URLs and publication titles).`;

export async function executeWebSearch(query: string): Promise<NormalizedSearchResponse> {
  const client = getGroqClient();
  const modelsToTry = [GROQ_CONFIG.defaultModel, GROQ_CONFIG.advancedModel];

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];

    // Tool call
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), GROQ_CONFIG.timeoutMs);

      const response = await (client.chat.completions.create as any)(
        {
          model: currentModel,
          messages: [
            { role: "system", content: SEARCH_SYSTEM_PROMPT },
            { role: "user", content: query },
          ],
          tools: [
            {
              type: "browser_search",
            },
          ],
          temperature: 0.3,
        },
        { signal: controller.signal }
      );

      clearTimeout(timeout);
      return parseSearchResponse(response);
    } catch (toolError: any) {
      console.warn(`Tool attempt on ${currentModel} returned:`, toolError.message);

      // Fallback
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), GROQ_CONFIG.timeoutMs);

      try {
        const fallbackResponse = await client.chat.completions.create(
          {
            model: currentModel,
            messages: [
              { role: "system", content: SEARCH_SYSTEM_PROMPT },
              {
                role: "user",
                content: `Research the following educational subject thoroughly and provide full authoritative citations with URLs: ${query}`,
              },
            ],
            temperature: 0.3,
          },
          { signal: controller.signal }
        );

        clearTimeout(timeout);
        return parseSearchResponse(fallbackResponse);
      } catch (fallbackError: any) {
        clearTimeout(timeout);
        if (i === modelsToTry.length - 1) {
          throw new Error(
            fallbackError?.message || "Failed to execute educational web search with Groq."
          );
        }
      }
    }
  }

  throw new Error("Unable to execute search with available models.");
}

function parseSearchResponse(response: any): NormalizedSearchResponse {
  const message = response.choices?.[0]?.message;
  const answer = message?.content || "No research summary was returned by Groq.";

  const sources: SearchSource[] = [];

  if (Array.isArray(response.citations)) {
    for (const cite of response.citations) {
      if (cite.url) {
        sources.push({
          title: cite.title || cite.url,
          url: cite.url,
          snippet: cite.snippet || undefined,
        });
      }
    }
  }

  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  const seenUrls = new Set<string>(sources.map((s) => s.url));
  while ((match = linkRegex.exec(answer)) !== null) {
    const title = match[1].trim();
    const url = match[2].trim();
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      sources.push({ title, url });
    }
  }

  const plainUrlRegex = /(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s)\]]*)?)/g;
  while ((match = plainUrlRegex.exec(answer)) !== null) {
    const url = match[1].trim().replace(/[.,;]$/, "");
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      try {
        const hostname = new URL(url).hostname;
        sources.push({ title: hostname, url });
      } catch {
        // ignore
      }
    }
  }

  return {
    answer,
    sources,
  };
}
