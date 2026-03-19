const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { pool } = require('../config/db');

// 이메일 발송 설정 (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 모두 입력해주세요.' });
    }

    // 이메일로 유저 찾기 (Prepared Statement로 SQL Injection 방어)
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: '존재하지 않는 이메일이거나 비밀번호가 틀렸습니다.' });
    }

    const user = users[0];

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: '존재하지 않는 이메일이거나 비밀번호가 틀렸습니다.' });
    }

    // JWT 발급
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' } // 일주일
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

// POST /api/auth/send-code
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    // 이메일 정규식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: '유효한 이메일 주소를 입력해주세요.' });
    }

    // 이미 가입된 이메일인지 확인
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: '이미 가입된 이메일입니다.' });
    }

    // 6자리 OTP 생성
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

    // DB 저장
    await pool.query(
      'INSERT INTO email_verifications (email, otp_code, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // 이메일 발송
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: '[MyPlanfit] 회원가입 이메일 인증 번호',
      text: `안녕하세요!\n운동을 다시 즐겁게. MyPlanfit 입니다.\n\n회원가입을 위한 인증 번호는 아래와 같습니다.\n\n\n${otp}\n\n\nMyPlanfit 화면으로 돌아가, 인증 번호를 입력해 주세요.\n감사합니다.\n\n* 이 번호는 5분간 유효합니다.\n* 이 메일에 답장을 하시면 곤란합니다. 😢`
    };
    
    await transporter.sendMail(mailOptions);

    res.json({ message: '인증 번호가 발송되었습니다. 메일함을 확인해주세요.' });
  } catch (error) {
    console.error('Send Code Error:', error);
    res.status(500).json({ error: '인증 메일 발송에 실패했습니다.' });
  }
});

// POST /api/auth/verify-code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: '이메일과 인증 번호를 입력해주세요.' });
    }

    // 최근 발송된 인증 코드 조회
    const [rows] = await pool.query(
      'SELECT otp_code, expires_at FROM email_verifications WHERE email = ? ORDER BY id DESC LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: '인증 요청 내역이 없습니다. 인증 번호를 먼저 요청해주세요.' });
    }

    const verification = rows[0];

    // 만료 여부 확인
    if (new Date() > new Date(verification.expires_at)) {
      return res.status(400).json({ error: '인증 번호가 만료되었습니다. 다시 시도해주세요.' });
    }

    // 일치 여부 확인
    if (code !== verification.otp_code) {
      return res.status(400).json({ error: '인증 번호가 일치하지 않습니다.' });
    }

    res.json({ message: '이메일 인증이 완료되었습니다.' });
  } catch (error) {
    console.error('Verify Code Error:', error);
    res.status(500).json({ error: '인증 확인 중 오류가 발생했습니다.' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, nickname, password } = req.body;

    if (!email || !nickname || !password) {
      return res.status(400).json({ error: '모든 항목을 입력해야 가입이 가능합니다.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: '보안을 위해 비밀번호는 최소 4자 이상이어야 합니다.' });
    }

    // 한번 더 프론트단 조작 방지를 위해 이메일 가입 유무 검증
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: '이미 가입된 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, nickname, password_hash) VALUES (?, ?, ?)',
      [email, nickname, hashedPassword]
    );

    res.status(201).json({ 
      message: '회원가입 절차가 끝났습니다. 로그인 화면으로 이동합니다!',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: '회원가입 처리 중 데이터 오류가 발생했습니다.' });
  }
});

module.exports = router;
