/**
 * useSpeechInput.ts — Voice recording + transcription hook
 * Drop into: src/hooks/useSpeechInput.ts
 *
 * Records audio from the user's mic, sends to backend Whisper API,
 * returns the transcript and parsed tasks.
 */

import { useState, useRef } from "react";
type RecordingState = "idle" | "recording" | "processing" | "done" | "error";

interface UseSpeechInputReturn {
  state: RecordingState;
  transcript: string;
  parsedTasks: any[];
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export function useSpeechInput(): UseSpeechInputReturn {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsedTasks, setParsedTasks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startRecording = async () => {
    setError(null);
    setTranscript("");
    setParsedTasks([]);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser. Please use Chrome!");
      setState("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setState("recording");

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onend = () => {
      setState("done");
    };

    recognition.onerror = (event: any) => {
      setError(`Microphone error: ${event.error}`);
      setState("error");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const reset = () => {
    setState("idle");
    setTranscript("");
    setParsedTasks([]);
    setError(null);
  };

  return { state, transcript, parsedTasks, error, startRecording, stopRecording, reset };
}