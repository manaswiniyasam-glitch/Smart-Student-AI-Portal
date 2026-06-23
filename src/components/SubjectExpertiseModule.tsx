import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, User, Mail, Search, ClipboardCheck, Calendar, HelpCircle, AlertTriangle 
} from "lucide-react";
import VoiceInputButton from "./VoiceInputButton";



interface SubjectExpertiseModuleProps {
  currentUserId: string;
  userRole: string;
  studentProfile?: {
    id: string;
    name: string;
    regNo?: string;
    email?: string;
  } | null;
}

export default function SubjectExpertiseModule({ currentUserId, userRole, studentProfile }: SubjectExpertiseModuleProps) {
  // AI Custom Subject Expertise Sandbox & Database Sync States
  const [leftTab, setLeftTab] = useState<'sandbox' | 'history'>('sandbox');
  const [customTopicName, setCustomTopicName] = useState<string>("Supervised learning models vs Unsupervised density clustering");
  const [studentName, setStudentName] = useState<string>(studentProfile?.name || "Alex Mercer");
  const [studentEmail, setStudentEmail] = useState<string>(studentProfile?.email || "");
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [sessionSearchQuery, setSessionSearchQuery] = useState<string>("");
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [scoreFilter, setScoreFilter] = useState<string>("all");

  const [vocalAnswer, setVocalAnswer] = useState<string>("");
  const [vocalBaseAnswer, setVocalBaseAnswer] = useState<string>("");
  const [lastCapturedVoiceInput, setLastCapturedVoiceInput] = useState<string>("");
  const [interimVoiceInput, setInterimVoiceInput] = useState<string>("");
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);

  // Response duration clocks (up to 5 min from 30s)
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timeLimit, setTimeLimit] = useState<number>(300); // 300 seconds default (5 minutes)

  const [predictingExpert, setPredictingExpert] = useState<boolean>(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [expertPrediction, setExpertPrediction] = useState<{
    suitableMarks: number;
    matchPercentage: number;
    correctAnswerCombinedReferenceLabels: string;
    gaps: string;
  } | null>(null);

  // Automatically start clock when speaking or typing starts
  // Also stop timer when user turns off microphone
  useEffect(() => {
    let interval: any = null;
    if (timerIsRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev >= timeLimit) {
            setTimerIsRunning(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerIsRunning, timeLimit]);

  const prevListeningRef = useRef<boolean>(false);

  useEffect(() => {
    if ((vocalAnswer.trim().length > 0 || isListeningVoice) && !timerIsRunning && timerSeconds === 0) {
      setTimerIsRunning(true);
    } else if (prevListeningRef.current && !isListeningVoice && timerIsRunning) {
      setTimerIsRunning(false);
    }
    prevListeningRef.current = isListeningVoice;
  }, [vocalAnswer, isListeningVoice, timerIsRunning, timerSeconds]);

  // Load past session records on mount
  useEffect(() => {
    fetchPastSessions();
  }, [studentProfile]);

  const fetchPastSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch("/api/subject-expertise/sessions");
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      const results = data.sessions || [];
      setPastSessions(results);
      if (results.length > 0) {
        setSelectedSessionId(prev => prev || results[0].id || null);
      }
    } catch (err) {
      console.error("Failed to fetch past session records from PostgreSQL DB:", err);
      const fallbackSession = {
        id: "guest_session_1",
        topic: "Guest Session - No DB access",
        createdAt: new Date().toISOString(),
        marks: 8.2,
        matchPercentage: 82,
        answer: "This is a local fallback session because the PostgreSQL database is offline.",
        correctAnswerKey: "Local fallback correct answer details...",
        gaps: "No mistakes identified in fallback mode.",
        userName: "Guest Scholar",
        userEmail: "guest@example.com"
      };
      setPastSessions([fallbackSession]);
      setSelectedSessionId(fallbackSession.id);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleLoadDemoSyllabusQuestion = () => {
    const topic = customTopicName.trim() || "Your Custom Topic";
    const promptQ = `Explain the foundational concepts, key parameters, trade-offs, and core practical designs related to ${topic}.`;
    setVocalAnswer(`Answering: "${promptQ}"\n\n`);
    setVocalBaseAnswer(`Answering: "${promptQ}"\n\n`);
  };

  const handlePredictExpertScoreAndAnswer = async () => {
    if (!customTopicName.trim()) {
      setPredictionError("Please enter a custom topic name to proceed with the evaluation.");
      return;
    }
    if (!vocalAnswer.trim()) {
      setPredictionError("Please use the Voice Recorder or type to enter your answer first.");
      return;
    }

    if (predictingExpert) {
      return;
    }

    setPredictingExpert(true);
    setPredictionError(null);
    setTimerIsRunning(false);

    try {
      const prompt = `
        You are an elite academic board examiner and comparative subject matching expert.
        The student is being assessed on the custom topic: "${customTopicName}"

        ---- STUDENT'S DICTATED/WRITTEN ANSWER ----
        "${vocalAnswer}"

        Assessments to make:
        1. Formulate the expected correct comprehensive response key for the topic "${customTopicName}".
        2. Predict a suitable score out of 10 for the student's answer (decimal between 0 and 10, e.g., 7.5 or 9.2), evaluating it strictly against standard academic benchmarks for "${customTopicName}".
        3. Estimate a precise Match Percentage (integer between 0 and 100) indicating how complete and close the student's answer was compared to the formulated high-standard response key.
        4. Identify EXACTLY where the student made mistakes, what those conceptual or technical mistakes are, and what key concepts are missing. Format this with visible bullet lists.

        YOU MUST RESPOND ONLY with a valid, clean JSON block conforming to this exact structural schema:
        {
          "suitableMarks": 8.0,
          "matchPercentage": 80,
          "correctAnswerCombinedReferenceLabels": "A consolidated summary of the expected academic correct answer key pattern of the topic for the student's reference",
          "gaps": "• Mistake: [Explain exactly what or where the student got it wrong compared to standard answers]\\n• Missing Concept: [Explain what mechanisms are missing from the response]"
        }
      `;

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 15000);
      let reply = "";

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt, history: [] }),
          signal: controller.signal
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const apiMessage = errorData?.error || `AI service unavailable (${response.status})`;
          throw new Error(apiMessage);
        }

        const data = await response.json();
        reply = data.reply || "";
      } catch (fetchErr: any) {
        if (fetchErr?.name === "AbortError") {
          setPredictionError("AI request timed out. Using fallback evaluation.");
        } else {
          setPredictionError(fetchErr?.message || "AI expert service unavailable. Using fallback evaluation.");
        }
        console.warn("AI evaluation fetch failed:", fetchErr);
      } finally {
        window.clearTimeout(timeoutId);
      }

      // Safe JSON parsing
      const cleanReply = reply.replace(/```json/gi, "").replace(/```/g, "").trim();
      const startIdx = cleanReply.indexOf("{");
      const endIdx = cleanReply.lastIndexOf("}");

      let suitableMarks = 7.0;
      let matchPercentage = 70;
      let correctAnswerKey = `Correct answer pattern for ${customTopicName}`;
      let gapsStr = "No major matching discrepancies or mistakes observed relative to standard benchmarks.";

      if (startIdx !== -1 && endIdx !== -1) {
        try {
          const parsed = JSON.parse(cleanReply.substring(startIdx, endIdx + 1));
          
          const rawMarks = Number(parsed.suitableMarks);
          if (!isNaN(rawMarks)) {
            suitableMarks = Math.max(0, Math.min(10, rawMarks));
          }
          
          const rawMatch = Number(parsed.matchPercentage);
          if (!isNaN(rawMatch)) {
            matchPercentage = Math.max(0, Math.min(100, Math.floor(rawMatch)));
          }

          if (parsed.correctAnswerCombinedReferenceLabels) {
            correctAnswerKey = typeof parsed.correctAnswerCombinedReferenceLabels === "string"
              ? parsed.correctAnswerCombinedReferenceLabels
              : JSON.stringify(parsed.correctAnswerCombinedReferenceLabels);
          }

          if (parsed.gaps) {
            gapsStr = typeof parsed.gaps === "string"
              ? parsed.gaps
              : (Array.isArray(parsed.gaps) ? parsed.gaps.map((g: any) => String(g)).join("\n") : JSON.stringify(parsed.gaps));
          }
        } catch (jsonErr) {
          console.warn("JSON parse issue, using text reply instead", jsonErr);
          gapsStr = reply || gapsStr;
        }
      } else {
        if (reply) {
          gapsStr = reply;
        } else {
          const words = vocalAnswer.trim().split(/\s+/).filter(Boolean);
          const lengthScore = Math.min(10, Math.max(3, Math.round(words.length / 15) + 3));
          suitableMarks = lengthScore;
          matchPercentage = Math.min(100, Math.max(35, Math.round(words.length * 2.5)));
          correctAnswerKey = `A strong answer on ${customTopicName} should cover the main concepts, examples, and comparisons relevant to the topic.`;
          gapsStr = words.length < 20
            ? `• Mistake: Response is too brief and misses key topic context for ${customTopicName}.\n• Missing Concept: Add more explanation of the central concepts and why they matter.`
            : `• Mistake: The answer may need more academic depth and structure.\n• Missing Concept: Include clearer examples and stronger topic-specific detail for ${customTopicName}.`;
        }
      }

      const safeUserName = studentName.trim() || "Anonymous Scholar";
      const safeUserEmail = studentEmail.trim() || "anonymous@student-evaluation.net";
      const safeTopic = customTopicName.trim().slice(0, 500);
      const safeAnswer = vocalAnswer.trim().slice(0, 19000);
      const safeCorrectAnswerKey = correctAnswerKey.slice(0, 19000);
      const safeGaps = gapsStr.slice(0, 19000);

      const finalPrediction = {
        suitableMarks,
        matchPercentage,
        correctAnswerCombinedReferenceLabels: safeCorrectAnswerKey,
        gaps: safeGaps
      };

      setExpertPrediction(finalPrediction);
      setPredictingExpert(false);

      const sessionDocId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const sessionData = {
        id: sessionDocId,
        userName: safeUserName,
        userEmail: safeUserEmail,
        topic: safeTopic,
        answer: safeAnswer,
        marks: suitableMarks,
        matchPercentage,
        correctAnswerKey: safeCorrectAnswerKey,
        gaps: safeGaps
      };

      void (async () => {
        try {
          const res = await fetch("/api/subject-expertise/sessions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(sessionData)
          });
          if (!res.ok) {
            throw new Error(`Server returned ${res.status}: ${res.statusText}`);
          }
          setSelectedSessionId(sessionDocId);
          await fetchPastSessions();
        } catch (dbErr) {
          console.warn("PostgreSQL persistence failed after evaluation:", dbErr);
          const localNewSession = {
            ...sessionData,
            createdAt: new Date().toISOString()
          };
          setPastSessions(prev => [localNewSession, ...prev]);
          setSelectedSessionId(sessionDocId);
        }
      })();

    } catch (err: any) {
      console.error("AI Expert prediction or DB save error:", err);
      setPredictionError("Error occurred during evaluation processing: " + err.message);
    } finally {
      setPredictingExpert(false);
    }
  };

  const isSandboxMode = leftTab === 'sandbox';
  const sandboxSession = expertPrediction ? {
    id: "MEM_SANDBOX_RUN",
    topic: customTopicName,
    answer: vocalAnswer,
    marks: expertPrediction.suitableMarks,
    matchPercentage: expertPrediction.matchPercentage,
    correctAnswerKey: expertPrediction.correctAnswerCombinedReferenceLabels,
    gaps: expertPrediction.gaps,
    createdAt: null
  } : null;

  const activeSession = isSandboxMode
    ? sandboxSession
    : (pastSessions.find(s => s.id === selectedSessionId) || pastSessions[0]);

  return (
    <div className="space-y-6">
      {/* SUITE_HEADER_MARKER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PART: Student Identity replaced with metrics and filter console */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          {/* Header Switcher Tabs */}
          <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="text-left font-sans">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <BookOpen className="text-indigo-600 w-4.5 h-4.5" />
                Subject Expertise Desk
              </h3>
              <p className="text-[10px] text-slate-400">
                {leftTab === 'sandbox' ? "Test answer alignment using speech analysis" : "Browse historical evaluations anonymously"}
              </p>
            </div>
            
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-250 text-xs shadow-3xs self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setLeftTab('sandbox')}
                className={`px-2.5 py-1 text-[9.5px] font-black uppercase tracking-tight rounded-md transition cursor-pointer ${
                  leftTab === 'sandbox'
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200/50 font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sandbox
              </button>
              <button
                type="button"
                onClick={() => setLeftTab('history')}
                className={`px-2.5 py-1 text-[9.5px] font-black uppercase tracking-tight rounded-md transition cursor-pointer ${
                  leftTab === 'history'
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200/50 font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Logs
              </button>
            </div>
          </div>

          {leftTab === 'sandbox' ? (
            /* RESTORED SUBJECT EXPERTISE SANDBOX INPUT FORM */
            <div className="space-y-4 font-sans text-left animate-fadeIn">
              {/* Student Identity Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/45 border border-indigo-100 rounded-xl">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3 text-indigo-500" />
                    Name:
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition shadow-3xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-indigo-500" />
                    Mail ID (Registered Email):
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    readOnly
                    className="w-full text-xs p-2 bg-slate-100 border border-slate-200 rounded-lg outline-none cursor-not-allowed text-slate-600 shadow-3xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-505 uppercase tracking-wider block">Topic for Assessment:</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customTopicName}
                    onChange={(e) => setCustomTopicName(e.target.value)}
                    placeholder="e.g. Supervised learning models vs Unsupervised density clustering"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleLoadDemoSyllabusQuestion}
                    className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-705 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer"
                  >
                    Load prompt
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-505 uppercase tracking-wider block">Set Response Time Limit:</label>
                <select
                  value={timeLimit}
                  onChange={(e) => {
                    setTimeLimit(Number(e.target.value));
                    setTimerSeconds(0);
                  }}
                  disabled={timerIsRunning}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition shadow-3xs"
                >
                  <option value={30}>30 Seconds</option>
                  <option value={60}>1 Minute</option>
                  <option value={120}>2 Minutes</option>
                  <option value={180}>3 Minutes</option>
                  <option value={240}>4 Minutes</option>
                  <option value={300}>5 Minutes</option>
                </select>
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-505 uppercase tracking-wider">Your Explanation Answer:</label>
                  {timerIsRunning && (
                    <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-150 px-1.5 py-0.5 rounded-full font-mono font-extrabold animate-pulse">
                      Timer: {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    value={vocalAnswer}
                    onChange={(e) => setVocalAnswer(e.target.value)}
                    placeholder="Draft your response here. Try clicking the mic below to dictate your answer..."
                    rows={6}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition pr-10 resize-none font-sans"
                  />
                  <div className="absolute right-2.5 bottom-3">
                    <VoiceInputButton
                      onTranscript={(text) => {
                        setVocalAnswer((prev) => prev ? prev + " " + text : text);
                      }}
                      onListeningChange={setIsListeningVoice}
                      tooltip="Speech-to-text dictation input"
                    />
                  </div>
                </div>
              </div>

              {predictionError && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-700 rounded-xl text-xs font-semibold">
                  {predictionError}
                </div>
              )}

              <button
                type="button"
                onClick={handlePredictExpertScoreAndAnswer}
                disabled={predictingExpert}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-755 text-white rounded-lg text-xs font-extrabold transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-1.5 font-sans"
              >
                {predictingExpert ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Compiling Academic Appraisal...</span>
                  </>
                ) : (
                  <span>Evaluate Performance Alignment</span>
                )}
              </button>
            </div>
          ) : (
            /* ANONYMOUS ALIGNMENT EVALUATION HISTORY LOGS (No student details) */
            <div className="space-y-4 font-sans text-left animate-fadeIn">
              {/* SCORE FILTER PRESETS */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Grade Tier Filter:</span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                  {[
                    { key: "all", label: "All Grades" },
                    { key: "high", label: "High (≥8.5)" },
                    { key: "med", label: "Medium (6.0-8.4)" },
                    { key: "low", label: "Remedial (<6.0)" }
                  ].map((tier) => (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => setScoreFilter(tier.key)}
                      className={`flex-1 text-center py-1 rounded-md text-[10px] font-bold tracking-tight transition cursor-pointer ${
                        scoreFilter === tier.key
                          ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                          : "text-slate-505 hover:text-slate-800"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE EVALUATION DATABASE VISIBILITY LOGGER */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <Search className="w-3 h-3" />
                  </span>
                  <input
                    type="text"
                    value={sessionSearchQuery}
                    onChange={(e) => setSessionSearchQuery(e.target.value)}
                    placeholder="Search student name, email, or topic..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition"
                  />
                </div>

                {/* Scrollable list of sessions */}
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {loadingSessions ? (
                    <div className="text-center py-6">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">Synchronizing live records...</p>
                    </div>
                  ) : (() => {
                    const activeSessionItem = pastSessions.find(s => s.id === selectedSessionId) || pastSessions[0];
                    
                    // Filter past sessions based on Search query & Score tier filter
                    const filtered = pastSessions.filter(session => {
                      const queryText = sessionSearchQuery.toLowerCase().trim();
                      const nameMatch = (session.userName || "").toLowerCase().includes(queryText);
                      const emailMatch = (session.userEmail || "").toLowerCase().includes(queryText);
                      const topicMatch = (session.topic || "").toLowerCase().includes(queryText);
                      const matchesSearch = !queryText || nameMatch || emailMatch || topicMatch;

                      const marksVal = Number(session.marks) || 0;
                      if (scoreFilter === "high") return matchesSearch && marksVal >= 8.5;
                      if (scoreFilter === "med") return matchesSearch && marksVal >= 6.0 && marksVal < 8.5;
                      if (scoreFilter === "low") return matchesSearch && marksVal < 6.0;
                      return matchesSearch;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          <p className="text-[10.5px] text-slate-400 font-bold">No submissions match the filters.</p>
                          <p className="text-[9.5px] text-slate-400/80 mt-0.5">Try widening search or tier options!</p>
                        </div>
                      );
                    }

                    return filtered.map((session, sIdx) => {
                      const isSelected = activeSessionItem?.id === session.id;
                      const formattedTime = (() => {
                        if (!session.createdAt) return "Recent Session";
                        try {
                          const d = typeof session.createdAt.toDate === "function" ? session.createdAt.toDate() : new Date(session.createdAt);
                          return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch {
                          return "Recent Session";
                        }
                      })();

                      return (
                        <div 
                          key={session.id || sIdx}
                          onClick={() => {
                            setSelectedSessionId(session.id || null);
                            // Keep backward compatibility in forms if any:
                            setCustomTopicName(session.topic);
                            setVocalAnswer(session.answer);
                            setVocalBaseAnswer(session.answer);
                            setStudentName(session.userName);
                            setStudentEmail(session.userEmail);
                            setExpertPrediction({
                              suitableMarks: session.marks,
                              matchPercentage: session.matchPercentage,
                              correctAnswerCombinedReferenceLabels: session.correctAnswerKey,
                              gaps: session.gaps
                            });
                          }}
                          className={`p-3 border rounded-xl transition cursor-pointer text-left space-y-1.5 relative overflow-hidden ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/30 shadow-2xs"
                              : "border-slate-200 hover:border-indigo-200 bg-white hover:bg-slate-50/50"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate">
                              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center font-mono font-bold text-[9px] text-indigo-700 uppercase">
                                {(session.userName || "S").charAt(0)}
                              </div>
                              <span className="font-extrabold text-[11px] text-slate-800 truncate">
                                {session.userName}
                              </span>
                            </div>
                            <span className="shrink-0 bg-slate-900 text-slate-100 font-mono font-black text-[9px] px-1.5 py-0.5 rounded-md border border-slate-705">
                               {session.marks}/10 Marks
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 leading-none flex items-center gap-1 truncate font-mono">
                            <Mail className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{session.userEmail}</span>
                          </div>

                          <div className="p-1.5 bg-slate-50 border border-slate-150 rounded-lg space-y-1">
                            <p className="text-[10px] font-bold text-slate-800 leading-tight truncate">
                              Topic: {session.topic}
                            </p>
                            <p className="text-[9.5px] text-slate-505 italic leading-snug truncate">
                              "{session.answer}"
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[8px] text-slate-450 uppercase tracking-wider font-extrabold font-sans pt-0.5">
                            <span>Concept Match: <strong className="text-emerald-700 font-mono font-bold">{session.matchPercentage}%</strong></span>
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PART: Selected Record Detailed Appraisal Dossier */}
        <div className="lg:col-span-7 space-y-4">
          {!activeSession ? (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="font-bold text-slate-800 text-sm">No Active Evaluation</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {isSandboxMode 
                    ? "Please enter your explanation answer and click 'Evaluate Performance Alignment' to see evaluation metrics here."
                    : "To view examination scores, conceptual error lists, and student metrics, select a log entry from the list panel."}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5 animate-fadeIn">
              {/* Anonymous Assessment Appraisal Ticker */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-105">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm ring-4 ring-slate-100">
                    <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-left font-sans">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-slate-800 text-sm">Anonymous Academic Appraisal</h3>
                      <span className="text-[8px] bg-emerald-50 text-emerald-700 font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded-md border border-emerald-250">
                        Verified Alignment
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 font-medium mt-0.5">
                      Appraisal ID: {activeSession.id?.substring(0, 8) || "MEM_SANDBOX_RUN"}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {(() => {
                      if (!activeSession.createdAt) return "Recent Date";
                      try {
                        const d = typeof activeSession.createdAt.toDate === "function" 
                          ? activeSession.createdAt.toDate() 
                          : new Date(activeSession.createdAt);
                        return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                      } catch {
                        return "Recent Date";
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* CUSTOM ASSESSMENT TARGET TOPIC BANNER */}
              <div className="bg-indigo-50/50 border border-indigo-100/80 p-3.5 rounded-xl space-y-1 text-left">
                <span className="text-[8.5px] uppercase font-black text-indigo-700 tracking-widest block font-sans">Evaluated Academic Topic</span>
                <h4 className="text-[12px] font-extrabold text-slate-800 leading-snug">{activeSession.topic}</h4>
              </div>

              {/* SCORE GAUGES SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Score / 10 Box */}
                <div className="p-3 bg-indigo-50/30 border border-indigo-150 rounded-xl space-y-1 text-left font-sans">
                  <span className="text-[9px] uppercase font-black text-indigo-700 block tracking-wider">Evaluation Score</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono text-slate-900">{activeSession.marks}</span>
                    <div className="leading-tight text-left">
                      <span className="text-[9.5px] text-indigo-800 font-bold uppercase bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded">
                        {Number(activeSession.marks) >= 8.5 ? "First-Class Honors" : Number(activeSession.marks) >= 6.0 ? "Proficient Pass" : "Remedial Plan Required"}
                      </span>
                      <span className="text-[9.5px] text-slate-400 block mt-0.5 font-sans">Scale out of 10 max</span>
                    </div>
                  </div>
                </div>

                {/* Match Percent Box */}
                <div className="p-3 bg-emerald-50/30 border border-emerald-150 rounded-xl space-y-1 text-left font-sans">
                  <span className="text-[9px] uppercase font-black text-emerald-800 block tracking-wider">Concept Alignment Ratio</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono text-emerald-700">{activeSession.matchPercentage}%</span>
                    <div className="leading-tight text-left font-sans">
                      <span className="text-[9.5px] text-emerald-805 font-bold uppercase bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-sans">
                        {activeSession.matchPercentage >= 80 ? "High Fidelity Match" : activeSession.matchPercentage >= 50 ? "Moderate Accuracy" : "Low Key-Term Density"}
                      </span>
                      <span className="text-[9.5px] text-slate-400 block mt-0.5">Benchmark term overlaps</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matching Evaluation Progress Bar */}
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-650">
                  <span className="uppercase tracking-wider">ANSWER ALIGNMENT WITH STANDARD EVALUATION:</span>
                  <span className="font-mono text-slate-800">{activeSession.matchPercentage || 85}% COVERAGE</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-lg overflow-hidden border border-slate-200/60">
                  <div
                    className={`h-full rounded-md transition-all duration-300 ${
                      (activeSession.matchPercentage || 85) >= 80
                        ? "bg-emerald-500"
                        : (activeSession.matchPercentage || 85) >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${activeSession.matchPercentage || 85}%` }}
                  ></div>
                </div>
              </div>

              {/* EXPECTED CORRECT ANSWER FOR THE STUDENT */}
              <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                  Expected Standard Correct Answer Key
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans border-l-2 border-indigo-500 pl-4 py-0.5 bg-white p-3 rounded-r-lg shadow-2xs">
                  {activeSession.correctAnswerKey || "Supervised learning utilizes labeled classification variables, whereas Unsupervised clustering uses dense spatial groupings/Euclidean layouts."}
                </p>
              </div>

              {/* Mistakes made & what are the mistakes */}
              <div className="bg-rose-50 border border-rose-200/80 p-4.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-[10px] uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  What and where mistakes were made & conceptual gaps
                </div>
                <div className="text-xs text-slate-755 leading-relaxed font-sans whitespace-pre-line pl-5 border-l-2 border-rose-300">
                  {activeSession.gaps}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
