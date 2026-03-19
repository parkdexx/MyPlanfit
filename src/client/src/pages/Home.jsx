import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 팝업 외부 영역 클릭 시 닫히도록 처리하는 스니펫
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Mock Data
  const dayPlans = ['전신 (월, 수, 금)', '상체 (화, 목)', '하체 (토)'];
  const mockHistory = [
    { name: '바벨컬', sets: [{ weight: 10, reps: 10, status: '완료' }, { weight: 9, reps: 10, status: '포기' }] },
    { name: '해머컬', sets: [{ weight: 15, reps: 10, status: '완료' }] }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleStartWorkout = () => {
    navigate('/workout');
  };

  const handleDayPlanSetup = () => {
    navigate('/plan/setup');
  };

  const renderCalendar = () => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const checkedDays = [5, 6, 8, 12]; // Mock completed days
    
    return (
      <div style={styles.calendarGrid}>
        {days.map(day => (
          <div 
            key={day} 
            style={{
              ...styles.calendarDay,
              ...(checkedDays.includes(day) ? styles.calendarDayChecked : {}),
              ...(selectedDate === day ? styles.calendarDaySelected : {})
            }}
            onClick={() => setSelectedDate(selectedDate === day ? null : day)}
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.topNav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/myplanfit-logo.svg" alt="logo" style={{ width: '28px', height: '28px' }} />
          <h1 style={styles.logoTitle}>MyPlanfit</h1>
        </div>
        <div style={styles.profileContainer} ref={menuRef}>
          <button style={styles.profileButton} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FiUser size={24} />
          </button>
          
          {isMenuOpen && (
            <div style={styles.dropdownMenu}>
              <button 
                style={styles.menuItem} 
                onClick={() => alert('개인 정보 설정 기능은 추후 개발 예정입니다.')}
              >
                <FiSettings style={{marginRight: '8px'}} /> 개인 정보 설정
              </button>
              <button 
                style={{...styles.menuItem, color: 'var(--danger)'}} 
                onClick={handleLogout}
              >
                <FiLogOut style={{marginRight: '8px'}} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={styles.header}>
        <h2 style={styles.title}>내 플랜</h2>
        <button style={styles.setupButton} onClick={handleDayPlanSetup}>설정</button>
      </div>

      <div style={styles.planSelector}>
        <p style={styles.sectionTitle}>다음에 진행할 운동</p>
        <div style={styles.planCard}>
          <h3 style={styles.planName}>{dayPlans[0]}</h3>
          <Button onClick={handleStartWorkout} style={{marginTop: '16px'}}>운동 시작</Button>
        </div>
      </div>

      <div style={styles.calendarSection}>
        <h3 style={styles.sectionTitle}>운동 기록</h3>
        {renderCalendar()}
      </div>

      {selectedDate && (
        <div style={styles.historySection}>
          <div style={styles.historyHeader}>
            <h4 style={styles.historyTitle}>10월 {selectedDate}일 운동 이력</h4>
            <button style={styles.closeButton} onClick={() => setSelectedDate(null)}>✕</button>
          </div>
          
          <div style={styles.historyContent}>
            {mockHistory.map((ex, idx) => (
              <div key={idx} style={styles.historyExercise}>
                <div style={styles.historyExName}>{ex.name}</div>
                {ex.sets.map((set, sIdx) => (
                  <div key={sIdx} style={styles.historySet}>
                    <span>ㄴ SET {sIdx + 1} : {set.weight}kg / {set.reps}회</span>
                    <span style={{
                      color: set.status === '완료' ? 'var(--success)' : 'var(--text-secondary)',
                      fontWeight: '600'
                    }}>
                      ({set.status})
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
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
  topNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  logoTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--primary-color)',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#f2f4f6',
    color: 'var(--text-main)',
    transition: 'background-color 0.2s',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '52px',
    right: '0',
    width: '200px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 8px',
    zIndex: 10,
    border: '1px solid var(--border-color)',
    animation: 'fadeIn 0.2s ease-in-out',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-main)',
    textAlign: 'left',
    borderRadius: '12px',
    width: '100%',
    transition: 'background-color 0.1s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  setupButton: {
    fontSize: '14px',
    color: 'var(--primary-color)',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  planSelector: {
    marginBottom: '32px',
  },
  planCard: {
    backgroundColor: '#f2f4f6',
    borderRadius: '16px',
    padding: '20px',
  },
  planName: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  calendarSection: {
    marginBottom: '24px',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  calendarDay: {
    aspectRatio: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    fontSize: '14px',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  calendarDayChecked: {
    backgroundColor: 'rgba(40, 40, 140, 0.1)',
    color: 'var(--primary-color)',
    fontWeight: '700',
    border: '2px solid var(--primary-color)',
  },
  calendarDaySelected: {
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
  },
  historySection: {
    backgroundColor: '#f9fafb',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border-color)',
    animation: 'fadeIn 0.2s ease-in-out',
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
  },
  closeButton: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
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
  }
};

export default Home;
