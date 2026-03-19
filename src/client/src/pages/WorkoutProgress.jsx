import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const WorkoutProgress = () => {
  const navigate = useNavigate();
  // Mock Active Workout Data
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  
  const handleComplete = () => {
    alert('세트 완료!');
  };

  const handleGiveUp = () => {
    alert('세트 포기');
  };

  const handleFinish = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>← 정지</button>
        <h2 style={styles.title}>진행 중: 바벨컬</h2>
        <div style={{width: '40px'}}></div>
      </div>

      <div style={styles.progressSection}>
        <div style={styles.progressInfo}>
          <span style={styles.setCount}>SET 1 / 3</span>
          <span style={styles.targetInfo}>목표: 10kg, 10회</span>
        </div>
      </div>

      <div style={styles.actionContainer}>
        <Button style={styles.completeBtn} onClick={handleComplete}>
          세트 완료
        </Button>
        <button style={styles.giveUpBtn} onClick={handleGiveUp}>포기하기</button>
      </div>

      <div style={styles.upcomingSection}>
        <h3 style={styles.upcomingTitle}>다음 운동</h3>
        <div style={styles.upcomingItem}>스쿼트 (60kg, 8회 x 2세트)</div>
      </div>

      <Button style={{backgroundColor: '#333333', color: '#ffffff'}} onClick={handleFinish}>
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
    fontSize: '16px',
    color: 'var(--danger)',
    fontWeight: '600',
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
  }
};

export default WorkoutProgress;
