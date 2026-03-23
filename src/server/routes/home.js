const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// 토큰 인증이 필요한 라우터
router.use(authMiddleware);

// GET /api/home/profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const [users] = await pool.query('SELECT nickname, email FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Profile Route Error:', error);
    res.status(500).json({ error: '프로필 정보를 불러오지 못했습니다.' });
  }
});

// GET /api/home/day-plans
router.get('/day-plans', async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1) 사용자의 모든 DAY_PLAN 가져오기 (이름 순이 아닌 만들어진 순서대로 order_index 권장, 우선 id순 정렬)
    const [dayPlans] = await pool.query(
      'SELECT id, name, order_index FROM day_plans WHERE user_id = ? ORDER BY order_index ASC, id ASC',
      [userId]
    );

    // 플랜이 없으면 바로 응답
    if (dayPlans.length === 0) {
      return res.json({ dayPlans: [], nextPlanIndex: 0 });
    }

    // 2) 최근에 운동 기록이 있는 day_plan_id 찾기
    const [histories] = await pool.query(
      'SELECT day_plan_id FROM workout_history_days WHERE user_id = ? ORDER BY workout_date DESC, completed_at DESC LIMIT 1',
      [userId]
    );

    const dayPlanIds = dayPlans.map(dp => dp.id);
    const [exercisePlans] = await pool.query(
      'SELECT day_plan_id, name FROM exercise_plans WHERE day_plan_id IN (?) ORDER BY order_index ASC, id ASC',
      [dayPlanIds]
    );

    // 각 dayPlan에 exercise_names 배열 추가
    const dayPlansWithExercises = dayPlans.map(dp => {
      const exercises = exercisePlans
        .filter(ex => ex.day_plan_id === dp.id)
        .map(ex => ex.name);
      return { ...dp, exercises };
    });

    let nextPlanIndex = 0;
    
    // 만약 예전에 한 적이 있다면,
    if (histories.length > 0 && histories[0].day_plan_id) {
      const lastPlanId = histories[0].day_plan_id;
      const lastIndex = dayPlansWithExercises.findIndex(p => p.id === lastPlanId);
      
      // 방금 전 했던 루틴의 다음 루틴 (순환)
      if (lastIndex !== -1) {
        nextPlanIndex = (lastIndex + 1) % dayPlansWithExercises.length;
      }
    }

    res.json({ dayPlans: dayPlansWithExercises, nextPlanIndex });
  } catch (error) {
    console.error('Day Plans Route Error:', error);
    res.status(500).json({ error: '플랜 목록을 불러오지 못했습니다.' });
  }
});

// GET /api/home/calendar?year=YYYY&month=M
router.get('/calendar', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: '연도와 월을 지정해야 합니다.' });
    }

    // YY-MM 형태 만들기
    const startObj = new Date(year, month - 1, 1);
    const endObj = new Date(year, month, 0); // 다음 달 0일 = 이달 마지막 일
    
    // YYYY-MM-DD
    const startStr = startObj.toISOString().split('T')[0];
    const endStr = endObj.toISOString().split('T')[0];

    const [rows] = await pool.query(
      'SELECT workout_date FROM workout_history_days WHERE user_id = ? AND workout_date BETWEEN ? AND ?',
      [userId, startStr, endStr]
    );

    // 날짜 스트링(YYYY-MM-DD) 배열로 변환
    // DB의 DATE 형태는 getTimeZone에 따라 시간이 다를 수 있으므로 수동으로 포맷팅
    const dates = rows.map(r => {
      const d = new Date(r.workout_date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });

    res.json({ checkedDates: dates });
  } catch (error) {
    console.error('Calendar Route Error:', error);
    res.status(500).json({ error: '달력 데이터를 불러오지 못했습니다.' });
  }
});

// GET /api/home/history?date=YYYY-MM-DD
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: '날짜를 지정해야 합니다.' });
    }

    // 해당 날짜의 history_day 찾기
    const [days] = await pool.query(
      'SELECT id, day_plan_name FROM workout_history_days WHERE user_id = ? AND workout_date = ?',
      [userId, date]
    );

    if (days.length === 0) {
      return res.json({ dayName: '', exercises: [] }); // 해당 날 기록 없음
    }

    const dayRecordId = days[0].id;
    const dayName = days[0].day_plan_name || '알 수 없는 루틴';

    // 해당 날의 exercise들
    const [exercises] = await pool.query(
      'SELECT id, exercise_name FROM workout_history_exercises WHERE history_day_id = ? ORDER BY order_index ASC, id ASC',
      [dayRecordId]
    );

    // 각 exercise 별 sets
    const historyData = [];
    for (const ex of exercises) {
      const [sets] = await pool.query(
        'SELECT set_number, weight_kg, reps, status FROM workout_history_sets WHERE history_exercise_id = ? ORDER BY set_number ASC',
        [ex.id]
      );
      historyData.push({
        id: ex.id,
        name: ex.exercise_name,
        sets: sets.map(s => ({
          set: s.set_number,
          weight: s.weight_kg,
          reps: s.reps,
          status: s.status
        }))
      });
    }

    res.json({ dayName, exercises: historyData });
  } catch (error) {
    console.error('History Route Error:', error);
    res.status(500).json({ error: '운동 기록 상세 정보를 불러오지 못했습니다.' });
  }
});

module.exports = router;
