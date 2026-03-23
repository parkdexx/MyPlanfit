import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthHeader from '../components/AuthHeader';
import Footer from '../components/Footer';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg('유효하지 않은 접근입니다. 올바른 메일 링크를 사용해 주세요.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 4) {
      setErrorMsg('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(data.message || '비밀번호가 성공적으로 변경되었습니다.');
      // Wait a bit before redirecting
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <AuthHeader title="새 비밀번호 설정" description="새롭게 사용할 비밀번호를 입력해 주세요." />

      <form onSubmit={handleSubmit} style={styles.formContainer}>
        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}
        {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

        <Input 
          label="새 비밀번호 (최소 4자)" 
          type="password" 
          placeholder="새로운 비밀번호" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!token || isSubmitting || successMsg}
        />
        
        <Input 
          label="새 비밀번호 확인" 
          type="password" 
          placeholder="비밀번호 한 번 더 입력" 
          required 
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          disabled={!token || isSubmitting || successMsg}
        />
        
        <div style={styles.buttonWrapper}>
          <Button type="submit" disabled={!token || isSubmitting || successMsg}>
            {isSubmitting ? '저장 중...' : '비밀번호 변경하기'}
          </Button>
        </div>
      </form>

      <div style={styles.linkContainer}>
        <Link to="/login" style={styles.link}>로그인 화면으로 돌아가기</Link>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 24px',
    height: '100%',
    flex: 1,
    backgroundColor: 'var(--app-bg)',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  errorAlert: {
    backgroundColor: '#fff0f0',
    color: 'var(--danger)',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
    border: '1px solid #ffcccc'
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
    border: '1px solid #bbf7d0'
  },
  buttonWrapper: {
    marginTop: '24px',
  },
  linkContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '32px',
  },
  link: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    textDecoration: 'none',
  }
};

export default ResetPassword;
