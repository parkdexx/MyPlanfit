import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { FiChevronLeft, FiPlus, FiTrash2, FiPlayCircle, FiMoreVertical } from 'react-icons/fi';
import ExerciseSelector from '../components/ExerciseSelector';

const PlanEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [plan, setPlan] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const currentPlan = data.find(p => p.id === parseInt(id, 10));
        if (currentPlan) {
          setPlan(currentPlan);
        } else {
          alert('플랜을 찾을 수 없습니다.');
          navigate('/plan/list');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [id, token]);

  const handleDeleteExercise = async (exId) => {
    const exercise = plan.exercises.find(e => e.id === exId);
    if (exercise.sets && exercise.sets.length > 0) {
      const confirmMsg = `'${exercise.name}' 아래 등록된 ${exercise.sets.length}개의 세트가 함께 삭제됩니다.\n계속하시겠습니까?`;
      if (!window.confirm(confirmMsg)) return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/plans/exercise/${exId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPlan();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSet = async (exerciseId) => {
    // 직전 세트 값 복사 로직:
    const exercise = plan.exercises.find(e => e.id === exerciseId);
    let defaultWeight = 0;
    let defaultReps = 0;

    if (exercise.sets && exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      defaultWeight = parseFloat(lastSet.weight_kg);
      defaultReps = parseInt(lastSet.reps, 10);
    }

    try {
      const res = await fetch('http://localhost:5000/api/plans/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          exercise_plan_id: exerciseId,
          weight_kg: defaultWeight,
          reps: defaultReps
        })
      });
      if (res.ok) {
        fetchPlan();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSet = async (setId, weight, reps) => {
    try {
      await fetch(`http://localhost:5000/api/plans/set/${setId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ weight_kg: weight, reps })
      });
      // No immediate fetch on input change, could be handled with onBlur
      // Or we just fetch after a small delay
      fetchPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSet = async (setId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/plans/set/${setId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPlan();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExerciseSelected = async (exerciseObj) => {
    setShowSelector(false);
    try {
      const res = await fetch('http://localhost:5000/api/plans/exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          day_plan_id: plan.id,
          name: exerciseObj.name,
          body_part: exerciseObj.body_part,
          youtube_url: exerciseObj.youtube_url
        })
      });
      if (res.ok) {
        fetchPlan();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenamePlan = async () => {
    setShowMenu(false);
    const newName = window.prompt('새로운 루틴 이름을 입력하세요:', plan.name);
    if (!newName || newName.trim() === '' || newName === plan.name) return;

    try {
      const res = await fetch(`http://localhost:5000/api/plans/day-plan/${plan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (res.ok) {
        fetchPlan();
      } else {
        alert('이름 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearExercises = async () => {
    setShowMenu(false);
    if (!plan.exercises || plan.exercises.length === 0) return;

    if (!window.confirm('정말로 이 루틴에 등록된 모든 운동을 비우시겠습니까?\n(이 작업은 되돌릴 수 없습니다)')) return;

    try {
      await Promise.all(
        plan.exercises.map(ex =>
          fetch(`http://localhost:5000/api/plans/exercise/${ex.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      fetchPlan();
    } catch (err) {
      console.error(err);
      alert('운동 비우기 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteRoutine = async () => {
    setShowMenu(false);
    if (!window.confirm(`'${plan.name}' 루틴 전체를 정말 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/plans/day-plan/${plan.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        navigate('/plan/list');
      } else {
        alert('루틴 삭제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!plan) return <div style={styles.container}><div style={{ padding: 24 }}>로딩 중...</div></div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/plan/list')}>
          <FiChevronLeft size={24} color="var(--text-main)" />
        </button>
        <h2 style={styles.title}>{plan.name}</h2>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button style={styles.moreButton} onClick={() => setShowMenu(!showMenu)}>
            <FiMoreVertical size={20} color="var(--text-secondary)" />
          </button>

          {showMenu && (
            <div style={styles.dropdownMenu}>
              <button style={styles.menuItem} onClick={handleRenamePlan}>이름 변경하기</button>
              <button style={styles.menuItem} onClick={handleClearExercises}>모든 운동 비우기</button>
              <button style={{ ...styles.menuItem, color: 'var(--danger)' }} onClick={handleDeleteRoutine}>루틴 비우기(삭제)</button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div style={styles.editorArea}>
        {plan.exercises && plan.exercises.length === 0 ? (
          <div style={styles.emptyCard}>
            아직 추가된 운동이 없습니다. <br />아래 + 버튼을 눌러 운동 종목을 추가해보세요.
          </div>
        ) : (
          plan.exercises.map((ex, exIdx) => (
            <div key={ex.id} style={styles.exerciseCard}>
              <div style={styles.exHeader}>
                <div style={styles.exTitleContainer}>
                  <div style={styles.exBadge}>{ex.body_part || '기타'}</div>
                  <h3 style={styles.exTitle}>{ex.name}</h3>
                </div>
                <div style={styles.exActions}>
                  {ex.youtube_url && (
                    <a href={ex.youtube_url} target="_blank" rel="noreferrer" style={styles.actionBtn}>
                      <FiPlayCircle size={20} color="var(--primary-color)" />
                    </a>
                  )}
                  <button style={styles.actionBtn} onClick={() => handleDeleteExercise(ex.id)}>
                    <FiTrash2 size={20} color="var(--danger)" />
                  </button>
                </div>
              </div>

              <div style={styles.setList}>
                {ex.sets && ex.sets.map((set, setIdx) => (
                  <div key={set.id} style={styles.setRow}>
                    <span style={styles.setNumberLabel}>Set {setIdx + 1}</span>
                    <input
                      type="number"
                      style={styles.inputField}
                      defaultValue={set.weight_kg}
                      onBlur={(e) => handleUpdateSet(set.id, parseFloat(e.target.value) || 0, set.reps)}
                    />
                    <span style={styles.unitText}>kg</span>
                    <span style={{ margin: '0 8px', color: '#d1d5db' }}>X</span>
                    <input
                      type="number"
                      style={styles.inputField}
                      defaultValue={set.reps}
                      onBlur={(e) => handleUpdateSet(set.id, set.weight_kg, parseInt(e.target.value, 10) || 0)}
                    />
                    <span style={styles.unitText}>회</span>

                    <button style={styles.deleteSetBtn} onClick={() => handleDeleteSet(set.id)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button style={styles.addSetBtn} onClick={() => handleAddSet(ex.id)}>
                + 세트 추가
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bottom Bar: Add Exercise Button */}
      <div style={styles.bottomBar}>
        <Button style={{ width: '100%' }} onClick={() => setShowSelector(true)}>
          <FiPlus size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 운동 항목 추가
        </Button>
      </div>

      {/* Exercise Selector Modal */}
      {showSelector && (
        <ExerciseSelector
          onClose={() => setShowSelector(false)}
          onSelect={handleExerciseSelected}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--app-bg)',
    position: 'relative',
    paddingBottom: '80px', // spacing for fixed bottom bar
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 16px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  moreButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    minWidth: '160px',
    zIndex: 20,
  },
  menuItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid #f2f4f6',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-main)',
    cursor: 'pointer',
  },
  editorArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  emptyCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '16px',
    padding: '40px 20px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    lineHeight: '1.6',
    border: '1px dashed #d1d5db'
  },
  exerciseCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid var(--border-color)',
  },
  exHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
  },
  exTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  exBadge: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700'
  },
  exTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0
  },
  exActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  setList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  setRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
  },
  setNumberLabel: {
    width: '60px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  inputField: {
    width: '60px',
    padding: '8px',
    textAlign: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-main)',
    backgroundColor: '#f9fafb',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  unitText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginLeft: '6px',
    marginRight: '8px',
    fontWeight: '500',
  },
  deleteSetBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  addSetBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#f2f4f6',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--border-color)',
    zIndex: 10,
  }
};

export default PlanEditor;
