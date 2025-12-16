import { sendGTMEvent } from '@next/third-parties/google';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { setCookie } from '@/api/client/cookie';
import {
  useSignUpMutation,
  useUploadProfileImageMutation,
} from '@/features/auth/model/use-auth-mutation';
import { getAttributionParams } from '@/utils/attribution-tracker';
import { hashValue } from '@/utils/hash';
import { 
  XIcon,
  ArrowLeft,
} from 'lucide-react';
import { SignUpRequest } from '../model/types';
import { NicknameStep, JobStep, CareerStep, StudyFormatTypesStep, GoalStep } from './steps';

type Step = 'nickname' | 'job' | 'career' | 'study-format-type' | 'goal';

const STEPS: Step[] = ['nickname', 'job', 'career', 'study-format-type', 'goal'];

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
    job?: string;
    career?: string;
    studyFormatTypes: string[];
    goal: string;
  }>({
    nickname: '',
    studyFormatTypes: [],
    goal: '',
  });

  useEffect(() => {
    if (open) {
      const attributionParams = getAttributionParams();

      sendGTMEvent({
        event: 'signup_modal_open',
        ...attributionParams,
      });
      setCurrentStep('nickname');
      setSignupData({ nickname: '', studyFormatTypes: [], goal: '' });
    }
  }, [open]);

  const handleComplete = () => {
    const imageExtension = signupData.file?.name.split('.').pop()?.toUpperCase() || 'JPG';
    
    const jobEnum = signupData.job;
    const careerEnum = signupData.career;
    const studyFormatTypes = signupData.studyFormatTypes.length > 0
      ? signupData.studyFormatTypes
      : undefined;

    const signUpPayload: SignUpRequest = {
      nickname: signupData.nickname,
      imageExtension: imageExtension as 'JPG' | 'PNG' | 'GIF' | 'WEBP' | 'SVG' | 'JPEG' | 'DEFAULT',
      ...(jobEnum && { job: jobEnum }),
      ...(careerEnum && { career: careerEnum }),
      ...(studyFormatTypes && studyFormatTypes.length > 0 && { studyFormatTypes }),
      ...(signupData.goal && signupData.goal.trim() && { goal: signupData.goal.trim().slice(0, 100) }), // 최대 100자
    };

    signUp.mutate(signUpPayload,
      {
        onSuccess: async (data) => {
          const memberId = data.content.generatedMemberId;
          if (memberId) {
            setCookie('memberId', memberId);

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

            onClose();
            window.location.href = '/home';
          }
        },
        onError: (error) => {
          console.error('회원가입 실패:', error);
          alert('회원가입에 실패했습니다. 다시 시도해주세요.');
        }
      }
    );
  };

  const handleNext = () => {
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
      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep);

  return (
    <Modal.Root open={open} onOpenChange={onClose}>
      <Modal.Portal>
        {/* 회원가입 타이틀은 스크린리더만 읽히도록 sr-only 처리 */}
        <Modal.Title className="sr-only">회원가입</Modal.Title> 
        <Modal.Overlay />
        <Modal.Content size="medium">
          {/* 헤더 */}
          <Modal.Header className="border-none pb-0">
            <div className="flex items-center justify-between">
              {currentStepIndex > 0 ? (
                <button 
                  onClick={handleBack}
                  className="p-100 rounded-100 hover:bg-fill-neutral-default-default text-text-subtle transition-colors"
                >
                  <ArrowLeft className="w-[20px] h-[20px]" />
                </button>
              ) : (
                <div className="w-[36px]" />
              )}
              
              {/* 스텝 인디케이터 (크기 키움) */}
              <div className="flex gap-75">
                {STEPS.map((step, idx) => (
                  <div 
                    key={step}
                    className={cn(
                      "h-[10px] rounded-full transition-all duration-300",
                      idx === currentStepIndex 
                        ? "w-[32px] bg-fill-brand-default-default" 
                        : "w-[10px] bg-fill-neutral-default-default"
                    )}
                  />
                ))}
              </div>

              <Modal.Close className="p-100 rounded-100 hover:bg-fill-neutral-default-default text-text-subtle transition-colors">
                <XIcon className="w-[20px] h-[20px]" />
              </Modal.Close>
            </div>
          </Modal.Header>

          {/* 메인 컨텐츠 */}
          <Modal.Body className="min-h-[400px] flex flex-col pt-200">
            <div key={currentStep} className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 fade-in duration-300 fill-mode-forwards">
              {renderStep()}
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}