'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useNicknameCheckQuery } from '@/hooks/queries/auth/use-nickname-check';
import { useCareersQuery } from '@/hooks/queries/user/use-update-user-profile-mutation';
import type { CareerResponse } from '@/types/api/my-page.types';

const AVATAR_PATHS = Array.from(
  { length: 8 },
  (_, i) => `/onboarding/avatars/avatar-${i + 1}.png`,
);

interface Step1Data {
  nickname: string;
  profileImageUrl?: string;
  profileImageFile?: File;
  career?: string;
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
}

interface Step1NicknameProps {
  data: Step1Data;
  updateData: (field: keyof Step1Data, value: unknown) => void;
  onNext: () => void;
}

const CONSENTS = [
  {
    key: 'termsAgreed' as const,
    label: '[필수] 이용약관 동의',
    link: 'https://www.notion.so/gaan/29bfbb391d7980fba669f8d4de741021',
  },
  {
    key: 'privacyAgreed' as const,
    label: '[필수] 개인정보 처리방침 동의',
    link: 'https://www.notion.so/gaan/29bfbb391d7980fba669f8d4de741021',
  },
  {
    key: 'marketingAgreed' as const,
    label: '[선택] 마케팅 정보 수신 동의',
    link: 'https://www.notion.so/gaan/29bfbb391d7980fba669f8d4de741021',
  },
];

const isValidNicknameFormat = (v: string) => /^[가-힣a-zA-Z]{2,10}$/.test(v);

