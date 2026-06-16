import type { Message } from "@/components/MessageBubble";

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

const STORAGE_KEY = "voicebot-conversations";

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    return parsed.map((c) => ({
      ...c,
      messages: c.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    // Drop transient typing indicators so a reload never restores a stuck "thinking" bubble.
    const cleaned = conversations.map((c) => ({
      ...c,
      messages: c.messages.filter((m) => !m.isTyping),
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch {
    // ignore quota / serialization errors
  }
}
