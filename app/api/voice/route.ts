import { NextRequest, NextResponse } from "next/server";
import { getAnswer } from "@/lib/llm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, language } = body as { message?: string; language?: "en" | "hi" };

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const answer = await getAnswer(message, language === "hi" ? "hi" : "en");

  return NextResponse.json({ answer });
}
