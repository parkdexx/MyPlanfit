import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthHeader from '../components/AuthHeader';
import Footer from '../components/Footer';

const Signup = () => {
  const navigate = useNavigate();

  // States
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  // UI Steps: 0 = Email Input, 1 = OTP Input, 2 = Details Input
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isSending, setIsSending] = useState(false);

  React.useEffect(() => {
    let timer;
    if (step === 1 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch('http://localhost:5000/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('인증번호가 이메일로 발송되었습니다.');
      setTimeLeft(300); // 5분 타이머 리셋
      setStep(1); // Proceed to OTP step
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (timeLeft === 0) {
      setErrorMsg('인증 시간이 만료되었습니다. 인증번호를 다시 발송해주세요.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('이메일 인증 완료! 닉네임과 비밀번호를 설정해주세요.');
      setStep(2); // Proceed to Details step
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 4) {
      setErrorMsg('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nickname, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 성공 시
      alert('가입이 완료되었습니다. 로그인 화면으로 이동합니다!');
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <AuthHeader title="회원가입" />

      <div style={styles.formContainer}>
        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}
        {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

        {/* Step 0 & 1 & 2: Email is always visible but disabled after step 0 */}
        <Input
          label="이메일"
          type="email"
          placeholder="가입 메일을 받을 수 있는 주소"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={step > 0}
        />

        {step === 0 && (
          <div style={styles.buttonWrapper}>
            <Button onClick={handleSendCode} disabled={isSending}>
              {isSending ? '메일 전송 중...' : '인증번호 발송'}
            </Button>
          </div>
        )}

        {/* Step 1: OTP Input */}
        {step >= 1 && (
          <Input
            label={step === 1 ? (timeLeft > 0 ? `인증번호 (남은 시간 ${formatTime(timeLeft)})` : '인증번호 (시간 초과)') : '인증번호 (6자리)'}
            type="text"
            placeholder="이메일로 온 숫자 6자리"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            disabled={step > 1 || (step === 1 && timeLeft === 0)}
          />
        )}

        {step === 1 && (
          <div style={styles.buttonWrapper}>
            <Button onClick={handleVerifyCode}>인증 통과하기</Button>
          </div>
        )}

        {/* Step 2: Nickname & Password Input */}
        {step === 2 && (
          <>
            <Input
              label="닉네임"
              type="text"
              placeholder="앱에서 사용할 멋진 닉네임"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <Input
              label="비밀번호 (최소 4자)"
              type="password"
              placeholder="안전한 비밀번호"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={styles.buttonWrapper}>
              <Button onClick={handleSignup}>가입 완료</Button>
            </div>
          </>
        )}
      </div>

      <div style={styles.linkContainer}>
        <span style={styles.text}>이미 계정이 있으신가요?</span>
        <Link to="/login" style={styles.link}>로그인하기</Link>
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
    marginTop: '16px',
    marginBottom: '8px'
  },
  linkContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '32px',
    gap: '8px'
  },
  text: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  link: {
    fontSize: '14px',
    color: 'var(--primary-color)',
    fontWeight: '700',
    textDecoration: 'none',
  }
};

export default Signup;
