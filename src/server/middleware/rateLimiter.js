const rateLimit = require('express-rate-limit');

// 일반 API 요청 제한: 1분당 1회
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1,
  message: { error: '요청이 너무 많습니다. 1분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 인증 관련 요청 제한: 1분당 1회 (브루트포스 방지)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1,
  message: { error: '로그인 시도가 너무 많습니다. 5분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
