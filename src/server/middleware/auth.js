const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰이 없습니다. 다시 로그인해주세요.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded; // { userId: ..., email: ... }
    next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다. 다시 로그인해주세요.' });
  }
};

module.exports = authMiddleware;
