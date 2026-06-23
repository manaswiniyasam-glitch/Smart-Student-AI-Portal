import pg from 'pg';
const { Pool } = pg;

// Load config from environment variables
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'postgres',
    };

const pool = new Pool(poolConfig);

// Helper to initialize table
export async function initializePostgresDb() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL: Connected successfully to database');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS subject_expertise_sessions (
          id VARCHAR(100) PRIMARY KEY,
          user_name VARCHAR(255),
          user_email VARCHAR(255),
          topic TEXT,
          answer TEXT,
          marks NUMERIC(4,2),
          match_percentage INTEGER,
          correct_answer_key TEXT,
          gaps TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('PostgreSQL: subject_expertise_sessions table initialized');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('PostgreSQL: Connection/initialization error:', err);
  }
}

// Helper to save session
export async function saveSubjectExpertiseSession(session: {
  id: string;
  userName: string;
  userEmail: string;
  topic: string;
  answer: string;
  marks: number;
  matchPercentage: number;
  correctAnswerKey: string;
  gaps: string;
}) {
  const queryText = `
    INSERT INTO subject_expertise_sessions (
      id, user_name, user_email, topic, answer, marks, match_percentage, correct_answer_key, gaps
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      user_name = EXCLUDED.user_name,
      user_email = EXCLUDED.user_email,
      topic = EXCLUDED.topic,
      answer = EXCLUDED.answer,
      marks = EXCLUDED.marks,
      match_percentage = EXCLUDED.match_percentage,
      correct_answer_key = EXCLUDED.correct_answer_key,
      gaps = EXCLUDED.gaps;
  `;
  const values = [
    session.id,
    session.userName,
    session.userEmail,
    session.topic,
    session.answer,
    session.marks,
    session.matchPercentage,
    session.correctAnswerKey,
    session.gaps
  ];
  await pool.query(queryText, values);
}

// Helper to get sessions
export async function getSubjectExpertiseSessions() {
  const queryText = `
    SELECT 
      id, 
      user_name AS "userName", 
      user_email AS "userEmail", 
      topic, 
      answer, 
      marks, 
      match_percentage AS "matchPercentage", 
      correct_answer_key AS "correctAnswerKey", 
      gaps, 
      created_at AS "createdAt"
    FROM subject_expertise_sessions 
    ORDER BY created_at DESC;
  `;
  const res = await pool.query(queryText);
  return res.rows.map(row => ({
    ...row,
    marks: Number(row.marks)
  }));
}

export default pool;
