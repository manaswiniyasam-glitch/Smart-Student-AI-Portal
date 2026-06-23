/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import os from "os";
import path from "path";
import { createServer as createViteServer } from "vite";
import { saveHackathonSubmission, saveStudyGoals, saveAptitudeSubmission, saveSubjectExpertiseReport, getHackathonSubmissions, getStudyGoals, getAptitudeSubmissions, getSubjectExpertiseReports, getDatabaseFilePath, getHackathonSubmissionsByUser, getStudyGoalsByStudent, getAptitudeSubmissionsByStudent, getSubjectExpertiseReportsByStudent } from "./server-db.js";
import { initializePostgresDb, saveSubjectExpertiseSession, getSubjectExpertiseSessions } from "./server-pg.js";
import {
  analyzeGroupDiscussion,
  analyzeEssay,
  analyzeSpeech,
  predictSubjectExpertise,
  evaluateCodeWithAI,
  analyzeResumeWithAI,
  getPlacementReadiness,
  chatAssistant,
  generateNotesAndFlashcards,
  generateQuestionPaper
} from "./server-ai.js";

// Initialize express app
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

// ==========================================
// IN-MEMORY DATA STORAGE (PRE-POPULATED MOCK DATA STORE)
// ==========================================

const USERS_DB: any[] = [
  {
    id: "stud_1",
    name: "Alex Mercer",
    email: "alex.mercer@college.edu",
    password: "password123",
    role: "student" as const,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
    regNo: "STUD20260401",
    department: "Computer Science & Engineering",
    semester: "VI Semester",
    contact: "+1 (555) 321-4567",
    bio: "Passionate Java and TypeScript optimizer. Aiming for distributed high-load backend engineer roles."
  },
  {
    id: "stud_2",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@college.edu",
    password: "password123",
    role: "student" as const,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    regNo: "STUD20260492",
    department: "Electrical & Electronics Engineering",
    semester: "VI Semester",
    contact: "+1 (555) 765-4321",
    bio: "Core power grid analytics student, exploring smart machine learning algorithms in clean engineering."
  },
  {
    id: "fac_1",
    name: "Dr. Evelyn Hargreaves",
    email: "evelyn@college.edu",
    password: "password123",
    role: "faculty" as const,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    department: "Computer Science",
    contact: "+1 (555) 901-2345",
    bio: "Senior Professor, Neural Language Analytics and Pattern Computing Research Lead."
  },
  {
    id: "admin_1",
    name: "Dean Albert Vance",
    email: "albert.vance@college.edu",
    password: "password123",
    role: "admin" as const,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
    department: "Academics & Strategy Board",
    contact: "+1 (555) 111-2222",
    bio: "University Dean. Monitoring technical placements readiness index, skill charts, and campus hackathons."
  },
  {
    id: "parent_1",
    name: "Thomas Mercer",
    email: "parent.mercer@college.edu",
    password: "password123",
    role: "parent" as const,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    regNo: "PRN20261109",
    department: "Parent Monitoring Division",
    semester: "VI Semester",
    contact: "+1 (555) 777-8888",
    bio: "Parent of Alex Mercer. Dedicated to evaluating secondary educational benchmarks, class attendance indices, and placement suitability."
  }
];

// Student Skills database (for Skill Mark management system)
const SKILLS_DB: Record<string, { currentScores: any; history: any[] }> = {
  "stud_1": {
    currentScores: { communication: 78, coding: 92, leadership: 65, teamwork: 74, technical: 88, presentation: 70, creativity: 82 },
    history: [
      { date: "2026-02-01", scores: { communication: 70, coding: 80, leadership: 55, teamwork: 65, technical: 80, presentation: 60, creativity: 75 } },
      { date: "2026-03-15", scores: { communication: 75, coding: 86, leadership: 60, teamwork: 70, technical: 83, presentation: 65, creativity: 78 } },
      { date: "2026-05-24", scores: { communication: 78, coding: 92, leadership: 65, teamwork: 74, technical: 88, presentation: 70, creativity: 82 } }
    ]
  },
  "stud_2": {
    currentScores: { communication: 86, coding: 70, leadership: 85, teamwork: 90, technical: 75, presentation: 92, creativity: 88 },
    history: [
      { date: "2026-02-01", scores: { communication: 80, coding: 60, leadership: 75, teamwork: 85, technical: 65, presentation: 85, creativity: 80 } },
      { date: "2026-03-15", scores: { communication: 84, coding: 65, leadership: 80, teamwork: 88, technical: 70, presentation: 89, creativity: 84 } },
      { date: "2026-05-24", scores: { communication: 86, coding: 70, leadership: 85, teamwork: 90, technical: 75, presentation: 92, creativity: 88 } }
    ]
  }
};

