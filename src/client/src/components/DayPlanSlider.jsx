import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';

const ExerciseText = ({ exercises }) => {
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(exercises?.length || 0);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(exercises?.length || 0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [exercises]);

  useEffect(() => {
    setVisibleCount(exercises?.length || 0);
  }, [exercises]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !exercises || exercises.length === 0) return;
    
    if (el.scrollWidth > el.clientWidth && visibleCount > 1) {
      setVisibleCount(prev => prev - 1);
    }
  }, [visibleCount, exercises]);

  if (!exercises || exercises.length === 0) {
    return <div style={styles.exerciseTextEmpty}>등록된 운동이 없습니다.</div>;
  }

  const isTruncated = visibleCount < exercises.length;
  let text = exercises.slice(0, visibleCount).join(', ');
  if (isTruncated) {
    text += `... 총 ${exercises.length}개 운동`;
  }

  return (
    <div ref={containerRef} style={styles.exerciseText}>
      {text}
    </div>
  );
};

const DayPlanSlider = ({ plans = [], nextPlanIndex = 0, onStartWorkout }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(nextPlanIndex || 0);
  }, [nextPlanIndex]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? plans.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === plans.length - 1 ? 0 : prev + 1));
  };

  if (!plans || plans.length === 0) {
    return (
      <div style={styles.sliderContainer}>
        <h3 style={styles.sectionTitle}>다음에 진행할 운동</h3>
        <div style={styles.planCardEmpty}>
          <p style={{color: 'var(--text-main)', fontWeight: '600', marginBottom: '8px'}}>아직 설정된 운동 플랜이 없네요!</p>
          <p style={{fontSize: '14px', color: 'var(--text-secondary)'}}>우측 상단 '설정'을 눌러 첫 루틴을 만들어보세요.</p>
        </div>
      </div>
    );
  }

  const currentPlan = plans[currentIndex];

  return (
    <div style={styles.sliderContainer}>
      <h3 style={styles.sectionTitle}>다음에 진행할 운동</h3>
      
      <div style={styles.planCard}>
        <div style={styles.cardHeader}>
          {plans.length > 1 ? (
            <button style={styles.arrowBtn} onClick={handlePrev}>&lt;</button>
          ) : <div style={{width: 32}} />}
          
          <h3 style={styles.planName}>{currentPlan?.name}</h3>
          
          {plans.length > 1 ? (
            <button style={styles.arrowBtn} onClick={handleNext}>&gt;</button>
          ) : <div style={{width: 32}} />}
        </div>
        
        {plans.length > 1 && (
          <div style={styles.cardIndicator}>
            {plans.map((_, idx) => (
              <div 
                key={idx} 
                style={{
                  ...styles.dot, 
                  backgroundColor: idx === currentIndex ? 'var(--primary-color)' : '#d1d5db'
                }} 
              />
            ))}
          </div>
        )}
        
        <ExerciseText exercises={currentPlan?.exercises || []} />

        <Button onClick={() => onStartWorkout(currentPlan.id)} style={{marginTop: '8px'}}>
          이 루틴 시작하기
        </Button>
      </div>
    </div>
  );
};

const styles = {
  sliderContainer: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  planCardEmpty: {
    backgroundColor: '#f2f4f6',
    borderRadius: '16px',
    padding: '32px 20px',
    textAlign: 'center',
    border: '1px dashed #d1d5db'
  },
  planCard: {
    backgroundColor: '#f2f4f6',
    borderRadius: '16px',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrowBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  planName: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-main)',
    textAlign: 'center',
    flex: 1,
  },
  cardIndicator: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '12px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  exerciseText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginTop: '16px',
    marginBottom: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
  },
  exerciseTextEmpty: {
    fontSize: '14px',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: '16px',
    marginBottom: '8px',
  }
};

export default DayPlanSlider;
