import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import Calendar from '../components/Calendar';
import WorkoutHistoryBoard from '../components/WorkoutHistoryBoard';
import DayPlanSlider from '../components/DayPlanSlider';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // States for API data
  const [dayPlans, setDayPlans] = useState([]);
  const [nextPlanIndex, setNextPlanIndex] = useState(0);
  const [checkedDates, setCheckedDates] = useState([]);

  // States for Calendar control
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(null);

  // State for History
  const [historyData, setHistoryData] = useState(null);

  // State for User Profile
  const [userProfile, setUserProfile] = useState({ nickname: '', email: '' });

  const token = localStorage.getItem('token');

  // Fetch User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/home/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile({ nickname: data.nickname, email: data.email });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Fetch Day Plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/home/day-plans', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDayPlans(data.dayPlans || []);
          setNextPlanIndex(data.nextPlanIndex || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlans();
  }, [token]);

  // Fetch Calendar Data (checked dates) for current month
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch(`/api/home/calendar?year=${currentYear}&month=${currentMonth}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCheckedDates(data.checkedDates || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCalendar();
  }, [currentYear, currentMonth, token]);

  // Fetch History Details when a date is clicked
  useEffect(() => {
    if (!selectedDate) {
      setHistoryData(null);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/home/history?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistoryData(data); // { dayName, exercises }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [selectedDate, token]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 1) {
        setCurrentYear(y => y - 1);
        return 12;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 12) {
        setCurrentYear(y => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  const handleSelectYear = (y) => {
    setCurrentYear(parseInt(y, 10));
  };

  const handleSelectMonth = (m) => {
    setCurrentMonth(parseInt(m, 10));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleStartWorkout = (planId) => {
    navigate(`/workout?planId=${planId}`);
  };

  const handleDayPlanSetup = () => {
    navigate('/plan/list');
  };

  const handleDateClick = (dateStr) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
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
              <div style={styles.profileInfo}>
                <div style={styles.profileNickname}>{userProfile.nickname}</div>
                <div style={styles.profileEmail}>{userProfile.email}</div>
              </div>
              <div style={styles.menuDivider}></div>
              <button
                style={styles.menuItem}
                onClick={() => alert('개인 정보 수정 기능은 추후 개발 예정입니다.')}
              >
                <FiSettings style={{ marginRight: '8px' }} /> 개인 정보 수정
              </button>
              <button
                style={{ ...styles.menuItem, color: 'var(--danger)' }}
                onClick={handleLogout}
              >
                <FiLogOut style={{ marginRight: '8px' }} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={styles.header}>
        <h2 style={styles.title}>운동 플랜</h2>
        <button style={styles.setupButton} onClick={handleDayPlanSetup}>플랜 설정</button>
      </div>

      <DayPlanSlider
        plans={dayPlans}
        nextPlanIndex={nextPlanIndex}
        onStartWorkout={handleStartWorkout}
      />

      <div style={styles.calendarSection}>
        <h3 style={styles.sectionTitle}>운동 기록</h3>
        <Calendar
          year={currentYear}
          month={currentMonth}
          checkedDates={checkedDates}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onGoToToday={handleGoToToday}
          onSelectYear={handleSelectYear}
          onSelectMonth={handleSelectMonth}
        />

        {selectedDate && historyData && (
          <WorkoutHistoryBoard
            date={selectedDate}
            data={historyData}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
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
    border: 'none',
    cursor: 'pointer'
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
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer'
  },
  profileInfo: {
    padding: '8px 16px 12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileNickname: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileEmail: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  menuDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '4px 8px',
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
    margin: 0
  },
  setupButton: {
    fontSize: '14px',
    color: 'var(--primary-color)',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  calendarSection: {
    marginBottom: '24px',
  }
};

export default Home;
