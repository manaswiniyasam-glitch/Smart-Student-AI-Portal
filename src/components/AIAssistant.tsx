import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, X, User, Bot, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";
import VoiceInputButton from "./VoiceInputButton";

interface AIAssistantProps {
  currentUserId: string;
  onClose?: () => void;
}

export default function AIAssistant({ currentUserId, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: "Hello! I am your Smart AI Mentor. I can help evaluate your placement readiness, suggest code optimization patterns, review your speech fluency, or recommend suitable career paths. What are you working on today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input;
    setInput("");

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      // Format chat history for Gemini matching standard SDK formats
      const conversationHistory = messages.map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        parts: [m.text]
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: conversationHistory,
          message: userMsgText
        })
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "assistant",
        text: data.reply || "I am processing your record. Could you please check after re-saving your draft details?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const botMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: "assistant",
        text: "I am having trouble connecting to my service node right now. However, I highly recommend checking out your technical skills dashboard or finishing your quantitative logic test!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "cleared",
        sender: "assistant",
        text: "History reset! Let me know if you need to optimize an algorithm, inspect a resume, or analyze group discussion strategies.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 w-80 md:w-96 shrink-0 shadow-2xl relative">
      {/* Top Banner */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-tight">AI Mentor Bot</h3>
            <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Gemini-3.5 Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            title="Reset Chat"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                m.sender === "user" ? "bg-blue-600" : "bg-slate-800 border border-slate-700"
              }`}
            >
              {m.sender === "user" ? (
                <User className="w-3.5 h-3.5 text-white" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-blue-400" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-200 border border-slate-705"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              <span className="block text-[9px] text-slate-400 mt-1 right-0 text-right">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 flex-row">
            <div className="w-7 h-7 rounded-sm bg-slate-800 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
            </div>
            <div className="bg-slate-800 border border-slate-705 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse delay-75"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse delay-150"></span>
              </span>
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about resume, placement index, algorithms..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <VoiceInputButton 
          onTranscript={(text) => setInput(prev => prev ? prev + " " + text : text)}
          tooltip="Speak to AI Mentor (Speech to Text)"
          className="shrink-0"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center transition disabled:opacity-50"
          disabled={!input.trim() || loading}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
