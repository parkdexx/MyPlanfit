/**
 * DB 초기화 스크립트
 * 실행: npm run init-db
 * 
 * myplanfit 데이터베이스에 필요한 테이블들을 생성합니다.
 */
const { pool } = require('../config/db');

const schema = `
-- =============================================
-- Users (사용자)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(100) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Template: DAY_PLAN (운동 루틴 템플릿)
-- =============================================
CREATE TABLE IF NOT EXISTS day_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Template: EXERCISE_PLAN (운동 종목 템플릿)
-- =============================================
CREATE TABLE IF NOT EXISTS exercise_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_plan_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  body_part VARCHAR(50),
  youtube_url VARCHAR(500),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (day_plan_id) REFERENCES day_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Template: SET_PLAN (세트 템플릿)
-- =============================================
CREATE TABLE IF NOT EXISTS set_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exercise_plan_id INT NOT NULL,
  weight_kg DECIMAL(5,2) DEFAULT 0,
  reps INT DEFAULT 0,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exercise_plan_id) REFERENCES exercise_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Email Verifications (이메일 인증)
-- =============================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- History: 운동 기록 (날짜별)
-- =============================================
CREATE TABLE IF NOT EXISTS workout_history_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  day_plan_id INT,
  day_plan_name VARCHAR(100),
  workout_date DATE NOT NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, workout_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- History: 운동 기록 (운동 종목별)
-- =============================================
CREATE TABLE IF NOT EXISTS workout_history_exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  history_day_id INT NOT NULL,
  exercise_name VARCHAR(100) NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (history_day_id) REFERENCES workout_history_days(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- History: 운동 기록 (세트별)
-- =============================================
CREATE TABLE IF NOT EXISTS workout_history_sets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  history_exercise_id INT NOT NULL,
  set_number INT NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL DEFAULT 0,
  reps INT NOT NULL DEFAULT 0,
  status ENUM('DONE', 'GIVEN_UP') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (history_exercise_id) REFERENCES workout_history_exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function initDatabase() {
  console.log('🔄 데이터베이스 테이블 초기화 시작...\n');

  const statements = schema
    .split(';')
    .map(s => s.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await pool.query(statement);
      // 테이블 이름 추출하여 출력
      const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      if (match) {
        console.log(`  ✅ ${match[1]} 테이블 생성 완료`);
      }
    } catch (error) {
      console.error(`  ❌ 오류:`, error.message);
      console.error(`     SQL: ${statement.substring(0, 80)}...`);
    }
  }

  // Add Dummy User
  try {
    const bcrypt = require('bcrypt');
    const dummyEmail = 'test@test.com';
    const dummyPassword = '1234';
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);
    
    // Check if exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [dummyEmail]);
    if (existing.length === 0) {
      await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [dummyEmail, hashedPassword]);
      console.log(`  ✅ 테스트용 계정 생성 완료 (Email: ${dummyEmail}, Password: ${dummyPassword})`);
    } else {
      console.log(`  ℹ️ 테스트용 계정이 이미 존재합니다. (Email: ${dummyEmail})`);
    }
  } catch (error) {
    console.error('  ❌ 테스트 계정 생성 오류:', error.message);
  }

  console.log('\n✨ 데이터베이스 초기화 완료!');
  process.exit(0);
}

initDatabase().catch(err => {
  console.error('❌ 초기화 실패:', err);
  process.exit(1);
});