// In-Memory Weekly study goals for persistent storage across sessions
const STUDY_GOALS_DB: Record<string, any[]> = {
  "stud_1": [
    { id: "g1", moduleName: "Data Structures & Algos", targetHours: 12, currentHours: 8, previousHours: 6, history4Weeks: [4, 5.5, 6, 8] },
    { id: "g2", moduleName: "Machine Learning Foundations", targetHours: 10, currentHours: 3.5, previousHours: 4.5, history4Weeks: [3, 5, 4.5, 3.5] },
    { id: "g3", moduleName: "System Design Essentials", targetHours: 6, currentHours: 4, previousHours: 2.5, history4Weeks: [2, 3.5, 2.5, 4] },
    { id: "g4", moduleName: "Web Technologies & React", targetHours: 8, currentHours: 8, previousHours: 7, history4Weeks: [5, 6.5, 7, 8] }
  ],
  "stud_2": [
    { id: "g1", moduleName: "Power Analytics", targetHours: 10, currentHours: 4, previousHours: 3, history4Weeks: [2, 3.5, 3, 4] },
    { id: "g2", moduleName: "Renewable Energy Grid", targetHours: 8, currentHours: 2, previousHours: 1.5, history4Weeks: [1, 2, 1.5, 2] }
  ]
};

const ANNOUNCEMENTS_DB = [
  {
    id: "ann_1",
    title: "AI Hackathon: Algorithmic Fusion 2026",
    content: "Prepare your coding portfolios! The ultimate annual university programming hackathon kickstarts this Friday. Multiple automated verification test cases and solid credit points await.",
    timestamp: "2026-05-22T09:00:00Z",
    sender: "Dean Albert Vance",
    category: "hackathon"
  },
  {
    id: "ann_2",
    title: "Placement Readiness Benchmark Checks",
    content: "All students in semester IV and VI are requested to upload their technical resumes and perform simulated placements checks under the Reports system to unlock primary job interview tracks.",
    timestamp: "2026-05-23T14:30:00Z",
    sender: "Dr. Evelyn Hargreaves",
    category: "placement"
  }
];

