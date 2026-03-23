import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthHeader from '../components/AuthHeader';
import Footer from '../components/Footer';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 컴포넌트 마운트 시 토큰 확인(자동 로그인) 및 기억된 이메일 불러오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 실제 환경: 서버에 토큰이 유효한지 검증하는 API를 추가로 호출하는 것이 베스트 프랙티스입니다.
      // 현재는 토큰이 존재하기만 하면 홈으로 이동합니다.
      navigate('/', { replace: true });
    }

    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 단순 유효성 검증
    if (!email.includes('@')) {
      setErrorMsg('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // 로그인 성공 시 JWT 저장
      localStorage.setItem('token', data.token);

      // 브라우저 끄더라도 이메일 기억할지 (localStorage)
      if (rememberEmail) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // 홈으로 라우팅
      navigate('/');
      
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <AuthHeader title="로그인" />

      <form onSubmit={handleLogin} style={styles.formContainer}>
        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}
        
        <Input 
          label="이메일" 
          type="email" 
          placeholder="이메일을 입력해주세요" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
          label="비밀번호" 
          type="password" 
          placeholder="비밀번호를 입력해주세요" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <label style={styles.rememberRow}>
          <input 
            type="checkbox" 
            style={styles.checkbox} 
            checked={rememberEmail}
            onChange={(e) => setRememberEmail(e.target.checked)}
          />
          <span>이메일 기억하기 (로그인은 자동유지됨)</span>
        </label>

        <div style={styles.buttonWrapper}>
          <Button type="submit">로그인</Button>
        </div>
      </form>

      <div style={styles.linkContainer}>
        <Link to="/forgot-password" style={styles.link}>비밀번호가 가물가물해요</Link>
        <span style={styles.divider}>|</span>
        <Link to="/signup" style={styles.link}>처음이신가요?</Link>
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
  rememberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    marginTop: '-8px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--primary-color)',
    cursor: 'pointer',
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
  },
  divider: {
    margin: '0 12px',
    color: 'var(--border-color)',
    fontSize: '12px',
  }
};

export default Login;
