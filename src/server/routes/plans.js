const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/plans : 유저가 보유한 전체 플랜 트리 (DAY_PLAN -> EXERCISE_PLAN -> SET_PLAN)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // 1. 가져오기
    const [dayPlans] = await pool.query(
      'SELECT id, name, order_index FROM day_plans WHERE user_id = ? ORDER BY order_index ASC, id ASC',
      [userId]
    );

    if (dayPlans.length === 0) {
      return res.json([]);
    }

    const dayPlanIds = dayPlans.map(dp => dp.id);
    const [exercisePlans] = await pool.query(
      'SELECT id, day_plan_id, name, body_part, youtube_url, order_index FROM exercise_plans WHERE day_plan_id IN (?) ORDER BY order_index ASC, id ASC',
      [dayPlanIds]
    );

    let setPlans = [];
    if (exercisePlans.length > 0) {
      const exIds = exercisePlans.map(ex => ex.id);
      const [sets] = await pool.query(
        'SELECT id, exercise_plan_id, weight_kg, reps, order_index FROM set_plans WHERE exercise_plan_id IN (?) ORDER BY order_index ASC, id ASC',
        [exIds]
      );
      setPlans = sets;
    }

    // 2. 조립하기
    const result = dayPlans.map(dp => {
      const exercises = exercisePlans
        .filter(ex => ex.day_plan_id === dp.id)
        .map(ex => {
          const sets = setPlans.filter(s => s.exercise_plan_id === ex.id);
          return { ...ex, sets };
        });
      return { ...dp, exercises };
    });

    res.json(result);
  } catch (error) {
    console.error('Fetch Plans Error:', error);
    res.status(500).json({ error: '플랜 데이터를 불러오지 못했습니다.' });
  }
});

// POST /api/plans/day-plan
router.post('/day-plan', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    
    if (!name) return res.status(400).json({ error: '분할 명칭(DAY_PLAN 이름)을 입력해주세요.' });

    // order_index를 위한 현재 개수 조회
    const [counts] = await pool.query('SELECT COUNT(*) as cnt FROM day_plans WHERE user_id = ?', [userId]);
    const maxOrder = counts[0].cnt;

    const [result] = await pool.query(
      'INSERT INTO day_plans (user_id, name, order_index) VALUES (?, ?, ?)',
      [userId, name, maxOrder]
    );

    res.status(201).json({ message: '새 플랜이 추가되었습니다.', id: result.insertId, name, order_index: maxOrder, exercises: [] });
  } catch (error) {
    console.error('Create DayPlan Error:', error);
    res.status(500).json({ error: '플랜 생성에 실패했습니다.' });
  }
});

// PUT /api/plans/day-plan/:id
router.put('/day-plan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) return res.status(400).json({ error: '새로운 이름을 입력해주세요.' });

    const [result] = await pool.query(
      'UPDATE day_plans SET name = ? WHERE id = ? AND user_id = ?',
      [name, id, userId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: '권한이 없거나 플랜을 찾을 수 없습니다.' });

    res.json({ message: '루틴 이름이 변경되었습니다.', name });
  } catch (error) {
    console.error('Update DayPlan Error:', error);
    res.status(500).json({ error: '루틴 이름 변경에 실패했습니다.' });
  }
});

// DELETE /api/plans/day-plan/:id
router.delete('/day-plan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 본인 플랜인지 확인용 (ON DELETE CASCADE로 하위 다날아감)
    const [result] = await pool.query('DELETE FROM day_plans WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: '해당 플랜을 찾을 수 없거나 삭제 권한이 없습니다.' });

    res.json({ message: '플랜이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete DayPlan Error:', error);
    res.status(500).json({ error: '플랜 삭제에 실패했습니다.' });
  }
});

// POST /api/plans/exercise
router.post('/exercise', async (req, res) => {
  try {
    const userId = req.user.userId; // 권한 확인용 (생략가능하지만 안전을위해)
    const { day_plan_id, name, body_part, youtube_url } = req.body;

    if (!day_plan_id || !name) return res.status(400).json({ error: '잘못된 요청입니다.' });

    const [counts] = await pool.query('SELECT COUNT(*) as cnt FROM exercise_plans WHERE day_plan_id = ?', [day_plan_id]);
    const maxOrder = counts[0].cnt;

    const [result] = await pool.query(
      'INSERT INTO exercise_plans (day_plan_id, name, body_part, youtube_url, order_index) VALUES (?, ?, ?, ?, ?)',
      [day_plan_id, name, body_part || '', youtube_url || '', maxOrder]
    );

    res.status(201).json({ 
      id: result.insertId, 
      day_plan_id, 
      name, 
      body_part, 
      youtube_url, 
      order_index: maxOrder, 
      sets: [] 
    });
  } catch (error) {
    console.error('Add Exercise Error:', error);
    res.status(500).json({ error: '운동 추가에 실패했습니다.' });
  }
});

// DELETE /api/plans/exercise/:id
router.delete('/exercise/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM exercise_plans WHERE id = ?', [id]);
    res.json({ message: '운동이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '운동 삭제에 실패했습니다.' });
  }
});

// POST /api/plans/set
router.post('/set', async (req, res) => {
  try {
    const { exercise_plan_id, weight_kg, reps } = req.body;

    if (!exercise_plan_id) return res.status(400).json({ error: '운동 ID가 누락되었습니다.' });

    const [counts] = await pool.query('SELECT COUNT(*) as cnt FROM set_plans WHERE exercise_plan_id = ?', [exercise_plan_id]);
    const maxOrder = counts[0].cnt;

    const [result] = await pool.query(
      'INSERT INTO set_plans (exercise_plan_id, weight_kg, reps, order_index) VALUES (?, ?, ?, ?)',
      [exercise_plan_id, weight_kg || 0, reps || 0, maxOrder]
    );

    res.status(201).json({ 
      id: result.insertId, 
      exercise_plan_id, 
      weight_kg: weight_kg || 0, 
      reps: reps || 0, 
      order_index: maxOrder 
    });
  } catch (error) {
    console.error('Add Set Error:', error);
    res.status(500).json({ error: '세트 추가에 실패했습니다.' });
  }
});

// PUT /api/plans/set/:id
router.put('/set/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { weight_kg, reps } = req.body;

    await pool.query(
      'UPDATE set_plans SET weight_kg = ?, reps = ? WHERE id = ?',
      [weight_kg, reps, id]
    );

    res.json({ message: '세트 정보가 수정되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '세트 수정에 실패했습니다.' });
  }
});

// DELETE /api/plans/set/:id
router.delete('/set/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM set_plans WHERE id = ?', [id]);
    res.json({ message: '세트가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '세트 삭제에 실패했습니다.' });
  }
});

module.exports = router;
