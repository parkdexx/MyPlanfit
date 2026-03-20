import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { FiTrash2, FiFolder, FiChevronLeft } from 'react-icons/fi';

const PlanList = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const token = localStorage.getItem('token');

  const fetchPlans = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [token]);

  const handleCreatePlan = async () => {
    const defaultName = `새로운 루틴 ${plans.length + 1}`;
    try {
      const res = await fetch('http://localhost:5000/api/plans/day-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: defaultName })
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/plan/editor/${data.id}`);
      } else {
        alert('루틴 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlan = async (e, plan) => {
    e.stopPropagation();

    if (plan.exercises && plan.exercises.length > 0) {
      const confirmDelete = window.confirm(`해당 루틴에 ${plan.exercises.length}개의 운동이 포함되어 있습니다.\n정말 삭제하시겠습니까?`);
      if (!confirmDelete) return;
    } else {
      const confirmDelete = window.confirm(`'${plan.name}' 루틴을 삭제하시겠습니까?`);
      if (!confirmDelete) return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/plans/day-plan/${plan.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPlans(); // reload
      } else {
        alert('삭제 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          <FiChevronLeft size={24} />
        </button>
        <h2 style={styles.title}>내 운동 플랜</h2>
        <div style={{ width: 24 }} /> {/* Spacer */}
      </div>

      <div style={styles.listContainer}>
        {plans.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>아직 만들어진 루틴이 없습니다.</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>나만의 운동 루틴을 생성해보세요!</p>
          </div>
        ) : (
          plans.map(plan => (
            <div
              key={plan.id}
              style={styles.planCard}
              onClick={() => navigate(`/plan/editor/${plan.id}`)}
            >
              <div style={styles.planHeader}>
                <div style={styles.planTitleContainer}>
                  <FiFolder size={20} color="var(--primary-color)" />
                  <span style={styles.planName}>{plan.name}</span>
                </div>
                <button
                  style={styles.deleteButton}
                  onClick={(e) => handleDeletePlan(e, plan)}
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
              <div style={styles.planInfo}>
                <span style={styles.exerciseCountBadge}>포함된 운동: {plan.exercises ? plan.exercises.length : 0}개</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={styles.bottomBar}>
        <Button onClick={handleCreatePlan} style={{ width: '100%' }}>
          + 새 루틴 만들기
        </Button>
      </div>
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
    paddingBottom: '80px', // For bottom bar
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border-color)',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  listContainer: {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '16px',
    padding: '40px 20px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    border: '1px dashed #d1d5db'
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  },
  planHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  planTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  planName: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  planInfo: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  exerciseCountBadge: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--primary-color)',
    backgroundColor: '#eef2ff',
    padding: '4px 10px',
    borderRadius: '12px',
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
  }
};

export default PlanList;
