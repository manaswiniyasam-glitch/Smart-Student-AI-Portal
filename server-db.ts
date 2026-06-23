import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);

// Initialize tables
db.prepare(`CREATE TABLE IF NOT EXISTS hackathon_submissions (
  id TEXT PRIMARY KEY,
  problemId TEXT,
  userId TEXT,
  code TEXT,
  language TEXT,
  status TEXT,
  passedCount INTEGER,
  totalCount INTEGER,
  score INTEGER,
  createdAt TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS study_goals (
  studentId TEXT PRIMARY KEY,
  goals TEXT,
  updatedAt TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS aptitude_submissions (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  answers TEXT,
  result TEXT,
  createdAt TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS subject_expertise_reports (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  studentName TEXT,
  department TEXT,
  inputData TEXT,
  report TEXT,
  createdAt TEXT
)`).run();

export function saveHackathonSubmission(entry: {
  id?: string;
  problemId: string;
  userId?: string;
  code: string;
  language?: string;
  status?: string;
  passedCount?: number;
  totalCount?: number;
  score?: number;
}) {
  try {
    const id = entry.id || `hs_${Date.now()}`;
    const stmt = db.prepare(`INSERT OR REPLACE INTO hackathon_submissions
      (id, problemId, userId, code, language, status, passedCount, totalCount, score, createdAt)
      VALUES (@id,@problemId,@userId,@code,@language,@status,@passedCount,@totalCount,@score,@createdAt)`);
    stmt.run({
      id,
      problemId: entry.problemId,
      userId: entry.userId || null,
      code: entry.code,
      language: entry.language || null,
      status: entry.status || null,
      passedCount: entry.passedCount || 0,
      totalCount: entry.totalCount || 0,
      score: entry.score || 0,
      createdAt: new Date().toISOString()
    });
    return id;
  } catch (err) {
    console.warn('DB: failed saving hackathon submission', err);
    return null;
  }
}

export function saveStudyGoals(studentId: string, goals: any[]) {
  try {
    const stmt = db.prepare(`INSERT OR REPLACE INTO study_goals (studentId, goals, updatedAt) VALUES (@studentId, @goals, @updatedAt)`);
    stmt.run({ studentId, goals: JSON.stringify(goals), updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.warn('DB: failed saving study goals', err);
    return false;
  }
}

export function saveAptitudeSubmission(studentId: string, answers: any, result: any) {
  try {
    const id = `apt_${Date.now()}`;
    const stmt = db.prepare(`INSERT INTO aptitude_submissions (id, studentId, answers, result, createdAt) VALUES (@id,@studentId,@answers,@result,@createdAt)`);
    stmt.run({ id, studentId, answers: JSON.stringify(answers), result: JSON.stringify(result), createdAt: new Date().toISOString() });
    return id;
  } catch (err) {
    console.warn('DB: failed saving aptitude submission', err);
    return null;
  }
}

export function saveSubjectExpertiseReport(studentId: string, studentName: string, department: string, inputData: any, report: any) {
  try {
    const id = `se_${Date.now()}`;
    const stmt = db.prepare(`INSERT INTO subject_expertise_reports (id, studentId, studentName, department, inputData, report, createdAt) VALUES (@id,@studentId,@studentName,@department,@inputData,@report,@createdAt)`);
    stmt.run({
      id,
      studentId,
      studentName,
      department,
      inputData: JSON.stringify(inputData),
      report: JSON.stringify(report),
      createdAt: new Date().toISOString()
    });
    return id;
  } catch (err) {
    console.warn('DB: failed saving subject expertise report', err);
    return null;
  }
}

export default db;

// Query helpers for admin access
export function getHackathonSubmissions(limit = 100) {
  try {
    const stmt = db.prepare(`SELECT * FROM hackathon_submissions ORDER BY createdAt DESC LIMIT ?`);
    return stmt.all(limit);
  } catch (err) {
    console.warn('DB: failed querying hackathon submissions', err);
    return [];
  }
}

export function getStudyGoals(limit = 100) {
  try {
    const stmt = db.prepare(`SELECT * FROM study_goals ORDER BY updatedAt DESC LIMIT ?`);
    const rows = stmt.all(limit);
    return rows.map(r => ({ ...r, goals: JSON.parse(r.goals) }));
  } catch (err) {
    console.warn('DB: failed querying study goals', err);
    return [];
  }
}

export function getAptitudeSubmissions(limit = 100) {
  try {
    const stmt = db.prepare(`SELECT * FROM aptitude_submissions ORDER BY createdAt DESC LIMIT ?`);
    const rows = stmt.all(limit);
    return rows.map(r => ({ ...r, answers: JSON.parse(r.answers), result: JSON.parse(r.result) }));
  } catch (err) {
    console.warn('DB: failed querying aptitude submissions', err);
    return [];
  }
}

export function getSubjectExpertiseReports(limit = 100) {
  try {
    const stmt = db.prepare(`SELECT * FROM subject_expertise_reports ORDER BY createdAt DESC LIMIT ?`);
    const rows = stmt.all(limit);
    return rows.map(r => ({
      ...r,
      inputData: JSON.parse(r.inputData),
      report: JSON.parse(r.report)
    }));
  } catch (err) {
    console.warn('DB: failed querying subject expertise reports', err);
    return [];
  }
}

export function getDatabaseFilePath() {
  return dbPath;
}

// Per-user query helpers
export function getHackathonSubmissionsByUser(userId: string, limit = 200) {
  try {
    const stmt = db.prepare(`SELECT * FROM hackathon_submissions WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`);
    return stmt.all(userId, limit);
  } catch (err) {
    console.warn('DB: failed querying hackathon submissions by user', err);
    return [];
  }
}

export function getStudyGoalsByStudent(studentId: string) {
  try {
    const stmt = db.prepare(`SELECT * FROM study_goals WHERE studentId = ? LIMIT 1`);
    const row = stmt.get(studentId);
    if (!row) return null;
    return { studentId: row.studentId, goals: JSON.parse(row.goals), updatedAt: row.updatedAt };
  } catch (err) {
    console.warn('DB: failed querying study goals by student', err);
    return null;
  }
}

export function getAptitudeSubmissionsByStudent(studentId: string, limit = 200) {
  try {
    const stmt = db.prepare(`SELECT * FROM aptitude_submissions WHERE studentId = ? ORDER BY createdAt DESC LIMIT ?`);
    const rows = stmt.all(studentId, limit);
    return rows.map(r => ({ ...r, answers: JSON.parse(r.answers), result: JSON.parse(r.result) }));
  } catch (err) {
    console.warn('DB: failed querying aptitude submissions by student', err);
    return [];
  }
}

export function getSubjectExpertiseReportsByStudent(studentId: string, limit = 200) {
  try {
    const stmt = db.prepare(`SELECT * FROM subject_expertise_reports WHERE studentId = ? ORDER BY createdAt DESC LIMIT ?`);
    const rows = stmt.all(studentId, limit);
    return rows.map(r => ({
      ...r,
      inputData: JSON.parse(r.inputData),
      report: JSON.parse(r.report)
    }));
  } catch (err) {
    console.warn('DB: failed querying subject expertise reports by student', err);
    return [];
  }
}
