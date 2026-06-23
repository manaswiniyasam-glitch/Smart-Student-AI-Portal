import React, { useState, useEffect } from "react";
import { 
  Code2, Trophy, Terminal, Play, CheckCircle2, AlertTriangle, 
  HelpCircle, Lightbulb, ChevronRight, Zap, Target, BarChart2 
} from "lucide-react";
import { CodingProblem, HackathonContest, SubmissionResult, LeaderboardEntry } from "../types";

interface HackathonModuleProps {
  currentUserId: string;
}

export default function HackathonModule({ currentUserId }: HackathonModuleProps) {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [submission, setSubmission] = useState<SubmissionResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [problemsLoading, setProblemsLoading] = useState(true);

  // Daily challenge state
  const dailyChallengeId = "prob_2";

  useEffect(() => {
    fetchProblems();
    fetchLeaderboard();
  }, []);

  const fetchProblems = async () => {
    try {
      setProblemsLoading(true);
      const res = await fetch("/api/hackathon/problems");
      const data = await res.json();
      if (data.problems && data.problems.length > 0) {
        setProblems(data.problems);
        setSelectedProblem(data.problems[0]);
        setCode(data.problems[0].starterCode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProblemsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/hackathon/leaderboard");
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectProblem = (prob: CodingProblem) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode);
    setSubmission(null);
  };

  const submitCode = async () => {
    if (!selectedProblem || loading) return;
    setLoading(true);
    setSubmission(null);

    try {
      const res = await fetch("/api/hackathon/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          code,
          language,
          userId: currentUserId
        })
      });

      const data = await res.json();
      if (data.result) {
        setSubmission(data.result);
        // Refresh leaderboard to see updated high scores instantly
        await fetchLeaderboard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Daily challenges, difficulty, problem picker, and leaderboard (Lg: 5 columns) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Daily Challenges Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 rounded-2xl border border-blue-800 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3 h-3fill" /> Daily Boost Challenge
            </span>
            <h3 className="font-bold text-base">Valid Parentheses Checker</h3>
            <p className="text-xs text-slate-300 mt-1 lines-clamp-2">
              Optimize linear scanning complexity and check nesting boundaries! Earn +100 alignment points toward placements.
            </p>
            <button
              onClick={() => {
                const targetProb = problems.find(p => p.id === dailyChallengeId);
                if (targetProb) handleSelectProblem(targetProb);
              }}
              className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            >
              Solve Now <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Problem Selector List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-blue-600" />
              Coding Challenges File
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Auto-Graded Compiler</span>
          </div>

          {problemsLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading compiler problem indices...</div>
          ) : (
            <div className="space-y-2.5">
              {problems.map((prob) => {
                const isSelected = selectedProblem?.id === prob.id;
                const speedColor = 
                  prob.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-200" :
                  prob.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-rose-50 text-rose-700 border-rose-200";

                return (
                  <button
                    key={prob.id}
                    onClick={() => handleSelectProblem(prob)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between cursor-pointer ${
                      isSelected 
                        ? "bg-slate-50 border-blue-500 shadow-sm" 
                        : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <p className="font-semibold text-xs text-slate-800">{prob.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{prob.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wider ${speedColor}`}>
                        {prob.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">+{prob.rewardPoints} pts</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Placements Placement Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Placement Prep Leaderboard
            </h3>
            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Live</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.userId === currentUserId;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                    isCurrentUser ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black ${
                      entry.rank === 1 ? "bg-amber-100 text-amber-700" :
                      entry.rank === 2 ? "bg-slate-100 text-slate-700" :
                      entry.rank === 3 ? "bg-orange-50 text-orange-700" : "text-slate-400"
                    }`}>
                      {entry.rank}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{entry.name}</p>
                      <p className="text-[10px] text-slate-400">{entry.regNo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{entry.score} pts</p>
                    <p className="text-[9px] text-slate-400">{entry.problemsSolved} challenges</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Code workspace description, Editor and Compiler window (Lg: 7 columns) */}
      <div className="lg:col-span-12 xl:col-span-7 space-y-6">
        {selectedProblem && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Challenge Header */}
            <div className="p-5 border-b border-slate-150 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-900">{selectedProblem.title}</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium outline-none text-slate-600 focus:border-blue-500"
                  >
                    <option value="javascript">JavaScript (ES6)</option>
                    <option value="typescript">TypeScript (Stable)</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-600 whitespace-pre-wrap font-sans mt-2 leading-relaxed">
                {selectedProblem.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-slate-900 text-slate-200 p-3 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Sample Input</span>
                  <code className="text-xs font-mono font-bold text-blue-300">{selectedProblem.sampleInput}</code>
                </div>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Sample Output</span>
                  <code className="text-xs font-mono font-bold text-green-300">{selectedProblem.sampleOutput}</code>
                </div>
              </div>
            </div>

            {/* Editing Desk */}
            <div className="relative">
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 rounded backdrop-blur text-[10px] text-slate-450 font-bold font-mono">
                <Terminal className="w-3" /> Virtual IDE
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={15}
                className="w-full bg-slate-950 text-green-400 p-5 font-mono text-xs focus:outline-none focus:ring-0 resize-y leading-relaxed shadow-inner"
                style={{ tabSize: 2 }}
              />
            </div>

            {/* Compilation Action Pad */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-450 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-500" />
                Solve it efficiently inside worst-case O(N) constraints.
              </span>
              <button
                onClick={submitCode}
                disabled={loading}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Terminal className="w-4 h-4 animate-spin" /> Compiling Test Cases...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Execute & Submit Code
                  </>
                )}
              </button>
            </div>

            {/* Compilation / AI Feedback Box */}
            {submission && (
              <div className="divide-y divide-slate-150 border-t border-slate-200">
                <div className={`p-5 flex items-start gap-3.5 ${
                  submission.status === "Accepted" ? "bg-emerald-500/5 text-slate-900" : "bg-red-500/5 text-slate-900"
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {submission.status === "Accepted" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-slate-950">
                        Compile Outcome: {submission.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Latency: {submission.runtimeMs} ms
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Score: <strong className="text-slate-900">{submission.score} pts</strong>. Passed {submission.passedCount} of {submission.totalCount} structural verification cases.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-indigo-50/30 to-blue-50/20">
                  <h4 className="font-bold text-xs text-indigo-950 flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                    AI Code Optimization & Structural Matrix Feed
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                    {submission.aiSuggestions}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
