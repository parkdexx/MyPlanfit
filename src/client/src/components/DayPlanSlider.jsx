import React, { useState, useEffect } from 'react';
import Button from './Button';

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
        
        <Button onClick={() => onStartWorkout(currentPlan.id)} style={{marginTop: '16px'}}>
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
  }
};

export default DayPlanSlider;
