import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, TrendingDown, BarChart2, BookOpen, AlertTriangle, Cpu, Terminal, 
  HelpCircle, ChevronRight, Award, Megaphone, Bell, Calendar, Eye, Search, User, Mail,
  Sparkles, X, Mic, CheckSquare, Square, Check, Flame, Clock, Play, Pause, RotateCcw, Timer,
  ClipboardCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SubjectExpertiseReport, AptitudeQuestion, EfficiencyTestResult, StudentSkillScores } from "../types";
import VoiceInputButton from "./VoiceInputButton";

import SubjectExpertiseModule from "./SubjectExpertiseModule";

const SYLLABUS_UNITS = [
  {
    id: "unit_1",
    name: "Unit I: Machine Learning & Core Artificial Intelligence",
    topics: [
      { id: "supervised_vs_unsupervised", name: "Supervised learning models vs Unsupervised density clustering", q: "Explain the difference between supervised learning and unsupervised density clustering algorithms.", ans: "Supervised learning maps input features to known, labeled target variables by learning parameters from annotations (using models like regression or neural classifiers, minimizing losses like cross-entropy or mean squared error). Unsupervised density clustering alternatively groups raw data points using spatial density or geometric positioning (like Euclidean coordinates or Gaussian centers) without any external labels or objective targets." },
      { id: "bias_variance", name: "The Bias-Variance Tradeoff & overfit avoidance patterns", q: "Discuss the bias-variance tradeoff and how to avoid overfitting in neural network optimization.", ans: "The bias-variance tradeoff defines the optimal parameters balancing structural simplicity (high bias, leading to underfitting of key trends) with high parameter complexity (high variance, leading to memorization of stochastic training noise). Overfitting is prevented via early stopping, dropout coefficients, L1/L2 weight penalties, batch normalization, and training data expansions." },
      { id: "gradient_descent", name: "Gradient Descent Optimization & Learning Rate Decay paths", q: "Describe gradient descent optimization and how learning rate decay paths improve convergence.", ans: "Gradient descent is an optimization heuristic that updates model parameters in the reverse direction of computed loss gradients. Learning rate decay schedules (such as step-wise reductions or cosine annealing) dynamically scale the rate down over training epochs, preventing parameter oscillations in localized basins and assuring asymptotic convergence into the global minimum." },
      { id: "neural_networks", name: "Deep Neural Networks and Backpropagation Backpressure metrics", q: "Analyze deep neural networks and evaluate the role of backpropagation backpressure metric profiles.", ans: "Deep neural networks stack nested activation layers to approximate non-linear topological functions. Backpropagation calculates feedback error gradients by propagating loss values backwards using recursive multi-variable chain rule steps. High backpressure flags network bottleneck constraints like vanishing or exploding gradients which inhibit numerical stability and weight adjustment." }
    ]
  },
  {
    id: "unit_2",
    name: "Unit II: High-Scale Distributed Cloud Architectures",
    topics: [
      { id: "rest_api", name: "RESTful API state transition principles and microservices limits", q: "Formulate RESTful API state transition principles and identify practical microservices boundaries.", ans: "RESTful architectures emphasize state transition controls using standard, stateless HTTP verbs (GET, POST, PUT, DELETE) to transfer representations of core resources. Microservices should be partitioned around bounded domain contexts, keeping independent databases, distinct deployable containers, and loose asynchronous broker interactions." },
      { id: "cap_theorem", name: "Database Sharding, horizontal partitions, and CAP Theorem bounds", q: "Contrast database sharding techniques using horizontal partitioning and establish CAP theorem bounds under latency.", ans: "Database sharding separates table datasets horizontally across multiple distinct network storage clusters. The CAP theorem proves a distributed datastore can only assure any two of Consistency, Availability, and Partition Tolerance simultaneously. Under realistic network latencies, engineers must choose between system availability versus read validity." },
      { id: "websockets_polling", name: "WebSockets vs HTTP long-polling real-time communication events", q: "Compare WebSockets and HTTP long-polling communication methods for low-latency streaming applications.", ans: "WebSockets establish a single, long-lived, full-duplex TCP socket that permits bi-directional frame delivery with minimal per-packet metadata overhead. HTTP long-polling conversely issues repeatedly blocking HTTP queries that hold connections open at the server tail, incurring heavy connection pool churn and HTTP header payload bloat." }
    ]
  },
  {
    id: "unit_3",
    name: "Unit III: Advanced Databases & Transaction Controls",
    topics: [
      { id: "concurrency_locks", name: "Optimistic vs Pessimistic locking protocols for parallel writing", q: "Critique the benefits of optimistic locking versus pessimistic locking protocols for concurrent writes.", ans: "Optimistic concurrency uses commit-time validation of row check-values to abort conflicting transactions at transaction tail-ends without taking physical locks. Pessimistic concurrency preemptively secures exclusive database locks (using select for update syntax) to block rival queries, avoiding transaction rollbacks but risking deadlocks and throttling thread throughput." },
      { id: "acid_compliance", name: "ACID transaction isolation states & write-ahead log (WAL) streams", q: "Examine ACID transaction compliance levels and detail the function of write-ahead logging (WAL) streams.", ans: "ACID compliance guarantees transaction reliability via Atomicity, Consistency, Isolation, and Durability. Write-Ahead Logging (WAL) ensures durability by appending all state transformations sequentially to persistent, non-volatile logs before committing modified database indexes to active memory structures." },
      { id: "query_opt", name: "SQL B-Tree indexes and database evaluation plan query limits", q: "Deconstruct SQL B-Tree index traversal paths and explain how database evaluation planners optimize index scans.", ans: "B-Tree indexes navigate logarithmic, highly balanced key arrangements to map target record addresses with minimal disk reads. Engine evaluators optimize queries by checking column cardinality stats catalogs to pick index-only seeks or range ranges over sequental full-table scans to reduce page lookups." }
    ]
  },
  {
    id: "unit_4",
    name: "Unit IV: Advanced Algorithms & Runtime Complexity",
    topics: [
      { id: "hash_indices", name: "Highly nested array flattened map index arrays searches", q: "Outline an optimal strategy for searching deeply nested JSON arrays utilizing direct hash indexing lookups.", ans: "Searching nested JSON arrays is accelerated by hashing nested attributes directly into in-memory hash index maps to achieve O(1) retrieval speeds. Instead of linearly looping complex tree structures at high transaction volumes, flattening elements during ingest and registering paths inside memory caches guarantees constant retrieval performance." },
      { id: "dp_tabulation", name: "Dynamic programming memoized tables vs iterative tabulation stack size", q: "Contrast dynamic programming memoization with iterative tabulation regarding stack size limits and caching efficiency.", ans: "Dynamic programming memoization stores intermediate computed subproblems top-down in recursive configurations, risking stack overflow crashes on deep branches. Iterative tabulation models bottom-up processing in arrays or matrices, avoiding recursive stack limits and maximizing hardware cache line execution locality." },
      { id: "dijkstras_pq", name: "Dijkstra's short path priority queues with Fibonacci heap bounds", q: "Formulate Dijkstra's shortest path algorithm using high-performance Fibonacci heap priority queues.", ans: "Dijkstra's algorithm finds shortest paths from source vertices by iteratively expanding closest unvisited node edges. Incorporating Fibonacci heaps yields amortized O(1) decrease-key performance bounds, lowering total asymptotic runtime complexity bounds over standard binominal priority queue arrays." }
    ]
  }
];

