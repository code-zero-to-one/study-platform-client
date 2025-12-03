import { sendGTMEvent } from '@next/third-parties/google';
import { useEffect, useState, useRef, useMemo } from 'react';
import { getCookie, setCookie } from '@/api/client/cookie';
import Button from '@/components/ui/button';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import {
  useSignUpMutation,
  useUploadProfileImageMutation,
} from '@/features/auth/model/use-auth-mutation';
import SignupImageSelector from '@/features/auth/ui/sign-up-image-selector';
import { getAttributionParams } from '@/utils/attribution-tracker';
import { hashValue } from '@/utils/hash';
import { 
  XIcon,
  ArrowLeft,
  Check,
  Hand,
  Briefcase, 
  TrendingUp, 
  Rocket,
  Lightbulb 
} from 'lucide-react';
import {
  JOB_OPTIONS,
  CAREER_OPTIONS,
  STUDY_TYPE_OPTIONS,
} from '@/features/auth/const/signup-options';

type Step = 'nickname' | 'job' | 'career' | 'interests' | 'goal';

const STEPS: Step[] = ['nickname', 'job', 'career', 'interests', 'goal'];

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
    name: string;
    image?: string;
    file?: File;
    job?: string;
    career?: string;
    studyTypes: string[];
    goal: string;
  }>({
    name: '',
    studyTypes: [],
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
      setSignupData({ name: '', studyTypes: [], goal: '' });
    }
  }, [open]);

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

  const handleComplete = () => {
    // console.log('Signup Completed:', signupData);

    const imageExtension = signupData.file?.name.split('.').pop() || 'jpg';

    signUp.mutate(
      {
        name: signupData.name,
        imageExtension,
        // job: signupData.job,
        // career: signupData.career,
        // studyTypes: signupData.studyTypes,
        // goal: signupData.goal,
      },
      {
        onSuccess: (data) => {
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
      case 'interests':
        return (
          <InterestsStep
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

// 공통 타이틀 컴포넌트
function StepHeader({ 
  title, 
  subtitle,
  icon: Icon 
}: { 
  title: React.ReactNode; 
  subtitle: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <div className="mb-400 text-center sm:text-left">
      <div className="inline-flex items-center justify-center w-[48px] h-[48px] rounded-full bg-fill-brand-subtle-default mb-300">
        <Icon className="w-[24px] h-[24px] text-text-brand" />
      </div>
      <h2 className="font-designer-24b text-text-strong mb-100 leading-tight">
        {title}
      </h2>
      <p className="font-designer-14r text-text-subtle">
        {subtitle}
      </p>
    </div>
  );
}

// 1. 닉네임 입력 단계
function NicknameStep({ data, updateData, onNext }: any) {
  const [checked, setChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isValidName = /^[가-힣a-zA-Z]{2,10}$/.test(data.name);

  useEffect(() => {
    if (isValidName && checked) {
      const timer = setTimeout(() => {
        onNext();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isValidName, checked, onNext]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateData('image', URL.createObjectURL(e.target.files[0]));
      updateData('file', e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full gap-400">
      <StepHeader 
        icon={Hand}
        title={<>반가워요!<br/>어떤 이름으로 불러드릴까요?</>}
        subtitle="프로필 사진도 설정할 수 있어요"
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-300 -mt-200">
        <SignupImageSelector
          image={data.image}
          setImage={(img) => updateData('image', img)}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
        />

        <div className="w-full max-w-[320px] flex flex-col gap-200">
          <div className="flex flex-col gap-75">
            <BaseInput
              autoFocus
              type="text"
              value={data.name}
              onChange={(e) => updateData('name', e.target.value.trim())}
              placeholder="닉네임을 입력해주세요"
              className="text-center"
              maxLength={10}
              color={isValidName || !data.name ? 'default' : 'error'}
            />
            <p className={cn(
              "font-designer-13r text-center transition-all h-[20px]",
              isValidName || !data.name ? "text-text-subtlest" : "text-text-error"
            )}>
              {(!isValidName && data.name) ? "2~10자 이내의 한글/영문만 가능해요" : "2~10자 이내의 한글/영문"}
            </p>
          </div>

          <div 
            className="flex items-center justify-center gap-100 cursor-pointer p-150 rounded-100 hover:bg-fill-neutral-subtle-hover transition-colors"
            onClick={() => setChecked(!checked)}
          >
            <div className={cn(
              "w-[20px] h-[20px] rounded-50 border flex items-center justify-center transition-all",
              checked ? "bg-fill-brand-default-default border-fill-brand-default-default" : "border-border-default bg-background-default"
            )}>
              {checked && <Check className="w-[14px] h-[14px] text-text-inverse" />}
            </div>
            <span className="font-designer-14m text-text-subtle">
              이용약관 및 개인정보 처리방침 동의
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. 직무 선택 단계
function JobStep({ data, updateData, onNext }: any) {
  const jobGroups = useMemo(() => {
    const groups: Record<string, { label: string; value: string }[]> = {};
    JOB_OPTIONS.forEach((option) => {
      const [groupName, detailName] = option.label.includes(' - ')
        ? option.label.split(' - ')
        : ['기타', option.label];
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push({
        label: detailName || option.label,
        value: option.value,
      });
    });
    return groups;
  }, []);

  const handleSelect = (value: string) => {
    updateData('job', value);
    setTimeout(onNext, 200);
  };

  return (
    <div className="flex flex-col h-full gap-300">
      <StepHeader 
        icon={Briefcase}
        title={<>현재 어떤 일을<br/>하고 계신가요?</>}
        subtitle="딱 맞는 스터디를 추천해드릴게요"
      />

      <div className="flex-1 flex flex-col gap-400 overflow-y-auto -mx-200 px-200 pb-200">
        {Object.entries(jobGroups).map(([groupName, options]) => (
          <div key={groupName} className="flex flex-col gap-150">
            <h3 className="font-designer-13b text-text-subtlest uppercase tracking-wider">
              {groupName}
            </h3>
            <div className="grid grid-cols-2 gap-100">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "p-150 rounded-100 font-designer-14m text-left border transition-all duration-200",
                    "hover:border-border-brand hover:bg-fill-brand-subtle-default hover:-translate-y-[2px]",
                    data.job === option.value 
                      ? "border-border-brand bg-fill-brand-subtle-default text-text-brand shadow-sm" 
                      : "border-border-default bg-background-default text-text-default"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. 경력 선택 단계
function CareerStep({ data, updateData, onNext }: any) {
  const handleSelect = (value: string) => {
    updateData('career', value);
    setTimeout(onNext, 200);
  };

  return (
    <div className="flex flex-col h-full gap-200">
      <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
         <div className="inline-flex items-center gap-100 bg-fill-brand-subtle-default px-150 py-50 rounded-full mb-200">
           <span className="font-designer-13b text-text-brand">거의 다 왔어요!</span>
         </div>
        <StepHeader 
          icon={TrendingUp}
          title={<>경력은 어느 정도<br/>되시나요?</>}
          subtitle="비슷한 단계의 분들과 매칭해드려요"
        />
      </div>

      <div className="flex-1 flex flex-col gap-150 max-w-[400px] mx-auto w-full">
        {CAREER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "w-full p-200 rounded-100 text-left font-designer-16m border flex items-center justify-between group transition-all duration-200",
              data.career === option.value
                ? "border-border-brand bg-fill-brand-subtle-default text-text-brand shadow-md scale-[1.02]"
                : "border-border-default bg-background-default text-text-default hover:border-border-brand hover:bg-fill-brand-subtle-default hover:shadow-sm hover:scale-[1.01]"
            )}
          >
            <span>{option.label}</span>
            <ArrowLeft className={cn(
              "w-[16px] h-[16px] rotate-180 transition-all duration-300",
              data.career === option.value 
                ? "opacity-100 text-text-brand translate-x-0" 
                : "opacity-0 group-hover:opacity-50 -translate-x-100 group-hover:translate-x-0"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}

// 4. 관심 스터디 선택 단계
function InterestsStep({ data, updateData, onNext }: any) {
  return (
    <div className="flex flex-col h-full gap-300">
      <StepHeader 
        icon={Rocket}
        title={<>어떤 활동을<br/>하고 싶으세요?</>}
        subtitle="최대 5개까지 선택할 수 있어요"
      />

      <div className="flex-1 flex flex-wrap content-start gap-100 pt-200">
        {STUDY_TYPE_OPTIONS.map((option) => {
          const isSelected = data.studyTypes.includes(option);
          return (
            <button
              key={option}
              onClick={() => {
                const current = data.studyTypes;
                const next = isSelected
                  ? current.filter((t: string) => t !== option)
                  : [...current, option].slice(0, 5);
                updateData('studyTypes', next);
              }}
              className={cn(
                "px-200 py-100 rounded-100 font-designer-14b border transition-all duration-200",
                isSelected
                  ? "bg-fill-neutral-strong-default border-fill-neutral-strong-default text-text-inverse shadow-md scale-105"
                  : "bg-background-default border-border-default text-text-subtle hover:border-border-brand hover:bg-fill-neutral-subtle-hover"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      <Button
        size="large"
        className="w-full"
        onClick={onNext}
        disabled={data.studyTypes.length === 0}
      >
        다음으로
      </Button>
    </div>
  );
}

// 5. 목표 입력 단계
function GoalStep({ data, updateData, onNext, onSkip }: any) {
  return (
    <div className="flex flex-col h-full gap-300">
      <StepHeader 
        icon={Lightbulb}
        title={<>마지막이에요!<br/>이루고 싶은 목표가 있나요?</>}
        subtitle="자유롭게 적어주시면 도움이 돼요"
      />

      <TextAreaInput
        value={data.goal}
        onChange={(e) => updateData('goal', e.target.value)}
        placeholder="예) 사이드 프로젝트를 완성하고 싶어요, 기초를 탄탄히 다지고 싶어요 등"
        className="min-h-[150px] font-designer-16r"
      />

      <div className="flex flex-col gap-100 mt-auto pt-200">
        <Button
          size="large"
          className="w-full"
          onClick={onNext}
          disabled={!data.goal.trim()}
        >
          시작하기
        </Button>
        <button
          onClick={onSkip}
          className="font-designer-14m text-text-subtlest hover:text-text-subtle underline underline-offset-4 py-100 transition-colors"
        >
          지금은 건너뛸게요
        </button>
      </div>
    </div>
  );
}
