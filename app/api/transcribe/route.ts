import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/asr";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const audio = formData.get("audio");

  if (!audio || !(audio instanceof File)) {
    return NextResponse.json({ error: "audio file is required" }, { status: 400 });
  }

  const { text, language } = await transcribeAudio(audio);
  return NextResponse.json({ transcript: text, language });
}
