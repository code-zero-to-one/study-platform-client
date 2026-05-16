'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneCodeMutation,
} from '@/hooks/queries/auth/use-phone-auth-mutation';
import { useToastStore } from '@/stores/use-toast-store';
import type { CheckoutFormValues } from './checkout-form';

const OTP_SECONDS = 180;

interface BuyerInfoSectionProps {
  onVerified: (verified: boolean) => void;
}

export function BuyerInfoSection({ onVerified }: BuyerInfoSectionProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const showToast = useToastStore((s) => s.showToast);
  const sendCode = useSendPhoneVerificationCodeMutation();
  const verifyCode = useVerifyPhoneCodeMutation();

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const [isVerified, setIsVerified] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setSecondsLeft(OTP_SECONDS);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const buyerName = watch('buyerName');
  const buyerPhone = watch('buyerPhone');

  useEffect(() => {
    if (!otpSent || isVerified) {
      clearTimer();
      return;
    }
    startTimer();
    return () => clearTimer();
  }, [otpSent, isVerified, clearTimer, startTimer]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  const handleSendCode = () => {
    const name = buyerName?.trim();
    const phone = buyerPhone?.trim();

    if (!name) {
      showToast('이름을 먼저 입력해주세요.', 'error');
      return;
    }
    if (!phone) {
      showToast('휴대폰 번호를 입력해주세요.', 'error');
      return;
    }

    const wasAlreadySent = otpSent;
    sendCode.mutate(
      { realName: name, phoneNumber: phone },
      {
        onSuccess: () => {
          setOtpSent(true);
          setOtpCode('');
          showToast('인증번호가 발송되었습니다.');
          if (wasAlreadySent) {
            startTimer();
          }
        },
        onError: () => {
          showToast('인증번호 발송에 실패했습니다.', 'error');
        },
      },
    );
  };

  const handleVerify = () => {
    const name = buyerName?.trim();
    const phone = buyerPhone?.trim();

    if (!otpCode.trim()) {
      showToast('인증번호를 입력해주세요.', 'error');
      return;
    }
    if (secondsLeft === 0) {
      showToast('인증 시간이 만료되었습니다. 다시 시도해주세요.', 'error');
      return;
    }

    verifyCode.mutate(
      {
        realName: name ?? '',
        phoneNumber: phone ?? '',
        code: otpCode.trim(),
      },
      {
        onSuccess: (data) => {
          if (data?.success) {
            setIsVerified(true);
            onVerified(true);
            showToast('휴대폰 인증이 완료되었습니다.');
          } else {
            showToast('인증번호가 올바르지 않습니다.', 'error');
          }
        },
        onError: () => {
          showToast('인증 확인에 실패했습니다.', 'error');
        },
      },
    );
  };

  return (
    <div className="rounded-200 border border-gray-300 bg-background-default px-500 py-400">
      <h2 className="mb-300 font-designer-18b text-gray-800">구매자 정보</h2>

      <div className="flex flex-col gap-300">
        {/* 이름 */}
        <div className="flex flex-col gap-100">
          <label
            htmlFor="buyerName"
            className="font-designer-14b text-gray-800"
          >
            이름 <span className="text-text-error">*</span>
          </label>
          <input
            id="buyerName"
            {...register('buyerName')}
            type="text"
            placeholder="이름을 입력해주세요"
            className={cn(
              'h-600 w-full rounded-100 border px-300 font-designer-16r text-gray-800 outline-none placeholder:text-gray-400',
              'focus:border-border-brand',
              errors.buyerName ? 'border-border-error' : 'border-gray-300',
            )}
          />
          {errors.buyerName && (
            <p className="font-designer-12r text-text-error">
              {errors.buyerName.message}
            </p>
          )}
        </div>

        {/* 이메일 */}
        <div className="flex flex-col gap-100">
          <label
            htmlFor="buyerEmail"
            className="font-designer-14b text-gray-800"
          >
            이메일 <span className="text-text-error">*</span>
          </label>
          <input
            id="buyerEmail"
            {...register('buyerEmail')}
            type="email"
            placeholder="이메일을 입력해주세요"
            className={cn(
              'h-600 w-full rounded-100 border px-300 font-designer-16r text-gray-800 outline-none placeholder:text-gray-400',
              'focus:border-border-brand',
              errors.buyerEmail ? 'border-border-error' : 'border-gray-300',
            )}
          />
          {errors.buyerEmail && (
            <p className="font-designer-12r text-text-error">
              {errors.buyerEmail.message}
            </p>
          )}
        </div>

        {/* 휴대폰 번호 */}
        <div className="flex flex-col gap-100">
          <label
            htmlFor="buyerPhone"
            className="font-designer-14b text-gray-800"
          >
            휴대폰 번호 <span className="text-text-error">*</span>
          </label>
          <div className="flex gap-150">
            <input
              id="buyerPhone"
              {...register('buyerPhone')}
              type="tel"
              placeholder="01012345678"
              disabled={isVerified}
              className={cn(
                'h-600 flex-1 rounded-100 border px-300 font-designer-16r text-gray-800 outline-none placeholder:text-gray-400',
                'focus:border-border-brand',
                isVerified && 'cursor-not-allowed opacity-60',
                errors.buyerPhone ? 'border-border-error' : 'border-gray-300',
              )}
            />
            {isVerified ? (
              <span className="flex h-600 items-center rounded-100 bg-gray-100 px-300 font-designer-14b text-gray-500">
                인증 완료
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendCode.isPending}
                className="h-600 shrink-0 rounded-100 bg-background-brand-default px-300 font-designer-14b text-gray-0 disabled:opacity-60"
              >
                {otpSent ? '재발송' : '인증하기'}
              </button>
            )}
          </div>
          {errors.buyerPhone && (
            <p className="font-designer-12r text-text-error">
              {errors.buyerPhone.message}
            </p>
          )}

          {/* OTP input row */}
          {otpSent && !isVerified && (
            <div className="flex gap-150">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="인증번호 6자리"
                  maxLength={6}
                  className="h-600 w-full rounded-100 border border-gray-300 px-300 font-designer-16r text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
                />
                <span className="absolute right-300 top-1/2 -translate-y-1/2 font-designer-14r text-text-error">
                  {minutes}:{seconds}
                </span>
              </div>
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifyCode.isPending || secondsLeft === 0}
                className="h-600 shrink-0 rounded-100 border border-background-brand-default px-300 font-designer-14b text-text-brand disabled:opacity-60"
              >
                확인
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
