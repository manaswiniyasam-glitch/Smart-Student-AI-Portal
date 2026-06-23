/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'faculty' | 'admin' | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  regNo?: string;
  department?: string;
  semester?: string;
  contact?: string;
  bio?: string;
}

// 1. Group Discussion Performance Prediction Mode
export interface GDAnalysisResult {
  id: string;
  timestamp: string;
  topic: string;
  transcription: string;
  scores: {
    overall: number;
    confidence: number;
    fluency: number;
    communication: number;
    leadership: number;
    participation: number;
    quality: number;
  };
  metrics: {
    speakingTimeSec: number;
    fillerWordsCount: number;
    wpm: number;
    confidencePercent: number;
    sentiment: 'positive' | 'neutral' | 'constructive';
  };
  suggestions: string[];
}

// 2. Essay Writing Efficiency Prediction
export interface EssayAnalysisResult {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  scores: {
    overall: number;
    grammar: number;
    vocabulary: number;
    structure: number;
    relevance: number;
    readability: number;
    originality: number; // 100 - plagiarism %
  };
  metrics: {
    wordCount: number;
    charCount: number;
    readabilityScoreStr: string; // e.g. "Grade 10" or "Easy"
    grammarErrorsCount: number;
    plagiarismPercent: number;
  };
  suggestions: string[];
}

// 3. Speech Efficiency Prediction
export interface SpeechAnalysisResult {
  id: string;
  timestamp: string;
  speechText: string;
  scores: {
    overall: number;
    pronunciation: number;
    clarity: number;
    confidence: number;
    speedConsistency: number;
    pauseEfficiency: number;
  };
  metrics: {
    durationSec: number;
    wpm: number;
    pausesCount: number;
    fillerWords: string[];
  };
  suggestions: string[];
}

// 4. Coding Hackathons Systems
export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  sampleInput: string;
  sampleOutput: string;
  starterCode: string;
  testCases: { input: string; expectedOutput: string }[];
  rewardPoints: number;
}

export interface HackathonContest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  problems: CodingProblem[];
  participantsCount: number;
}

export interface SubmissionResult {
  problemId: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error';
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  compileError?: string;
  score: number;
  aiSuggestions: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  regNo: string;
  score: number;
  problemsSolved: number;
  rank: number;
}

// 5. Subject Expertise Prediction System
export interface SubjectPerformance {
  subjectName: string;
  attendancePercent: number;
  attendanceScore: number; // Weighted
  assignmentMarksPercent: number;
  quizMarksPercent: number;
  examMarksPercent: number;
  overallScore: number;
}

export interface SubjectExpertiseReport {
  studentId: string;
  timestamp: string;
  performances: SubjectPerformance[];
  predictedStrongest: string;
  predictedWeakest: string;
  careerDomainRecommendation: {
    domainName: string;
    description: string;
    recommendedSkills: string[];
    suitableRoles: string[];
  };
  technologiesToLearn: string[];
  remediationPlan: string[];
}

// 6. Student Efficiency Prediction Test
export interface AptitudeQuestion {
  id: string;
  category: 'quantitative' | 'logical' | 'technical' | 'verbal';
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface EfficiencyTestResult {
  id: string;
  timestamp: string;
  scores: {
    overall: number;
    quantitative: number;
    logical: number;
    technical: number;
    verbal: number;
  };
  predictedLearningEfficiency: number; // e.g. 85%
  academicPerformancePrediction: string; // "High Distinction", "First Class", etc.
  feedback: string[];
}

// 7. Student Skills Marks Management System
export interface StudentSkillScores {
  communication: number;
  coding: number;
  leadership: number;
  teamwork: number;
  technical: number;
  presentation: number;
  creativity: number;
}

export interface SkillHistoryEntry {
  date: string;
  scores: StudentSkillScores;
}

export interface StudentSkillReport {
  studentId: string;
  studentName: string;
  currentScores: StudentSkillScores;
  history: SkillHistoryEntry[];
}

// AI Help / Additional Modules
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ResumeAnalysisResult {
  score: number;
  parsedDetails: {
    name?: string;
    email?: string;
    skillsIdentified: string[];
    experienceSum?: string;
    educationSum?: string;
  };
  recommendations: string[];
  readyForPlacement: boolean;
}

export interface PlacementReadinessResult {
  overallScore: number; // 0-100
  status: 'Ready' | 'Needs Improvement' | 'Critical Review';
  componentScores: {
    academicPerformance: number;
    technicalSkills: number;
    communicationSkills: number;
    interviewRating: number;
    resumeRating: number;
  };
  criticalGaps: string[];
  actionPath: string[];
}

export interface InterviewQA {
  id: string;
  question: string;
  userAnswer?: string;
  aiFeedback?: {
    score: number;
    positives: string[];
    gaps: string[];
    sampleBestAnswer: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  sender: string;
  category: 'hackathon' | 'exam' | 'placement' | 'general';
}
