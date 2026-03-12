const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');
const { apiLimiter, healthLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Health Check (전용 rate limiter 적용) ──
app.get('/api/health', healthLimiter, async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'OK',
    server: '🟢 MyPlanfit API Server is running',
    database: dbConnected ? '🟢 Connected' : '🔴 Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Rate Limiter는 health check 이후에 적용
app.use('/api', apiLimiter);

// ── Routes (추후 추가) ──
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/plans', require('./routes/plans'));
// app.use('/api/workout', require('./routes/workout'));

// ── Start Server ──
app.listen(PORT, async () => {
  console.log(`\n🚀 MyPlanfit Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
  await testConnection();
});
