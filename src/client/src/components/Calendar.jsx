import React from 'react';

const Calendar = ({ year, month, checkedDates = [], selectedDate, onDateClick, onPrevMonth, onNextMonth, onGoToToday, onSelectYear, onSelectMonth }) => {
  // get total days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  // day of week of 1st day (0 = Sunday, 1 = Monday ...)
  const firstDayIndex = new Date(year, month - 1, 1).getDay();

  const days = [];
  
  // empty blocks for days before 1st
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }

  // actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDayClick = (day) => {
    if (!day) return;
    const yStr = year;
    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;
    onDateClick(dateStr);
  };

  const isChecked = (day) => {
    if (!day) return false;
    const yStr = year;
    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;
    return checkedDates.includes(dateStr);
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    const [y, m, d] = selectedDate.split('-');
    return parseInt(y) === year && parseInt(m) === month && parseInt(d) === day;
  };

  const currentActualYear = new Date().getFullYear();
  // Generate [currentYear-5 ~ currentYear+5]
  const years = Array.from({length: 11}, (_, i) => currentActualYear - 5 + i);
  const months = Array.from({length: 12}, (_, i) => i + 1);

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div style={styles.calendarContainer}>
      <div style={styles.calendarHeaderContainer}>
        <div style={styles.monthHeader}>
          <button style={styles.arrowBtn} onClick={onPrevMonth}>&lt;</button>
          
          <div style={styles.selectorGroup}>
            <select 
              value={year} 
              onChange={(e) => onSelectYear(e.target.value)} 
              style={styles.dropdown}
            >
              {years.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select 
              value={month} 
              onChange={(e) => onSelectMonth(e.target.value)} 
              style={styles.dropdown}
            >
              {months.map(m => <option key={m} value={m}>{m}월</option>)}
            </select>
          </div>
          
          <button style={styles.arrowBtn} onClick={onNextMonth}>&gt;</button>
        </div>
        <div style={styles.todayButtonContainer}>
          <button style={styles.todayBtn} onClick={onGoToToday}>오늘로 돌아가기</button>
        </div>
      </div>
      
      <div style={styles.calendarGrid}>
        {weekdays.map((wd, i) => (
          <div key={i} style={styles.weekdayHeading}>{wd}</div>
        ))}

        {days.map((day, idx) => {
          const checked = isChecked(day);
          const selected = isSelected(day);
          
          return (
            <div 
              key={idx} 
              style={{
                ...styles.calendarDay,
                ...(day ? styles.calendarDayActive : {}),
                ...(checked ? styles.calendarDayChecked : {}),
                ...(selected ? styles.calendarDaySelected : {})
              }}
              onClick={() => handleDayClick(day)}
            >
              {day || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  calendarContainer: {
    padding: '16px 0',
  },
  calendarHeaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '8px'
  },
  monthHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '0 8px'
  },
  selectorGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  dropdown: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-main)',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    appearance: 'none',
    textAlign: 'center',
    outline: 'none',
  },
  todayButtonContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '0 8px',
    marginTop: '4px'
  },
  todayBtn: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--primary-color)',
    backgroundColor: 'rgba(40, 40, 140, 0.1)',
    border: 'none',
    borderRadius: '8px',
    padding: '4px 10px',
    cursor: 'pointer'
  },
  arrowBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  weekdayHeading: {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  },
  calendarDay: {
    aspectRatio: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    fontSize: '14px',
    color: 'var(--text-main)',
    transition: 'all 0.2s',
  },
  calendarDayActive: {
    cursor: 'pointer',
    backgroundColor: 'transparent',
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
};

export default Calendar;
