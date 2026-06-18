import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  NicknameStep,
  JobStep,
  CareerStep,
  StudyFormatTypesStep,
  GoalStep,
  SuccessStep,
} from '@/components/auth/forms/sign-up-steps';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { Modal } from '@/components/common/ui/modal';
import {
  redirectToClearedLoginState,
  resetClientDerivedAuthStateWithQueryCache,
} from '@/features/auth/model/client-auth-cleanup';
import { writeExistingMemberSession } from '@/features/auth/model/client-auth-session';
import {
  useSignUpMutation,
  useUploadProfileImageMutation,
} from '@/hooks/queries/auth/use-auth-mutation';
import { useToastStore } from '@/stores/use-toast-store';
import { SignUpRequest } from '@/types/api/auth.types';
import { getAttributionParams } from '@/utils/attribution-tracker';
import { hashValue } from '@/utils/hash';

type Step =
  | 'nickname'
  | 'job'
  | 'career'
  | 'study-format-type'
  | 'goal'
  | 'success';

const STEPS: Step[] = [
  'nickname',
  'job',
  'career',
  'study-format-type',
  'goal',
  'success',
];

export default function SignupModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // 열릴 때만 내부 콘텐츠 마운트 → 상태 초기화 effect 불필요(mount-gate).
  return (
    <Modal.Root open={open} onOpenChange={onClose}>
      <Modal.Portal>
        {/* 회원가입 타이틀은 스크린리더만 읽히도록 sr-only 처리 */}
        <Modal.Title className="sr-only">회원가입</Modal.Title>
        <Modal.Overlay />
        <Modal.Content size="medium">
          {open && <SignupModalContent onClose={onClose} />}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function SignupModalContent({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState<Step>('nickname');
  const showToast = useToastStore((state) => state.showToast);
  const signUp = useSignUpMutation();
  const uploadProfileImage = useUploadProfileImageMutation();
  const [signupData, setSignupData] = useState<{
    nickname: string;
    image?: string;
    file?: File;
    jobs?: string[];
    career?: string;
    studyFormatTypes: string[];
    goal: string;
  }>({
    nickname: '',
    studyFormatTypes: [],
    goal: '',
    jobs: [],
  });

  // 모달 노출(마운트) 시 1회 분석 이벤트 전송.
  useEffect(() => {
    const attributionParams = getAttributionParams();

    sendGTMEvent({
      event: 'signup_modal_open',
      ...attributionParams,
    });
  }, []);

  const handleComplete = () => {
    const imageExtension =
      signupData.file?.name.split('.').pop()?.toUpperCase() || 'JPG';

    const jobs =
      signupData.jobs && signupData.jobs.length > 0
        ? signupData.jobs
        : undefined;
    const careerEnum = signupData.career;
    const studyFormatTypes =
      signupData.studyFormatTypes.length > 0
        ? signupData.studyFormatTypes
        : undefined;

    const signUpPayload: SignUpRequest = {
      nickname: signupData.nickname,
      imageExtension: imageExtension as
        | 'JPG'
        | 'PNG'
        | 'GIF'
        | 'WEBP'
        | 'SVG'
        | 'JPEG'
        | 'DEFAULT',
      ...(jobs && jobs.length > 0 && { jobs }),
      ...(careerEnum && { career: careerEnum }),
      ...(studyFormatTypes &&
        studyFormatTypes.length > 0 && { studyFormatTypes }),
      ...(signupData.goal &&
        signupData.goal.trim() && {
          goal: signupData.goal.trim().slice(0, 100),
        }), // 최대 100자
    };

    signUp.mutate(signUpPayload, {
      onSuccess: async (data) => {
        const content = data?.content;
        const memberId = content?.generatedMemberId;
        const accessToken = content?.accessToken;
        if (!memberId || !accessToken) {
          showToast(
            '회원가입 후 로그인 세션을 확인하지 못했습니다. 다시 로그인해주세요.',
            'error',
          );
          redirectToClearedLoginState();

          return;
        }

        resetClientDerivedAuthStateWithQueryCache();
        const hasSavedExistingMemberSession = writeExistingMemberSession({
          accessToken,
          memberId,
        });

        if (!hasSavedExistingMemberSession) {
          showToast(
            '회원가입 후 로그인 세션 저장에 실패했습니다. 다시 로그인해주세요.',
            'error',
          );
          redirectToClearedLoginState();

          return;
        }

        if (signupData.file && content?.uploadUrl) {
          const formData = new FormData();
          formData.append('file', signupData.file);
          uploadProfileImage.mutate({
            uploadUrl: content.uploadUrl,
            file: formData,
          });
        }

        const attributionParams = getAttributionParams();

        sendGTMEvent({
          event: 'custom_member_join',
          dl_timestamp: new Date().toISOString(),
          dl_member_id: hashValue(memberId),
          ...attributionParams,
        });

        // 모달 닫지 않고 success step으로 이동
        setCurrentStep('success');
      },
      onError: (error) => {
        console.error('회원가입 실패:', error);
        showToast('회원가입에 실패했습니다. 다시 시도해주세요.', 'error');
      },
    });
  };

  const handleNext = () => {
    // goal 단계에서는 바로 완료 처리
    if (currentStep === 'goal') {
      handleComplete();

      return;
    }

    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleSuccessConfirm = () => {
    onClose();
    window.location.href = '/home';
  };

  const updateData = (key: string, value: unknown) => {
    setSignupData((prev) => ({ ...prev, [key]: value }));
  };

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isSuccessStep = currentStep === 'success';

  return (
    <>
      {/* 헤더 - success step일 때 숨김 */}
      {!isSuccessStep && (
        <Modal.Header className="border-none pb-0">
          <div className="flex items-center justify-between">
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-100 hover:bg-fill-neutral-default-default text-text-subtle p-100 transition-colors"
              >
                <ArrowLeft className="size-250" />
              </button>
            ) : (
              <div className="w-[36px]" />
            )}

            {/* 스텝 인디케이터 (크기 키움) */}
            <div className="flex gap-75">
              {STEPS.flatMap((step, idx) =>
                step === 'success'
                  ? []
                  : [
                      <div
                        key={step}
                        className={cn(
                          'h-125 rounded-full transition-all duration-300',
                          idx === currentStepIndex
                            ? 'bg-fill-brand-default-default w-400'
                            : 'bg-fill-neutral-default-default w-125',
                        )}
                      />,
                    ],
              )}
            </div>

            <Modal.Close className="rounded-100 hover:bg-fill-neutral-default-default text-text-subtle p-100 transition-colors">
              <XIcon className="size-250" />
            </Modal.Close>
          </div>
        </Modal.Header>
      )}

      {/* 메인 컨텐츠 */}
      <Modal.Body className="flex min-h-[400px] flex-col pt-200">
        <div
          key={currentStep}
          className="animate-in slide-in-from-right-4 fade-in fill-mode-forwards flex h-full flex-1 flex-col duration-300"
        >
          {currentStep === 'nickname' && (
            <NicknameStep
              data={signupData}
              updateData={updateData}
              onNext={handleNext}
            />
          )}
          {currentStep === 'job' && (
            <JobStep
              data={signupData}
              updateData={updateData}
              onNext={handleNext}
            />
          )}
          {currentStep === 'career' && (
            <CareerStep
              data={signupData}
              updateData={updateData}
              onNext={handleNext}
            />
          )}
          {currentStep === 'study-format-type' && (
            <StudyFormatTypesStep
              data={signupData}
              updateData={updateData}
              onNext={handleNext}
            />
          )}
          {currentStep === 'goal' && (
            <GoalStep
              data={signupData}
              updateData={updateData}
              onNext={handleNext}
              onSkip={handleComplete}
            />
          )}
          {currentStep === 'success' && (
            <SuccessStep onConfirm={handleSuccessConfirm} />
          )}
        </div>
      </Modal.Body>
    </>
  );
}