export function Step1Nickname({
  data,
  updateData,
  onNext,
}: Step1NicknameProps) {
  const [isCheckRequested, setIsCheckRequested] = useState(false);

  const isValidFormat = isValidNicknameFormat(data.nickname);

  const { data: nicknameCheck, isLoading: isChecking } = useNicknameCheckQuery(
    data.nickname,
    isCheckRequested && isValidFormat,
  );

  const isAvailable = nicknameCheck?.available ?? null;
  const showAvailable = isCheckRequested && !isChecking && isAvailable === true;
  const showTaken = isCheckRequested && !isChecking && isAvailable === false;

  const { data: careers = [] } = useCareersQuery();

  const canProceed =
    isValidFormat &&
    showAvailable &&
    data.termsAgreed &&
    data.privacyAgreed &&
    !!data.career;

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData('nickname', e.target.value);
    setIsCheckRequested(false);
  };

  const handleCheckNickname = () => {
    if (!isValidFormat || isChecking) return;
    setIsCheckRequested(true);
  };

  const handleRandomAvatar = async () => {
    if (data.profileImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(data.profileImageUrl);
    }
    const path = AVATAR_PATHS[Math.floor(Math.random() * AVATAR_PATHS.length)];
    updateData('profileImageUrl', path);
    updateData('profileImageFile', undefined);
    try {
      const res = await fetch(path);
      const blob = await res.blob();
      const file = new File([blob], path.split('/').pop()!, {
        type: 'image/png',
      });
      updateData('profileImageFile', file);
    } catch {
      updateData('profileImageUrl', undefined);
    }
  };

  const toggleConsent = (key: keyof Step1Data) => {
    updateData(key, !data[key]);
  };

  return (
    <div className="flex flex-col gap-400 overflow-y-auto">
      {/* Profile image */}
      <div className="flex flex-col items-center gap-200">
        <div className="relative">
          <div className="size-1600 overflow-hidden rounded-full bg-rose-50">
            {data.profileImageUrl ? (
              <Image
                src={data.profileImageUrl}
                alt="프로필 이미지"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span className="text-[48px]">😊</span>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="프로필 이미지 변경"
            onClick={handleRandomAvatar}
            className="absolute right-0 bottom-0 flex size-425 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
          >
            <svg
              viewBox="0 0 17.58 18.5892"
              className="h-200 w-200 text-gray-600"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.79 4.29462H13.79V6.08462C13.79 6.53462 14.33 6.75462 14.64 6.43462L17.43 3.64462C17.63 3.44462 17.63 3.13462 17.43 2.93462L14.64 0.144618C14.33 -0.165382 13.79 0.0546185 13.79 0.504618V2.29462H2.79C2.24 2.29462 1.79 2.74462 1.79 3.29462V7.29462C1.79 7.84462 2.24 8.29462 2.79 8.29462C3.34 8.29462 3.79 7.84462 3.79 7.29462V4.29462ZM13.79 14.2946H3.79V12.5046C3.79 12.0546 3.25 11.8346 2.94 12.1546L0.15 14.9446C-0.05 15.1446 -0.05 15.4546 0.15 15.6546L2.94 18.4446C3.25 18.7546 3.79 18.5346 3.79 18.0846V16.2946H14.79C15.34 16.2946 15.79 15.8446 15.79 15.2946V11.2946C15.79 10.7446 15.34 10.2946 14.79 10.2946C14.24 10.2946 13.79 10.7446 13.79 11.2946V14.2946Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nickname title */}
      <div className="flex flex-col gap-100">
        <p className="font-designer-18b text-gray-800">
          반가워요! 닉네임을 정해주세요.
        </p>
        <p className="font-designer-14r text-gray-500">
          ZERO-ONE에서 사용할 이름입니다.
        </p>
      </div>

      {/* Nickname input */}
      <div className="flex flex-col gap-100">
        <div className="flex h-700 gap-150">
          <input
            type="text"
            value={data.nickname}
            onChange={handleNicknameChange}
            placeholder="닉네임을 입력해주세요"
            maxLength={10}
            className={cn(
              'flex-1 rounded-150 border px-250 font-designer-14r text-gray-800 outline-none placeholder:text-gray-500 transition-colors',
              showTaken
                ? 'border-border-error focus:border-border-error'
                : 'border-gray-300 focus:border-border-brand',
            )}
          />
          <button
            type="button"
            onClick={handleCheckNickname}
            disabled={!isValidFormat || isChecking}
            className={cn(
              'shrink-0 rounded-150 px-250 font-designer-14m transition-colors',
              isValidFormat && !isChecking
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'cursor-not-allowed bg-gray-200 text-gray-400',
            )}
          >
            {isChecking ? (
              <Loader2 className="h-200 w-200 animate-spin" />
            ) : (
              '중복확인'
            )}
          </button>
        </div>
        <p
          className={cn(
            'min-h-225 font-designer-12r transition-colors',
            showTaken
              ? 'text-text-error'
              : showAvailable
                ? 'text-text-success'
                : !isValidFormat && data.nickname
                  ? 'text-text-error'
                  : 'text-text-subtlest',
          )}
        >
          {showTaken
            ? '이미 사용 중인 닉네임이에요'
            : showAvailable
              ? '사용 가능한 닉네임이에요'
              : !isValidFormat && data.nickname
                ? '2~10자 이내의 한글/영문만 가능해요'
                : '2~10자 이내의 한글/영문'}
        </p>
      </div>

      {/* Consent checkboxes */}
      <div className="flex flex-col gap-425">
        {CONSENTS.map((consent) => (
          <div
            key={consent.key}
            className="flex cursor-pointer items-center gap-125"
            onClick={() => toggleConsent(consent.key as keyof Step1Data)}
          >
            {data[consent.key] ? (
              <svg
                viewBox="0 0 20 20"
                className="size-300 shrink-0 text-rose-500"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 13.5L5.5 9L6.92 7.59L10 10.67L13.08 7.59L14.5 9L10 13.5Z" />
              </svg>
            ) : (
              <div className="size-300 shrink-0 rounded-full border border-gray-300" />
            )}
            <span className="flex-1 font-designer-16b text-gray-800">
              {consent.label}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(consent.link, '_blank', 'noopener,noreferrer');
              }}
              className="shrink-0 font-designer-14m text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-700"
            >
              보기
            </button>
          </div>
        ))}
      </div>

      {/* Career title */}
      <div className="flex flex-col gap-100">
        <p className="font-designer-18b text-gray-800">
          바이브 코딩, 어디까지 해보셨나요?
        </p>
        <p className="font-designer-14r text-gray-500">
          신규 코스 기획에 활용될 예정입니다.
        </p>
      </div>

      {/* Career options */}
      <div className="flex flex-col gap-150">
        {careers.map((careerResponse: CareerResponse) => (
          <button
            key={careerResponse.career}
            type="button"
            onClick={() => updateData('career', careerResponse.career)}
            className={cn(
              'h-700 rounded-150 border px-300 text-left font-designer-14m transition-all duration-200',
              data.career === careerResponse.career
                ? 'border-rose-500 bg-rose-50 text-rose-500'
                : 'border-gray-300 bg-white text-gray-800 hover:border-rose-300',
            )}
          >
            {careerResponse.description}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className={cn(
          'h-700 w-full rounded-100 font-designer-16b transition-colors',
          canProceed
            ? 'bg-rose-500 text-white hover:bg-rose-600'
            : 'cursor-not-allowed bg-gray-200 text-gray-400',
        )}
      >
        다음
      </button>
    </div>
  );
}
