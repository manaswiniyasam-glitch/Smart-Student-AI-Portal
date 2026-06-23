import React, { useState } from "react";
import { 
  FileText, Mic, Users, Play, Sparkles, AlertCircle, 
  Settings, CheckCircle, ChevronDown, Award, RefreshCw, UploadCloud,
  Layers, Compass, Volume2, BookOpen
} from "lucide-react";
import { GDAnalysisResult, EssayAnalysisResult, SpeechAnalysisResult } from "../types";
import VoiceInputButton from "./VoiceInputButton";

interface EssaySpeechGDModulesProps {
  currentUserId: string;
  initialView?: "gd" | "essay" | "speech";
}

export default function EssaySpeechGDModules({ currentUserId, initialView }: EssaySpeechGDModulesProps) {
  const [activeTab, setActiveTab] = useState<"gd" | "essay" | "speech">(initialView || "gd");

  // GD state
  const [gdTopic, setGdTopic] = useState("AI Ethics and Bias in Automation Pathways");
  const [gdTranscript, setGdTranscript] = useState(
    "In my opinion, AI systems are bringing immense productivity gains, but we must implement strict guardrails. To build on Alex's point, let's explore how algorithmic models acquire historical biases during the model pre-training phase. If we do not address this, automated decision workflows will perpetuate systemic inequities."
  );
  const [gdLoading, setGdLoading] = useState(false);
  const [gdResult, setGdResult] = useState<GDAnalysisResult | null>(null);

  // Essay state
  const [essayTitle, setEssayTitle] = useState("The Influence of Generative AI on Global Educational Systems");
  const [essayText, setEssayText] = useState(
    "Writing assays with machine assistance speeds up pedagogical delivery, however, the structure of learning itself requires careful adjustment. Students must maintain active critical synthesis, rather than letting algorithms fabricate standard thesis assertions catalogued primarily on search vectors. Our core curriculum models need modern adaptive evaluation schemas."
  );
  const [essayLoading, setEssayLoading] = useState(false);
  const [essayResult, setEssayResult] = useState<EssayAnalysisResult | null>(null);

  // Speech state
  const [speechText, setSpeechText] = useState(
    "Basically like, public speaking requires, ahm, optimal respiratory support. Actually, when individuals rush their sentences, phonetic clarity suffers drastically, leading to high conversational fillers."
  );
  const [speechLoading, setSpeechLoading] = useState(false);
  const [speechResult, setSpeechResult] = useState<SpeechAnalysisResult | null>(null);

  const [simulatedFile, setSimulatedFile] = useState<string | null>(null);

  // Real voice speech recording states
  const [isRecordingLiveSpeech, setIsRecordingLiveSpeech] = useState(false);
  const [speechRecError, setSpeechRecError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any | null>(null);

  const toggleLiveSpeechRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechRecError("Browser speech API unsupported.");
      setTimeout(() => setSpeechRecError(null), 3500);
      return;
    }

    if (isRecordingLiveSpeech) {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch(e) {}
      }
      setIsRecordingLiveSpeech(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsRecordingLiveSpeech(true);
          setSpeechRecError(null);
          setSimulatedFile("live_microphone_stream.wav");
        };

        rec.onerror = (e: any) => {
          console.error("Live Mic Error:", e);
          if (e.error === "not-allowed") {
            setSpeechRecError("Mic blocked by permissions");
          } else {
            setSpeechRecError(`Error: ${e.error || "Mic offline"}`);
          }
          setIsRecordingLiveSpeech(false);
          setTimeout(() => setSpeechRecError(null), 3500);
        };

        rec.onend = () => {
          setIsRecordingLiveSpeech(false);
        };

        rec.onresult = (event: any) => {
          let chunk = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              chunk += event.results[i][0].transcript + " ";
            }
          }
          if (chunk) {
            setSpeechText(prev => {
              const cleaned = prev ? prev.trim() : "";
              return cleaned ? cleaned + " " + chunk.trim() : chunk.trim();
            });
          }
        };

        rec.start();
        setRecognitionInstance(rec);
      } catch (err: any) {
        setSpeechRecError("Initialization failed");
        setIsRecordingLiveSpeech(false);
        setTimeout(() => setSpeechRecError(null), 3500);
      }
    }
  };

  // Upload simulation helper
  const handleSimulateUpload = (type: string) => {
    setSimulatedFile(`${type}_submission_node_${Math.floor(Math.random() * 9000) + 1000}.mp4`);
  };

  const runGDAnalysis = async () => {
    if (!gdTopic.trim() || !gdTranscript.trim() || gdLoading) return;
    setGdLoading(true);
    setGdResult(null);

    try {
      const res = await fetch("/api/ai/gd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: gdTopic, transcription: gdTranscript })
      });
      const data = await res.json();
      if (data.result) setGdResult(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setGdLoading(false);
    }
  };

  const runEssayAnalysis = async () => {
    if (!essayTitle.trim() || !essayText.trim() || essayLoading) return;
    setEssayLoading(true);
    setEssayResult(null);

    try {
      const res = await fetch("/api/ai/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: essayTitle, content: essayText })
      });
      const data = await res.json();
      if (data.result) setEssayResult(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setEssayLoading(false);
    }
  };

  const runSpeechAnalysis = async () => {
    if (!speechText.trim() || speechLoading) return;
    setSpeechLoading(true);
    setSpeechResult(null);

    try {
      const res = await fetch("/api/ai/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speechText })
      });
      const data = await res.json();
      if (data.result) setSpeechResult(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setSpeechLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Selection Navigation Banner matching "Professional Polish" */}
      <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-bold text-sm tracking-tight">AI Soft Skills Analytics Suite</h2>
        </div>
        {!initialView ? (
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab("gd"); setSimulatedFile(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "gd" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Group Discussion
            </button>
            <button
              onClick={() => { setActiveTab("essay"); setSimulatedFile(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "essay" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Essay Review
            </button>
            <button
              onClick={() => { setActiveTab("speech"); setSimulatedFile(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "speech" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> Speech lab
            </button>
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-blue-605/20 text-blue-300 text-[10px] font-black rounded-lg border border-blue-500/30 uppercase tracking-widest font-mono">
            {activeTab === "gd" ? "Group Discussion Performance Analyzer" : activeTab === "essay" ? "AI Essay writing Efficiency Prediction" : "AI Speech Efficiency Prediction"}
          </div>
        )}
      </div>

      {/* Main Form Fields and Result Grids */}
      <div className="p-6">
        {/* ============================================ */}
        {/* VIEW 1: GROUP DISCUSSION PERFORMANCE PREDICT */}
        {/* ============================================ */}
        {activeTab === "gd" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side: Upload Video/Audio & Pre-filled Transcript */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-xs mb-2">1. Upload GD Audio/Video Capture</h4>
                  <div className="p-5 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Drag or drop files here</p>
                    <p className="text-[10px] text-slate-400 mt-1">Accepts MP3, WAV, WebM, MP4 up to 100MB</p>
                    
                    <button 
                      type="button"
                      onClick={() => handleSimulateUpload("GD")}
                      className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded-lg transition text-slate-600"
                    >
                      Pre-fill Sample Video.mp4
                    </button>
                  </div>

                  {simulatedFile && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700 font-medium flex items-center justify-between">
                      <span>✓ {simulatedFile} loaded successfully.</span>
                      <span className="text-[9px] font-black uppercase text-green-600 bg-green-100 px-1.5 rounded">Attached</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">GD Topic Statement:</label>
                  <input
                    type="text"
                    value={gdTopic}
                    onChange={(e) => setGdTopic(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none text-slate-700"
                    placeholder="Enter what the group was discussing..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-800">Speech Transcription Script:</label>
                    <VoiceInputButton 
                      onTranscript={(text) => setGdTranscript(prev => prev ? prev + " " + text : text)}
                      tooltip="Input speech via browser Voice Recognition"
                      className="shrink-0"
                    />
                  </div>
                  <textarea
                    value={gdTranscript}
                    onChange={(e) => setGdTranscript(e.target.value)}
                    rows={6}
                    className="w-full text-xs border border-slate-200 p-3 rounded-lg outline-none text-slate-700 font-mono leading-relaxed"
                    placeholder="Provide what the candidate articulated during the session..."
                  />
                  <span className="text-[10px] text-slate-400 italic block">Speech-to-text algorithm analyzes vocal fluency alongside physical gesture indices.</span>
                </div>

                <button
                  onClick={runGDAnalysis}
                  disabled={gdLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {gdLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Performing Multi-Traits Prediction...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run GD Speech-to-Text Performance Evaluator
                    </>
                  )}
                </button>
              </div>

              {/* Right Side: Prediction Scoreboard results with custom SVGs */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                {!gdResult ? (
                  <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 text-slate-350 mb-2" />
                    <p className="text-xs font-medium">Group Discussion Analytics Portal</p>
                    <p className="text-[10px] text-slate-400 max-w-sm mt-1">Upload and submit your audio file to predict performance across Confidence, Leadership, Fluency, and Speaking Quality scores.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Scores Circle header */}
                    <div className="flex items-center gap-5 border-b border-slate-200 pb-4">
                      {/* Overall Percentage badge */}
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-lg">
                        <span className="text-2xl font-black">{gdResult.scores.overall}%</span>
                        <span className="text-[8px] uppercase font-bold tracking-widest text-blue-200">Overall</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">GD Competency Report</h4>
                        <p className="text-[10px] font-semibold text-slate-500">
                          Topic: <span className="text-slate-800">{gdResult.topic}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Sentiment: {gdResult.metrics.sentiment}
                          </span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">
                            WPM: {gdResult.metrics.wpm}
                          </span>
                          <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase">
                            Filler keywords: {gdResult.metrics.fillerWordsCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scores Progress breakdown */}
                    <div className="space-y-3.5">
                      <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Performance Vectors</h5>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-600">Fluency Dynamics</span>
                            <span className="font-black text-slate-900">{gdResult.scores.fluency}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${gdResult.scores.fluency}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-600">Confidence Presence</span>
                            <span className="font-black text-slate-900">{gdResult.scores.confidence}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${gdResult.scores.confidence}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-600">Leadership Cues</span>
                            <span className="font-black text-slate-900">{gdResult.scores.leadership}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${gdResult.scores.leadership}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-600">Speaking Quality</span>
                            <span className="font-black text-slate-900">{gdResult.scores.quality}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${gdResult.scores.quality}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Suggestions List */}
                    <div className="bg-white p-4 rounded-xl border border-slate-150">
                      <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1 text-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Improvement recommendations
                      </h5>
                      <ul className="space-y-2">
                        {gdResult.suggestions.map((sug, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="text-blue-500 mt-1 font-bold shrink-0">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* VIEW 2: ESSAY WRITING EFFICIENCY PREDICTION  */}
        {/* ============================================ */}
        {activeTab === "essay" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side Inputs: Essay text entry */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-xs mb-2">1. Upload Essay Document (Or Write Below)</h4>
                  <div className="p-4 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-10 h-10 text-slate-400 mb-1" />
                    <p className="text-xs font-semibold text-slate-700">Upload essay draft</p>
                    <button 
                      type="button" 
                      onClick={() => handleSimulateUpload("Essay")}
                      className="mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[9px] font-bold rounded"
                    >
                      Attach Draft.docx
                    </button>
                  </div>
                  {simulatedFile && (
                    <div className="mt-2 text-[10px] text-green-600 font-bold bg-green-50 p-1.5 rounded">
                      ✓ Selected {simulatedFile} as text input stream.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">Essay Topic / Title:</label>
                  <input
                    type="text"
                    value={essayTitle}
                    onChange={(e) => setEssayTitle(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none text-slate-700"
                    placeholder="Enter what the essay topic is..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-800">Essay Body Text:</label>
                    <VoiceInputButton 
                      onTranscript={(text) => setEssayText(prev => prev ? prev + " " + text : text)}
                      tooltip="Draft essay body via Voice-to-Text"
                      className="shrink-0"
                    />
                  </div>
                  <textarea
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    rows={8}
                    className="w-full text-xs border border-slate-200 p-3 rounded-lg outline-none text-slate-700 leading-relaxed font-sans"
                    placeholder="Paste your candidate's raw essay script directly..."
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Minimum recommended: 150 words</span>
                    <span>Words Count: {essayText.trim().split(/\s+/).filter(Boolean).length}</span>
                  </div>
                </div>

                <button
                  onClick={runEssayAnalysis}
                  disabled={essayLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {essayLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> NLP Evaluation processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run AI NLP Essay Efficiency Evaluator
                    </>
                  )}
                </button>
              </div>

              {/* Right Side results breakdown */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                {!essayResult ? (
                  <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <FileText className="w-10 h-10 text-slate-350 mb-2" />
                    <p className="text-xs font-medium">Essay NLP grading workspace</p>
                    <p className="text-[10px] text-slate-400 max-w-sm mt-1">Submit your textual essay drafts here to receive immediate Grammar efficiency counts, Readability rankings, and AI plagiarism indexes.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Top percentage banner */}
                    <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                      <div className="w-20 h-20 bg-amber-500 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-lg">
                        <span className="text-2xl font-black">{essayResult.scores.overall}%</span>
                        <span className="text-[8px] uppercase font-bold tracking-widest text-amber-100">Grade Score</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{essayResult.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            Originality: {essayResult.scores.originality}%
                          </span>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                            Readability: {essayResult.metrics.readabilityScoreStr}
                          </span>
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold animate-pulse">
                            Grammar faults: {essayResult.metrics.grammarErrorsCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress indicators */}
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Metrics Breakdown</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Grammar Correctness</span>
                            <span className="font-bold text-slate-900">{essayResult.scores.grammar}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: `${essayResult.scores.grammar}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Vocabulary Richness</span>
                            <span className="font-bold text-slate-900">{essayResult.scores.vocabulary}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: `${essayResult.scores.vocabulary}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Topic Relevance</span>
                            <span className="font-bold text-slate-900">{essayResult.scores.relevance}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${essayResult.scores.relevance}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Structure & Flow</span>
                            <span className="font-bold text-slate-900">{essayResult.scores.structure}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${essayResult.scores.structure}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-150">
                      <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1 text-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Structure Improvement Suggestions
                      </h5>
                      <ul className="space-y-1.5">
                        {essayResult.suggestions.map((sug, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                            <span className="text-amber-500 mt-1 shrink-0">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* VIEW 3: SPEECH EFFICIENCY PREDICTION         */}
        {/* ============================================ */}
        {activeTab === "speech" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Audio recording Simulation and Text script */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-xs">Phonetic Voice Input & Mic Stream Simulation</h4>
                    {speechRecError && (
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 animate-pulse">
                        ⚠️ {speechRecError}
                      </span>
                    )}
                  </div>
                  
                  {/* Option A: Fully Functional Live Record Block */}
                  <div className="p-4 bg-slate-900 rounded-xl space-y-3 border border-slate-800">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isRecordingLiveSpeech ? "bg-rose-500 animate-pulse" : "bg-slate-800"
                        }`}>
                          <Mic className={`w-4 h-4 ${isRecordingLiveSpeech ? "text-white animate-bounce" : "text-slate-400"}`} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {isRecordingLiveSpeech ? "🟢 Recording Live Speech Room" : "Inactive Voice Record Feed"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-sans">
                            {isRecordingLiveSpeech ? "Speak into device mic. Transcript feeds live below!" : "Connect active physical mic stream to start dictating"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={toggleLiveSpeechRecording}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold transition select-none cursor-pointer ${
                          isRecordingLiveSpeech 
                            ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse" 
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isRecordingLiveSpeech ? "Stop Recording" : "Record Voice Live"}
                      </button>
                    </div>

                    {isRecordingLiveSpeech && (
                      <div className="flex items-center justify-center gap-1.5 h-6 text-blue-400 font-mono text-[9px]">
                        <span className="h-2 w-1 bg-blue-400 animate-pulse"></span>
                        <span className="h-4 w-1 bg-blue-400 animate-pulse delay-75"></span>
                        <span className="h-3 w-1 bg-blue-400 animate-pulse delay-100"></span>
                        <span className="h-5 w-1 bg-blue-400 animate-pulse delay-150"></span>
                        <span className="h-2 w-1 bg-blue-400 animate-pulse delay-200"></span>
                        <span className="h-4 w-1 bg-blue-400 animate-pulse delay-300"></span>
                        <span className="text-slate-400 uppercase tracking-widest text-[8px] ml-1 font-bold">Acoustic Audio Feed Connected</span>
                      </div>
                    )}
                  </div>

                  {/* Option B: Connect Mock Waveform Simulation */}
                  <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg text-xs">
                    <span className="text-slate-500 text-[10px]">Or load continuous test file:</span>
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload("Speech_Audio")}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 rounded font-bold font-mono transition border cursor-pointer hover:border-slate-350"
                    >
                      Connect Mock Mic.wav
                    </button>
                  </div>

                  {simulatedFile && (
                    <div className="text-[10px] text-blue-600 font-bold bg-blue-50 p-1.5 rounded border border-blue-105 flex items-center gap-1">
                      <span>✓ Connected active audio track:</span> 
                      <span className="font-mono bg-blue-100 text-blue-800 px-1 py-0.2 rounded">{simulatedFile}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-800">Transcript for Speech Efficiency Profiler:</label>
                    <VoiceInputButton 
                      onTranscript={(text) => setSpeechText(prev => prev ? prev + " " + text : text)}
                      tooltip="Input speech transcript via browser Web Speech detection"
                      className="shrink-0"
                    />
                  </div>
                  <textarea
                    value={speechText}
                    onChange={(e) => setSpeechText(e.target.value)}
                    rows={6}
                    className="w-full text-xs border border-slate-200 p-3 rounded-lg outline-none text-slate-700 font-mono leading-relaxed"
                    placeholder="Enter what you spoke to analyze voice fillers such as 'basically' and 'like'..."
                  />
                </div>

                <button
                  onClick={runSpeechAnalysis}
                  disabled={speechLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {speechLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Speech Pronunciation checks running...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run Speech Efficiency Checker
                    </>
                  )}
                </button>
              </div>

              {/* Right Column Results Feedback */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                {!speechResult ? (
                  <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <Mic className="w-10 h-10 text-slate-350 mb-2" />
                    <p className="text-xs font-medium">Clarity and filler indicators</p>
                    <p className="text-[10px] text-slate-405 max-w-sm mt-1">Check pronunciation indices, vocal consistency, speaking speed, and pause spacing variables instantly.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Top header circle */}
                    <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                      <div className="w-20 h-20 bg-indigo-600 rounded-full flex flex-col items-center justify-center text-white shrink-0 shadow-lg">
                        <span className="text-2xl font-black">{speechResult.scores.overall}%</span>
                        <span className="text-[8px] uppercase font-bold tracking-widest text-indigo-100">Speech Index</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Vocal Articulation feedback</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                            Duration: {speechResult.metrics.durationSec} Sec
                          </span>
                          <span className="text-[9px] bg-slate-200 text-slate-705 px-1.5 rounded font-semibold">
                            Speed: {speechResult.metrics.wpm} WPM
                          </span>
                          <span className="text-[9px] bg-red-100 text-red-700 px-1.5 rounded font-bold">
                            Pauses counted: {speechResult.metrics.pausesCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress indicators */}
                    <div className="space-y-3.5">
                      <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Pronunciation and speed indices</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Phonetic Accuracy</span>
                            <span className="font-bold text-slate-900">{speechResult.scores.pronunciation}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${speechResult.scores.pronunciation}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Clarity index</span>
                            <span className="font-bold text-slate-900">{speechResult.scores.clarity}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${speechResult.scores.clarity}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Confidence pacing</span>
                            <span className="font-bold text-slate-900">{speechResult.scores.confidence}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${speechResult.scores.confidence}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Filler avoidance score</span>
                            <span className="font-bold text-slate-900">{speechResult.scores.speedConsistency}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full">
                            <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${speechResult.scores.speedConsistency}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Speech metrics identifiers */}
                    {speechResult.metrics.fillerWords.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                        <span className="block text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">Filler terms flag:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {speechResult.metrics.fillerWords.map((word, index) => (
                            <span key={index} className="text-xs bg-white text-red-700 px-2 py-0.5 rounded border border-red-200 font-mono">
                              "{word}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-white p-4 rounded-xl border border-slate-150">
                      <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1 text-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Speech Lab dynamic checklist
                      </h5>
                      <ul className="space-y-1.5">
                        {speechResult.suggestions.map((sug, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                            <span className="text-indigo-500 mt-1 shrink-0">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