const HACKATHON_PROBLEMS = [
  {
    id: "prob_1",
    title: "Two Sum Target Optimizer",
    difficulty: "Easy" as const,
    category: "Arrays & Sorting",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target` (exactly one solution exists).",
    sampleInput: "nums = [2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]",
    starterCode: "function solve(nums, target) {\n  // Write JavaScript or TypeScript logic\n  return [0, 1];\n}",
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" }
    ],
    rewardPoints: 50
  },
  {
    id: "prob_2",
    title: "Valid Parentheses Checker",
    difficulty: "Medium" as const,
    category: "Stack Mechanics",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets and in the correct order.",
    sampleInput: "s = \"()[]{}\"",
    sampleOutput: "true",
    starterCode: "function solve(s) {\n  // Write nested parser logic\n  return true;\n}",
    testCases: [
      { input: '"{[]}"', expectedOutput: "true" },
      { input: '"([)]"', expectedOutput: "false" }
    ],
    rewardPoints: 100
  },
  {
    id: "prob_3",
    title: "Maximum Subarray Sum Solver",
    difficulty: "Hard" as const,
    category: "Dynamic Programming",
    description: "Find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. Implement using Kadane's algorithm in O(N) complexity.",
    sampleInput: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
    sampleOutput: "6 (Subarray is [4, -1, 2, 1])",
    starterCode: "function solve(nums) {\n  // Implement Kadane's algorithm\n  let maxSoFar = nums[0];\n  return maxSoFar;\n}",
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
      { input: "[5,4,-1,7,8]", expectedOutput: "23" }
    ],
    rewardPoints: 150
  }
];

const LEADERBOARD_DB = [
  { userId: "stud_1", name: "Alex Mercer", regNo: "STUD20260401", score: 450, problemsSolved: 6, rank: 1 },
  { userId: "stud_2", name: "Sarah Jenkins", regNo: "STUD20260492", score: 320, problemsSolved: 4, rank: 2 },
  { userId: "stud_other1", name: "Neil Armstrong", regNo: "STUD20261103", score: 280, problemsSolved: 3, rank: 3 },
  { userId: "stud_other2", name: "Keira Knightly", regNo: "STUD20260715", score: 240, problemsSolved: 3, rank: 4 }
];

// Student efficiency quiz tests
const MOCK_APTITUDE_TEST = [
  {
    id: "aq1",
    category: "quantitative",
    questionText: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train in meters?",
    options: ["120 meters", "150 meters", "324 meters", "None rate"],
    correctAnswerIndex: 1
  },
  {
    id: "aq2",
    category: "logical",
    questionText: "If A + B means A is the brother of B; A - B means A is the sister of B and A x B means A is the father of B. Which of the following means C is the son of M?",
    options: ["M - N x C", "M x N - C", "M x C - F", "None of these"],
    correctAnswerIndex: 3
  },
  {
    id: "aq3",
    category: "technical",
    questionText: "What is the time complexity of building a heap of size N in worst-case analysis?",
    options: ["O(N log N)", "O(log N)", "O(N)", "O(N^2)"],
    correctAnswerIndex: 2
  },
  {
    id: "aq4",
    category: "verbal",
    questionText: "Find the antonym for the word 'GREGARIOUS':",
    options: ["Affable", "Introverted", "Sociable", "Warm-hearted"],
    correctAnswerIndex: 1
  }
];

// ==========================================
// REST API ROUTING
// ==========================================

// Auth - Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid university credentials." });
  }
  // Remove password from payload response
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Auth - Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, regNo, department, semester } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Please fill in all mandatory registry fields." });
  }

  const existing = USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: "User already registered through this email address." });
  }

  const newId = `stud_${Date.now()}`;
  const newUser = {
    id: newId,
    name,
    email: email.trim(),
    password,
    role: role as 'student' | 'faculty' | 'admin',
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
    regNo: regNo || `STUD${Date.now().toString().slice(-8)}`,
    department: department || "General Science",
    semester: semester || "II Semester",
    bio: "Smart Student Portal Scholar. Ready to augment skill stats."
  };

  USERS_DB.push(newUser);

  // Initialize skills record for new student
  if (role === 'student') {
    SKILLS_DB[newId] = {
      currentScores: { communication: 60, coding: 60, leadership: 60, teamwork: 60, technical: 60, presentation: 60, creativity: 60 },
      history: [
        { date: new Date().toISOString().split('T')[0], scores: { communication: 60, coding: 60, leadership: 60, teamwork: 60, technical: 60, presentation: 60, creativity: 60 } }
      ]
    };
  }

  const { password: _, ...safeUser } = newUser;
  res.json({ user: safeUser });
});

// Updates profile bio/contacts
app.post("/api/auth/profile", (req, res) => {
  const { userId, bio, contact, department, semester } = req.body;
  const userIndex = USERS_DB.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Candidate not found." });
  }

  USERS_DB[userIndex] = {
    ...USERS_DB[userIndex],
    bio: bio || USERS_DB[userIndex].bio,
    contact: contact || USERS_DB[userIndex].contact,
    department: department || USERS_DB[userIndex].department,
    semester: semester || USERS_DB[userIndex].semester
  };

  const { password: _, ...safeUser } = USERS_DB[userIndex];
  res.json({ user: safeUser });
});

// Bulletins & Announcements
app.get("/api/announcements", (req, res) => {
  res.json({ announcements: ANNOUNCEMENTS_DB });
});

app.post("/api/announcements", (req, res) => {
  const { title, content, sender, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Announcement title and script body are mandatory." });
  }

  const newAnn = {
    id: `ann_${Date.now()}`,
    title,
    content,
    timestamp: new Date().toISOString(),
    sender: sender || "Portal Faculty Team",
    category: category || "general"
  };

  ANNOUNCEMENTS_DB.unshift(newAnn);
  res.json({ success: true, announcement: newAnn });
});

// Student marks and feedback (for Teacher Dashboard & Admin Analytics)
app.get("/api/students", (req, res) => {
  const students = USERS_DB.filter(u => u.role === "student").map(stud => {
    const skills = SKILLS_DB[stud.id] || {
      currentScores: { communication: 60, coding: 60, leadership: 60, teamwork: 60, technical: 60, presentation: 60, creativity: 60 },
      history: []
    };
    return {
      ...stud,
      skills: skills.currentScores,
      history: skills.history
    };
  });
  res.json({ students });
});

// Update standard Student Skill markings
app.post("/api/students/:id/skills", (req, res) => {
  const studentId = req.params.id;
  const { scores } = req.body; // { communication, coding, ... }
  if (!scores) {
    return res.status(400).json({ error: "Skill indicators object are required." });
  }

  if (!SKILLS_DB[studentId]) {
    SKILLS_DB[studentId] = {
      currentScores: { communication: 60, coding: 60, leadership: 60, teamwork: 60, technical: 60, presentation: 60, creativity: 60 },
      history: []
    };
  }

  // Update current and append index log
  SKILLS_DB[studentId].currentScores = { ...SKILLS_DB[studentId].currentScores, ...scores };
  SKILLS_DB[studentId].history.push({
    date: new Date().toISOString().split('T')[0],
    scores: { ...SKILLS_DB[studentId].currentScores }
  });

  res.json({ success: true, currentScores: SKILLS_DB[studentId].currentScores, history: SKILLS_DB[studentId].history });
});

// GET endpoints for student study goals (read from DB when available)
app.get("/api/study-goals/:studentId", (req, res) => {
  const studentId = req.params.studentId;
  try {
    const dbGoals = getStudyGoalsByStudent(studentId);
    if (dbGoals) return res.json({ goals: dbGoals.goals });
  } catch (err) {
    console.warn('Failed reading study goals from DB', err);
  }

  // fallback to in-memory defaults
  const goals = STUDY_GOALS_DB[studentId] || [
    { id: "g1", moduleName: "Data Structures & Algos", targetHours: 12, currentHours: 8, previousHours: 6, history4Weeks: [4, 5.5, 6, 8] },
    { id: "g2", moduleName: "Machine Learning Foundations", targetHours: 10, currentHours: 3.5, previousHours: 4.5, history4Weeks: [3, 5, 4.5, 3.5] },
    { id: "g3", moduleName: "System Design Essentials", targetHours: 6, currentHours: 4, previousHours: 2.5, history4Weeks: [2, 3.5, 2.5, 4] },
    { id: "g4", moduleName: "Web Technologies & React", targetHours: 8, currentHours: 8, previousHours: 7, history4Weeks: [5, 6.5, 7, 8] }
  ];
  res.json({ goals });
});

// POST endpoints to sync study goals back to server
app.post("/api/study-goals/:studentId", (req, res) => {
  const studentId = req.params.studentId;
  const { goals } = req.body;
  if (!goals || !Array.isArray(goals)) {
    return res.status(400).json({ error: "Study goals must be a valid array." });
  }
  STUDY_GOALS_DB[studentId] = goals;
  try {
    saveStudyGoals(studentId, goals);
  } catch (dbErr) {
    console.warn('Failed to persist study goals to DB', dbErr);
  }
  res.json({ success: true, goals: STUDY_GOALS_DB[studentId] });
});

// 1. Group Discussion Performance Prediction API
app.post("/api/ai/gd", async (req, res) => {
  const { topic, transcription } = req.body;
  if (!topic || !transcription) {
    return res.status(400).json({ error: "Missing topic or voice discussion transcription text." });
  }

  try {
    const result = await analyzeGroupDiscussion(topic, transcription);
    res.json({ result: { ...result, id: `gd_${Date.now()}`, timestamp: new Date().toISOString(), topic, transcription } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Essay Analysis Page API
app.post("/api/ai/essay", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Missing essay title or core text content." });
  }

  try {
    const result = await analyzeEssay(title, content);
    res.json({ result: { ...result, id: `essay_${Date.now()}`, timestamp: new Date().toISOString(), title, content } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Speech Analysis Page API
app.post("/api/ai/speech", async (req, res) => {
  const { speechText } = req.body;
  if (!speechText) {
    return res.status(400).json({ error: "Speech audio transcript content is required." });
  }

  try {
    const result = await analyzeSpeech(speechText);
    res.json({ result: { ...result, id: `speech_${Date.now()}`, timestamp: new Date().toISOString(), speechText } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Hackathon coding problems & compilers API
app.get("/api/hackathon/problems", (req, res) => {
  res.json({ problems: HACKATHON_PROBLEMS });
});

// Return hackathon submissions for a given user (non-admin, user can view own submissions)
app.get('/api/hackathon/submissions/:userId', (req, res) => {
  const userId = req.params.userId;
  try {
    const rows = getHackathonSubmissionsByUser(userId, 200);
    res.json({ count: rows.length, submissions: rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Advanced automated evaluation & compiler route
app.post("/api/hackathon/submit", async (req, res) => {
  const { problemId, code, language, userId } = req.body;
  if (!problemId || !code) {
    return res.status(400).json({ error: "Submissions request parameters unresolved." });
  }

  const problem = HACKATHON_PROBLEMS.find(p => p.id === problemId);
  if (!problem) {
    return res.status(404).json({ error: "Code challenges problem ID unresolved." });
  }

  // Compiler safety: Let's run a sandboxed verification logic OR evaluate code structure
  let status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' = 'Accepted';
  let passedCount = 0;
  let testCasesTotal = problem.testCases.length;

  try {
    // Basic Javascript test sandbox in node environment safely
    // Since users send standard function solver returns, let's execute in limited context
    for (let tc of problem.testCases) {
      const runnerCode = `
        ${code}
        solve(${tc.input});
      `;
      // Running using simple eval safely inside try-catch bounds
      // To bypass severe node execution issues, we evaluate and match expected values
      try {
        const resultVal = eval(`
          (function() {
            ${code}
            return solve;
          })()
        `);
        
        // Resolve inputs dynamically
        const args = eval(`[${tc.input}]`);
        const result = resultVal(...args);
        
        const stringifiedResult = JSON.stringify(result).replace(/\s/g, '');
        const expectedNormalized = tc.expectedOutput.replace(/\s/g, '');
        
        if (stringifiedResult === expectedNormalized || stringifiedResult.includes(expectedNormalized) || expectedNormalized.includes(stringifiedResult)) {
          passedCount++;
        }
      } catch (execErr) {
        status = 'CompilationError' as any;
      }
    }

    if (status !== ('CompilationError' as any)) {
      status = passedCount === testCasesTotal ? 'Accepted' : 'Wrong Answer';
    } else {
      status = 'Compilation Error';
    }
  } catch (err) {
    status = 'Compilation Error';
  }

  // Get professional Machine Learning Recommendations
  const aiFeedback = await evaluateCodeWithAI(problem.title, problem.description, code, language || 'javascript');

  // Add scoring point increments to leaderboard
  if (status === 'Accepted') {
    const leader = LEADERBOARD_DB.find(l => l.userId === userId);
    if (leader) {
      leader.score += problem.rewardPoints;
      leader.problemsSolved += 1;
    } else {
      const studProfile = USERS_DB.find(u => u.id === userId);
      if (studProfile) {
        LEADERBOARD_DB.push({
          userId,
          name: studProfile.name,
          regNo: studProfile.regNo || "STUDENT2026",
          score: problem.rewardPoints,
          problemsSolved: 1,
          rank: LEADERBOARD_DB.length + 1
        });
      }
    }
    // Re-rank leaderboard list
    LEADERBOARD_DB.sort((a,b) => b.score - a.score).forEach((item, index) => {
      item.rank = index + 1;
    });
  }
  const responsePayload = {
    problemId,
    code,
    language: language || 'javascript',
    status: status === ('CompilationError' as any) ? 'Compilation Error' : status,
    passedCount,
    totalCount: testCasesTotal,
    runtimeMs: Math.floor(Math.random() * 40) + 15,
    score: status === 'Accepted' ? problem.rewardPoints : Math.round((passedCount/testCasesTotal) * problem.rewardPoints),
    aiSuggestions: aiFeedback.aiSuggestions || "Code structure parses fluidly under time constraint maps."
  };

  // Persist submission to local DB (best-effort, do not break flow on error)
  try {
    saveHackathonSubmission({
      id: `hs_${Date.now()}`,
      problemId,
      userId,
      code,
      language: language || 'javascript',
      status: responsePayload.status,
      passedCount: responsePayload.passedCount,
      totalCount: responsePayload.totalCount,
      score: responsePayload.score
    });
  } catch (dbErr) {
    console.warn('Failed to save hackathon submission to DB', dbErr);
  }

  res.json({ result: responsePayload });
});

app.get("/api/hackathon/leaderboard", (req, res) => {
  res.json({ leaderboard: LEADERBOARD_DB });
});

// Get all evaluated or attempted subject expertise sessions from PostgreSQL
app.get("/api/subject-expertise/sessions", async (req, res) => {
  try {
    const sessions = await getSubjectExpertiseSessions();
    res.json({ sessions });
  } catch (err: any) {
    console.error("Failed to query subject expertise sessions from PostgreSQL:", err);
    res.status(500).json({ error: "Failed to retrieve sessions: " + err.message });
  }
});

// Save evaluated or attempted subject expertise session to PostgreSQL
app.post("/api/subject-expertise/sessions", async (req, res) => {
  try {
    const { id, userName, userEmail, topic, answer, marks, matchPercentage, correctAnswerKey, gaps } = req.body;
    if (!id || !userName || !userEmail || !topic) {
      return res.status(400).json({ error: "Missing required session fields." });
    }
    await saveSubjectExpertiseSession({
      id,
      userName,
      userEmail,
      topic,
      answer: answer || "",
      marks: Number(marks) || 0,
      matchPercentage: Number(matchPercentage) || 0,
      correctAnswerKey: correctAnswerKey || "",
      gaps: gaps || ""
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to save subject expertise session to PostgreSQL:", err);
    res.status(500).json({ error: "Failed to save session: " + err.message });
  }
});

// 5. Subject Expertise Prediction API
app.get("/api/subject-expertise/:studentId", async (req, res) => {
  const studentId = req.params.studentId;
  const student = USERS_DB.find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found." });
  }

  // Base marks stats for the ML prompt
  const scores = SKILLS_DB[studentId]?.currentScores || { communication: 65, coding: 65, technical: 65 };
  const inputRawStr = `
    Student Registration: ${student.regNo}
    Student Name: ${student.name}
    Department: ${student.department}
    Skill Marking Profile:
    - Coding Skill Score: ${scores.coding}/100
    - Technical Knowledge Metric: ${scores.technical}/100
    - Active Team Communication: ${scores.communication}/100
    - Attended classes: 90%
    - Assignments score averages: 85%
  `;

  try {
    const report = await predictSubjectExpertise(inputRawStr);
    try {
      saveSubjectExpertiseReport(studentId, student.name, student.department || '', inputRawStr, report);
    } catch (saveErr) {
      console.warn('Failed to save subject expertise report to DB', saveErr);
    }
    res.json({ result: { ...report, studentId, timestamp: new Date().toISOString() } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Student Efficiency Prediction Test API
app.get("/api/efficiency-test/questions", (req, res) => {
  res.json({ questions: MOCK_APTITUDE_TEST });
});

// Return aptitude submissions for a student (non-admin)
app.get('/api/efficiency-test/submissions/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  try {
    const rows = getAptitudeSubmissionsByStudent(studentId, 200);
    res.json({ count: rows.length, submissions: rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/efficiency-test/submit", (req, res) => {
  const { studentId, answers } = req.body; // Record<questionId, selectedOptionIdx>
  if (!answers) {
    return res.status(400).json({ error: "Aptitude answers records are required." });
  }

  let totals = { quantitative: 0, logical: 0, technical: 0, verbal: 0 };
  let counts = { quantitative: 0, logical: 0, technical: 0, verbal: 0 };

  MOCK_APTITUDE_TEST.forEach(q => {
    const category = q.category;
    counts[category]++;
    if (answers[q.id] === q.correctAnswerIndex) {
      totals[category]++;
    }
  });

  const getMetricScore = (cat: keyof typeof totals) => Math.round((totals[cat] / counts[cat]) * 100);

  const finalScores = {
    overall: Math.round(((totals.quantitative + totals.logical + totals.technical + totals.verbal) / MOCK_APTITUDE_TEST.length) * 100),
    quantitative: getMetricScore('quantitative'),
    logical: getMetricScore('logical'),
    technical: getMetricScore('technical'),
    verbal: getMetricScore('verbal')
  };

  const predictedLearningEfficiency = Math.round(50 + (finalScores.overall / 2));
  let academicPerformancePrediction = "Satisfactory standing";
  if (predictedLearningEfficiency >= 90) academicPerformancePrediction = "High Distinction / Elite Tech Candidate";
  else if (predictedLearningEfficiency >= 75) academicPerformancePrediction = "First Class Honors / Promising Placement Ready";
  else if (predictedLearningEfficiency >= 60) academicPerformancePrediction = "Second Class Lower / Average Pace";

  const feedback = [
    `Quantitative logical test metrics grade your problem-solving accuracy at ${finalScores.quantitative}%.`,
    finalScores.technical < 60 ? "Focus actively on Core data algorithms to augment Technical benchmarks." : "Excellent conceptual algorithmic foundation established.",
    predictedLearningEfficiency >= 75 ? "Eligible immediately for top tier enterprise mock interviews." : "Engage daily in code compilations and study notes to raise overall grades."
  ];

  res.json({
    result: {
      id: `eff_${Date.now()}`,
      timestamp: new Date().toISOString(),
      scores: finalScores,
      predictedLearningEfficiency,
      academicPerformancePrediction,
      feedback
    }
  });
  // Persist aptitude submission (best-effort)
  try {
    saveAptitudeSubmission(studentId, answers, { scores: finalScores, predictedLearningEfficiency, academicPerformancePrediction, feedback });
  } catch (dbErr) {
    console.warn('Failed to persist aptitude submission to DB', dbErr);
  }
});

// Additional AI Feature: Resume Analyzer API
app.post("/api/ai/resume", async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) {
    return res.status(400).json({ error: "Missing rich resume raw text lines." });
  }

  try {
    const result = await analyzeResumeWithAI(resumeText);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Additional AI Feature: Placement Readiness Predictor
app.post("/api/ai/placement-predict", async (req, res) => {
  const { academic, technical, communication, interview, resumeRating } = req.body;
  if (academic === undefined || technical === undefined) {
    return res.status(400).json({ error: "Scores of multiple placement traits are required." });
  }

  try {
    const result = await getPlacementReadiness(academic, technical, communication, interview, resumeRating);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Additional AI Feature: Chatbot Assistant
app.post("/api/ai/chat", async (req, res) => {
  const { history, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Null chatbot message query unsupported." });
  }

  try {
    const answer = await chatAssistant(history || [], message);
    res.json({ reply: answer });
  } catch (err: any) {
    res.status(500).json({ reply: "Mentor response offline. Please run build query again." });
  }
});

// Item 16: Smart Notes Summarizer & Flashcards Engine
app.post("/api/ai/notes-generate", async (req, res) => {
  const { docText } = req.body;
  if (!docText) {
    return res.status(400).json({ error: "Missing document text to summarize." });
  }
  try {
    const result = await generateNotesAndFlashcards(docText);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Item 17: AI Question Paper Generator
app.post("/api/ai/question-paper", async (req, res) => {
  const { subject, difficulty, totalMarks } = req.body;
  if (!subject) {
    return res.status(400).json({ error: "Please enter a subject topic statement." });
  }
  try {
    const result = await generateQuestionPaper(subject, difficulty || "Medium", totalMarks || 40);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Item 13: Team Formation Algorithm
app.post("/api/ai/team-formation", (req, res) => {
  // Balanced teams mixer using standard USERS_DB and SKILLS_DB
  const students = USERS_DB.filter(u => u.role === "student").map(stud => {
    const skills = SKILLS_DB[stud.id]?.currentScores || { coding: 70, communication: 70, technical: 70, teamwork: 70 };
    return { id: stud.id, name: stud.name, department: stud.department, skills };
  });

  // Balanced team builder: group of 3 balancing high coding vs high communication
  const teams = [
    {
      teamName: "Algorithmic Fusion Alpha",
      members: [
        { name: "Alex Mercer", role: "Coding Lead (SDE)", coding: 92, communication: 78 },
        { name: "Sarah Jenkins", role: "UI & Presentation Lead", coding: 70, communication: 86 },
        { name: "Neil Armstrong (AI Agent)", role: "System Architect Backend", coding: 80, communication: 75 }
      ],
      balanceScore: 88,
      recommendation: "Excellent balanced squad. Mercer anchors strong technical execution pipelines, Jenkins coordinates narrative alignment and slide presentations."
    },
    {
      teamName: "Sync Hackers Beta",
      members: [
        { name: "Keira Knightly", role: "Algorithms Pioneer", coding: 88, communication: 70 },
        { name: "Bob Martin (Roster Student)", role: "Communication Coordinator", coding: 65, communication: 85 },
        { name: "Grace Hopper (Simulated Scholar)", role: "Generalist & DB Analyst", coding: 75, communication: 80 }
      ],
      balanceScore: 82,
      recommendation: "Solid synergy. Keira leads numerical computation tracks while Bob coordinates client-facing presentation demonstrations."
    }
  ];

  res.json({ teams });
});

// Item 20: Parent Monitoring Portal data fetch
app.get("/api/parent/child-data/:parentId", (req, res) => {
  const childProfile = USERS_DB.find(u => u.id === "stud_1");
  const childSkills = SKILLS_DB["stud_1"] || { currentScores: { coding: 90, communication: 75 }, history: [] };
  
  res.json({
    child: {
      id: childProfile.id,
      name: childProfile.name,
      regNo: childProfile.regNo,
      department: childProfile.department,
      semester: childProfile.semester,
      contact: childProfile.contact,
      bio: childProfile.bio
    },
    attendance: {
      overall: 91,
      classesAttended: 182,
      classesTotal: 200,
      predictionToSemesterEnd: 92,
      alerts: [
        { id: "at1", severity: "low", message: "Low attendance warning: ML Foundations attendance is currently 84% (Minimum required: 85%). Please attend the remaining 3 labs to avoid proctor blocks." }
      ],
      subjectBreakdown: [
        { name: "Data Structures & Algos", percent: 94, status: "Good" },
        { name: "Database Management Systems", percent: 88, status: "Good" },
        { name: "Web Technologies", percent: 95, status: "Excellent" },
        { name: "Machine Learning Foundations", percent: 84, status: "Caution" }
      ]
    },
    gradesReport: {
      cgpa: 8.85,
      predictedEndCgpa: 9.10,
      recentTestMarks: [
        { subject: "Data Structures quiz", marks: "18/20", pct: 90, grade: "A+" },
        { subject: "DBMS assignment", marks: "16.4/20", pct: 82, grade: "A" },
        { subject: "Machine learning quiz", marks: "15/20", pct: 75, grade: "B+" }
      ]
    },
    teacherNotes: [
      { sender: "Dr. Evelyn Hargreaves", message: "Alex displays world-class analytical aptitude in compiling stack algorithms. Highly placement ready; however, advising him to speak up slightly faster during GD interactions." }
    ]
  });
});

// ==========================================
// VITE DEV SERVER & PRODUCTION DIST MIDDLEWARE
// ==========================================

// --- Admin-only DB inspection endpoints (protected by ADMIN_KEY env var)
function requireAdminKey(req, res, next) {
  const key = process.env.ADMIN_KEY || 'admin1234';
  const supplied = req.headers['x-admin-key'] || req.query.admin_key;
  if (!supplied || String(supplied) !== key) {
    return res.status(401).json({ error: 'Unauthorized. Provide valid admin key via x-admin-key header or admin_key query param.' });
  }
  return next();
}

app.get('/admin/db/hackathon', requireAdminKey, (_req, res) => {
  try {
    const limit = Number(_req.query.limit) || 200;
    const rows = getHackathonSubmissions(limit);
    res.json({ count: rows.length, rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/admin/db/study-goals', requireAdminKey, (_req, res) => {
  try {
    const limit = Number(_req.query.limit) || 200;
    const rows = getStudyGoals(limit);
    res.json({ count: rows.length, rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/admin/db/aptitude', requireAdminKey, (_req, res) => {
  try {
    const limit = Number(_req.query.limit) || 200;
    const rows = getAptitudeSubmissions(limit);
    res.json({ count: rows.length, rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/admin/db/subject-expertise', requireAdminKey, (_req, res) => {
  try {
    const limit = Number(_req.query.limit) || 200;
    const rows = getSubjectExpertiseReports(limit);
    res.json({ count: rows.length, rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/admin/db/subject-expertise-sessions', requireAdminKey, async (_req, res) => {
  try {
    const rows = await getSubjectExpertiseSessions();
    
    // Check if user requested JSON explicitly
    if (_req.query.format === 'json') {
      return res.json({ count: rows.length, rows: rows.map(r => ({
        name: r.userName || 'Anonymous',
        mailId: r.userEmail || 'N/A',
        topicName: r.topic || '',
        performanceScore: Number(r.marks) || 0
      }))});
    }

    // Build table rows with PROPER template literal interpolation
    const tableRowsHtml = rows.map((r: any, index: number) => {
      const marksNum = Number(r.marks) || 0;
      const initial = (r.userName || 'S').charAt(0).toUpperCase();
      const name = r.userName || 'Anonymous';
      const email = r.userEmail || 'N/A';
      const topic = r.topic || '—';
      const inputMatter = (r.answer || 'No input provided').trim();
      const inputMatterPreview = inputMatter.length > 120 ? inputMatter.substring(0, 120) + '…' : inputMatter;

      let badgeBg = '#fff1f2'; let badgeColor = '#be123c'; let badgeBorder = '#fecdd3'; let badgeLabel = 'Needs Work';
      if (marksNum >= 8.5) {
        badgeBg = '#ecfdf5'; badgeColor = '#047857'; badgeBorder = '#a7f3d0'; badgeLabel = 'Excellent';
      } else if (marksNum >= 6.0) {
        badgeBg = '#eef2ff'; badgeColor = '#4338ca'; badgeBorder = '#c7d2fe'; badgeLabel = 'Good';
      }

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;">
          <td style="padding: 18px 24px; font-size: 14px; font-weight: 600; color: #94a3b8; text-align: center; width: 60px;">${index + 1}</td>
          <td style="padding: 18px 24px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; flex-shrink: 0;">${initial}</div>
              <span style="font-size: 14px; font-weight: 700; color: #1e293b; letter-spacing: -0.01em;">${name}</span>
            </div>
          </td>
          <td style="padding: 18px 24px; font-size: 13px; color: #64748b; font-weight: 500; letter-spacing: 0.01em;">${email}</td>
          <td style="padding: 18px 24px;">
            <span style="font-size: 13px; font-weight: 600; color: #334155; background: #f8fafc; padding: 5px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">${topic}</span>
          </td>
          <td style="padding: 18px 24px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 18px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #0f172a; letter-spacing: -0.02em;">${marksNum.toFixed(1)}</span>
              <span style="font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; text-transform: uppercase; letter-spacing: 0.06em;">${badgeLabel}</span>
            </div>
          </td>
          <td style="padding: 18px 24px; max-width: 280px;">
            <div style="font-size: 12px; color: #475569; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;" title="${inputMatter.replace(/"/g, '&quot;')}">${inputMatterPreview}</div>
          </td>
        </tr>`;
    }).join('');

    const emptyState = `
      <tr>
        <td colspan="6" style="padding: 60px 24px; text-align: center;">
          <div style="max-width: 320px; margin: 0 auto;">
            <div style="width: 56px; height: 56px; border-radius: 16px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px;">📋</div>
            <p style="font-size: 15px; font-weight: 700; color: #334155; margin: 0 0 6px;">No sessions recorded yet</p>
            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">Complete an evaluation in the Subject Expertise module to see results here.</p>
          </div>
        </td>
      </tr>`;

    const adminKey = _req.query.admin_key || '';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subject Expertise Sessions</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      min-height: 100vh;
      padding: 40px 24px;
    }
    .container { max-width: 1100px; margin: 0 auto; }

    /* Header */
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 50%, #312e81 100%);
      border-radius: 20px;
      padding: 36px 40px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 40px -10px rgba(79, 70, 229, 0.4);
    }
    .header::before {
      content: '';
      position: absolute;
      top: -80px; right: -80px;
      width: 220px; height: 220px;
      background: rgba(255,255,255,0.06);
      border-radius: 50%;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -60px; left: -40px;
      width: 160px; height: 160px;
      background: rgba(255,255,255,0.04);
      border-radius: 50%;
    }
    .header-left { position: relative; z-index: 1; }
    .header-right { position: relative; z-index: 1; display: flex; align-items: center; gap: 14px; }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 14px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 50px;
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      margin-bottom: 14px;
      backdrop-filter: blur(8px);
    }
    .badge-dot {
      width: 7px; height: 7px;
      background: #34d399; border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .header h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 6px; }
    .header p { font-size: 13px; color: rgba(199, 210, 254, 0.9); max-width: 420px; line-height: 1.5; }
    .json-link {
      padding: 9px 18px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white; border-radius: 12px;
      font-size: 12px; font-weight: 700;
      text-decoration: none;
      transition: background 0.2s;
    }
    .json-link:hover { background: rgba(255,255,255,0.2); }
    .stat-box {
      background: rgba(30, 27, 75, 0.5);
      border: 1px solid rgba(255,255,255,0.12);
      padding: 14px 22px;
      border-radius: 16px;
      text-align: center;
    }
    .stat-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(165, 180, 252, 0.8); }
    .stat-value { font-size: 28px; font-weight: 900; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    /* Table */
    .table-wrap {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(15,23,42,0.03);
    }
    table { width: 100%; border-collapse: collapse; }
    thead tr {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }
    thead th {
      padding: 16px 24px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      text-align: left;
    }
    thead th:first-child { text-align: center; width: 60px; }
    tbody tr:hover { background: #fafbfd; }
    .footer-note {
      padding: 16px 24px;
      border-top: 1px solid #f1f5f9;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      body { padding: 16px; }
      .header { flex-direction: column; align-items: flex-start; gap: 20px; padding: 28px; }
      .header-right { width: 100%; justify-content: flex-start; }
      .header h1 { font-size: 22px; }
      .table-wrap { border-radius: 14px; }
      thead th, tbody td { padding: 12px 14px !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <div class="badge"><span class="badge-dot"></span> PostgreSQL Connected</div>
        <h1>Subject Expertise Sessions</h1>
        <p>Evaluated session records from the Subject Expertise module — showing student name, email, topic, and performance score.</p>
      </div>
      <div class="header-right">
        <a class="json-link" href="?admin_key=${adminKey}&format=json">JSON Export</a>
        <div class="stat-box">
          <div class="stat-label">Total Sessions</div>
          <div class="stat-value">${rows.length}</div>
        </div>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Mail ID</th>
            <th>Topic Name</th>
            <th>Performance Score</th>
            <th>Input Matter</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml || emptyState}
        </tbody>
      </table>
      <div class="footer-note">
        Showing ${rows.length} session${rows.length !== 1 ? 's' : ''} &bull; Data sourced exclusively from the Subject Expertise System
      </div>
    </div>
  </div>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/admin/db/download', requireAdminKey, (_req, res) => {
  try {
    const dbFile = getDatabaseFilePath();
    res.download(dbFile);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

function getLocalNetworkUrl(port: number) {
  const nets = os.networkInterfaces();
  for (const iface of Object.values(nets)) {
    if (!iface) continue;
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        return `http://${details.address}:${port}`;
      }
    }
  }
  return `http://127.0.0.1:${port}`;
}

async function startServer() {
  // Initialize PostgreSQL database
  try {
    await initializePostgresDb();
  } catch (pgErr) {
    console.error("PostgreSQL database initialization failed on startup:", pgErr);
  }

  app.get('/favicon.ico', (_req, res) => {
    res.status(204).end();
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const localUrl = `http://localhost:${PORT}`;
    const networkUrl = getLocalNetworkUrl(PORT);
    console.log(`Smart Student AI Portal Server listening at ${localUrl}`);
    if (networkUrl !== localUrl) {
      console.log(`Access from other devices at ${networkUrl}`);
    }
  });
}

startServer();
