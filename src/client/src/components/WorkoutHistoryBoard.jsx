import React from 'react';

const WorkoutHistoryBoard = ({ date, data, onClose }) => {
  if (!date || !data) return null;

  const [y, m, d] = date.split('-');

  return (
    <div style={styles.historySection}>
      <div style={styles.historyHeader}>
        <h4 style={styles.historyTitle}>
          {m}월 {d}일 운동 이력 
          <span style={styles.dayNameBadge}>{data.dayName}</span>
        </h4>
        <button style={styles.closeButton} onClick={onClose}>✕</button>
      </div>
      
      <div style={styles.historyContent}>
        {data.exercises && data.exercises.length > 0 ? (
          data.exercises.map((ex, idx) => (
            <div key={idx} style={styles.historyExercise}>
              <div style={styles.historyExName}>{ex.name}</div>
              {ex.sets.map((set, sIdx) => {
                const isDone = set.status === 'DONE' || set.status === '완료';
                const statusText = isDone ? '완료' : '포기';
                return (
                  <div key={sIdx} style={styles.historySet}>
                    <span>ㄴ SET {set.set} : {set.weight}kg / {set.reps}회</span>
                    <span style={{
                      color: isDone ? '#16a34a' : 'var(--text-secondary)',
                      fontWeight: '600'
                    }}>
                      ({statusText})
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div style={styles.emptyText}>세부 운동 기록이 없습니다.</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  historySection: {
    backgroundColor: '#f9fafb',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border-color)',
    animation: 'fadeIn 0.2s ease-in-out',
    marginTop: '16px'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  historyTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dayNameBadge: {
    fontSize: '12px',
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '600'
  },
  closeButton: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  historyContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  historyExercise: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  historyExName: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  historySet: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    display: 'flex',
    justifyContent: 'space-between',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '12px 0'
  }
};

export default WorkoutHistoryBoard;
