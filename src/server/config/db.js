const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Cloud Run에서 Cloud SQL 연결 시 사용 (/cloudsql/ 접두사 자동 처리)
  socketPath: process.env.DB_SOCKET_PATH 
    ? (process.env.DB_SOCKET_PATH.startsWith('/cloudsql/') 
        ? process.env.DB_SOCKET_PATH 
        : `/cloudsql/${process.env.DB_SOCKET_PATH}`)
    : null,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 연결 타임아웃 10초로 연장
});

// 연결 테스트 함수
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL 연결 성공!');
    console.log(`   Host: ${process.env.DB_HOST || 'via Socket'}`);
    if (process.env.DB_SOCKET_PATH) {
      console.log(`   Socket: ${process.env.DB_SOCKET_PATH}`);
    }
    console.log(`   Database: ${process.env.DB_NAME}`);
    connection.release();
    return { connected: true };
  } catch (error) {
    console.error('❌ MySQL 연결 실패 상세 정보:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    return { connected: false, error: error.message, code: error.code };
  }
}

module.exports = { pool, testConnection };
