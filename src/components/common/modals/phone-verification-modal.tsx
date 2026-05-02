'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneCodeMutation,
} from '@/hooks/queries/auth/use-phone-auth-mutation';
import { extractErrorCode } from '@/utils/error';
import { formatPhoneNumber } from '@/utils/format';

type Step = 'input' | 'verify' | 'complete';

interface PhoneVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationComplete?: (phoneNumber: string) => void;
  memberId?: number; // 프로필 정보 갱신을 위한 memberId (optional)
}

export default function PhoneVerificationModal({
  open,
  onOpenChange,
  onVerificationComplete,
  memberId,
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<Step>('input');
  const [name, setName] = useState(''); // 이름 상태 추가
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(180);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // API Mutation 훅
  const { mutate: sendCode, isPending: isSendingCode } =
    useSendPhoneVerificationCodeMutation();
  const { mutate: verifyCode, isPending: isVerifying } =
    useVerifyPhoneCodeMutation(memberId);

  // 클라이언트 마운트 확인 (Portal용)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 모달 열릴 때 input 포커스
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, step]);

  // 모달이 닫히면 상태 초기화
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('input');
        setName('');
        setPhoneNumber('');
        setCode('');
        setError('');
        setTimer(180);
        setFailCount(0);
        setIsResending(false);
        setResendMessage('');
        setIsShaking(false);
      }, 300);
    }
  }, [open]);

  // 타이머 로직
  useEffect(() => {
    if (step === 'verify' && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);

      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/[^0-9]/g, '');
    if (numbers.length <= 11) {
      setPhoneNumber(numbers);
      setError('');
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleRequestCode = () => {
    if (name.trim().length < 2) {
      setError('이름을 정확히 입력해주세요.');

      return;
    }
    if (phoneNumber.length < 10) {
      setError('올바른 휴대폰 번호를 입력해주세요.');

      return;
    }

    // API 호출: 인증번호 발송
    sendCode(
      {
        realName: name.trim(),
        phoneNumber,
      },
      {
        onSuccess: () => {
          setStep('verify');
          setTimer(180);
          setError('');
        },
        onError: (error: unknown) => {
          const { message } = extractErrorCode(error);
          setError(
            message || '인증번호 발송에 실패했습니다. 다시 시도해주세요.',
          );
        },
      },
    );
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      setError('인증번호 6자리를 입력해주세요.');
      triggerShake();

      return;
    }

    // API 호출: 인증번호 검증
    verifyCode(
      {
        realName: name.trim(),
        phoneNumber,
        code,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setStep('complete');
            onVerificationComplete?.(phoneNumber);
          } else {
            const newFailCount = failCount + 1;
            setFailCount(newFailCount);
            triggerShake();

            if (newFailCount >= 5) {
              setError('인증번호를 5회 틀렸어요. 새 인증번호를 받아주세요.');
              setCode('');
            } else {
              setError(
                data.message ||
                  `인증번호가 올바르지 않아요. (${5 - newFailCount}회 남음)`,
              );
              setCode('');
            }
          }
        },
        onError: (error: unknown) => {
          const newFailCount = failCount + 1;
          setFailCount(newFailCount);
          triggerShake();
          const { message } = extractErrorCode(error);

          if (newFailCount >= 5) {
            setError('인증번호를 5회 틀렸어요. 새 인증번호를 받아주세요.');
          } else {
            setError(
              message ||
                `인증번호가 올바르지 않아요. (${5 - newFailCount}회 남음)`,
            );
          }
          setCode('');
        },
      },
    );
  };

  const handleResend = () => {
    if (name.trim().length < 2 || phoneNumber.length < 10) {
      setError('이름과 전화번호를 입력해주세요.');

      return;
    }

    setIsResending(true);
    setFailCount(0); // 재전송 시 실패 횟수 초기화
    setError('');
    setCode('');

    // API 호출: 인증번호 재발송
    sendCode(
      {
        realName: name.trim(),
        phoneNumber,
      },
      {
        onSuccess: () => {
          setTimer(180);
          setResendMessage('인증번호를 다시 보냈어요');
          setTimeout(() => {
            setResendMessage('');
            setIsResending(false);
          }, 3000);
        },
        onError: (error: unknown) => {
          const { message } = extractErrorCode(error);
          setError(
            message || '인증번호 발송에 실패했습니다. 다시 시도해주세요.',
          );
          setIsResending(false);
        },
      },
    );
  };

  if (!mounted || !open) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        fontFamily:
          'var(--font-pretendard), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      onClick={() => onOpenChange(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 16px',
          padding: '40px',
          backgroundColor: '#ffffff',
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'modalFadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---------------- STEP 1: 정보 입력 (이름 + 전화번호) ---------------- */}
        {step === 'input' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: '#111827',
                    margin: 0,
                  }}
                >
                  본인 정보를
                  <br />
                  입력해주세요
                </h2>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: 0,
                  }}
                >
                  스터디 그룹을 진행하려면 본인인증이 필요해요.
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#9ca3af',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="실명 입력"
                  value={name}
                  onChange={handleNameChange}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '18px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    if (!error) e.target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    if (!error) e.target.style.borderColor = '#e5e7eb';
                  }}
                />

                <input
                  type="tel"
                  placeholder="010-1234-5678"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '18px',
                    border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    if (!error) e.target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    if (!error) e.target.style.borderColor = '#e5e7eb';
                  }}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    phoneNumber.length >= 10 &&
                    name.trim().length >= 2 &&
                    handleRequestCode()
                  }
                />
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '2px',
                    marginLeft: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    lineHeight: '1.4',
                    wordBreak: 'keep-all',
                  }}
                >
                  <span>🔒</span>
                  <span>
                    실명과 전화번호는{' '}
                    <strong>본인과 스터디 참여자만 확인 가능</strong>하며,
                    외부자는 볼 수 없습니다.
                  </span>
                </p>
              </div>

              {error && (
                <p style={{ fontSize: '14px', color: '#ef4444' }}>{error}</p>
              )}

              <button
                onClick={handleRequestCode}
                disabled={
                  phoneNumber.length < 10 ||
                  name.trim().length < 2 ||
                  isSendingCode
                }
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor:
                    phoneNumber.length >= 10 &&
                    name.trim().length >= 2 &&
                    !isSendingCode
                      ? '#111827'
                      : '#d1d5db',
                  border: 'none',
                  borderRadius: '12px',
                  cursor:
                    phoneNumber.length >= 10 &&
                    name.trim().length >= 2 &&
                    !isSendingCode
                      ? 'pointer'
                      : 'not-allowed',
                  transition: 'background-color 0.2s',
                }}
              >
                {isSendingCode ? '발송 중...' : '인증번호 받기'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------- STEP 2: 인증번호 입력 ---------------- */}
        {step === 'verify' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: '#111827',
                    margin: 0,
                  }}
                >
                  인증번호를
                  <br />
                  입력해주세요
                </h2>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: 0,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {formatPhoneNumber(phoneNumber)}
                  </span>
                  으로
                  <br />
                  전송된 번호를 입력해주세요.
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#9ca3af',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  position: 'relative',
                  animation: isShaking ? 'shake 0.5s ease-in-out' : 'none',
                }}
              >
                <style>
                  {`
                    @keyframes shake {
                      0%, 100% { transform: translateX(0); }
                      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                      20%, 40%, 60%, 80% { transform: translateX(4px); }
                    }
                  `}
                </style>
                <input
                  ref={inputRef}
                  type="tel"
                  inputMode="numeric"
                  placeholder="인증번호 6자리"
                  value={code}
                  onChange={(e) => {
                    const num = e.target.value.replace(/[^0-9]/g, '');
                    if (num.length <= 6) setCode(num);
                    setError('');
                  }}
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '16px',
                    paddingRight: '60px',
                    fontSize: '18px',
                    border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: error ? '#fef2f2' : '#ffffff',
                    color: '#111827',
                    boxSizing: 'border-box',
                    transition: 'background-color 0.2s, border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    if (!error) e.target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    if (!error) e.target.style.borderColor = '#e5e7eb';
                  }}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && code.length === 6 && handleVerifyCode()
                  }
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ef4444',
                  }}
                >
                  {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                </span>
              </div>

              {error ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#ef4444',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>⚠</span> {error}
                  </p>
                  {failCount >= 5 && (
                    <button
                      onClick={handleResend}
                      disabled={isResending}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: '#3b82f6',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isResending ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {isResending ? '전송 중...' : '새 인증번호 받기'}
                    </button>
                  )}
                </div>
              ) : resendMessage ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#22c55e' }}>✓</span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#22c55e',
                      fontWeight: 500,
                    }}
                  >
                    {resendMessage}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    style={{
                      fontSize: '14px',
                      color: isResending ? '#9ca3af' : '#6b7280',
                      textDecoration: 'underline',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: isResending ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {isResending ? '전송 중...' : '인증번호 재전송'}
                  </button>
                </div>
              )}

              <button
                onClick={handleVerifyCode}
                disabled={code.length !== 6 || timer === 0 || isVerifying}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor:
                    code.length === 6 && timer > 0 && !isVerifying
                      ? '#111827'
                      : '#d1d5db',
                  border: 'none',
                  borderRadius: '12px',
                  cursor:
                    code.length === 6 && timer > 0 && !isVerifying
                      ? 'pointer'
                      : 'not-allowed',
                  transition: 'background-color 0.2s',
                }}
              >
                {isVerifying ? '확인 중...' : '확인'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------- STEP 3: 완료 ---------------- */}
        {step === 'complete' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '20px 0',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '40px', color: '#22c55e' }}>✓</span>
            </div>

            <h2
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827',
                margin: '0 0 8px 0',
              }}
            >
              인증 완료!
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 32px 0',
                lineHeight: 1.5,
              }}
            >
              본인 인증이 성공적으로
              <br />
              완료되었습니다.
            </p>

            <button
              onClick={() => onOpenChange(false)}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: '#111827',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              확인
            </button>
          </div>
        )}
      </div>

      {/* 애니메이션용 스타일 */}
      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );

  // document.body에 직접 Portal로 렌더링
  return createPortal(modalContent, document.body);
}
