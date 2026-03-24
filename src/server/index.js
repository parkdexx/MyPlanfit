const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
// Cloud Run의 Secret Manager 마운트 경로 확인
if (fs.existsSync('/secrets/.env')) {
  require('dotenv').config({ path: '/secrets/.env' });
  console.log('🔐 Production: Loaded environment variables from Secret Manager (/secrets/.env)');
} else {
  require('dotenv').config();
}

const { testConnection } = require('./config/db');
const { apiLimiter, healthLimiter } = require('./middleware/rateLimiter');

const app = express();
app.set('trust proxy', 1); // Cloud Run (Proxy) 환경에서의 Rate Limiting을 위해 설정
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "frame-src": ["'self'", "https://www.youtube.com", "https://youtube.com", "https://www.youtube-nocookie.com"],
      "img-src": ["'self'", "data:", "https://i.ytimg.com", "https://*.youtube.com"],
    },
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
})); // 보안 헤더 적용 (YouTube iframe 허용 및 Referrer 허용)
app.use(cors({
  origin: [
    'http://localhost:5173', // 로컬 개발 환경
    'https://myplanfit-65988077346.asia-northeast3.run.app' // 운영 환경
  ],
  credentials: true
}));
app.use(express.json());

// ── Health Check (전용 rate limiter 적용) ──
app.get('/api/health', healthLimiter, async (req, res) => {
  const dbStatus = await testConnection();
  
  // Cloud Run에서 사용 가능한 소켓 목록 진단
  let availableSockets = [];
  try {
    if (fs.existsSync('/cloudsql')) {
      availableSockets = fs.readdirSync('/cloudsql');
    }
  } catch (err) {
    availableSockets = [`Error reading /cloudsql: ${err.message}`];
  }

  res.json({
    status: 'OK',
    server: '🟢 MyPlanfit API Server is running',
    database: dbStatus.connected ? '🟢 Connected' : '🔴 Disconnected',
    dbError: dbStatus.error || null,
    dbCode: dbStatus.code || null,
    socketPathUsed: process.env.DB_SOCKET_PATH || 'Not Set',
    availableSockets: availableSockets,
    timestamp: new Date().toISOString(),
  });
});

// Rate Limiter는 health check 이후에 적용
app.use('/api', apiLimiter);

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/home', require('./routes/home'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/workout', require('./routes/workout'));

// ── Frontend Static Serving ──
// 환경이 Production일 경우, React 빌드 결과물(dist)을 Express가 서빙합니다.
if (process.env.NODE_ENV === 'production') {
  console.log('📦 Production 모드: 프론트엔드 정적 파일을 백엔드에서 제공합니다.');
  // 프론트엔드 빌드된 정적 파일 경로
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // API 요청이 아닌 모든 Get 요청은 React 앱(index.html)으로 넘깁니다. (React Router 호환용)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// ── Start Server ──
// const { initYoutubeCron } = require('./cron/youtubeUpdater'); // 더 이상 서버 백그라운드에서 동작하지 않음 (로컬수동실행으로 대체)

const server = app.listen(PORT, async () => {
  console.log(`\n🚀 MyPlanfit Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
  await testConnection();
});

// 유튜브 영상 관리를 위한 스케줄러 시작 (매일 새벽 1시) 및 반환된 task 할당
// const youtubeCronTask = initYoutubeCron(); 
const youtubeCronTask = null;

// ── Graceful Shutdown (정상 종료 로직) ──
// PM2, nodemon, Ctrl+C 등으로 프로세스 종료 신호가 들어왔을 때 cron 작업이 무한 증식하지 않도록 처리합니다.
const gracefulShutdown = () => {
  console.log('\n🛑 서버 종료 신호 감지. 관련 자원을 안전하게 종료합니다...');

  if (youtubeCronTask) {
    console.log('⏰ YouTube Cron 스케줄러 정지');
    youtubeCronTask.stop(); // 스케줄러 실행 중지
  }

  server.close(() => {
    console.log('🚀 Express 서버 연결 종료 완료');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
