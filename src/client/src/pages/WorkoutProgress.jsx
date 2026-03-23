import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { FiChevronLeft } from 'react-icons/fi';

const WorkoutProgress = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const token = localStorage.getItem('token');

  const [historyDayId, setHistoryDayId] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 진행 중인 운동과 세트 찾기
  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentSet, setCurrentSet] = useState(null);
  const [nextExercise, setNextExercise] = useState(null);
  const [isAllDone, setIsAllDone] = useState(false);

  useEffect(() => {
    if (!planId) return;

    const startWorkout = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/workout/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ day_plan_id: planId })
        });
        if (res.ok) {
          const data = await res.json();
          setHistoryDayId(data.history_day_id);
        }
      } catch (err) {
        console.error('Failed to start workout:', err);
      }
    };
    startWorkout();
  }, [planId, token]);

  useEffect(() => {
    if (!historyDayId) return;
    fetchWorkoutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyDayId]);

  const fetchWorkoutData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/workout/${historyDayId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkoutData(data);
        calculateCurrentState(data.exercises);
      }
    } catch (err) {
      console.error('Failed to fetch workout data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentState = (exercises) => {
    let foundCurrent = false;
    setCurrentExercise(null);
    setCurrentSet(null);
    setNextExercise(null);
    setIsAllDone(false);

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const pendingSet = ex.sets.find(s => s.status === 'PENDING');

      if (pendingSet && !foundCurrent) {
        setCurrentExercise(ex);
        setCurrentSet(pendingSet);
        foundCurrent = true;

        // Find next exercise
        if (i + 1 < exercises.length) {
          setNextExercise(exercises[i + 1]);
        }
        break; // Stop after finding the first pending set
      }
    }

    if (!foundCurrent) {
      setIsAllDone(true);
    }
  };

  const handleUpdateSet = async (status) => {
    if (!currentSet) return;
    try {
      const res = await fetch(`http://localhost:5000/api/workout/set/${currentSet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchWorkoutData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to update set:', err);
    }
  };

  const handleFinish = async () => {
    if (historyDayId) {
      try {
        await fetch(`http://localhost:5000/api/workout/${historyDayId}/finish`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to finish workout:', err);
      }
    }
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>운동 준비 중...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <FiChevronLeft size={24} />
        </button>
        <h2 style={styles.title}>
          {isAllDone ? '마무리' : `진행 중: ${currentExercise?.exercise_name || ''}`}
        </h2>
        <div style={{ width: '40px' }}></div>
      </div>

      <div style={styles.progressSection}>
        {isAllDone ? (
          <div style={styles.progressInfo}>
            <span style={styles.setCount}>모든 운동 완료!</span>
            <span style={styles.targetInfo}>오늘 하루도 고생하셨습니다.</span>
          </div>
        ) : (
          <div style={styles.progressInfo}>
            <span style={styles.setCount}>SET {currentSet?.set_number} / {currentExercise?.sets.length}</span>
            <span style={styles.targetInfo}>목표: {currentSet?.weight_kg}kg, {currentSet?.reps}회</span>
          </div>
        )}
      </div>

      {!isAllDone && (
        <div style={styles.actionContainer}>
          <Button style={styles.completeBtn} onClick={() => handleUpdateSet('DONE')}>
            세트 완료
          </Button>
          <button style={styles.giveUpBtn} onClick={() => handleUpdateSet('GIVEN_UP')}>포기하기</button>
        </div>
      )}

      {!isAllDone && nextExercise && (
        <div style={styles.upcomingSection}>
          <h3 style={styles.upcomingTitle}>다음 운동</h3>
          <div style={styles.upcomingItem}>
            {nextExercise.exercise_name} ({nextExercise.sets.length}세트 대기 중)
          </div>
        </div>
      )}

      <Button style={{ backgroundColor: '#333333', color: '#ffffff' }} onClick={handleFinish}>
        오늘 운동 끝내기
      </Button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    height: '100%',
    flex: 1,
    backgroundColor: 'var(--bg-color)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  progressSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '60px',
  },
  setCount: {
    fontSize: '48px',
    fontWeight: '800',
    color: 'var(--primary-color)',
  },
  targetInfo: {
    fontSize: '20px',
    color: 'var(--text-main)',
    fontWeight: '600',
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '40px',
  },
  completeBtn: {
    backgroundColor: 'var(--success)',
    padding: '24px',
    fontSize: '20px',
    borderRadius: '16px',
  },
  giveUpBtn: {
    display: 'block',
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  upcomingSection: {
    backgroundColor: 'var(--app-bg)',
    padding: '20px',
    borderRadius: '16px',
    marginBottom: '24px',
    border: '1px solid var(--border-color)',
  },
  upcomingTitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  upcomingItem: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  loading: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  }
};

export default WorkoutProgress;
