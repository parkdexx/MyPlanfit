const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET /api/exercises?target=가슴
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { target } = req.query;
    
    let query = 'SELECT id, name, body_part, youtube_url FROM exercise_dictionary';
    const params = [];

    if (target) {
      query += ' WHERE body_part LIKE ?';
      params.push(`%${target}%`);
    }
    
    query += ' ORDER BY name ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Exercises Dictionary Route Error:', error);
    res.status(500).json({ error: '운동 목록을 불러오지 못했습니다.' });
  }
});

module.exports = router;