interface WeeklyStudyGoal {
  id: string;
  moduleName: string;
  targetHours: number;
  currentHours: number;
  previousHours?: number;
  history4Weeks?: number[];
}

interface Particle {
  id: number;
  x: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "triangle" | "star";
  delay: number;
  duration: number;
  angle: number;
}

interface StatsDashboardProps {
  currentUserId: string;
  userRole: 'student' | 'faculty' | 'admin';
  studentProfile?: {
    id: string;
    name: string;
    regNo?: string;
    email?: string;
  };
  initialView?: string;
}

const generateConfetti = (): Particle[] => {
  const shapes: ("circle" | "square" | "triangle" | "star")[] = ["circle", "square", "triangle", "star"];
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#14B8A6", // teal
  ];
  return Array.from({ length: 90 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100, // percentage from left
    size: Math.random() * 8 + 6, // 6px to 14px
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    delay: Math.random() * 0.6, // stagger start
    duration: Math.random() * 2.5 + 2, // 2s to 4.5s fall time
    angle: Math.random() * 360, // random rotation
  }));
};

export default function StatsDashboard({ currentUserId, userRole, studentProfile, initialView }: StatsDashboardProps) {
  // Weekly Study Goal states defined dynamically
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyStudyGoal[]>(() => {
    const saved = localStorage.getItem("student_weekly_goals");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => {
          const prev = item.previousHours !== undefined ? item.previousHours : Math.max(0, Math.floor(item.targetHours * 0.6));
          const current = item.currentHours;
          const hist = item.history4Weeks && Array.isArray(item.history4Weeks) && item.history4Weeks.length === 4
            ? [...item.history4Weeks]
            : [
                Math.max(0, parseFloat((item.targetHours * 0.45).toFixed(1))),
                Math.max(0, parseFloat((item.targetHours * 0.7).toFixed(1))),
                prev,
                current
              ];
          hist[2] = prev;
          hist[3] = current;
          return {
            ...item,
            previousHours: prev,
            history4Weeks: hist
          };
        });
      } catch (e) {
        // Fallback below
      }
    }
    return [
      { id: "g1", moduleName: "Data Structures & Algos", targetHours: 12, currentHours: 8, previousHours: 6, history4Weeks: [4, 5.5, 6, 8] },
      { id: "g2", moduleName: "Machine Learning Foundations", targetHours: 10, currentHours: 3.5, previousHours: 4.5, history4Weeks: [3, 5, 4.5, 3.5] },
      { id: "g3", moduleName: "System Design Essentials", targetHours: 6, currentHours: 4, previousHours: 2.5, history4Weeks: [2, 3.5, 2.5, 4] },
      { id: "g4", moduleName: "Web Technologies & React", targetHours: 8, currentHours: 8, previousHours: 7, history4Weeks: [5, 6.5, 7, 8] }
    ];
  });

  const [activeCelebration, setActiveCelebration] = useState<{
    moduleName: string;
    targetHours: number;
  } | null>(null);
  const [confettiParticles, setConfettiParticles] = useState<Particle[]>([]);

  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [newGoalModule, setNewGoalModule] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(10);
  const [newGoalPrev, setNewGoalPrev] = useState(4);

  const [hasLoaded, setHasLoaded] = useState(false);

  // Load goals from the server on mount or when currentUserId/studentProfile.id changes
  useEffect(() => {
    const targetId = currentUserId || studentProfile?.id || "stud_1";
    fetch(`/api/study-goals/${targetId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response not ok");
        return res.json();
      })
      .then((data) => {
        if (data && data.goals && Array.isArray(data.goals)) {
          const mapped = data.goals.map((g: any) => {
            const prev = g.previousHours !== undefined ? g.previousHours : Math.max(0, Math.floor(g.targetHours * 0.6));
            const current = g.currentHours;
            const hist = g.history4Weeks && Array.isArray(g.history4Weeks) && g.history4Weeks.length === 4
              ? [...g.history4Weeks]
              : [
                  Math.max(0, parseFloat((g.targetHours * 0.45).toFixed(1))),
                  Math.max(0, parseFloat((g.targetHours * 0.7).toFixed(1))),
                  prev,
                  current
                ];
            hist[2] = prev;
            hist[3] = current;
            return {
              ...g,
              previousHours: prev,
              history4Weeks: hist
            };
          });
          setWeeklyGoals(mapped);
        }
        setHasLoaded(true);
      })
      .catch((err) => {
        console.warn("Failed to retrieve study goals from server, using local storage state fallback:", err);
        setHasLoaded(true);
      });
  }, [currentUserId, studentProfile?.id]);

  // Sync goals back to server and localStorage on changes
  useEffect(() => {
    localStorage.setItem("student_weekly_goals", JSON.stringify(weeklyGoals));

    if (hasLoaded) {
      const targetId = currentUserId || studentProfile?.id || "stud_1";
      fetch(`/api/study-goals/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: weeklyGoals })
      }).catch((err) => {
        console.error("Failed to persist study goals to server:", err);
      });
    }
  }, [weeklyGoals, hasLoaded, currentUserId, studentProfile?.id]);

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalModule.trim()) return;
    const target = Math.max(1, newGoalTarget);
    const prev = Math.max(0, newGoalPrev);
    const newGoal: WeeklyStudyGoal = {
      id: "goal_" + Date.now(),
      moduleName: newGoalModule.trim(),
      targetHours: target,
      currentHours: 0,
      previousHours: prev,
      history4Weeks: [
        Math.max(0, parseFloat((target * 0.35).toFixed(1))),
        Math.max(0, parseFloat((target * 0.55).toFixed(1))),
        prev,
        0
      ]
    };
    setWeeklyGoals((prevList) => [...prevList, newGoal]);
    setNewGoalModule("");
    setNewGoalTarget(10);
    setNewGoalPrev(4);
    setShowAddGoalForm(false);
  };

  const handleUpdatePrevHours = (id: string, increment: number) => {
    setWeeklyGoals((prev) => prev.map((g) => {
      if (g.id === id) {
        const nextVal = Math.max(0, parseFloat(((g.previousHours ?? 0) + increment).toFixed(1)));
        const hist = g.history4Weeks && Array.isArray(g.history4Weeks) && g.history4Weeks.length === 4
          ? [...g.history4Weeks]
          : [
              Math.max(0, parseFloat((g.targetHours * 0.45).toFixed(1))),
              Math.max(0, parseFloat((g.targetHours * 0.7).toFixed(1))),
              nextVal,
              g.currentHours
            ];
        hist[2] = nextVal;
        return { ...g, previousHours: nextVal, history4Weeks: hist };
      }
      return g;
    }));
  };

  const handleUpdateHours = (id: string, increment: number) => {
    let celebrationDetails: { moduleName: string; targetHours: number } | null = null;

    setWeeklyGoals((prev) => {
      return prev.map((g) => {
        if (g.id === id) {
          const prevPct = g.targetHours > 0 ? (g.currentHours / g.targetHours) * 100 : 0;
          const nextVal = Math.max(0, parseFloat((g.currentHours + increment).toFixed(1)));
          const nextPct = g.targetHours > 0 ? (nextVal / g.targetHours) * 100 : 0;
          
          if (prevPct < 100 && nextPct >= 100) {
            celebrationDetails = { moduleName: g.moduleName, targetHours: g.targetHours };
          }
          
          const hist = g.history4Weeks && Array.isArray(g.history4Weeks) && g.history4Weeks.length === 4
            ? [...g.history4Weeks]
            : [
                Math.max(0, parseFloat((g.targetHours * 0.45).toFixed(1))),
                Math.max(0, parseFloat((g.targetHours * 0.7).toFixed(1))),
                g.previousHours ?? Math.max(0, Math.floor(g.targetHours * 0.6)),
                nextVal
              ];
          hist[3] = nextVal;
          return { ...g, currentHours: nextVal, history4Weeks: hist };
        }
        return g;
      });
    });

    if (celebrationDetails) {
      setActiveCelebration(celebrationDetails);
      setConfettiParticles(generateConfetti());
    }
  };

  const handleDeleteGoal = (id: string) => {
    setWeeklyGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Subject expertise prediction systems
  const [subjectReport, setSubjectReport] = useState<SubjectExpertiseReport | null>(null);
  const [loadingSubject, setLoadingSubject] = useState(false);

  // Aptitude test states (Student Efficiency Prediction Test)
  const [aptQuestions, setAptQuestions] = useState<AptitudeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<EfficiencyTestResult | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // Additional dynamic states
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [focusWeight, setFocusWeight] = useState(80);
  const [stressWeight, setStressWeight] = useState(30);
  const [psychResult, setPsychResult] = useState<any | null>(null);

  const [paperSubject, setPaperSubject] = useState("");
  const [paperDifficulty, setPaperDifficulty] = useState("Standard");
  const [paperMarks, setPaperMarks] = useState(40);
  const [generatedPaper, setGeneratedPaper] = useState<any | null>(null);
  const [generatingPaper, setGeneratingPaper] = useState(false);

  // AI Subject Consultancy Desk State
  const [consultQuery, setConsultQuery] = useState("");
  const [consultReply, setConsultReply] = useState("");
  const [consultLoading, setConsultLoading] = useState(false);

  const submitSubjectConsult = async () => {
    if (!consultQuery.trim() || consultLoading) return;
    setConsultLoading(true);
    setConsultReply("");
    try {
      // Build a specific, contextual prompt incorporating available subject metrics
      const currentPerfClean = subjectReport ? subjectReport.performances.map(p => 
        `${p.subjectName}: Attendance ${p.attendancePercent}%, Exam ${p.examMarksPercent}%, Course Score ${p.overallScore}%`
      ).join("; ") : "N/A";

      const systemContextMessage = `You are Alex Mercer's Professional Academic Subject Advisor. Here are Alex's current undergraduate metrics: [${currentPerfClean}]. Strongest is ${subjectReport?.predictedStrongest || "Web Technologies"}, Weakest is ${subjectReport?.predictedWeakest || "Machine Learning Foundations"}. Alex Mercers is asking you a direct academic query: "${consultQuery}". Give a brief, high-impact 2-sentence response with concrete remediation recommendations.`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: systemContextMessage,
          history: []
        })
      });
      const data = await res.json();
      setConsultReply(data.reply || "Subject Advisor currently compiling matrices. Feel free to re-submit.");
    } catch (err) {
      console.error(err);
      setConsultReply("Error consulting academic advisor. Please try again.");
    } finally {
      setConsultLoading(false);
    }
  };

  const handleGeneratePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperSubject) return;
    setGeneratingPaper(true);
    setGeneratedPaper(null);
    try {
      const res = await fetch("/api/ai/question-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: paperSubject, difficulty: paperDifficulty, totalMarks: paperMarks })
      });
      const data = await res.json();
      if (data.result) {
        setGeneratedPaper(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPaper(false);
    }
  };

  // Hardcode pre-filled Skills scores for Alex Mercer (stud_1) or generic fallback
  const radarSkillKeys: (keyof StudentSkillScores)[] = [
    "communication", "coding", "leadership", "teamwork", "technical", "presentation", "creativity"
  ];

  const skillScores: StudentSkillScores = {
    communication: 78,
    coding: 92,
    leadership: 65,
    teamwork: 82,
    technical: 88,
    presentation: 70,
    creativity: 80
  };

  useEffect(() => {
    fetchSubjectExpertise();
    fetchQuizQuestions();
  }, [studentProfile]);

  const fetchSubjectExpertise = async () => {
    try {
      setLoadingSubject(true);
      const res = await fetch(`/api/subject-expertise/${studentProfile?.id || "stud_1"}`);
      const data = await res.json();
      if (data.result) setSubjectReport(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubject(false);
    }
  };

  const fetchQuizQuestions = async () => {
    try {
      const res = await fetch("/api/efficiency-test/questions");
      const data = await res.json();
      setAptQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectOption = (qId: string, idx: number) => {
    if (quizSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
  };

  const submitQuiz = async () => {
    if (quizLoading) return;
    setQuizLoading(true);

    try {
      const res = await fetch("/api/efficiency-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentProfile?.id || "stud_1", answers })
      });
      const data = await res.json();
      if (data.result) {
        setQuizResult(data.result);
        setQuizSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  // Generate Radar Polygon Points inside SVG dynamically (Trigonometry helper)
  const renderRadarChart = () => {
    const defaultWidth = 300;
    const defaultHeight = 300;
    const padding = 40;
    const centerX = defaultWidth / 2;
    const centerY = defaultHeight / 2;
    const radius = centerX - padding;

    const angleStep = (2 * Math.PI) / radarSkillKeys.length;

    // Build web grid concentric circles
    const gridG = Array.from({ length: 4 }).map((_, stepIdx) => {
      const rStep = (radius / 4) * (stepIdx + 1);
      const points: string[] = [];
      for (let i = 0; i < radarSkillKeys.length; i++) {
        const x = centerX + rStep * Math.cos(i * angleStep - Math.PI / 2);
        const y = centerY + rStep * Math.sin(i * angleStep - Math.PI / 2);
        points.push(`${x},${y}`);
      }
      return (
        <polygon
          key={stepIdx}
          points={points.join(" ")}
          className="stroke-slate-200 fill-none"
          strokeWidth="1"
        />
      );
    });

    // Build axes with text labels
    const axesG = radarSkillKeys.map((key, i) => {
      const xOuter = centerX + radius * Math.cos(i * angleStep - Math.PI / 2);
      const yOuter = centerY + radius * Math.sin(i * angleStep - Math.PI / 2);

      const labelDistance = radius + 15;
      const xLabel = centerX + labelDistance * Math.cos(i * angleStep - Math.PI / 2);
      const yLabel = centerY + labelDistance * Math.sin(i * angleStep - Math.PI / 2);

      return (
        <g key={key}>
          <line
            x1={centerX}
            y1={centerY}
            x2={xOuter}
            y2={yOuter}
            className="stroke-slate-200"
            strokeWidth="1"
          />
          <text
            x={xLabel}
            y={yLabel}
            textAnchor="middle"
            alignmentBaseline="middle"
            className="text-[9px] fill-slate-500 uppercase font-black tracking-tight"
          >
            {key}
          </text>
        </g>
      );
    });

    // Calculate score points coordinates
    const scorePoints: string[] = [];
    radarSkillKeys.forEach((key, i) => {
      const score = skillScores[key] || 60;
      const normalizedRadius = (score / 100) * radius;
      const x = centerX + normalizedRadius * Math.cos(i * angleStep - Math.PI / 2);
      const y = centerY + normalizedRadius * Math.sin(i * angleStep - Math.PI / 2);
      scorePoints.push(`${x},${y}`);
    });

    return (
      <svg className="w-full max-w-[280px] mx-auto" viewBox={`0 0 ${defaultWidth} ${defaultHeight}`}>
        {/* Grids */}
        {gridG}
        {/* Axes */}
        {axesG}
        {/* Skill Area Polygon */}
        <polygon
          points={scorePoints.join(" ")}
          className="fill-blue-500/20 stroke-blue-600"
          strokeWidth="2"
        />
        {/* Dots */}
        {scorePoints.map((pt, idx) => {
          const [cx, cy] = pt.split(",");
          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r="4"
              className="fill-blue-600 stroke-white"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    );
  };

  const showAll = !initialView;

  return (
    <div className="space-y-6">
      {/* SECTION 1: Subject Expertise Analytics Grid */}
      {(showAll || initialView === "expertise") && (
        <SubjectExpertiseModule 
          currentUserId={currentUserId}
          userRole={userRole}
          studentProfile={studentProfile}
        />
      )}

      {/* SECTION 1.5: Student Skills Marks Management System */}
      {(showAll || initialView === "skills") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {initialView === "skills" && (
            <div className="lg:col-span-12 border-b border-slate-200 pb-3 mb-2">
              <h3 className="font-bold text-slate-805 text-sm">Student Skills Marks Management System</h3>
              <p className="text-xs text-slate-450">Interactive tracker of core communication, technical scoring, leadership metrics and creativity profiles</p>
            </div>
          )}

          {/* Radar visualization */}
          <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                University Verified Radar Map
              </h3>
              <p className="text-[10px] text-slate-400">Calculated on active faculty markings</p>
            </div>
            <div className="my-3">
              {renderRadarChart()}
            </div>
            <div className="border-t border-slate-800 pt-3">
              <span className="text-[9px] uppercase tracking-wider text-slate-450 block">Identified Peak Aptitude Path</span>
              <span className="text-blue-300 text-xs font-bold">{subjectReport?.careerDomainRecommendation.domainName || "Software Systems Engineering"}</span>
            </div>
          </div>

          {/* Interactive slider mock metrics adjustments */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Dynamic Capability & Grades Breakdown</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">Adjust your capability quotients. In the real system, these figures are populated automatically from your Group Discussion speech speed, compiler mock contest, and midterm papers compiled under Faculty supervision.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              {radarSkillKeys.map((key) => {
                const val = skillScores[key] || 70;
                return (
                  <div key={key} className="bg-slate-50 border p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-slate-600">
                      <span>{key}:</span>
                      <span className="text-blue-600 font-mono text-xs">{val}/100</span>
                    </div>
                    <div className="h-2 bg-slate-205 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${val >= 80 ? 'bg-blue-650' : 'bg-indigo-500'}`} style={{ width: `${val}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl text-[11px] text-indigo-750 font-medium">
              Note: Contact your corporate department coordinators or select the **Faculty Evaluator Login** in the lockout menu to simulate formal verification criteria overrides.
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY STUDY GOAL PROGRESS WIDGET */}
      {(showAll || initialView === "goals") && (
      <div id="weekly-study-goals-widget" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Academic Rhythm</span>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mt-1">
              <Calendar className="w-4.5 h-4.5 text-blue-600" />
              Weekly Study Goal Progress Tracker
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">Define and monitor target study hours for coding repositories and standard subject courses</p>
          </div>
          
          <button
            id="add-goal-btn"
            onClick={() => setShowAddGoalForm(!showAddGoalForm)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs font-sans"
          >
            {showAddGoalForm ? "Cancel Form" : "+ Define Weekly Goal"}
          </button>
        </div>

        {/* Global Progress Metrics Panel */}
        {(() => {
          const totalTarget = weeklyGoals.reduce((sum, g) => sum + g.targetHours, 0);
          const totalCurrent = weeklyGoals.reduce((sum, g) => sum + g.currentHours, 0);
          const globalPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
          return (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="md:col-span-4 flex flex-col justify-center space-y-1">
                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-widest">Aggregate Weekly Standing</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-850 font-mono">{totalCurrent.toFixed(1)}</span>
                  <span className="text-slate-400 text-xs font-medium">/ {totalTarget} target study hours</span>
                </div>
                <div className="text-[10px] font-sans font-bold text-slate-500">
                  {globalPct >= 100 ? (
                    <span className="text-green-700 font-bold flex items-center gap-1">🏆 Goal Competed! Excellent study momentum!</span>
                  ) : globalPct >= 75 ? (
                    <span className="text-blue-700 font-bold">Almost there! Keep compiling study sessions!</span>
                  ) : (
                    <span>Progress: {globalPct}% completed of target milestones.</span>
                  )}
                </div>
              </div>
              <div className="md:col-span-8 flex flex-col justify-center">
                <div className="flex justify-between items-center text-xs font-bold text-slate-650 mb-1.5">
                  <span>Weekly Study Goal Completion Rate:</span>
                  <span className="font-mono text-slate-850">{globalPct}%</span>
                </div>
                <div className="h-4 bg-slate-200 rounded-lg overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="h-full rounded-md transition-all duration-500 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xs"
                    style={{ width: `${Math.min(globalPct, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Create Dynamic New Goal Input Form Row */}
        {showAddGoalForm && (
          <form id="add-goal-form" onSubmit={handleAddGoalSubmit} className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end animate-fadeIn">
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase block">Subject / Coding Module Name:</label>
              <div className="flex gap-1.5 items-center">
                <input
                  id="goal-module-input"
                  type="text"
                  required
                  placeholder="e.g., System Design Patterns"
                  value={newGoalModule}
                  onChange={(e) => setNewGoalModule(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg text-slate-800 outline-none focus:border-blue-500"
                />
                <VoiceInputButton 
                  onTranscript={(text) => setNewGoalModule(prev => prev ? prev + " " + text : text)}
                  tooltip="Specify module path via voice recognition"
                  className="shrink-0"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase block">Target Hours:</label>
              <input
                id="goal-hours-input"
                type="number"
                min="1"
                max="80"
                required
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg text-slate-850 font-mono outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase block">Last Wk Hours:</label>
              <input
                id="goal-prev-hours-input"
                type="number"
                min="0"
                max="80"
                required
                value={newGoalPrev}
                onChange={(e) => setNewGoalPrev(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg text-slate-855 font-mono outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowAddGoalForm(false)}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-600 border rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Define Track
              </button>
            </div>
          </form>
        )}

        {/* Dynamic Cards Lists for Goals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {weeklyGoals.map((g) => {
            const pct = g.targetHours > 0 ? Math.round((g.currentHours / g.targetHours) * 100) : 0;
            const prevHrs = g.previousHours ?? 0;
            const diff = parseFloat((g.currentHours - prevHrs).toFixed(1));

            return (
              <div 
                key={g.id} 
                className={`bg-white border rounded-xl p-4 flex flex-col justify-between transition-all relative ${
                  pct >= 100 ? 'border-green-300 shadow-xs ring-1 ring-green-150 bg-green-50/10' : 'border-slate-200 shadow-xs hover:border-slate-350'
                }`}
              >
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteGoal(g.id)}
                  title="Remove Goal"
                  className="absolute top-2 right-2 text-slate-300 hover:text-rose-600 transition p-1 cursor-pointer"
                >
                  <span className="text-xs">✕</span>
                </button>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1 pr-4">{g.moduleName}</h4>
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs text-slate-500 font-sans">
                    <span className="font-bold text-slate-850 font-mono">{g.currentHours.toFixed(1)} hrs</span>
                    <span>of {g.targetHours} expected</span>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="my-3 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span>Progress</span>
                      {(() => {
                        if (diff > 0) {
                          return (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm text-[8px] font-black border border-emerald-200" title={`Logged ${diff} hours more than previous week!`}>
                              <TrendingUp className="w-2.5 h-2.5 text-emerald-600" /> +{diff}h
                            </span>
                          );
                        } else if (diff < 0) {
                          return (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-rose-50 text-rose-600 rounded-sm text-[8px] font-black border border-rose-105" title={`Logged ${Math.abs(diff)} hours less than previous week.`}>
                              <TrendingDown className="w-2.5 h-2.5 text-rose-500" /> {diff}h
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-slate-50 text-slate-400 rounded-sm text-[8px] font-medium border border-slate-200" title="Same level as previous week">
                              steady
                            </span>
                          );
                        }
                      })()}
                    </span>
                    <span className="font-mono">{pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct >= 100 ? "bg-green-600" :
                        pct >= 50 ? "bg-blue-500" : "bg-amber-400"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* 4-Week Progress Sparkline Trend Line Chart */}
                <div id={`sparkline-trend-${g.id}`} className="mb-3.5 p-2 bg-slate-50 border border-slate-100/80 rounded-xl space-y-1.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-400 tracking-wider font-mono">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5 text-blue-500" />
                      4-Wk Study Trend
                    </span>
                    <span className="text-[9px] text-blue-800 font-black">
                      {(g.history4Weeks || [0, 0, prevHrs, g.currentHours]).map(v => typeof v === 'number' ? v.toFixed(1) : '0').join(' → ')}
                    </span>
                  </div>
                  
                  {/* Miniature elegant inline sparkline */}
                  <div className="relative h-12 w-full flex items-end pt-1 bg-white rounded-lg border border-slate-150 py-1 overflow-hidden px-1">
                    {(() => {
                      const history = g.history4Weeks || [
                        Math.max(0, parseFloat((g.targetHours * 0.4).toFixed(1))),
                        Math.max(0, parseFloat((g.targetHours * 0.6).toFixed(1))),
                        prevHrs,
                        g.currentHours
                      ];
                      const maxVal = Math.max(...history, g.targetHours, 1);
                      const svgPoints = history.map((val, idx) => {
                        const sx = (idx / 3) * 88 + 6; // slightly inside bounds
                        const sy = 34 - (val / maxVal) * 26; // inverted coordinate
                        return { x: sx, y: sy, value: val };
                      });

                      const pathD = `M ${svgPoints.map(p => `${p.x} ${p.y}`).join(" L ")}`;
                      const fillD = `${pathD} L ${svgPoints[3].x} 38 L ${svgPoints[0].x} 38 Z`;

                      return (
                        <div className="relative w-full h-full">
                          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id={`sparkline-grad-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Guideline gridlines */}
                            <line x1="0" y1="34" x2="100" y2="34" stroke="#F1F5F9" strokeWidth="0.5" strokeDasharray="2,2" />
                            <line x1="0" y1="20" x2="100" y2="20" stroke="#F1F5F9" strokeWidth="0.5" strokeDasharray="2,2" />
                            <line x1="0" y1="6" x2="100" y2="6" stroke="#F8FAFC" strokeWidth="0.5" />

                            {/* Target threshold horizontal dashed line */}
                            {g.targetHours <= maxVal && (
                              <line 
                                x1="0" 
                                y1={34 - (g.targetHours / maxVal) * 26} 
                                x2="100" 
                                y2={34 - (g.targetHours / maxVal) * 26} 
                                stroke="#10B981" 
                                strokeWidth="0.75" 
                                strokeDasharray="2,2" 
                                opacity="0.8"
                                title={`Target Goal: ${g.targetHours}h`}
                              />
                            )}

                            {/* Filled sparkline area */}
                            <path d={fillD} fill={`url(#sparkline-grad-${g.id})`} />

                            {/* Glowing outline stroke line */}
                            <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Core Nodes */}
                            {svgPoints.map((pt, i) => (
                              <g key={i}>
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r="2" 
                                  fill={i === 3 ? "#1D4ED8" : "#3B82F6"} 
                                  stroke="#FFFFFF" 
                                  strokeWidth="0.75" 
                                />
                                <text 
                                  x={pt.x} 
                                  y={pt.y > 15 ? pt.y - 4 : pt.y + 8} 
                                  textAnchor="middle" 
                                  className="fill-slate-500 font-mono text-[4.5px] font-black"
                                >
                                  {pt.value.toFixed(1)}
                                </text>
                              </g>
                            ))}
                          </svg>
                          
                          {/* Label row for timing interval metrics */}
                          <div className="absolute bottom-0.5 left-0 right-0 flex justify-between px-1.5 text-[6.5px] font-black text-slate-400 select-none font-mono">
                            <span>W-3</span>
                            <span>W-2</span>
                            <span>W-1</span>
                            <span className="text-blue-600 font-extrabold">CURR</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Previous Week Hours Control Slider/Action Row */}
                <div className="flex items-center justify-between gap-1 mb-2.5 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100 hover:border-slate-200 transition">
                  <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider font-mono">Last Week Output:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdatePrevHours(g.id, -0.5)}
                      className="p-0.5 px-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-extrabold rounded cursor-pointer font-mono"
                      title="Adjust Last Week -30 mins"
                    >
                      -0.5
                    </button>
                    <span className="text-[10px] font-extrabold font-mono text-slate-750 min-w-[28px] text-center">{prevHrs.toFixed(1)}h</span>
                    <button
                      type="button"
                      onClick={() => handleUpdatePrevHours(g.id, 0.5)}
                      className="p-0.5 px-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-extrabold rounded cursor-pointer font-mono"
                      title="Adjust Last Week +30 mins"
                    >
                      +0.5
                    </button>
                  </div>
                </div>

                {/* Micro Actions */}
                <div className="flex items-center justify-between gap-1 mt-1 pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-black tracking-wider uppercase font-mono">
                    {pct >= 100 ? (
                      <span className="text-green-700">✓ Completed</span>
                    ) : (
                      <span className="text-slate-400">active</span>
                    )}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateHours(g.id, -0.5)}
                      className="p-1 px-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded cursor-pointer font-mono"
                      title="Log -30 mins"
                    >
                      -0.5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateHours(g.id, 0.5)}
                      className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-850 text-[10px] font-bold rounded cursor-pointer font-mono"
                      title="Log +30 mins"
                    >
                      +0.5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateHours(g.id, 1)}
                      className="p-1 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black rounded cursor-pointer font-mono"
                      title="Log +1 hour"
                    >
                      +1h
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* SECTION 2: Student Learning Efficiency Aptitude Prediction Test */}
      {(showAll || initialView === "efficiency") && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Cpu className="w-4.5 h-4.5 text-blue-500" />
              Student Efficiency Prediction Test
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Quick logical reasoning, continuous aptitude and quantitative checks</p>
          </div>
          {quizSubmitted && (
            <button
              onClick={resetQuiz}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition"
            >
              Recheck Test
            </button>
          )}
        </div>

        {!quizSubmitted ? (
          <div className="space-y-6">
            <div className="space-y-4">
              {aptQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs bg-slate-900 text-white font-mono w-5 h-5 flex items-center justify-center rounded shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{q.questionText}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition cursor-pointer ${
                            isSelected 
                              ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold" 
                              : "bg-white border-slate-250 hover:bg-slate-50 text-slate-650"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={submitQuiz}
              disabled={quizLoading || Object.keys(answers).length < aptQuestions.length}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {quizLoading ? "Calculating predictive efficiency metrics..." : "Submit Efficiency Answers"}
            </button>
          </div>
        ) : (
          quizResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-xl border border-blue-800 shadow-inner flex flex-col justify-between h-full">
                <div>
                  <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">ML PREDICTED SCORE</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-blue-400">{quizResult.predictedLearningEfficiency}%</span>
                    <span className="text-xs text-slate-300">Efficiency Scale</span>
                  </div>
                </div>

                <div className="my-4 border-t border-blue-800 pt-3">
                  <span className="text-[10px] text-blue-300 font-bold block mb-1 uppercase tracking-widest">Placement Benchmark:</span>
                  <p className="text-sm font-bold">{quizResult.academicPerformancePrediction}</p>
                </div>

                <div className="bg-white/10 p-3 rounded-lg border border-white/5 text-[11px] text-slate-250 leading-relaxed">
                  Your logical reasoning scores are incorporated immediately with your coding metrics for resume analysis predictions.
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Aptitude Analytics Categories</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Quantitative Math</span>
                      <span className="font-bold text-slate-900">{quizResult.scores.quantitative}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${quizResult.scores.quantitative}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Technical Aptitude</span>
                      <span className="font-bold text-slate-900">{quizResult.scores.technical}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${quizResult.scores.technical}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Logical Reasoning</span>
                      <span className="font-bold text-slate-900">{quizResult.scores.logical}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${quizResult.scores.logical}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Verbal Capability</span>
                      <span className="font-bold text-slate-900">{quizResult.scores.verbal}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${quizResult.scores.verbal}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-xs text-slate-800 mb-2">Academic Prediction Insights</h5>
                  <ul className="space-y-1.5">
                    {quizResult.feedback.map((f, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold shrink-0">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      )}

      {/* NEW SECTION 3: Smart AI Study Recommendations & Curated Material Map */}
      {(showAll || initialView === "expertise" || initialView === "goals") && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="pb-3 border-b flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5 text-blue-600" />
              Smart Study Recommendation Engine
            </h3>
            <p className="text-[11px] text-slate-400">Personalized remedial path maps based on individual weakest modules indices</p>
          </div>
          <button
            onClick={() => setShowLearningPath(!showLearningPath)}
            className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs transition cursor-pointer"
          >
            {showLearningPath ? "Hide Curated Path" : "Preview Curated Materials"}
          </button>
        </div>

        {showLearningPath && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <div className="p-1.5 bg-amber-500 rounded-lg text-white">
                <AlertTriangle className="w-4 h-4 shrink-0" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900">Current Focused Remediation: Machine Learning Theory Foundations</h4>
                <p className="text-[11px] text-amber-700 leading-relaxed font-sans">Alex's current analytics point to a 74% proficiency index in mathematical matrices and backpropagation. Calibrating customized practice sheets and video tutorial streams below.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[8px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded uppercase font-mono">Weak Topic Practice</span>
                <h5 className="font-bold text-xs text-slate-800">Gradient Descent & Loss Functions</h5>
                <p className="text-[11px] text-slate-400 font-sans">Conceptual step-by-step review on bias vectors, learning rates, and gradient scaling.</p>
                <a href="https://youtube.com/results?search_query=gradient+descent+backpropagation+concept" target="_blank" rel="referrer" className="text-[10px] text-blue-600 hover:underline font-bold block">Open YouTube Tutorial Index</a>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[8px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase font-mono">Hands-on Workbook</span>
                <h5 className="font-bold text-xs text-slate-800 font-serif">Backpropagation Calculations Sheets</h5>
                <p className="text-[11px] text-slate-400 font-sans">Simulate error differentials through a triple-layer perceptron. Full solutions included.</p>
                <a href="#" className="text-[10px] text-indigo-600 hover:underline font-bold block">Download Practice PDF Worksheet</a>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[8px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded uppercase font-mono">Recommended Courseware</span>
                <h5 className="font-bold text-xs text-slate-800">Stanford CS229 Neural Networks</h5>
                <p className="text-[11px] text-slate-400 font-sans">Highly structured syllabus mapping directly to upcoming placement questionnaires.</p>
                <a href="https://youtube.com/results?search_query=stanford+cs229+neural+networks" target="_blank" rel="referrer" className="text-[10px] text-green-600 hover:underline font-bold block">Access Ivy League Lecture Streams</a>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* NEW SECTION 4: Interactive Psychological & Cognitive Workload Diagnostics */}
      {(showAll || initialView === "goals") && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="pb-3 border-b">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Cpu className="w-4.5 h-4.5 text-purple-600" />
            Psychological & Cognitive Workload Diagnostics
          </h3>
          <p className="text-[11px] text-slate-400 font-sans">Map focus vectors, sleep patterns, and academic stress indicators to diagnose cognitive standing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Core Focus Index:</span>
                <span className="text-purple-600 font-mono">{focusWeight}%</span>
              </div>
              <input
                type="range" min="10" max="100"
                value={focusWeight}
                onChange={(e) => setFocusWeight(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Perceived Stress Level:</span>
                <span className="text-rose-600 font-mono">{stressWeight}%</span>
              </div>
              <input
                type="range" min="10" max="100"
                value={stressWeight}
                onChange={(e) => setStressWeight(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
            <button
              onClick={() => {
                const isOptimal = focusWeight > 70 && stressWeight < 50;
                setPsychResult({
                  standing: isOptimal ? "Optimal Balanced Cognition" : "High Cognitive Burnout Risk",
                  cognitiveLoadIndex: Math.round((stressWeight * 1.2) - (focusWeight * 0.4) + 40),
                  recs: isOptimal 
                    ? ["Sustain active focus cycles with 25-minute Pomodoro spans.", "Perfect integration between rest matrices and placement preparation."] 
                    : ["Warning: High stress and low focus scores detected.", "Take immediate 15-minute screen-free intervals. Walk near open areas or college lawns.", "Incorporate light auditory sound loops prior to daily code compilers submissions."]
                });
              }}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Analyze Scientific Psychological Index
            </button>
          </div>

          <div className="md:col-span-7 bg-slate-50 border p-4.5 rounded-xl min-h-[160px] flex flex-col justify-center">
            {psychResult ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                  <span className="text-[10px] text-purple-700 font-extrabold uppercase font-mono">Cognitive Standing:</span>
                  <span className="text-xs font-bold text-slate-900">{psychResult.standing}</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 font-sans leading-relaxed">
                  {psychResult.recs.map((rec: string, i: number) => (
                    <p key={i} className="flex items-start gap-1">
                      <span className="text-purple-600 font-black shrink-0">•</span>
                      <span>{rec}</span>
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 font-sans font-bold uppercase tracking-wider">Drag vectors and press analyze to predict mental standings...</p>
            )}
          </div>
        </div>
      </div>
      )}

      {/* NEW SECTION 5: Faculty Exam & Quiz Question Paper Compiler */}
      {userRole === "faculty" && (showAll || initialView === "expertise") && (
        <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-bold text-blue-300 text-sm flex items-center gap-1.5">
              <Terminal className="w-5 h-5" />
              Syllabus Question Paper Compiler (Faculty tool)
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">Instantly compile academic midterm sheets structured strictly to target CGPA improvements</p>
          </div>

          <form onSubmit={handleGeneratePaper} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-300 font-bold uppercase block">Course Subject Topic:</label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="text"
                  value={paperSubject}
                  onChange={(e) => setPaperSubject(e.target.value)}
                  placeholder="e.g. Backpropagation Math CSE"
                  className="w-full text-xs bg-slate-800 border border-slate-705 p-2 rounded-lg text-white"
                />
                <VoiceInputButton 
                  onTranscript={(text) => setPaperSubject(prev => prev ? prev + " " + text : text)}
                  tooltip="Speak Course Subject Title (Voice to Text)"
                  className="shrink-0"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-300 font-bold uppercase block">Difficulty Level:</label>
              <select
                value={paperDifficulty}
                onChange={(e) => setPaperDifficulty(e.target.value)}
                className="w-full text-xs bg-slate-800 border border-slate-705 p-2 rounded-lg"
              >
                <option value="Standard">Standard undergraduate</option>
                <option value="Aggressive">Aggressive Competitive</option>
                <option value="Elite">Elite Research level</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-300 font-bold uppercase block">Total Paper Marks Math:</label>
              <input
                type="number"
                min="10" max="100"
                value={paperMarks}
                onChange={(e) => setPaperMarks(Number(e.target.value))}
                className="w-full text-xs bg-slate-800 border border-slate-705 p-2 rounded-lg text-white font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={generatingPaper || !paperSubject}
              className="py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-lg text-xs transition disabled:opacity-55 cursor-pointer"
            >
              {generatingPaper ? "Compiling..." : "Generate mid-term task"}
            </button>
          </form>

          {generatedPaper && (
            <div className="bg-slate-850 border border-slate-850 p-4 rounded-xl space-y-4 animate-fadeIn max-h-[350px] overflow-y-auto">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[10px] text-blue-300 uppercase">Compiled Exam Paper Structure</span>
                <span className="font-mono text-slate-400">Time limit: 60 mins</span>
              </div>
              <div className="space-y-3.5 divide-y divide-slate-800">
                {generatedPaper.questions.map((q: any, idx: number) => (
                  <div key={idx} className="pt-3.5 first:pt-0 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <p className="font-black text-blue-300">Q{q.qNo || idx + 1}. ({q.type || "Analytical Task"})</p>
                      <span className="bg-slate-800 px-2 py-0.5 rounded font-bold text-[9px] text-slate-350">{q.marks} Marks</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">{q.text}</p>
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        {q.options.map((opt: string, oi: number) => (
                          <div key={oi} className="bg-slate-800/50 p-1.5 px-2.5 rounded text-slate-300 border border-slate-800">{String.fromCharCode(65+oi)}. {opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Confetti Celebration Overlay */}
      <AnimatePresence>
        {activeCelebration && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCelebration(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md pointer-events-auto cursor-pointer"
            />

            {/* Confetti particle layers (full screen view, interactive overlay layer) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-[101]">
              {confettiParticles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ 
                    x: `${p.x}vw`, 
                    y: "-15vh", 
                    scale: 0, 
                    rotate: 0, 
                    opacity: 1 
                  }}
                  animate={{ 
                    y: "115vh", 
                    scale: [0, 1.2, 1.2, 0.9, 0], 
                    rotate: p.angle + 720,
                    x: `${p.x + (Math.sin(p.id) * 12)}vw`, // swaying drift
                    opacity: [1, 1, 0.8, 0.5, 0]
                  }}
                  transition={{ 
                    duration: p.duration, 
                    delay: p.delay, 
                    ease: "linear" 
                  }}
                  style={{
                    position: "absolute",
                    width: p.size,
                    height: p.shape === "circle" ? p.size : p.shape === "triangle" ? 0 : p.size,
                    backgroundColor: p.shape !== "triangle" ? p.color : "transparent",
                    borderRadius: p.shape === "circle" ? "50%" : p.shape === "star" ? "30% 70% 70% 30% / 30% 30% 70% 70%" : "2%",
                    borderStyle: p.shape === "triangle" ? "solid" : "none",
                    borderWidth: p.shape === "triangle" ? `0 ${p.size / 2}px ${p.size}px ${p.size / 2}px` : "0",
                    borderColor: p.shape === "triangle" ? `transparent transparent ${p.color} transparent` : "transparent",
                  }}
                />
              ))}
            </div>

            {/* Glassmorphic Modal Card */}
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="relative w-full max-w-md bg-white border border-emerald-100 rounded-3xl p-6 text-center shadow-2xl pointer-events-auto overflow-hidden text-slate-850 z-[102]"
            >
              {/* Green glowing background overlay */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

              {/* Close icon */}
              <button
                onClick={() => setActiveCelebration(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {/* Celebration Icon Badge */}
              <div className="flex justify-center mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 1] }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                  className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm relative"
                >
                  <Award className="w-9 h-9 text-emerald-600 animate-pulse" />
                  
                  {/* Floating sparkly accents */}
                  <motion.div
                    animate={{ y: [-3, 3], rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="absolute -top-1 -right-1 text-amber-500"
                  >
                    <Sparkles className="w-4.5 h-4.5 fill-amber-500" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Header and Details */}
              <div className="space-y-2">
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-full uppercase tracking-wider font-mono shadow-xs">
                  Academic Milestone Met!
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 tracking-tight mt-3">
                  100% Target Compile Hours Completed!
                </h4>
                <div className="bg-emerald-50/50 border border-emerald-100 py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-800 font-sans inline-block mt-1">
                  &ldquo;{activeCelebration.moduleName}&rdquo;
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm mx-auto pt-2 font-sans">
                  Excellent focus compile session! You completed your weekly target of <strong className="font-mono text-slate-800 font-extrabold font-semibold">{activeCelebration.targetHours}</strong> expected study hours for this module. Faculty coordinators and campus algorithms trackers index this as a peak rhythm status update!
                </p>
              </div>

              {/* Close dismiss CTA  Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setActiveCelebration(null)}
                  className="w-full py-2.5 bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl tracking-wider uppercase font-mono shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  Awesome! Let&apos;s keep compiling success
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
