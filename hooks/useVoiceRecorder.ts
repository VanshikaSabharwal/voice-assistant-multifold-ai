"use client";

import { useRef, useCallback } from "react";

const SPEECH_RMS_THRESHOLD = 12;
const SILENCE_DURATION_MS = 1200;

export function useVoiceRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceCleanupRef = useRef<(() => void) | null>(null);

  const start = useCallback(async (onSilence?: () => void) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();

    if (onSilence) {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const buffer = new Uint8Array(analyser.frequencyBinCount);

      let hasSpoken = false;
      let silenceStartedAt: number | null = null;
      let rafId: number;

      const tick = () => {
        analyser.getByteTimeDomainData(buffer);
        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i++) {
          const deviation = buffer[i] - 128;
          sumSquares += deviation * deviation;
        }
        const rms = Math.sqrt(sumSquares / buffer.length);

        if (rms > SPEECH_RMS_THRESHOLD) {
          hasSpoken = true;
          silenceStartedAt = null;
        } else if (hasSpoken) {
          if (silenceStartedAt === null) {
            silenceStartedAt = performance.now();
          } else if (performance.now() - silenceStartedAt > SILENCE_DURATION_MS) {
            onSilence();
            return;
          }
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      silenceCleanupRef.current = () => {
        cancelAnimationFrame(rafId);
        source.disconnect();
        audioContext.close();
      };
    }
  }, []);

  const stop = useCallback((): Promise<Blob> => {
    silenceCleanupRef.current?.();
    silenceCleanupRef.current = null;

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(new Blob());
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  return { start, stop };
}
