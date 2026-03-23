import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthHeader from '../components/AuthHeader';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');

  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('이메일을 입력해주세요.');
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(data.message || '비밀번호 재설정 메일이 발송되었습니다.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <AuthHeader title="비밀번호 찾기" description="가입하신 이메일 주소를 입력해 주세요." />

      <form onSubmit={handleReset} style={styles.formContainer}>
        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}
        {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

        <Input 
          label="이메일" 
          type="email" 
          placeholder="이메일을 입력해주세요" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSending}
        />
        
        <div style={styles.buttonWrapper}>
          <Button type="submit" disabled={isSending}>
            {isSending ? '전송 중...' : '재설정 메일 받기'}
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

export default ForgotPassword;
