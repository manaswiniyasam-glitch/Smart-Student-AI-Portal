import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onListeningChange?: (listening: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  tooltip?: string;
  className?: string;
}

export default function VoiceInputButton({
  onTranscript,
  onInterimTranscript,
  onListeningChange,
  disabled = false,
  size = "sm",
  tooltip = "Voice Input Support (Speech to Text)",
  className = ""
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const latestInterimRef = useRef<string>("");
  const isActiveRef = useRef<boolean>(false);

  const onTranscriptRef = useRef(onTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onInterimTranscriptRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  // Propagate listening state to parent framework for responsive UI feedback
  useEffect(() => {
    if (onListeningChange) {
      onListeningChange(isListening);
    }
  }, [isListening, onListeningChange]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      isActiveRef.current = true;
      setErrorText(null);
    };

    rec.onerror = (event: any) => {
      setIsListening(false);
      isActiveRef.current = false;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setErrorText("Microphone access blocked. Please allow the microphone to use voice input.");
      } else if (event.error === "no-speech") {
        setErrorText("No speech detected. Please try again.");
      } else if (event.error === "audio-capture") {
        setErrorText("Microphone unavailable. Check your device settings.");
      } else {
        console.warn("Speech recognition issue:", event.error || event);
        setErrorText(`Speech recognition error: ${event.error || "unknown"}`);
      }
      setTimeout(() => setErrorText(null), 3000);
    };

    rec.onend = () => {
      setIsListening(false);
      isActiveRef.current = false;
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (latestInterimRef.current.trim()) {
        onTranscriptRef.current(latestInterimRef.current.trim());
        latestInterimRef.current = "";
      }
      if (onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current("");
      }
    };

    rec.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + " ";
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (finalTranscript.trim()) {
        onTranscriptRef.current(finalTranscript.trim());
        latestInterimRef.current = "";
      }

      latestInterimRef.current = interimTranscript;

      if (interimTranscript.trim()) {
        if (onInterimTranscriptRef.current) {
          onInterimTranscriptRef.current(interimTranscript.trim());
        }
        silenceTimerRef.current = window.setTimeout(() => {
          if (interimTranscript.trim()) {
            onTranscriptRef.current(interimTranscript.trim());
            latestInterimRef.current = "";
          }
        }, 2000);
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup errors
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rec = recognitionRef.current;
    if (!supported || !rec) {
      setErrorText("Browser Speech API Not Supported");
      setTimeout(() => setErrorText(null), 3500);
      return;
    }

    if (isListening || isActiveRef.current) {
      try {
        rec.stop();
        setIsListening(false);
        isActiveRef.current = false;
      } catch (err) {
        console.warn("Speech recognition stop warning:", err);
      }
      return;
    }

    try {
      rec.start();
    } catch (err: any) {
      console.warn("Speech start warning:", err);
      setErrorText("Unable to start speech recognition. Try refreshing or allowing microphone access.");
      setTimeout(() => setErrorText(null), 3000);
    }
  };

  if (!supported) {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          disabled
          title="Speech API not available"
          className={`flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400 ${size === "sm" ? "w-8 h-8 p-1.5" : "w-10 h-10 p-2"}`}
        >
          <Mic className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"}`} />
        </button>
        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg border border-slate-800 z-30">
          Speech API unavailable
        </div>
      </div>
    );
  }

  const isSmall = size === "sm";

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? "Listening... Click to stop voice feed" : tooltip}
        className={`flex items-center justify-center rounded-xl transition-all duration-200 select-none cursor-pointer border ${
          isListening
            ? "bg-rose-500 border-rose-600 text-white animate-pulse shadow-md shadow-rose-200"
            : "bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-500 hover:text-blue-600 shadow-xs"
        } ${isSmall ? "w-8 h-8 p-1.5" : "w-10 h-10 p-2"} disabled:opacity-50`}
      >
        {isListening ? (
          <MicOff className={`${isSmall ? "w-4 h-4" : "w-5 h-5"} animate-bounce`} />
        ) : (
          <Mic className={`${isSmall ? "w-4 h-4" : "w-5 h-5"}`} />
        )}
      </button>

      {errorText && (
        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg border border-slate-800 flex items-center gap-1 z-30 animate-fadeIn">
          <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
          <span>{errorText}</span>
        </div>
      )}

      {isListening && (
        <span className="absolute left-full ml-2 text-[9px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded shadow-xs tracking-wider animate-pulse z-20 select-none font-mono whitespace-nowrap">
          🔴 SPEAK NOW...
        </span>
      )}
    </div>
  );
}
