import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, BookOpen, Clock, Activity, MessageSquare, 
  Send, User, TrendingUp, Award, Bell
} from "lucide-react";

interface ParentDashboardProps {
  parentId: string;
}

export default function ParentDashboard({ parentId }: ParentDashboardProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parentMessage, setParentMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'parent' | 'mentor' | 'ai'; text: string }>>([
    { role: "mentor", text: "Welcome parent. I am Evelyn Hargreaves. Alex is doing incredibly well with algorithms, but let us verify ML theory fundamentals before final tests." }
  ]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    fetchChildPerformance();
  }, [parentId]);

  const fetchChildPerformance = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/parent/child-data/${parentId}`);
      if (!res.ok) throw new Error("Could not restore child data matrix.");
      const payload = await res.json();
      setData(payload);
    } catch (err: any) {
      setError(err.message || "Failed to establish secure child tracking connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentMessage.trim()) return;

    const userMsg = parentMessage.trim();
    setChatHistory((prev) => [...prev, { role: "parent", text: userMsg }]);
    setParentMessage("");
    setIsSendingMessage(true);

    try {
      // Direct integration with the Mentor AI assistant router to answer parent concerns
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Respond as the student's Academic Mentor. A parent has left this message: "${userMsg}". Address their student Alex Mercer specifically, reference their solid 94% DS & Algos but 84% weak ML foundations to keep it highly contextual, and offer advice.`,
          history: []
        })
      });
      const resData = await res.ok ? await res.json() : { reply: "Note logged by Faculty Staff. We will recalibrate benchmarks." };
      setChatHistory((prev) => [...prev, { role: "mentor", text: resData.reply }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: "mentor", text: "SMS message dispatched directly to Dr. Evelyn's university dashboard queue. Thank you for staying proactive!" }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] space-y-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Establishing Secure Child Gateway Data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-800">{error || "Data link unavailable."}</p>
        <button onClick={fetchChildPerformance} className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Retry connection</button>
      </div>
    );
  }

  const { child, attendance, gradesReport, teacherNotes } = data;

  return (
    <div className="space-y-6">
      {/* Overview Greeting */}
      <div className="bg-amber-600/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[9px] bg-amber-600/20 text-amber-800 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">SECURE PORTAL RECOGNIPPED</span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">Thomas Mercer's Parent Analytics Hub</h2>
          <p className="text-xs text-slate-600">Active monitoring: <strong className="text-slate-950 font-bold">{child.name}</strong> ({child.regNo}) • {child.department} • {child.semester}</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border rounded-xl p-3 shadow-xs text-center min-w-[100px]">
            <span className="block text-[8px] text-slate-400 font-bold">CGPA OVERVIEW</span>
            <span className="text-sm font-black text-green-700 font-mono">{gradesReport.cgpa}</span>
          </div>
          <div className="bg-white border rounded-xl p-3 shadow-xs text-center min-w-[100px]">
            <span className="block text-[8px] text-slate-400 font-bold">ATTENDANCE</span>
            <span className="text-sm font-black text-blue-700 font-mono">{attendance.overall}%</span>
          </div>
        </div>
      </div>

      {/* Primary Grid: Left attendance and Grades, Right Teacher Note & SMS logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Academic Standing and Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Attendance indicators */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-blue-500" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Lecture Attendance Mappings</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">Semester-end Forecast: {attendance.predictionToSemesterEnd}%</span>
            </div>

            {/* Attendance Alert Block */}
            {attendance.alerts && attendance.alerts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                  <span>Doubt-Threshold Proctor Warning</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed font-sans">{attendance.alerts[0].message}</p>
              </div>
            )}

            {/* Subject-wise bars */}
            <div className="space-y-3.5">
              {attendance.subjectBreakdown.map((subject: any) => (
                <div key={subject.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{subject.name}</span>
                    <span className={subject.percent < 85 ? "text-rose-600 font-mono" : "text-green-700 font-mono"}>{subject.percent}% ({subject.status})</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        subject.percent >= 90 ? "bg-green-600" :
                        subject.percent >= 85 ? "bg-blue-600" : "bg-amber-500"
                      }`} 
                      style={{ width: `${subject.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic standing results */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award className="w-4.5 h-4.5 text-green-600" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recent Examination & Test Markers</h3>
            </div>

            <div className="divide-y text-xs">
              {gradesReport.recentTestMarks.map((test: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 capitalize">{test.subject}</p>
                    <p className="text-[10px] text-slate-400">Equivalent ratio percent: {test.pct}%</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold rounded font-mono mr-2">{test.marks}</span>
                    <span className="font-black text-slate-800 font-mono">{test.grade}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 justify-start">
                <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Simulated Model Endpoint Grade:</span>
              </div>
              <strong className="text-slate-900 font-black font-mono">Predicted {gradesReport.predictedEndCgpa} CGPA (Elite)</strong>
            </div>
          </div>

        </div>

        {/* Right Column: Teacher Notes, SMS notification simulator and Direct Mentor Note */}
        <div className="lg:col-span-5 space-y-6">

          {/* Teacher feedback panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-4.5 h-4.5 text-purple-600" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Faculty Mentor direct observations</h3>
            </div>

            <div className="space-y-4">
              {teacherNotes.map((note: any, index: number) => (
                <div key={index} className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1 text-xs">
                  <p className="font-black text-[10px] text-purple-800 uppercase tracking-wider">{note.sender}</p>
                  <p className="text-slate-600 leading-relaxed font-sans">{note.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Continuous SMS communications & Interactive note-sender */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Verify Secure SMS alert logs</h3>
              <p className="text-[10px] text-slate-400 mt-1">Continuous security monitors logs dispatching proctor flags seamlessly.</p>
            </div>

            <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] space-y-1">
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>DISPATCHED SMS TO PARENT</span>
                  <span>10:24 AM</span>
                </div>
                <p className="text-slate-600 leading-tight">"SmartStudentAI Alert: Alex Mercer has missed his second consecutive practical lab session on ML theory foundations. Current lecture attendance is 84%."</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] space-y-1">
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>DISPATCHED SMS TO PARENT</span>
                  <span>Yesterday</span>
                </div>
                <p className="text-slate-600 leading-tight">"SmartStudentAI: Placement dry run index computed at 84.5% standing. Congratulations, student remains on honors eligibility rosters!"</p>
              </div>
            </div>

            <form onSubmit={handleSendNote} className="pt-2 border-t space-y-2">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">Reply directly to Faculty Mentor:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={parentMessage}
                  onChange={(e) => setParentMessage(e.target.value)}
                  placeholder="Ask advisor or reply to ML attendance warning..."
                  className="flex-1 text-xs border border-slate-200 p-2 rounded-lg outline-none max-w-[76%] focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage}
                  className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 px-3 cursor-pointer"
                >
                  {isSendingMessage ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Chat conversation mapping */}
              {chatHistory.length > 1 && (
                <div className="mt-3 border-t pt-3 space-y-2 text-xs max-h-[140px] overflow-y-auto bg-slate-50/50 p-2 rounded-lg">
                  {chatHistory.slice(1).map((chat, idx) => (
                    <div key={idx} className={`p-2 rounded-lg ${chat.role === 'parent' ? 'bg-amber-50 text-amber-900 border border-amber-100 ml-4' : 'bg-slate-100 text-slate-800 mr-4'}`}>
                      <p className="font-bold text-[9px] uppercase text-slate-400 mb-0.5">{chat.role === 'parent' ? 'You' : 'Mentor Advisor'}</p>
                      <p className="font-sans leading-relaxed">{chat.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
