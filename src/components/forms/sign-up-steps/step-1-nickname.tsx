// 1. 닉네임 입력 단계
import { Hand, Check, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import SignupImageSelector from '@/components/forms/sign-up-image-selector';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { BaseInput } from '@/components/ui/input';
import { useDebounce } from '@/hooks/common/use-debounce';
import { useNicknameCheckQuery } from '@/hooks/queries/use-nickname-check';
import { StepHeader } from './step-header';

export function NicknameStep({ data, updateData, onNext }: any) {
  const [checked, setChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isValidName = /^[가-힣a-zA-Z]{2,10}$/.test(data.nickname);

  // 닉네임 debounce (500ms)
  const debouncedNickname = useDebounce(data.nickname, 500);

  // 닉네임 중복 체크 (유효한 형식일 때만)
  const { data: nicknameCheck, isLoading: isCheckingNickname } =
    useNicknameCheckQuery(
      debouncedNickname,
      isValidName && debouncedNickname.length >= 2,
    );

  // 닉네임 사용 가능 여부
  const isNicknameAvailable = nicknameCheck?.available ?? true;
  const showNicknameError =
    isValidName &&
    debouncedNickname === data.nickname &&
    nicknameCheck &&
    !isNicknameAvailable;

  useEffect(() => {
    if (isValidName && checked && isNicknameAvailable && !isCheckingNickname) {
      const timer = setTimeout(() => {
        onNext();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isValidName, checked, isNicknameAvailable, isCheckingNickname, onNext]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateData('image', URL.createObjectURL(e.target.files[0]));
      updateData('file', e.target.files[0]);
    }
  };

  return (
    <div className="flex h-full flex-col gap-400">
      <StepHeader
        icon={Hand}
        title={
          <>
            반가워요!
            <br />
            어떤 이름으로 불러드릴까요?
          </>
        }
        subtitle="프로필 사진도 설정할 수 있어요"
      />

      <div className="-mt-200 flex flex-1 flex-col items-center justify-center gap-300">
        <SignupImageSelector
          image={data.image}
          setImage={(img) => updateData('image', img)}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
        />

        <div className="flex w-full max-w-[320px] flex-col gap-200">
          <div className="flex flex-col gap-75">
            <div className="relative">
              <BaseInput
                autoFocus
                type="text"
                value={data.nickname}
                onChange={(e) => updateData('nickname', e.target.value)}
                placeholder="닉네임을 입력해주세요"
                className="text-center"
                maxLength={10}
                color={
                  showNicknameError
                    ? 'error'
                    : isValidName || !data.nickname
                      ? 'default'
                      : 'error'
                }
              />
              {isValidName && data.nickname && isCheckingNickname && (
                <div className="absolute top-1/2 right-100 -translate-y-1/2">
                  <Loader2
                    className="text-text-subtle animate-spin"
                    size={16}
                  />
                </div>
              )}
            </div>
            <p
              className={cn(
                'font-designer-13r min-h-[20px] text-center transition-all',
                showNicknameError || (!isValidName && data.nickname)
                  ? 'text-text-error'
                  : isValidName && isNicknameAvailable && !isCheckingNickname
                    ? 'text-text-success'
                    : 'text-text-subtlest',
              )}
            >
              {showNicknameError
                ? '이미 사용 중인 닉네임이에요'
                : !isValidName && data.nickname
                  ? '2~10자 이내의 한글/영문만 가능해요'
                  : isValidName &&
                      isNicknameAvailable &&
                      !isCheckingNickname &&
                      data.nickname
                    ? '사용 가능한 닉네임이에요'
                    : '2~10자 이내의 한글/영문'}
            </p>
          </div>

          <div
            className="rounded-100 hover:bg-fill-neutral-subtle-hover flex cursor-pointer items-center justify-center gap-100 p-150 transition-colors"
            onClick={() => setChecked(!checked)}
          >
            <div
              className={cn(
                'rounded-50 flex h-[20px] w-[20px] items-center justify-center border transition-all',
                checked
                  ? 'bg-fill-brand-default-default border-fill-brand-default-default'
                  : 'border-border-default bg-background-default',
              )}
            >
              {checked && (
                <Check className="text-text-inverse h-[14px] w-[14px]" />
              )}
            </div>
            <span className="font-designer-14m text-text-subtle">
              이용약관 및 개인정보 처리방침 동의
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  'https://www.notion.so/gaan/29bfbb391d7980fba669f8d4de741021',
                  '_blank',
                );
              }}
              className="font-designer-14m text-text-subtlest hover:text-text-subtle py-100 underline underline-offset-4 transition-colors"
            >
              보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
