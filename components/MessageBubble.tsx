"use client";

import type { Translation } from "@/lib/i18n";

export type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  lang: "en" | "hi";
  timestamp: Date;
  isTyping?: boolean;
};

interface MessageBubbleProps {
  message: Message;
  displayText?: string;
  t: Translation;
  isSpeaking?: boolean;
  isLoadingSpeech?: boolean;
  canSpeak?: boolean;
  onToggleSpeak?: () => void;
}

function BotAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#10a37f" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="tts-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 inline-block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 inline-block" />
      <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 inline-block" />
    </div>
  );
}

export default function MessageBubble({
  message,
  displayText,
  t,
  isSpeaking,
  isLoadingSpeech,
  canSpeak,
  onToggleSpeak,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const text = displayText ?? message.text;

  if (isUser) {
    return (
      <div className="message-enter flex justify-end px-3 sm:px-4 py-2">
        <div
          className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed"
          style={{ background: "#2f2f2f", color: "#ececec" }}
        >
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="message-enter flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 max-w-3xl mx-auto w-full">
      <BotAvatar />
      <div className="flex-1 text-sm leading-relaxed pt-1" style={{ color: "#ececec" }}>
        {message.isTyping ? (
          <TypingIndicator />
        ) : (
          <div className="flex items-start gap-2">
            <p className="whitespace-pre-wrap flex-1">{text}</p>
            {canSpeak && onToggleSpeak && (
              <button
                onClick={onToggleSpeak}
                className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                style={{ color: isSpeaking || isLoadingSpeech ? "#10a37f" : "#8e8ea0" }}
                title={isLoadingSpeech ? t.loadingSpeech : isSpeaking ? t.stopSpeaking : t.readAloud}
              >
                {isLoadingSpeech ? <SpinnerIcon /> : isSpeaking ? <StopIcon /> : <PlayIcon />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
