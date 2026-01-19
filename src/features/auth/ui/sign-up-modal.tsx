import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { setCookie } from '@/api/client/cookie';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { Modal } from '@/components/ui/modal';
import {
  useSignUpMutation,
  useUploadProfileImageMutation,
} from '@/features/auth/model/use-auth-mutation';
import { getAttributionParams } from '@/utils/attribution-tracker';
import { hashValue } from '@/utils/hash';
import {
  NicknameStep,
  JobStep,
  CareerStep,
  StudyFormatTypesStep,
  GoalStep,
  SuccessStep,
} from './steps';
import { SignUpRequest } from '../model/types';

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
  const [currentStep, setCurrentStep] = useState<Step>('nickname');
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

  useEffect(() => {
    if (open) {
      const attributionParams = getAttributionParams();

      sendGTMEvent({
        event: 'signup_modal_open',
        ...attributionParams,
      });
      setCurrentStep('nickname');
      setSignupData({ nickname: '', studyFormatTypes: [], goal: '', jobs: [] });
    }
  }, [open]);

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
        const refreshToken = content?.refreshToken;
        
        if (memberId && accessToken && refreshToken) {
          setCookie('memberId', memberId);
          setCookie('accessToken', accessToken);
          // refreshToken도 쿠키에 저장 (필요 시 secure, httpOnly 설정 등 고려)
          setCookie('refresh_token', refreshToken);

          // 이미지 업로드
          if (signupData.file) {
            const formData = new FormData();
            formData.append('file', signupData.file);
            uploadProfileImage.mutate({
              memberId: Number(memberId),
              filename: `profile-${memberId}`,
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
        }

        // 모달 닫지 않고 success step으로 이동 (토큰 여부와 관계없이 성공 시 이동)
        setCurrentStep('success');
      },
      onError: (error) => {
        console.error('회원가입 실패:', error);
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
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

  const updateData = (key: string, value: any) => {
    setSignupData((prev) => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'nickname':
        return (
          <NicknameStep
            data={signupData}
            updateData={updateData}
            onNext={handleNext}
          />
        );
      case 'job':
        return (
          <JobStep
            data={signupData}
            updateData={updateData}
            onNext={handleNext}
          />
        );
      case 'career':
        return (
          <CareerStep
            data={signupData}
            updateData={updateData}
            onNext={handleNext}
          />
        );
      case 'study-format-type':
        return (
          <StudyFormatTypesStep
            data={signupData}
            updateData={updateData}
            onNext={handleNext}
          />
        );
      case 'goal':
        return (
          <GoalStep
            data={signupData}
            updateData={updateData}
            onNext={handleNext}
            onSkip={handleComplete}
          />
        );
      case 'success':
        return <SuccessStep onConfirm={handleSuccessConfirm} />;
      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isSuccessStep = currentStep === 'success';

  return (
    <Modal.Root open={open} onOpenChange={onClose}>
      <Modal.Portal>
        {/* 회원가입 타이틀은 스크린리더만 읽히도록 sr-only 처리 */}
        <Modal.Title className="sr-only">회원가입</Modal.Title>
        <Modal.Overlay />
        <Modal.Content size="medium">
          {/* 헤더 - success step일 때 숨김 */}
          {!isSuccessStep && (
            <Modal.Header className="border-none pb-0">
              <div className="flex items-center justify-between">
                {currentStepIndex > 0 ? (
                  <button
                    onClick={handleBack}
                    className="rounded-100 hover:bg-fill-neutral-default-default text-text-subtle p-100 transition-colors"
                  >
                    <ArrowLeft className="h-[20px] w-[20px]" />
                  </button>
                ) : (
                  <div className="w-[36px]" />
                )}

                {/* 스텝 인디케이터 (크기 키움) */}
                <div className="flex gap-75">
                  {STEPS.filter((step) => step !== 'success').map(
                    (step, idx) => (
                      <div
                        key={step}
                        className={cn(
                          'h-[10px] rounded-full transition-all duration-300',
                          idx === currentStepIndex
                            ? 'bg-fill-brand-default-default w-[32px]'
                            : 'bg-fill-neutral-default-default w-[10px]',
                        )}
                      />
                    ),
                  )}
                </div>

                <Modal.Close className="rounded-100 hover:bg-fill-neutral-default-default text-text-subtle p-100 transition-colors">
                  <XIcon className="h-[20px] w-[20px]" />
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
              {renderStep()}
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
