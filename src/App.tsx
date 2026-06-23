import React, { useState, useEffect } from "react";
import { 
  Sparkles, Layers, Code2, Users, FileText, Mic, BookOpen, Briefcase, 
  Trophy, TrendingUp, Cpu, ShieldAlert, Award, FileSpreadsheet, 
  Search, Bell, UserCheck, LogOut, User, Menu, X, PlusCircle, Megaphone,
  Download, ArrowRight, ChevronRight, ArrowLeft
} from "lucide-react";
import { UserProfile, Announcement, StudentSkillScores } from "./types";
import AIAssistant from "./components/AIAssistant";
import HackathonModule from "./components/HackathonModule";
import EssaySpeechGDModules from "./components/EssaySpeechGDModules";
import StatsDashboard from "./components/StatsDashboard";
import TalentReadiness from "./components/TalentReadiness";
import ParentDashboard from "./components/ParentDashboard";
import CareerGuidance from "./components/CareerGuidance";
import PerformanceAnalytics from "./components/PerformanceAnalytics";

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authRole, setAuthRole] = useState<'student' | 'faculty' | 'admin' | 'parent'>('student');
  const [authRegNo, setAuthRegNo] = useState("");
  const [authDept, setAuthDept] = useState("");
  const [authSem, setAuthSem] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

  // OTP Multifactor variables
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSentMessage, setOtpSentMessage] = useState("");
  const [pendingUserPayload, setPendingUserPayload] = useState<any | null>(null);

  // Tabs navigation layout
  const [activeTab, setActiveTab ] = useState("dashboard");
  const [statsSubView, setStatsSubView] = useState<string | undefined>(undefined);
  const [talentSubView, setTalentSubView] = useState<"placement" | "resume" | "interview" | undefined>(undefined);
  const [softSubView, setSoftSubView] = useState<"gd" | "essay" | "speech" | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAiMentor, setShowAiMentor] = useState(false);
  const [showGuide, setShowGuide] = useState(() => localStorage.getItem("student_portal_show_guide") !== "false");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [adminKey, setAdminKey] = useState("");
  const [adminDBView, setAdminDBView] = useState<"hackathon" | "study-goals" | "aptitude" | "subject-expertise">("hackathon");
  const [adminDBRows, setAdminDBRows] = useState<any[]>([]);
  const [adminDBLoading, setAdminDBLoading] = useState(false);
  const [adminDBError, setAdminDBError] = useState("");
  const [adminDBCount, setAdminDBCount] = useState(0);
  
  const dashboardModulesList = [
    {
      id: "gd",
      category: "AI GD Performance",
      title: "AI-Based Group Discussion Prediction",
      desc: "Evaluate team interactions, communication metrics, confidence levels, and participant leadership scores.",
      actionText: "Analyze GD Speech",
      bg: "bg-indigo-50 border-indigo-200 text-indigo-700",
      onClick: () => { setActiveTab("soft-suite"); setSoftSubView("gd"); }
    },
    {
      id: "essay",
      category: "AI Academic Writing",
      title: "AI-Based Essay Writing Efficiency",
      desc: "Scan grammar patterns, vocabulary indices, sentence formatting complexities, and predictive plagiarism checks.",
      actionText: "Verify Essay Analytics",
      bg: "bg-rose-50 border-rose-200 text-rose-700",
      onClick: () => { setActiveTab("soft-suite"); setSoftSubView("essay"); }
    },
    {
      id: "speech",
      category: "Speech Lab",
      title: "AI-Based Speech Efficiency Analyzer",
      desc: "Evaluate fluency parameters, custom speed rates, pronunciation clarity metrics, and vocal filler ratios.",
      actionText: "Scan Speech Stream",
      bg: "bg-pink-50 border-pink-205 text-pink-700",
      onClick: () => { setActiveTab("soft-suite"); setSoftSubView("speech"); }
    },
    {
      id: "hackathon",
      category: "Contests Platform",
      title: "AI-Based Hackathon Sandboxes",
      desc: "Join real-time coding challenges. Run dynamic tests against automatic edge compilers with instant feedback.",
      actionText: "Open Compiler Interface",
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
      onClick: () => { setActiveTab("hackathon"); }
    },
    {
      id: "expertise",
      category: "Expertise Engine",
      title: "Subject Expertise Prediction System",
      desc: "Machine Learning models tracking attendance performance matrices, scoreboards, and syllabus margins.",
      actionText: "Open Academic Tracks",
      bg: "bg-blue-50 border-blue-200 text-blue-700",
      onClick: () => { setActiveTab("stats-report"); setStatsSubView("expertise"); }
    },
    {
      id: "efficiency",
      category: "Cognitive Diagnostics",
      title: "Student Efficiency Prediction Test",
      desc: "Solve continuous quick aptitude logic diagnostic quizzes, tracking cognitive metrics live.",
      actionText: "Start Efficiency Quiz",
      bg: "bg-purple-50 border-purple-200 text-purple-700",
      onClick: () => { setActiveTab("stats-report"); setStatsSubView("efficiency"); }
    },
    {
      id: "skills",
      category: "Capability Maps",
      title: "Student Skills Marks Management",
      desc: "Simulated Radar diagrams marking presentation levels, global confidence indices, and core systems skills.",
      actionText: "Calibrate Marks Radar",
      bg: "bg-teal-50 border-teal-200 text-teal-700",
      onClick: () => { setActiveTab("stats-report"); setStatsSubView("skills"); }
    },
    {
      id: "resume",
      category: "ATS Optimizers",
      title: "AI Resume & ATS Parser",
      desc: "Grade markdown details, find missing technical skills, index layout errors, and predict recruitment screening grades.",
      actionText: "Parse PDF Transcript",
      bg: "bg-slate-100 border-slate-300 text-slate-800",
      onClick: () => { setActiveTab("talent-placement"); setTalentSubView("resume"); }
    },
    {
      id: "interview",
      category: "Video Simulations",
      title: "AI Mock Interviewing System",
      desc: "Evaluate verbal structure and concept gaps under adaptive real-time engineering queries with prompt-based grading.",
      actionText: "Simulate Mock Queries",
      bg: "bg-cyan-50 border-cyan-200 text-cyan-700",
      onClick: () => { setActiveTab("talent-placement"); setTalentSubView("interview"); }
    },
    {
      id: "placement",
      category: "Recruitment Heuristics",
      title: "Placement Readiness Predictor",
      desc: "Predict employment readiness indices matching active top employer hiring quotas using continuous regression matrices.",
      actionText: "Predict Career Eligibility",
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      onClick: () => { setActiveTab("talent-placement"); setTalentSubView("placement"); }
    },
    {
      id: "career",
      category: "Co-pilot Systems",
      title: "AI Career Guidance Navigator",
      desc: "Recommend courses, roadmap steps, next certifications, and trending industry platforms aligned with goals.",
      actionText: "Open Advising Module",
      bg: "bg-sky-50 border-sky-200 text-sky-700",
      onClick: () => { setActiveTab("career-guidance"); }
    },
    {
      id: "attendance",
      category: "Academic Syncs",
      title: "Smart Attendance Analytics & Goals",
      desc: "Define target study times, forecast future attendance, and analyze academic fatigue indices.",
      actionText: "Define Dynamic Goals",
      bg: "bg-fuchsia-100 border-fuchsia-200 text-fuchsia-800",
      onClick: () => { setActiveTab("stats-report"); setStatsSubView("goals"); }
    },
    {
      id: "analytics",
      category: "Historical Reports",
      title: "Student Performance Analytics",
      desc: "Analyze semester SGPA scores, class ranks, and campus performance trends via direct chart reports.",
      actionText: "Browse Analytics Portal",
      bg: "bg-violet-50 border-violet-200 text-violet-700",
      onClick: () => { setActiveTab("performance-analytics"); }
    }
  ];

  // Common application dynamic states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifyCount, setNotifyCount] = useState(2);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [selectedFacultyStudent, setSelectedFacultyStudent] = useState<any | null>(null);

  // Faculty mark modifiers
  const [facultySkillModifiers, setFacultySkillModifiers] = useState<StudentSkillScores>({
    communication: 75, coding: 80, leadership: 60, teamwork: 70, technical: 80, presentation: 70, creativity: 75
  });

  // Announcement post states (Faculty/Admin)
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnCategory, setNewAnnCategory] = useState<'hackathon' | 'exam' | 'placement' | 'general'>('general');

  useEffect(() => {
    // Attempt load initial announcements
    fetchAnnouncements();
    // Attempt load students list (for Faculty and Administrator analytical tables)
    fetchStudents();
  }, [currentUser]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      setStudentList(data.students || []);
      if (data.students && data.students.length > 0) {
        setSelectedFacultyStudent(data.students[0]);
        setFacultySkillModifiers(data.students[0].skills);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminDbData = async (view: "hackathon" | "study-goals" | "aptitude" | "subject-expertise") => {
    if (!adminKey) {
      setAdminDBError("Enter admin key to view the database.");
      return;
    }
    setAdminDBLoading(true);
    setAdminDBError("");
    setAdminDBRows([]);
    setAdminDBCount(0);

    try {
      const res = await fetch(`/admin/db/${view}?admin_key=${encodeURIComponent(adminKey)}`);
      const data = await res.json();
      if (!res.ok) {
        setAdminDBError(data.error || "Unable to load database records.");
        return;
      }
      setAdminDBRows(data.rows || []);
      setAdminDBCount(data.count || (data.rows || []).length);
    } catch (err) {
      setAdminDBError("Unable to connect to the admin database endpoint.");
    } finally {
      setAdminDBLoading(false);
    }
  };

  const downloadAdminDatabase = () => {
    if (!adminKey) {
      setAdminDBError("Enter admin key to download the DB file.");
      return;
    }
    window.location.href = `/admin/db/download?admin_key=${encodeURIComponent(adminKey)}`;
  };

  const exportAdminCsv = () => {
    if (!adminDBRows.length) {
      setAdminDBError("Load database rows before exporting to CSV.");
      return;
    }

    const headers = Object.keys(adminDBRows[0]);
    const csvRows = [
      headers.join(","),
      ...adminDBRows.map((row) => headers.map((key) => {
        const value = row[key];
        const cell = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
        return `"${cell.replace(/"/g, '""')}"`;
      }).join(","))
    ];

    const csvContent = csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${adminDBView.replace(/-/g, '_')}_records.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // Quick preset demo login helper (Frictionless checking for evaluators)
  const handleQuickDemoLogin = async (role: 'student' | 'faculty' | 'admin' | 'parent') => {
    let email = "alex.mercer@college.edu";
    if (role === 'faculty') email = "evelyn@college.edu";
    if (role === 'admin') email = "albert.vance@college.edu";
    if (role === 'parent') email = "parent.mercer@college.edu";

    try {
      setAuthError("");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" })
      });
      const data = await res.json();
      if (data.user) {
        setPendingUserPayload(data.user);
        setOtpSentMessage(`Secure simulated SMS dispatched to registered device ending with *8892. Enter PIN code below. (Access PIN: 4892)`);
        setOtpCode("");
        setShowOtpScreen(true);
      } else {
        setAuthError(data.error || "Login simulation error.");
      }
    } catch (err) {
      setAuthError("Frictionless authentication systems connecting error.");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      if (isRegistering) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
            role: authRole,
            regNo: authRegNo,
            department: authDept,
            semester: authSem
          })
        });
        const data = await res.json();
        if (data.user) {
          setPendingUserPayload(data.user);
          setOtpSentMessage(`Success establishing registration parameters! A secure SMS has been dispatched. Enter PIN. (Access PIN: 4892)`);
          setOtpCode("");
          setShowOtpScreen(true);
        } else {
          setAuthError(data.error || "Registration rejected.");
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (data.user) {
          setPendingUserPayload(data.user);
          setOtpSentMessage(`A multi-factor secure SMS verification check triggered for ${data.user.name}. (Access PIN: 4892)`);
          setOtpCode("");
          setShowOtpScreen(true);
        } else {
          setAuthError(data.error || "Credentials error.");
        }
      }
    } catch (err) {
      setAuthError("Failed to communicate with authentication nodes.");
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === "4892" && pendingUserPayload) {
      setCurrentUser(pendingUserPayload);
      setShowOtpScreen(false);
      setPendingUserPayload(null);
      if (pendingUserPayload.role === "parent") {
        setActiveTab("parent-portal");
      } else {
        setActiveTab("dashboard");
      }
    } else {
      setAuthError("Incorrect Secure PIN validation code. Standard evaluation code is 4892.");
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAnnTitle,
          content: newAnnContent,
          sender: currentUser?.name || "Faculty Board",
          category: newAnnCategory
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewAnnTitle("");
        setNewAnnContent("");
        fetchAnnouncements();
        setNotifyCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStudentSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyStudent) return;

    try {
      const res = await fetch(`/api/students/${selectedFacultyStudent.id}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: facultySkillModifiers })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully saved updated skill marking criteria for ${selectedFacultyStudent.name}!`);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const selectStudentOnFacultyPanel = (student: any) => {
    setSelectedFacultyStudent(student);
    setFacultySkillModifiers(student.skills);
  };

  // If user is not logged in, show Auth Gate Or MF SMS Verification Gate
  if (!currentUser) {
    if (showOtpScreen) {
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-6 font-sans antialiased text-slate-900 leading-normal">
          <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-3xl">🔑</span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-2">SMS Multi-factor Verification</h1>
              <p className="text-[11px] text-slate-500 font-medium">A dynamic OTP has been generated for secure candidate authentication logs.</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/50 p-3.5 rounded-xl text-xs text-amber-800 font-sans leading-relaxed animate-pulse">
              {otpSentMessage}
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <label className="text-[10px] font-black text-slate-400 block uppercase tracking-wider mb-1">Enter 4-Digit PIN Access Token:</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  placeholder="e.g. 4892"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center text-xl tracking-widest font-mono border border-slate-200 p-2.5 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg text-center font-bold">
                  {authError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowOtpScreen(false); setAuthError(""); }}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Back to Portal
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Verify Access
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans antialiased text-slate-900">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-xl mx-auto shadow-md shadow-blue-500/10">S</div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">Smart Student <span className="text-blue-600">AI</span> Portal</h1>
            <p className="text-xs text-slate-400 font-medium">Undergraduate Performance Forecasting & Analytics Suite</p>
          </div>

          {/* Quick Preset Demo Login Box */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Frictionless Quick Demo Logins</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                Student
              </button>
              <button 
                type="button"
                onClick={() => handleQuickDemoLogin('faculty')}
                className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                Faculty
              </button>
              <button 
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer hover:shadow-xs"
              >
                Dean Admin
              </button>
              <button 
                type="button"
                onClick={() => handleQuickDemoLogin('parent')}
                className="py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer hover:shadow-xs"
              >
                Parent Portal
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="absolute bg-white px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or Use Registry Logins</span>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Candidate Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neil Armstrong"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none text-slate-800"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">University Email Address:</label>
              <input
                type="email"
                required
                placeholder="candidate@college.edu"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Registry Password:</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none text-slate-800"
              />
            </div>

            {isRegistering && (
              <div className="space-y-4 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Role Type</label>
                    <select
                      value={authRole}
                      onChange={(e) => setAuthRole(e.target.value as any)}
                      className="w-full text-xs border border-slate-200 p-2 rounded outline-none text-slate-705 bg-white"
                    >
                      <option value="student">Student Scholar</option>
                      <option value="parent">Parent / Guardian</option>
                      <option value="faculty">Faculty Member</option>
                      <option value="admin">Administrator (Dean)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Regist. ID No</label>
                    <input
                      type="text"
                      placeholder="e.g. STUD2026"
                      value={authRegNo}
                      onChange={(e) => setAuthRegNo(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={authDept}
                      onChange={(e) => setAuthDept(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Semester / Batch</label>
                    <input
                      type="text"
                      placeholder="e.g. VI Semester"
                      value={authSem}
                      onChange={(e) => setAuthSem(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {authError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {isRegistering ? "Build Portal Profile" : "Secure Portal Access"}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => { setIsRegistering(!isRegistering); setAuthError(""); }}
              className="text-xs text-blue-600 hover:underline"
            >
              {isRegistering ? "Existing scholar? Secure Login" : "New candidate? Build a Profile"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-x-hidden antialiased">
      {/* 1. SIDEBAR NAVIGATION - "Professional Polish" matching design style */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between transform ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-0 lg:translate-x-0"
      } transition-transform duration-300 lg:relative`}>
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg text-white">S</div>
              <span className="font-bold tracking-tight text-base">SmartStudent <span className="text-blue-400 font-black">AI</span></span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 bg-slate-800 rounded hover:bg-slate-705"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {/* Common Section */}
            <button
              onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition text-left cursor-pointer ${
                activeTab === "dashboard" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" /> Multi-traits Overview
            </button>

             {/* AI Predictive Evaluation Suite */}
            <div className="py-2.5">
              <span className="px-4 text-[9px] font-black text-slate-505 uppercase tracking-widest block mb-1">Predictive Modules</span>
              
              <button
                onClick={() => { setActiveTab("soft-suite"); setSoftSubView(undefined); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                  activeTab === "soft-suite" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> AI Speech & GD Lab
              </button>

              <button
                onClick={() => { setActiveTab("hackathon"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                  activeTab === "hackathon" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Coding Hackathons
              </button>

              <button
                onClick={() => { setActiveTab("stats-report"); setStatsSubView(undefined); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                  activeTab === "stats-report" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Subject Expertise pred.
              </button>

              <button
                onClick={() => { setActiveTab("talent-placement"); setTalentSubView(undefined); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                  activeTab === "talent-placement" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Placement Preparatory
              </button>

              <button
                onClick={() => { setActiveTab("career-guidance"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                  activeTab === "career-guidance" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div> AI Career Guidance
              </button>

              <button
                onClick={() => { setActiveTab("performance-analytics"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                  activeTab === "performance-analytics" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> Performance Analytics
              </button>
            </div>

            {/* Role Specific Views */}
            {currentUser.role === "faculty" && (
              <div className="py-2">
                <span className="px-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Faculty Control Panel</span>
                <button
                  onClick={() => { setActiveTab("faculty-marks"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                    activeTab === "faculty-marks" ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <UserCheck className="w-4 h-4" /> Student grading marks
                </button>
              </div>
            )}

            {currentUser.role === "admin" && (
              <div className="py-2">
                <span className="px-4 text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-1">Dean Strategy Board</span>
                <button
                  onClick={() => { setActiveTab("admin-dean"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                    activeTab === "admin-dean" ? "bg-slate-800 text-rose-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Award className="w-4 h-4" /> Strategic KPIs
                </button>
              </div>
            )}

            {currentUser.role === "parent" && (
              <div className="py-2">
                <span className="px-4 text-[9px] font-black text-amber-500 uppercase tracking-widest block mb-1">Parent Gate Portal</span>
                <button
                  onClick={() => { setActiveTab("parent-portal"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                    activeTab === "parent-portal" ? "bg-slate-800 text-amber-500" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <User className="w-4 h-4" /> Parent Monitoring
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* User Card inside Sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 object-cover" 
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-slate-100">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase font-bold">{currentUser.role === 'admin' ? "Dean Officer" : currentUser.regNo || currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="w-full py-1.5 bg-slate-805 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-red-400 hover:text-red-300 border border-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" /> Secure Lockout
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB CANVAS CONTENT */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
        {/* TOP BAR / UTILITY NAVIGATION HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-72 md:w-96 border border-slate-200 shadow-inner">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search AI metrics, coding contest parameters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-xs w-full text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Bulletin triggers */}
            <div className="relative cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <Bell className="w-4.5 h-4.5 text-slate-500 hover:text-slate-800" />
              {notifyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full text-[8px] font-black text-white flex items-center justify-center">
                  {notifyCount}
                </span>
              )}
            </div>

            <button
              onClick={handlePrintReport}
              className="px-3.5 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm shadow-blue-500/10"
            >
              <Download className="w-3.5 h-3.5" /> PDF report
            </button>

            {/* Toggle AI Mentor Button */}
            <button
              onClick={() => setShowAiMentor(!showAiMentor)}
              className="px-3 py-1.5 md:py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Mentor
            </button>
          </div>
        </header>

        {/* CONTAINER CONTENT WRAPPER */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 pb-20 max-w-7xl mx-auto w-full">
          
          {/* Dynamic Smart Multi-Level Back Button & Breadcrumbs Navigation */}
          {activeTab !== "dashboard" && (
            <div id="navigation-breadcrumbs-bar" className="mb-5 flex flex-wrap items-center justify-between gap-3 animate-fadeIn border-b border-slate-100 pb-4">
              <button
                id="back-navigation-btn"
                onClick={() => {
                  if (statsSubView !== undefined) {
                    setStatsSubView(undefined);
                  } else if (talentSubView !== undefined) {
                    setTalentSubView(undefined);
                  } else if (softSubView !== undefined) {
                    setSoftSubView(undefined);
                  } else {
                    setActiveTab("dashboard");
                  }
                }}
                className="group inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-blue-200 transition duration-155 shadow-xs cursor-pointer select-none"
                title="Navigate Back"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span>
                  {statsSubView !== undefined || talentSubView !== undefined || softSubView !== undefined 
                    ? `Back to ${activeTab.replace("-", " ")} Overview`
                    : "Back to Home Dashboard"
                  }
                </span>
              </button>
              
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1 select-none">
                <span className="text-slate-400 font-medium">Location:</span>
                <span className="text-slate-600 font-bold">{activeTab.replace("-", " ")}</span>
                {(statsSubView || talentSubView || softSubView) && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="text-blue-600 font-black">{statsSubView || talentSubView || softSubView}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ======================= */}
          {/* VIEW: MAIN DASHBOARD    */}
          {/* ======================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Header card welcome */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">University Student Performance Hub</h1>
                    {!showGuide && (
                      <button
                        onClick={() => {
                          setShowGuide(true);
                          localStorage.setItem("student_portal_show_guide", "true");
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition cursor-pointer"
                        title="Show Interactive Tour Guide"
                      >
                        Help Map
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-450 mt-1">
                    System predicted Placement readiness metric index: <strong className="text-blue-600">84.5%</strong> (Class Honors Standing)
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <div className="bg-white border p-3 rounded-xl shadow-sm text-center min-w-[120px]">
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase mb-1">CONTEST RANK</span>
                    <strong className="text-sm font-black text-slate-850">#2 / 120</strong>
                  </div>
                  <div className="bg-white border p-3 rounded-xl shadow-sm text-center min-w-[120px]">
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase mb-1">ACADEMIC AVG</span>
                    <strong className="text-sm font-black text-slate-850">9.1 SGPA</strong>
                  </div>
                </div>
              </div>

              {/* Onboarding Guidance Tour Guide HUD */}
              {showGuide && (
                <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-indigo-900/45 p-5 rounded-2xl text-white shadow-xl relative overflow-hidden animate-fadeIn">
                  <div className="absolute top-0 right-0 p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setShowGuide(false);
                        localStorage.setItem("student_portal_show_guide", "false");
                      }}
                      className="text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 p-1.5 rounded-lg transition text-xs font-bold cursor-pointer"
                      title="Dimiss Onboarding Map Guide"
                    >
                      💡 Dismiss Guide
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black tracking-tight text-white uppercase font-mono">Interactive Hub Roadmap & Quick Guide</h2>
                        <p className="text-xs text-slate-300">Understand your AI-powered performance portal in 15 seconds. High efficiency navigation map.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 pt-1.5">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">STORY 1. Soft Skills</span>
                        <h4 className="font-bold text-white text-xs">AI GD & Essay Lab</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Evaluates vocal filler stats, speech metrics & essay plagiarism parameters instantly.</p>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-1">STORY 2. Coding sandbox</span>
                        <h4 className="font-bold text-white text-xs">Sandboxed Compilers</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Solve complex edge testing cases with live compiler diagnostics and instant output.</p>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">STORY 3. Academic Benchmarks</span>
                        <h4 className="font-bold text-white text-xs">Expertise & Goals</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Manage weekly targets with persistent study outputs and 4-week comparison trend lines.</p>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block mb-1">STORY 4. Job Readiness</span>
                        <h4 className="font-bold text-white text-xs">Talent Ready & ATS</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Audit resumes, conduct diagnostic interview simulations & predict job placements.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Live search feedback notice */}
              {searchQuery && (
                <div className="flex items-center justify-between bg-blue-50 text-blue-800 border border-blue-150 rounded-xl p-3.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>Filtering predictive portal modules matching <strong>"{searchQuery}"</strong></span>
                  </div>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[11px] font-bold bg-white text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Portal Modules shortcuts cards */}
              {(() => {
                const queryFiltered = dashboardModulesList.filter((mod) => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    mod.title.toLowerCase().includes(q) ||
                    mod.category.toLowerCase().includes(q) ||
                    mod.desc.toLowerCase().includes(q)
                  );
                });

                if (queryFiltered.length === 0) {
                  return (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4 animate-fadeIn">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">No matching student traits or modules found</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                        We couldn't find any predictive modules matching "{searchQuery}". Try searching for categories like "GD", "Resume", "Goals", "Hackathon", or "Quiz".
                      </p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Reset Search Parameters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
                    {queryFiltered.map((mod) => (
                      <div key={mod.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-350 hover:shadow-md transition">
                        <div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${mod.bg}`}>
                            {mod.category}
                          </span>
                          <h3 className="font-bold text-slate-850 text-sm mt-3 leading-snug">{mod.title}</h3>
                          <p className="text-xs text-slate-450 leading-relaxed mt-1.5 font-sans">{mod.desc}</p>
                        </div>
                        <button 
                          onClick={mod.onClick}
                          className="mt-4 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline text-left cursor-pointer uppercase tracking-widest font-mono"
                        >
                          {mod.actionText} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Announcements / Notifications list board */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 text-slate-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4.5 h-4.5 text-blue-500" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">Announcements & Bulletins Noticeboard</h3>
                  </div>
                  {!showGuide && (
                    <button
                      onClick={() => {
                        setShowGuide(true);
                        localStorage.setItem("student_portal_show_guide", "true");
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:underline bg-slate-50 border border-slate-200 px-2 py-1 rounded cursor-pointer"
                    >
                      💡 Access Help Map
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          ann.category === 'hackathon' ? "bg-emerald-100 text-emerald-800" :
                          ann.category === 'placement' ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-800"
                        }`}>
                          {ann.category}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <span className="font-bold text-slate-600">{ann.sender}</span>
                          <span>•</span>
                          <span>{new Date(ann.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-850">{ann.title}</h4>
                      <p className="text-slate-600 font-sans leading-relaxed">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: SPEECH, ESSAY & GD LAB TABS PANEL */}
          {/* ======================================= */}
          {activeTab === "soft-suite" && (
            <EssaySpeechGDModules currentUserId={currentUser.id} initialView={softSubView} />
          )}

          {/* ======================================= */}
          {/* VIEW: CODING HACKATHON COMPILER PANEL */}
          {/* ======================================= */}
          {activeTab === "hackathon" && (
            <HackathonModule currentUserId={currentUser.id} />
          )}

          {/* ======================================= */}
          {/* VIEW: SUBJECT EXPERTISE PREDICTIONS     */}
          {/* ======================================= */}
          {activeTab === "stats-report" && (
            <StatsDashboard 
              currentUserId={currentUser.id} 
              userRole={currentUser.role}
              studentProfile={{ id: currentUser.id, name: currentUser.name, regNo: currentUser.regNo, email: currentUser.email }} 
              initialView={statsSubView}
            />
          )}

          {/* ======================================= */}
          {/* VIEW: PLACEMENT TALENT READINESS GAUGE */}
          {/* ======================================= */}
          {activeTab === "talent-placement" && (
            <TalentReadiness initialView={talentSubView} />
          )}

          {/* ======================================= */}
          {/* VIEW: AI CAREER GUIDANCE ADVISING UNIT  */}
          {/* ======================================= */}
          {activeTab === "career-guidance" && (
            <CareerGuidance />
          )}

          {/* ======================================= */}
          {/* VIEW: COMPREHENSIVE PERFORMANCE ANALYS  */}
          {/* ======================================= */}
          {activeTab === "performance-analytics" && (
            <PerformanceAnalytics currentUserId={currentUser.id} />
          )}

          {/* ======================================= */}
          {/* VIEW: SECURE PARENT MONITORING PORTAL  */}
          {/* ======================================= */}
          {activeTab === "parent-portal" && (
            <ParentDashboard parentId={currentUser.id} />
          )}

          {/* ======================================= */}
          {/* VIEW: FACULTY MARKS SETTERS PANEL       */}
          {/* ======================================= */}
          {activeTab === "faculty-marks" && (
            <div className="space-y-6">
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <div className="pb-3 border-b border-slate-100 mb-5">
                  <h3 className="font-bold text-slate-800 text-sm">Faculty Evaluation Roster Systems</h3>
                  <p className="text-xs text-slate-450 mt-1">Directly adjust student oral, logical and dynamic technical scores to recalibrate prediction reports.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Student list picker */}
                  <div className="lg:col-span-5 border rounded-lg overflow-hidden">
                    <span className="block text-[10px] text-slate-450 bg-slate-50 font-bold p-2.5 uppercase border-b">SCHOLARS ROSTER</span>
                    <div className="divide-y max-h-[350px] overflow-y-auto">
                      {studentList.map((stud) => (
                        <button
                          key={stud.id}
                          onClick={() => selectStudentOnFacultyPanel(stud)}
                          className={`w-full text-left p-3 flex items-center justify-between text-xs cursor-pointer ${
                            selectedFacultyStudent?.id === stud.id ? "bg-slate-50" : "hover:bg-slate-50/50"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-800">{stud.name}</p>
                            <p className="text-[10px] text-slate-450">{stud.department}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marking formulationSliders */}
                  {selectedFacultyStudent && (
                    <form onSubmit={handleUpdateStudentSkills} className="lg:col-span-7 space-y-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-700">Currently Editing: <strong className="text-slate-900">{selectedFacultyStudent.name}</strong> ({selectedFacultyStudent.regNo})</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(facultySkillModifiers).map((skillKey) => {
                          const val = (facultySkillModifiers as any)[skillKey] || 60;
                          return (
                            <div key={skillKey}>
                              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                                <span className="uppercase">{skillKey} Marks:</span>
                                <span className="text-indigo-600 font-mono">{val}/100</span>
                              </div>
                              <input
                                type="range"
                                min="0" max="100"
                                value={val}
                                onChange={(e) => setFacultySkillModifiers((prev) => ({ ...prev, [skillKey]: Number(e.target.value) }))}
                                className="w-full accent-indigo-600"
                              />
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 bg-slate-900 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                      >
                        Commit Calibrated Score Matrix
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Add Bulletins Form box */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="pb-2 border-b">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Post an Academic Announcement Notice</h3>
                </div>

                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Notice Header Title:</label>
                      <input
                        type="text"
                        required
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        placeholder="e.g. Mandatory Placement Dry-run checks"
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Notice Category Tag:</label>
                      <select
                        value={newAnnCategory}
                        onChange={(e) => setNewAnnCategory(e.target.value as any)}
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none text-slate-700"
                      >
                        <option value="general">General Advisory</option>
                        <option value="hackathon">Hackathon Alert</option>
                        <option value="exam">Curriculum Exam</option>
                        <option value="placement">Placements Drive</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Announcement Script Content:</label>
                    <textarea
                      required
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      rows={4}
                      placeholder="Enter the notice guidelines for student readers..."
                      className="w-full text-xs border border-slate-200 p-3 rounded-lg outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    Deploy Academic Notice
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: DEAN ADMINISTRATION STRATEGY BOX  */}
          {/* ======================================= */}
          {activeTab === "admin-dean" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded-xl p-4 text-center">
                  <span className="block text-[9px] text-slate-400 font-black uppercase">AVERAGE PLACEMENTS INDEX</span>
                  <strong className="text-2xl font-black text-blue-600 mt-1 block">85.4%</strong>
                  <span className="text-[10px] text-green-600 font-bold">↑ 4% this month</span>
                </div>
                <div className="bg-white border rounded-xl p-4 text-center">
                  <span className="block text-[9px] text-slate-400 font-black uppercase">TOTAL ENROLLED SCHOLARS</span>
                  <strong className="text-2xl font-black text-indigo-650 mt-1 block font-mono">1,240</strong>
                  <span className="text-[10px] text-slate-400">All Departments included</span>
                </div>
                <div className="bg-white border rounded-xl p-4 text-center">
                  <span className="block text-[9px] text-slate-400 font-black uppercase">AI CONTEST ENGAGEMENTS</span>
                  <strong className="text-2xl font-black text-amber-600 mt-1 block font-mono">84%</strong>
                  <span className="text-[10px] text-green-600 font-bold">Active programmers</span>
                </div>
                <div className="bg-white border rounded-xl p-4 text-center">
                  <span className="block text-[9px] text-slate-400 font-black uppercase">SYSTEM HEURISTIC STATUS</span>
                  <strong className="text-2xl font-black text-green-600 mt-1 block">100%</strong>
                  <span className="text-[10px] text-slate-400">All models online</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="font-extrabold text-sm text-blue-300 uppercase tracking-widest">Enterprise Strategic KPI Tracker</h3>
                  <p className="text-[11px] text-slate-400">Predictive academic failure prevention metrics & job placement readiness charts.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cohort Skill Index averages:</span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between mb-1 text-[11px]"><span>Software Coding Foundations</span><span className="font-bold">90%</span></div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: "90%" }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-[11px]"><span>Continuous Mathematical reasoning</span><span className="font-bold font-mono">74%</span></div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: "74%" }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-[11px]"><span>Assertive GD oral confidence</span><span className="font-bold">82%</span></div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: "82%" }}></div></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-850 p-4 border border-slate-800 rounded-xl space-y-3">
                    <span className="text-[10px] text-blue-300 font-black uppercase tracking-wider block">DEAN PREVENTIVE ALERTS</span>
                    <ul className="space-y-2 text-[11px] text-slate-300">
                      <li className="flex items-start gap-1.5 font-sans leading-relaxed">
                        <span className="text-red-500 font-bold shrink-0">•</span>
                        <span>Flag: 12% of scholars in CSE showcase weak Database performance prediction. Suggested intervention scheduled.</span>
                      </li>
                      <li className="flex items-start gap-1.5 font-sans leading-relaxed">
                        <span className="text-green-400 font-bold shrink-0">•</span>
                        <span>Optimism: High compiler code trials detected. Dynamic score increases average readiness metrics across-the-board.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Admin DB Inspector</h3>
                    <p className="text-[11px] text-slate-500 max-w-2xl">
                      Use this secure admin panel to inspect persisted hackathon submissions, study goals, and aptitude records from the SQLite database.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto]">
                    <input
                      type="password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="Enter admin key"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none"
                    />
                    <button
                      onClick={() => fetchAdminDbData(adminDBView)}
                      className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                    >
                      Load Data
                    </button>
                    <button
                      onClick={downloadAdminDatabase}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Download DB
                    </button>
                    <button
                      onClick={exportAdminCsv}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["hackathon", "study-goals", "aptitude", "subject-expertise"] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setAdminDBView(view)}
                      className={`rounded-full px-4 py-2 text-xs font-bold uppercase transition ${adminDBView === view ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {view.replace('-', ' ')}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {adminDBError && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                      {adminDBError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-[11px] text-slate-500">Selected table: <strong>{adminDBView.replace('-', ' ')}</strong></span>
                    <span className="text-[11px] text-slate-500">Records loaded: <strong>{adminDBLoading ? 'Loading…' : adminDBCount}</strong></span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600">
                          {(adminDBRows[0] ? Object.keys(adminDBRows[0]) : []).map((col) => (
                            <th key={col} className="border-b border-slate-200 px-3 py-2 font-semibold uppercase tracking-wide">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {adminDBRows.length === 0 && (
                          <tr>
                            <td colSpan={adminDBRows[0] ? Object.keys(adminDBRows[0]).length : 1} className="px-3 py-4 text-slate-500">
                              {adminDBLoading ? 'Loading records...' : 'No records loaded yet. Select a table and click Load Data.'}
                            </td>
                          </tr>
                        )}
                        {adminDBRows.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            {Object.keys(row).map((col) => (
                              <td key={col} className="border-b border-slate-200 px-3 py-3 text-[13px] text-slate-700">
                                {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* BOTTOM STATUS FOOTER BAR */}
        <footer className="absolute bottom-0 inset-x-0 h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[11px] text-slate-400 z-30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              All Predictive Engines Operational
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Smart Student Portal Heuristics: VI 2026 Batch</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" onClick={() => setShowAiMentor(true)} className="hover:text-blue-600 font-bold">Contact AI Advisor</a>
          </div>
        </footer>

        {/* FLOATING CHAT SLIDEOUT OVERLAY PANEL */}
        {showAiMentor && (
          <div className="absolute right-0 inset-y-0 z-50 flex shadow-2xl">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setShowAiMentor(false)}></div>
            <div className="relative h-full flex mt-16 lg:mt-0">
              <AIAssistant 
                currentUserId={currentUser.id} 
                onClose={() => setShowAiMentor(false)} 
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
