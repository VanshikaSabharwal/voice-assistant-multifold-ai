import Groq from "groq-sdk";
import knowledgeBase from "@/data/knowledge-base.json";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Language = "en" | "hi";

const SYSTEM_PROMPT = `You are VoiceAssist, a friendly customer support agent for electrical equipment (AC, washing machine, refrigerator, microwave). You speak like a helpful human technician, not a robot — warm, brief, and practical.

Rules:
- Use ONLY the knowledge base below to answer. If the question isn't covered, say you don't have that information and suggest contacting a technician.
- Keep answers short and conversational (3-5 sentences) since they will be read aloud by a text-to-speech engine. Avoid numbered lists, markdown, or special characters — speak in plain flowing sentences.
- Respond in the SAME language as the user's question. If they ask in Hindi, answer in Hindi (Devanagari script). If in English, answer in English.
- If the user's language preference is explicitly given, follow that instead.

Knowledge base:
${JSON.stringify(knowledgeBase, null, 2)}`;

export async function getAnswer(transcript: string, language: Language): Promise<string> {
  const languageInstruction =
    language === "hi"
      ? "Respond in Hindi (Devanagari script), regardless of what script the question used."
      : "Respond in English.";

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 300,
    messages: [
      { role: "system", content: `${SYSTEM_PROMPT}\n\n${languageInstruction}` },
      { role: "user", content: transcript },
    ],
  });

  return response.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response. Please try again.";
}
