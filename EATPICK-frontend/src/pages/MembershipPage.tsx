import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, LogOut, User } from 'lucide-react';
import '../Membership.css';

/**
 * 회원가입 컴포넌트
 * 백엔드 MemberDto 스펙(email, password, nickname)에 맞춰 연동됩니다.
 * 스타일은 외부 CSS 파일의 클래스를 사용합니다.
 */

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. 프론트엔드 유효성 검사
    if (!email || !password || !passwordConfirm || !nickname) {
      setStatus('error');
      setErrorMessage('모든 항목을 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setStatus('error');
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setErrorMessage('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // 2. 백엔드 API 호출 (MemberDto 형식 준수)
      const response = await fetch('http://43.203.165.206:8080/api/member/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          nickname: nickname
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '회원가입에 실패했습니다. 중복된 계정이거나 서버 오류일 수 있습니다.');
      }

      // 3. 가입 성공 처리
      setStatus('success');
    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('서버와 통신하는 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    setNickname('');
    setStatus('idle');
    window.location.href = '/login'; 
  };

  // 회원가입 성공 화면 (성공 메시지 출력 후 로그인 유도)
  if (status === 'success') {
    return (
      <div className="success-page-container">
        <div className="success-card">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="success-title">환영합니다!</h2>
          <p className="success-text"><strong>{nickname}</strong>님, 성공적으로 가입되었습니다.</p>
          <button onClick={handleReset} className="logout-btn">
            <LogOut size={18} className="logout-icon" />
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  // 기본 회원가입 폼 화면
  return (
    <div className="page-container">
      <div className="login-card">
        <div className="text-center mb-8">
          <h1 className="title">회원가입</h1>
          <p className="subtitle">새로운 계정을 만들어보세요.</p>
        </div>

        {status === 'error' && (
          <div className="error-alert">
            <AlertCircle className="error-icon" size={18} />
            <p className="error-text">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSignup}>
          {/* 닉네임 입력 필드 */}
          <div className="form-group">
            <label className="input-label" htmlFor="nickname">이름</label>
            <div className="input-wrapper">
              <div className="input-icon-wrapper">
                <User className="input-icon" />
              </div>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input-field"
                placeholder="홍길동"
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {/* 이메일 입력 필드 */}
          <div className="form-group">
            <label className="input-label" htmlFor="email">이메일 주소</label>
            <div className="input-wrapper">
              <div className="input-icon-wrapper">
                <Mail className="input-icon" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="test@example.com"
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="form-group">
            <label className="input-label" htmlFor="password">비밀번호</label>
            <div className="input-wrapper">
              <div className="input-icon-wrapper">
                <Lock className="input-icon" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="8자 이상 입력"
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {/* 비밀번호 확인 필드 */}
          <div className="form-group">
            <label className="input-label" htmlFor="passwordConfirm">비밀번호 확인</label>
            <div className="input-wrapper">
              <div className="input-icon-wrapper">
                <Lock className="input-icon" />
              </div>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="input-field"
                placeholder="비밀번호 재입력"
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="submit-btn"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="spinner-icon" />
                가입 처리 중...
              </>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        <div className="footer-text">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-link">
            로그인 하기
          </a>
        </div>
      </div>
    </div>
  );
}