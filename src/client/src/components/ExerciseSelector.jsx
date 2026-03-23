import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlayCircle } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';

const ExerciseSelector = ({ onClose, onSelect }) => {
  const [exercises, setExercises] = useState([]);
  const [filter, setFilter] = useState('');
  const token = localStorage.getItem('token');

  const fetchExercises = async () => {
    try {
      const url = filter ? `http://localhost:5000/api/exercises?target=${encodeURIComponent(filter)}` : 'http://localhost:5000/api/exercises';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [filter, token]);

  const bodyParts = ['전체', '가슴', '등', '어깨', '유산소', '전신', '코어', '팔', '하체'];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        <div style={styles.header}>
          <h3 style={styles.title}>운동 선택</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.filterScroll}>
          {bodyParts.map(part => (
            <button 
              key={part} 
              style={{
                ...styles.filterChips, 
                ...(filter === (part === '전체' ? '' : part) ? styles.filterChipsActive : {})
              }}
              onClick={() => setFilter(part === '전체' ? '' : part)}
            >
              {part}
            </button>
          ))}
        </div>

        <div style={styles.listArea}>
          {exercises.length === 0 ? (
            <div style={styles.emptyVal}>해당 부위의 운동이 없습니다.</div>
          ) : (
            exercises.map(ex => (
              <div key={ex.id} style={styles.listItem}>
                <div style={styles.listText}>
                  <div style={styles.listPart}>{ex.body_part}</div>
                  <div style={styles.listName}>{ex.name}</div>
                </div>
                
                <div style={styles.listActions}>
                  {ex.youtube_url && (
                    <button 
                      style={styles.actionBtnOutline} 
                      onClick={(e) => { e.stopPropagation(); window.open(ex.youtube_url, '_blank'); }}
                    >
                       <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                         <FaYoutube style={{ color: '#FF0000', fontSize: '18px' }} />
                         <span>영상보기</span>
                       </div>
                    </button>
                  )}
                  <button style={styles.actionBtnPrimary} onClick={() => onSelect(ex)}>
                    선택
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', // center vertically
    padding: '24px', // prevent touching edges on small screens
  },
  modal: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '480px',
    height: '80vh',
    borderRadius: '24px', // all corners rounded
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    animation: 'fadeIn 0.2s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 16px 24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  filterScroll: {
    display: 'flex',
    padding: '0 24px 16px 24px',
    gap: '8px',
    overflowX: 'auto',
    borderBottom: '1px solid var(--border-color)',
    // Removed scrollbarWidth: 'none' to allow horizontal scrollbar visibility
  },
  filterChips: {
    flexShrink: 0,
    padding: '8px 16px',
    backgroundColor: '#f2f4f6',
    border: '1px solid transparent',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterChipsActive: {
    backgroundColor: 'rgba(40, 40, 140, 0.1)',
    borderColor: 'var(--primary-color)',
    color: 'var(--primary-color)',
  },
  listArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 24px',
  },
  emptyVal: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    padding: '40px 0',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #f2f4f6',
  },
  listText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  listPart: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  listName: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  listActions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtnOutline: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionBtnPrimary: {
    padding: '6px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  }
};

export default ExerciseSelector;
