import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { FiChevronLeft } from 'react-icons/fi';
import Footer from '../components/Footer';

const extractVideoId = (url) => {
  if (!url) return null;
  const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regex);
  return (match && match[2].length === 11) ? match[2] : null;
};

const WorkoutProgress = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const token = localStorage.getItem('token');

  const [historyDayId, setHistoryDayId] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentSet, setCurrentSet] = useState(null);
  const [nextExercise, setNextExercise] = useState(null);
  const [isAllDone, setIsAllDone] = useState(false);

  useEffect(() => {
    if (!planId) return;

    const startWorkout = async () => {
      try {
        const res = await fetch('/api/workout/start', {
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
  }, [historyDayId]);

  const fetchWorkoutData = async () => {
    try {
      const res = await fetch(`/api/workout/${historyDayId}`, {
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

        if (i + 1 < exercises.length) {
          setNextExercise(exercises[i + 1]);
        }
        break;
      }
    }

    if (!foundCurrent) {
      setIsAllDone(true);
    }
  };

  const handleUpdateSet = async (status) => {
    if (!currentSet) return;
    try {
      const res = await fetch(`/api/workout/set/${currentSet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchWorkoutData();
      }
    } catch (err) {
      console.error('Failed to update set:', err);
    }
  };

  const handleFinish = async () => {
    if (!isAllDone) {
      if (!window.confirm('아직 완료하지 않은 세트가 있습니다. 운동을 종료하시겠습니까?')) {
        return;
      }
    }
    if (historyDayId) {
      try {
        await fetch(`/api/workout/${historyDayId}/finish`, {
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
        <div style={styles.loading}>로딩 중...</div>
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
          {isAllDone ? '모든 운동 완료!' : `${currentExercise?.exercise_name || ''}`}
        </h2>
        <div style={{ width: 40 }}></div>
      </div>

      <div style={styles.progressSection}>
        {isAllDone ? (
          <div style={styles.progressInfo}>
            <span style={styles.setCount}>수고하셨습니다!</span>
            <span style={styles.targetInfo}>오늘의 운동을 모두 마쳤습니다.</span>
          </div>
        ) : (
          <>
            <div style={styles.progressInfo}>
              <span style={styles.setCount}>SET {currentSet?.set_number} / {currentExercise?.sets.length}</span>
              <span style={styles.targetInfo}>{currentSet?.weight_kg}kg, {currentSet?.reps}회</span>
            </div>

            {currentExercise?.youtube_url && extractVideoId(currentExercise.youtube_url) && (
              <div style={styles.videoContainer}>
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractVideoId(currentExercise.youtube_url)}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ borderRadius: '12px' }}
                ></iframe>
              </div>
            )}
          </>
        )}
      </div>

      {!isAllDone && (
        <div style={styles.actionContainer}>
          <Button style={styles.completeBtn} onClick={() => handleUpdateSet('DONE')}>
            세트 완료
          </Button>
          <button style={styles.giveUpBtn} onClick={() => {
            if (window.confirm('정말 이번 세트를 건너뛰시겠습니까?')) {
              handleUpdateSet('GIVEN_UP');
            }
          }}>
            건너뛰기
          </button>
        </div>
      )}

      {!isAllDone && nextExercise && (
        <div style={styles.upcomingSection}>
          <h3 style={styles.upcomingTitle}>다음 운동</h3>
          <div style={styles.upcomingItem}>
            {nextExercise.exercise_name} ({nextExercise.sets.length}세트)
          </div>
        </div>
      )}

      <Button style={{ backgroundColor: '#333333', color: '#ffffff', marginTop: 'auto' }} onClick={handleFinish}>
        운동 종료하기
      </Button>
      <Footer />
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
    backgroundColor: 'var(--app-bg)',
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
    margin: 0,
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
    marginBottom: '24px',
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
  videoContainer: {
    width: '100%',
    aspectRatio: '16/9',
    marginBottom: '40px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#000',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
    marginTop: 0,
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
    fontWeight: '600',
  }
};

export default WorkoutProgress;