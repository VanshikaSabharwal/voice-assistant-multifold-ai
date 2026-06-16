import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeechStream } from "@/lib/tts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const language = searchParams.get("language") === "hi" ? "hi" : "en";

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const upstream = await synthesizeSpeechStream(text, language);

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
