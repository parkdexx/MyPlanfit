const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 1. POST /api/workout/start (기존에 오늘자 history가 없으면 복사 생성)
router.post('/start', authMiddleware, async (req, res) => {
  const { day_plan_id } = req.body;
  const user_id = req.user.userId;
  
  if (!day_plan_id) return res.status(400).json({ error: 'day_plan_id required' });

  // 오늘 날짜 구하기 (YYYY-MM-DD)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 이미 오늘 날짜의 history_day가 있는지 확인
    const [existing] = await connection.query(
      'SELECT id FROM workout_history_days WHERE user_id = ? AND workout_date = ?',
      [user_id, todayStr]
    );

    if (existing.length > 0) {
      await connection.commit();
      return res.json({ history_day_id: existing[0].id });
    }

    // day_plan 이름 가져오기
    const [dayPlanRows] = await connection.query(
      'SELECT name FROM day_plans WHERE id = ? AND user_id = ?',
      [day_plan_id, user_id]
    );

    if (dayPlanRows.length === 0) {
      throw new Error('Day Plan not found');
    }
    const dayPlanName = dayPlanRows[0].name;

    // 1. Insert workout_history_days
    const [dayResult] = await connection.query(
      'INSERT INTO workout_history_days (user_id, day_plan_id, day_plan_name, workout_date) VALUES (?, ?, ?, ?)',
      [user_id, day_plan_id, dayPlanName, todayStr]
    );
    const historyDayId = dayResult.insertId;

    // 2. exercise_plans 가져오기
    const [exercisePlans] = await connection.query(
      'SELECT * FROM exercise_plans WHERE day_plan_id = ? ORDER BY order_index ASC',
      [day_plan_id]
    );

    for (const exPlan of exercisePlans) {
      // workout_history_exercises 추가
      const [exResult] = await connection.query(
        'INSERT INTO workout_history_exercises (history_day_id, exercise_name, order_index) VALUES (?, ?, ?)',
        [historyDayId, exPlan.name, exPlan.order_index]
      );
      const historyExId = exResult.insertId;

      // set_plans 가져오기
      const [setPlans] = await connection.query(
        'SELECT * FROM set_plans WHERE exercise_plan_id = ? ORDER BY order_index ASC',
        [exPlan.id]
      );

      let setNumber = 1;
      for (const setPlan of setPlans) {
        await connection.query(
          'INSERT INTO workout_history_sets (history_exercise_id, set_number, weight_kg, reps, status) VALUES (?, ?, ?, ?, ?)',
          [historyExId, setNumber, setPlan.weight_kg, setPlan.reps, 'PENDING']
        );
        setNumber++;
      }
    }

    await connection.commit();
    res.json({ history_day_id: historyDayId });
  } catch (error) {
    await connection.rollback();
    console.error('Start Workout Error:', error);
    res.status(500).json({ error: '운동 시작 중 오류가 발생했습니다.' });
  } finally {
    connection.release();
  }
});

// 2. GET /api/workout/:history_day_id (현재 활성화된 운동 세션 가져오기)
router.get('/:history_day_id', authMiddleware, async (req, res) => {
  const { history_day_id } = req.params;
  const user_id = req.user.userId;

  try {
    const [dayRows] = await pool.query(
      'SELECT * FROM workout_history_days WHERE id = ? AND user_id = ?',
      [history_day_id, user_id]
    );

    if (dayRows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    const [exercises] = await pool.query(
      'SELECT * FROM workout_history_exercises WHERE history_day_id = ? ORDER BY order_index ASC',
      [history_day_id]
    );

    for (const ex of exercises) {
      const [sets] = await pool.query(
        'SELECT * FROM workout_history_sets WHERE history_exercise_id = ? ORDER BY set_number ASC',
        [ex.id]
      );
      ex.sets = sets;
    }

    res.json({
      day: dayRows[0],
      exercises
    });
  } catch (error) {
    console.error('Get Workout Error:', error);
    res.status(500).json({ error: '운동 정보를 불러오는 데 실패했습니다.' });
  }
});

// 3. PUT /api/workout/set/:history_set_id (세트 상태 업데이트)
router.put('/set/:history_set_id', authMiddleware, async (req, res) => {
  const { history_set_id } = req.params;
  const { status } = req.body; // 'DONE' | 'GIVEN_UP'
  const user_id = req.user.userId;

  if (!['DONE', 'GIVEN_UP', 'PENDING'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // 본인의 세트가 맞는지 확인 필요 (join을 통해 체크)
    const checkQuery = `
      SELECT s.id 
      FROM workout_history_sets s
      JOIN workout_history_exercises e ON s.history_exercise_id = e.id
      JOIN workout_history_days d ON e.history_day_id = d.id
      WHERE s.id = ? AND d.user_id = ?
    `;
    const [check] = await pool.query(checkQuery, [history_set_id, user_id]);
    
    if (check.length === 0) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    await pool.query(
      'UPDATE workout_history_sets SET status = ? WHERE id = ?',
      [status, history_set_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update Set Error:', error);
    res.status(500).json({ error: '세트 정보 업데이트 실패' });
  }
});

// 4. PUT /api/workout/:history_day_id/finish (오늘 운동 마침)
router.put('/:history_day_id/finish', authMiddleware, async (req, res) => {
  const { history_day_id } = req.params;
  const user_id = req.user.userId;

  try {
    const [result] = await pool.query(
      'UPDATE workout_history_days SET completed_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [history_day_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found or permission denied' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Finish Workout Error:', error);
    res.status(500).json({ error: '운동 완료 처리 실패' });
  }
});

module.exports = router;
