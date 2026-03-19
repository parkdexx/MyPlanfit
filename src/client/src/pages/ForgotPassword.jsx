import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthHeader from '../components/AuthHeader';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    alert('비밀번호 재설정 메일이 발송되었습니다. (Mock)');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <AuthHeader title="비밀번호 찾기" description="가입하신 이메일 주소를 입력해 주세요." />

      <form onSubmit={handleReset} style={styles.formContainer}>
        <Input 
          label="이메일" 
          type="email" 
          placeholder="이메일을 입력해주세요" 
          required 
        />
        
        <div style={styles.buttonWrapper}>
          <Button type="submit">재설정 메일 받기</Button>
        </div>
      </form>

      <div style={styles.linkContainer}>
        <Link to="/login" style={styles.link}>로그인 화면으로 돌아가기</Link>
      </div>
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
