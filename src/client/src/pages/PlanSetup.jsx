import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const PlanSetup = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>← 뒤로</button>
        <h2 style={styles.title}>내 플랜 설정</h2>
        <div style={{width: '40px'}}></div>
      </div>

      <div style={styles.content}>
        <div style={styles.dayPlanItem}>
          <div style={styles.dayPlanHeader}>
            <h3 style={styles.dayPlanName}>📁 전신 (월, 수, 금)</h3>
            <button style={styles.deleteBtn}>삭제</button>
          </div>
          
          <div style={styles.exerciseList}>
            <div style={styles.exerciseItem}>
              <div style={styles.exHeader}>
                <span style={styles.exName}>💪 바벨컬</span>
                <button style={styles.editBtn}>수정</button>
              </div>
              <div style={styles.sets}>
                <span style={styles.setTag}>10kg x 10회</span>
                <span style={styles.setTag}>10kg x 10회</span>
                <span style={styles.setTag}>10kg x 10회</span>
              </div>
            </div>

            <div style={styles.exerciseItem}>
              <div style={styles.exHeader}>
                <span style={styles.exName}>💪 스쿼트</span>
                <button style={styles.editBtn}>수정</button>
              </div>
              <div style={styles.sets}>
                <span style={styles.setTag}>60kg x 8회</span>
                <span style={styles.setTag}>60kg x 8회</span>
              </div>
            </div>

            <Button variant="secondary" style={styles.addBtn}>+ 운동 추가하기</Button>
          </div>
        </div>

        <Button style={{marginTop: '24px'}}>+ 새 DAY PLAN 만들기</Button>
      </div>
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
    marginBottom: '24px',
  },
  backButton: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  content: {
    flex: 1,
  },
  dayPlanItem: {
    backgroundColor: 'var(--app-bg)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border-color)',
  },
  dayPlanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
  },
  dayPlanName: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  deleteBtn: {
    fontSize: '14px',
    color: 'var(--danger)',
    fontWeight: '600',
  },
  exerciseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  exerciseItem: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '16px',
  },
  exHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  exName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  editBtn: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  sets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  setTag: {
    backgroundColor: '#e5e8eb',
    color: 'var(--text-main)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: '#f2f4f6',
    color: 'var(--text-main)',
    marginTop: '8px',
  }
};

export default PlanSetup;
