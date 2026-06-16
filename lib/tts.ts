type Language = "en" | "hi";

const SPEAKER = "shubh";
// Keeps the query string used by the streaming GET endpoint comfortably under typical
// server header-size limits even when Devanagari text triples in size after URL-encoding.
const MAX_CHARS = 1000;

export async function synthesizeSpeechStream(text: string, language: Language): Promise<Response> {
  const response = await fetch("https://api.sarvam.ai/text-to-speech/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": process.env.SARVAM_API_KEY!,
    },
    body: JSON.stringify({
      text: text.slice(0, MAX_CHARS),
      target_language_code: language === "hi" ? "hi-IN" : "en-IN",
      speaker: SPEAKER,
      model: "bulbul:v3",
      output_audio_codec: "mp3",
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Sarvam streaming TTS failed: ${response.status} ${await response.text().catch(() => "")}`);
  }

  return response;
}
