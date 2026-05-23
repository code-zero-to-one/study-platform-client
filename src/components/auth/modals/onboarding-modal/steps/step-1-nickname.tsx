'use client';

import { Check, Loader2, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useNicknameCheckQuery } from '@/hooks/queries/auth/use-nickname-check';
import { useCareersQuery } from '@/hooks/queries/user/use-update-user-profile-mutation';
import type { CareerResponse } from '@/types/api/my-page.types';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (data.profileImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(data.profileImageUrl);
    }
    updateData('profileImageUrl', URL.createObjectURL(file));
    updateData('profileImageFile', file);
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
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-0 bottom-0 flex size-425 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
          >
            <RefreshCw className="h-200 w-200 text-gray-600" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
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
            'min-h-[18px] font-designer-12r transition-colors',
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
            className="flex cursor-pointer items-center gap-150"
            onClick={() => toggleConsent(consent.key as keyof Step1Data)}
          >
            <div
              className={cn(
                'flex size-250 shrink-0 items-center justify-center rounded-50 border transition-colors',
                data[consent.key]
                  ? 'border-rose-500 bg-rose-500'
                  : 'border-gray-300 bg-white',
              )}
            >
              {data[consent.key] && (
                <Check className="h-150 w-150 text-white" />
              )}
            </div>
            <span className="flex-1 font-designer-14m text-gray-800">
              {consent.label}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(consent.link, '_blank');
              }}
              className="shrink-0 font-designer-14m text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-700"
            >
              보기
            </button>
          </div>
        ))}
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
