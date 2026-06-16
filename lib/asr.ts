import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Language = "en" | "hi";

interface VerboseTranscription {
  text: string;
  language?: string;
}

export async function transcribeAudio(file: File): Promise<{ text: string; language: Language }> {
  const response = (await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3",
    response_format: "verbose_json",
  })) as VerboseTranscription;

  const language: Language = response.language?.toLowerCase().startsWith("hi") ? "hi" : "en";

  return { text: response.text.trim(), language };
}
