const rateLimit = require('express-rate-limit');

// 일반 API 요청 제한
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 150,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 인증 관련 요청 제한 (브루트포스 방지)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: '로그인 시도가 너무 많습니다. 10분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check 요청 제한: 1분당 10회
const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'Health check 요청이 너무 많습니다.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, healthLimiter };
