"use client";

import { useState, useRef } from "react";
import type { Translation } from "@/lib/i18n";

interface VoiceInputProps {
  t: Translation;
  onSend: (text: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onOpenVoiceMode: () => void;
  isRecording: boolean;
  isThinking: boolean;
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MicIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

function VoiceModeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="7" y="5" width="3" height="14" rx="1" />
      <rect x="12" y="2" width="3" height="20" rx="1" />
      <rect x="17" y="6" width="3" height="12" rx="1" />
      <rect x="22" y="9" width="0" height="6" />
    </svg>
  );
}

export default function VoiceInput({
  t,
  onSend,
  onStartRecording,
  onStopRecording,
  onOpenVoiceMode,
  isRecording,
  isThinking,
}: VoiceInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  const canSend = text.trim().length > 0 && !isThinking;

  return (
    <div className="px-4 pb-6 pt-2" style={{ background: "#212121" }}>
      <div
        className="mx-auto max-w-3xl rounded-2xl overflow-hidden transition-all"
        style={{ background: "#2f2f2f", border: "1px solid #3f3f3f" }}
      >
        {/* Textarea */}
        <div className="px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isThinking || isRecording}
            placeholder={isRecording ? t.listeningPlaceholder : isThinking ? t.thinkingPlaceholder : t.inputPlaceholder}
            rows={1}
            className="w-full bg-transparent text-sm resize-none outline-none leading-relaxed"
            style={{
              color: "#ececec",
              caretColor: "#10a37f",
              minHeight: "24px",
              maxHeight: "160px",
            }}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Left: hint */}
          <span className="text-xs" style={{ color: "#8e8ea0" }}>
            {isRecording ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 recording-pulse" />
                {t.recordingHint}
              </span>
            ) : (
              t.shiftEnterHint
            )}
          </span>

          {/* Right: voice mode + mic + send */}
          <div className="flex items-center gap-2">
            {/* Voice mode button */}
            <button
              onClick={onOpenVoiceMode}
              disabled={isThinking || isRecording}
              title={t.voiceModeButtonTitle}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all cursor-pointer ${
                isThinking || isRecording ? "opacity-40 cursor-not-allowed" : ""
              }`}
              style={{ background: "#3f3f3f", color: "#ececec" }}
            >
              <VoiceModeIcon />
            </button>

            {/* Mic button */}
            <button
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={isThinking}
              title={isRecording ? "Stop recording" : "Hold to speak"}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all cursor-pointer ${
                isThinking ? "opacity-40 cursor-not-allowed" : ""
              } ${isRecording ? "recording-pulse" : ""}`}
              style={{
                background: isRecording ? "#ef4444" : "#10a37f",
              }}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              title="Send"
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                canSend ? "cursor-pointer" : "opacity-30 cursor-not-allowed"
              }`}
              style={{ background: canSend ? "#10a37f" : "#3f3f3f" }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs mt-3" style={{ color: "#8e8ea0" }}>
        {t.disclaimer}
      </p>
    </div>
  );
}
