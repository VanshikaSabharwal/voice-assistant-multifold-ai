"use client";

import { useEffect, useRef, useState } from "react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import type { Translation } from "@/lib/i18n";

type Language = "en" | "hi";
type Phase = "listening" | "thinking" | "speaking";

interface VoiceModeOverlayProps {
  t: Translation;
  onClose: () => void;
  onExchange: (text: string, lang: Language) => Promise<{ id: string; answer: string; lang: Language }>;
  speak: (id: string, text: string, lang: Language) => Promise<void>;
  stopSpeaking: () => void;
}

const MAX_LISTEN_MS = 20000;

function MicGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

export default function VoiceModeOverlay({ t, onClose, onExchange, speak, stopSpeaking }: VoiceModeOverlayProps) {
  const [phase, setPhase] = useState<Phase>("listening");
  const [error, setError] = useState<string | null>(null);
  const recorder = useVoiceRecorder();
  const stopListeningRef = useRef<(() => void) | null>(null);
  // A unique token per effect run, not a boolean -- React Strict Mode double-invokes this
  // effect (mount -> cleanup -> mount) in dev, and a shared boolean can get flipped back to
  // "active" by the second mount before the first mount's stale async chain finishes checking
  // it, letting a dead loop run alongside the real one. A monotonically increasing token can't
  // be revived that way: once a session's id no longer matches the latest, it's dead for good.
  const sessionRef = useRef(0);

  useEffect(() => {
    const session = ++sessionRef.current;
    const isCurrent = () => sessionRef.current === session;

    function recordUntilSilenceOrTap(): Promise<Blob> {
      return new Promise((resolve) => {
        let settled = false;
        const finish = async () => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          stopListeningRef.current = null;
          const blob = await recorder.stop();
          resolve(blob);
        };
        const timeoutId = setTimeout(finish, MAX_LISTEN_MS);
        stopListeningRef.current = finish;
        recorder.start(finish).catch(() => {
          clearTimeout(timeoutId);
          settled = true;
          resolve(new Blob());
        });
      });
    }

    async function runLoop() {
      while (isCurrent()) {
        setPhase("listening");
        setError(null);

        const blob = await recordUntilSilenceOrTap();
        if (!isCurrent()) return;
        if (blob.size === 0) {
          setError(t.micPermissionError);
          return;
        }

        setPhase("thinking");
        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          if (!res.ok) throw new Error("transcribe failed");
          const data = (await res.json()) as { transcript?: string; language: Language };
          if (!isCurrent()) return;
          if (!data.transcript?.trim()) continue;

          const { id, answer, lang } = await onExchange(data.transcript, data.language);
          if (!isCurrent()) return;

          setPhase("speaking");
          await speak(id, answer, lang);
        } catch {
          if (isCurrent()) setError(t.transcribeError);
        }
      }
    }

    runLoop();

    return () => {
      // Intentional mutable counter, not a DOM-node ref -- bumping it here (rather than
      // reusing the closed-over `session`) is what invalidates this run for good.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      sessionRef.current++;
      stopListeningRef.current?.();
      recorder.stop();
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTap() {
    if (phase === "speaking") {
      stopSpeaking();
    } else if (phase === "listening") {
      stopListeningRef.current?.();
    }
  }

  const phaseLabel =
    phase === "listening"
      ? t.voiceModeListening
      : phase === "thinking"
      ? t.voiceModeThinking
      : t.voiceModeSpeaking;

  const circleColor = phase === "speaking" ? "#10a37f" : phase === "thinking" ? "#3f3f3f" : "#ef4444";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(15,15,15,0.97)" }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-lg"
        style={{ background: "#2a2a2a", color: "#ececec" }}
        title={t.voiceModeClose}
      >
        ✕
      </button>

      <button
        onClick={handleTap}
        disabled={phase === "thinking"}
        className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
          phase === "listening" ? "recording-pulse" : ""
        }`}
        style={{ background: circleColor }}
      >
        <MicGlyph />
      </button>

      <p className="mt-8 text-sm text-center px-4" style={{ color: "#ececec" }}>
        {phaseLabel}
      </p>
      {phase === "listening" && (
        <p className="mt-1 text-xs text-center px-4" style={{ color: "#8e8ea0" }}>
          {t.voiceModeTapToStop}
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs text-center px-4" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}
