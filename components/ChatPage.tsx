"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import MessageBubble, { type Message } from "./MessageBubble";
import VoiceInput from "./VoiceInput";
import VoiceModeOverlay from "./VoiceModeOverlay";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadConversations, saveConversations, type Conversation } from "@/lib/storage";
import { getTranslation, type Language } from "@/lib/i18n";

const WELCOME_ID = "welcome";

const WELCOME_MESSAGE: Message = {
  id: WELCOME_ID,
  role: "bot",
  text: "",
  lang: "en",
  timestamp: new Date(),
};

function createConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "New conversation",
    messages: [WELCOME_MESSAGE],
  };
}

function SpeakerOnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function EmptyState({ t }: { t: ReturnType<typeof getTranslation> }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl"
        style={{ background: "#10a37f" }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: "#ececec" }}>
          {t.emptyTitle}
        </h1>
        <p className="text-sm" style={{ color: "#8e8ea0" }}>
          {t.emptySubtitle}
        </p>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {t.suggestions.map((suggestion) => (
          <button
            key={suggestion}
            className="px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
            style={{
              background: "#2f2f2f",
              color: "#ececec",
              border: "1px solid #3f3f3f",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#10a37f")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#3f3f3f")}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [createConversation()]);
  const [activeConversationId, setActiveConversationId] = useState<string>(() => conversations[0].id);
  const [language, setLanguage] = useState<Language>("en");
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const tts = useTextToSpeech();
  const t = getTranslation(language);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? conversations[0];
  const messages = activeConversation.messages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Restore persisted conversations on mount. localStorage isn't available during SSR,
  // so this one-time client-only read has to happen post-mount rather than in render.
  useEffect(() => {
    const stored = loadConversations();
    if (stored.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConversations(stored);
      setActiveConversationId(stored[0].id);
    }
    setHasLoaded(true);
  }, []);

  // Persist conversations after every change (skipping the pre-restore initial render).
  useEffect(() => {
    if (!hasLoaded) return;
    saveConversations(conversations);
  }, [conversations, hasLoaded]);

  const updateConversationMessages = useCallback(
    (conversationId: string, updater: (prev: Message[]) => Message[]) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const newMessages = updater(c.messages);
          const firstUserMessage = newMessages.find((m) => m.role === "user");
          const title = firstUserMessage ? firstUserMessage.text.slice(0, 40) : c.title;
          return { ...c, messages: newMessages, title };
        })
      );
    },
    []
  );

  const addMessage = useCallback(
    (conversationId: string, msg: Omit<Message, "id" | "timestamp">) => {
      const newMsg: Message = {
        ...msg,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      updateConversationMessages(conversationId, (prev) => [...prev, newMsg]);
      return newMsg.id;
    },
    [updateConversationMessages]
  );

  // Sends a user message, waits for the bot's answer, and returns it (without speaking it) —
  // shared by the typed/voice-recorder flow (which auto-speaks based on the mute toggle) and
  // voice mode (which always speaks, driving its own listen/speak loop).
  const sendAndGetAnswer = useCallback(
    async (conversationId: string, text: string, lang: Language): Promise<{ id: string; answer: string }> => {
      addMessage(conversationId, { role: "user", text, lang });

      const typingId = crypto.randomUUID();
      updateConversationMessages(conversationId, (prev) => [
        ...prev,
        { id: typingId, role: "bot", text: "", lang, timestamp: new Date(), isTyping: true },
      ]);
      setIsThinking(true);

      let answer: string;
      try {
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, language: lang }),
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        answer = data.answer;
      } catch {
        answer = getTranslation(lang).genericError;
      }

      updateConversationMessages(conversationId, (prev) =>
        prev.map((m) => (m.id === typingId ? { ...m, text: answer, isTyping: false } : m))
      );
      setIsThinking(false);
      return { id: typingId, answer };
    },
    [addMessage, updateConversationMessages]
  );

  const handleSend = useCallback(
    async (text: string, langOverride?: Language) => {
      const conversationId = activeConversationId;
      const replyLang = langOverride ?? language;
      const { id, answer } = await sendAndGetAnswer(conversationId, text, replyLang);
      if (autoSpeak) tts.speak(id, answer, replyLang);
    },
    [activeConversationId, language, sendAndGetAnswer, autoSpeak, tts]
  );

  const recorder = useVoiceRecorder();

  const handleStartRecording = useCallback(async () => {
    tts.stop();
    try {
      await recorder.start();
      setIsRecording(true);
    } catch {
      addMessage(activeConversationId, {
        role: "bot",
        text: t.micPermissionError,
        lang: language,
      });
    }
  }, [recorder, addMessage, activeConversationId, language, tts, t]);

  const handleStopRecording = useCallback(async () => {
    setIsRecording(false);
    const blob = await recorder.stop();
    if (blob.size === 0) return;

    setIsThinking(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Transcription failed: ${res.status}`);
      const data = await res.json();

      if (!data.transcript?.trim()) {
        setIsThinking(false);
        return;
      }

      setLanguage(data.language);
      await handleSend(data.transcript, data.language);
    } catch {
      setIsThinking(false);
      addMessage(activeConversationId, {
        role: "bot",
        text: t.transcribeError,
        lang: language,
      });
    }
  }, [recorder, handleSend, addMessage, activeConversationId, language, t]);

  const handleNewChat = useCallback(() => {
    tts.stop();
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(conv.id);
    setIsRecording(false);
    setIsThinking(false);
  }, [tts]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      tts.stop();
      setActiveConversationId(id);
      setIsRecording(false);
      setIsThinking(false);
    },
    [tts]
  );

  const handleDeleteConversation = useCallback(
    (id: string) => {
      tts.stop();
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const conv = createConversation();
        setConversations([conv]);
        setActiveConversationId(conv.id);
      } else {
        setConversations(remaining);
        if (id === activeConversationId) {
          setActiveConversationId(remaining[0].id);
        }
      }
      setIsRecording(false);
      setIsThinking(false);
    },
    [tts, conversations, activeConversationId]
  );

  const handleVoiceModeExchange = useCallback(
    async (text: string, lang: Language) => {
      setLanguage(lang);
      const { id, answer } = await sendAndGetAnswer(activeConversationId, text, lang);
      return { id, answer, lang };
    },
    [activeConversationId, sendAndGetAnswer]
  );

  const handleOpenVoiceMode = useCallback(() => {
    tts.stop();
    setVoiceModeOpen(true);
  }, [tts]);

  const handleCloseVoiceMode = useCallback(() => {
    setVoiceModeOpen(false);
  }, []);

  const showEmpty = messages.length === 0;

  return (
    <div className="flex h-full" style={{ background: "#212121" }}>
      <Sidebar
        t={t}
        language={language}
        onLanguageChange={setLanguage}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header */}
        <header
          className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #2a2a2a" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer md:hidden"
              style={{ color: "#ececec" }}
              title="Open menu"
            >
              <MenuIcon />
            </button>
            <h2 className="text-sm font-medium truncate" style={{ color: "#ececec" }}>
              {t.headerTitle}
            </h2>
            <span
              className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "#2f2f2f", color: "#8e8ea0" }}
            >
              {language === "en" ? "English" : "हिंदी"}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {tts.supported && (
              <button
                onClick={() => {
                  setAutoSpeak((prev) => {
                    if (prev) tts.stop();
                    return !prev;
                  });
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                style={{ color: "#8e8ea0", background: "#2f2f2f" }}
                title={autoSpeak ? t.muteTitle : t.unmuteTitle}
              >
                {autoSpeak ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
                <span className="hidden sm:inline">{autoSpeak ? t.voiceOn : t.voiceOff}</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs" style={{ color: "#8e8ea0" }}>
                {t.connected}
              </span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          {showEmpty ? (
            <EmptyState t={t} />
          ) : (
            <div className="flex flex-col max-w-3xl mx-auto w-full">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  displayText={msg.id === WELCOME_ID ? t.welcomeMessage : undefined}
                  t={t}
                  isSpeaking={tts.speakingId === msg.id}
                  isLoadingSpeech={tts.loadingId === msg.id}
                  canSpeak={tts.supported}
                  onToggleSpeak={() =>
                    tts.speakingId === msg.id || tts.loadingId === msg.id
                      ? tts.stop()
                      : tts.speak(msg.id, msg.id === WELCOME_ID ? t.welcomeMessage : msg.text, msg.lang)
                  }
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <VoiceInput
          t={t}
          onSend={handleSend}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onOpenVoiceMode={handleOpenVoiceMode}
          isRecording={isRecording}
          isThinking={isThinking}
        />
      </div>

      {voiceModeOpen && (
        <VoiceModeOverlay
          t={t}
          onClose={handleCloseVoiceMode}
          onExchange={handleVoiceModeExchange}
          speak={tts.speak}
          stopSpeaking={tts.stop}
        />
      )}
    </div>
  );
}
