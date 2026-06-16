"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Language = "en" | "hi";

export function useTextToSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestIdRef = useRef(0);
  const pendingResolversRef = useRef<Map<number, () => void>>(new Map());

  // `supported` starts false so server and first client render match (no window during SSR);
  // this flips it true post-mount, which is necessarily a setState-in-effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(true);
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const resolvePending = useCallback((requestId: number) => {
    pendingResolversRef.current.get(requestId)?.();
    pendingResolversRef.current.delete(requestId);
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current++;
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeakingId(null);
    setLoadingId(null);
    // Unblock any in-flight speak() callers awaiting playback completion.
    pendingResolversRef.current.forEach((resolve) => resolve());
    pendingResolversRef.current.clear();
  }, []);

  const speak = useCallback(
    (id: string, text: string, lang: Language): Promise<void> => {
      const requestId = ++requestIdRef.current;

      return new Promise<void>((resolve) => {
        if (!supported || !text.trim()) {
          resolve();
          return;
        }
        pendingResolversRef.current.set(requestId, resolve);

        audioRef.current?.pause();
        audioRef.current = null;
        setSpeakingId(null);
        setLoadingId(id);

        // Point the <audio> element straight at the streaming endpoint instead of fetching
        // the whole clip first: the browser starts buffering/decoding as bytes arrive, so
        // playback can begin well before Sarvam finishes generating the full response.
        const url = `/api/speak?text=${encodeURIComponent(text)}&language=${lang}`;
        const audio = new Audio(url);
        audioRef.current = audio;

        const finish = () => {
          if (requestId !== requestIdRef.current) return;
          setLoadingId((current) => (current === id ? null : current));
          setSpeakingId((current) => (current === id ? null : current));
        };

        audio.onplaying = () => {
          if (requestId !== requestIdRef.current) return;
          setLoadingId((current) => (current === id ? null : current));
          setSpeakingId(id);
        };
        audio.onended = () => {
          finish();
          resolvePending(requestId);
        };
        audio.onerror = () => {
          finish();
          resolvePending(requestId);
        };
        audio.play().catch(() => {
          finish();
          resolvePending(requestId);
        });
      });
    },
    [supported, resolvePending]
  );

  return { speak, stop, speakingId, loadingId, supported };
}
