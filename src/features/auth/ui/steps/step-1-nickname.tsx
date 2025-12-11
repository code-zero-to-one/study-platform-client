// 1. 닉네임 입력 단계
import { useState, useRef, useEffect } from 'react';
import { StepHeader } from './step-header';
import { Hand, Check } from 'lucide-react';
import { cn } from '@/shared/shadcn/lib/utils';
import { BaseInput } from '@/shared/ui/input';
import SignupImageSelector from '../sign-up-image-selector';

export function NicknameStep({ data, updateData, onNext }: any) {
    const [checked, setChecked] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isValidName = /^[가-힣a-zA-Z]{2,10}$/.test(data.nickname);
  
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
                value={data.nickname}
                onChange={(e) => updateData('nickname', e.target.value)}
                placeholder="닉네임을 입력해주세요"
                className="text-center"
                maxLength={10}
                color={isValidName || !data.nickname ? 'default' : 'error'}
              />
              <p className={cn(
                "font-designer-13r text-center transition-all h-[20px]",
                isValidName || !data.nickname ? "text-text-subtlest" : "text-text-error"
              )}>
                {(!isValidName && data.nickname) ? "2~10자 이내의 한글/영문만 가능해요" : "2~10자 이내의 한글/영문"}
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
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    window.open('https://www.notion.so/gaan/29bfbb391d7980fba669f8d4de741021', '_blank');
                }}
                className="font-designer-14m text-text-subtlest hover:text-text-subtle underline underline-offset-4 py-100 transition-colors"
              >
                보기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }