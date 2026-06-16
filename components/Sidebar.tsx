"use client";

import type { Conversation } from "@/lib/storage";
import type { Translation } from "@/lib/i18n";

type Language = "en" | "hi";

interface SidebarProps {
  t: Translation;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNewChat: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function Sidebar({
  t,
  language,
  onLanguageChange,
  onNewChat,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <aside
      className="flex flex-col w-64 h-full flex-shrink-0 select-none"
      style={{ background: "#171717", borderRight: "1px solid #2a2a2a" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "#10a37f" }}>
          <MicIcon />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#ececec" }}>VoiceAssist</p>
          <p className="text-xs" style={{ color: "#8e8ea0" }}>Equipment Support</p>
        </div>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          style={{ color: "#ececec" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#2a2a2a")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <PlusIcon />
          {t.newConversation}
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: "#8e8ea0" }}>
          {t.recent}
        </p>
        <nav className="flex flex-col gap-0.5">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="group relative flex items-center rounded-lg transition-colors"
              style={{
                background: activeConversationId === conv.id ? "#2a2a2a" : "transparent",
              }}
              onMouseEnter={e => {
                if (activeConversationId !== conv.id) e.currentTarget.style.background = "#222222";
              }}
              onMouseLeave={e => {
                if (activeConversationId !== conv.id) e.currentTarget.style.background = "transparent";
              }}
            >
              <button
                onClick={() => onSelectConversation(conv.id)}
                className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 text-sm text-left cursor-pointer truncate"
                style={{
                  color: activeConversationId === conv.id ? "#ececec" : "#8e8ea0",
                }}
              >
                <span className="flex-shrink-0" style={{ color: "#8e8ea0" }}>
                  <ChatIcon />
                </span>
                <span className="truncate">{conv.title}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                title={t.deleteConversation}
                className="flex-shrink-0 w-7 h-7 mr-1 rounded-md flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#8e8ea0" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={e => (e.currentTarget.style.color = "#8e8ea0")}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </nav>
      </div>

      {/* Language Toggle */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid #2a2a2a" }}>
        <p className="text-xs mb-2" style={{ color: "#8e8ea0" }}>{t.languageLabel}</p>
        <div className="flex rounded-lg p-0.5" style={{ background: "#2a2a2a" }}>
          {(["en", "hi"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
              style={{
                background: language === lang ? "#10a37f" : "transparent",
                color: language === lang ? "#fff" : "#8e8ea0",
              }}
            >
              {lang === "en" ? "English" : "हिंदी"}
            </button>
          ))}
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "#8e8ea0" }}>
          {t.autoDetect}
        </p>
      </div>
    </aside>
  );
}
