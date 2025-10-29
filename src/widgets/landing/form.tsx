'use client';

import { useState } from 'react';
import Button from '@/shared/ui/button';
import Checkbox from '@/shared/ui/checkbox';

export default function LandingForm() {
  const [checked, setChecked] = useState<string[]>([]);
  const [type, setType] = useState<string>('NONE');
  const [email, setEmail] = useState<string>('');
  const [consultation, setConsultation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 유효성 검사
      if (!email.trim()) {
        alert('이메일을 입력해주세요.');

        return;
      }

      if (type === 'NONE') {
        alert('직무 유형을 선택해주세요.');

        return;
      }

      if (checked.length === 0) {
        alert('관심 기능을 하나 이상 선택해주세요.');

        return;
      }

      if (!checked.includes('AGREE_TERMS_OF_SERVICE')) {
        alert('개인정보 보호정책에 동의해주세요.');

        return;
      }

      // API 호출
      const response = await fetch('/api/notify-user-by-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          type,
          features: checked.filter((item) => item !== 'AGREE_TERMS_OF_SERVICE'),
          consultation: consultation.trim(),
          agreeTerms: checked.includes('AGREE_TERMS_OF_SERVICE'),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('신청이 성공적으로 제출되었습니다!');
        // 폼 초기화
        setEmail('');
        setType('NONE');
        setChecked([]);
        setConsultation('');
      } else {
        alert(result.error || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
      alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[768px] w-[720px] rounded-[24px] p-[48px] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      <form onSubmit={handleSubmit}>
        <div className="flex w-full flex-col">
          <div className="font-designer-16m mb-[12px] text-[#444444]">
            연락 받을 이메일 주소를 입력해주세요.
          </div>
          <input
            type="email"
            placeholder="zeroone@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="placeholder:font-designer-16m h-[60px] w-full rounded-[16px] bg-[#F2F2F2] px-[24px] py-[18px] placeholder:text-[#999999]"
            required
          />
          <div className="font-designer-16m mt-[32px] mb-[12px] text-[#444444]">
            어느 분야에서 활동하고 계신가요?
          </div>
          <select
            className={`h-[60px] w-full appearance-none rounded-[16px] bg-[#F2F2F2] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMTBMMTIgMTVMMTcgMTAiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat py-[18px] pr-[50px] pl-[24px] ${
              type === 'NONE' ? 'text-[#999999]' : 'text-[#111111]'
            }`}
            style={{ backgroundPosition: 'calc(100% - 12px) center' }}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="NONE" hidden>
              유형을 선택해주세요.
            </option>
            <option value="FRONTEND">프론트엔드 개발자</option>
            <option value="BACKEND">백엔드 개발자</option>
            <option value="PLANNER">서비스 기획자</option>
            <option value="DESIGNER">프로덕트 디자이너</option>
            <option value="UX_DESIGNER">UX 디자이너</option>
          </select>
          <div className="font-designer-16m mt-[32px] mb-[12px] text-[#444444]">
            제로원에서 사용해보고 싶은 기능은 무엇인가요?
            <span className="font-designer-14m text-[#FF4C4F]">
              *복수선택가능
            </span>
          </div>

          <div className="flex flex-row gap-[16px]">
            <div className="flex flex-row gap-[11px]">
              <Checkbox
                id="STUDY"
                checked={checked.includes('STUDY')}
                onToggle={() => {
                  setChecked(
                    checked.includes('STUDY')
                      ? checked.filter((item) => item !== 'STUDY')
                      : [...checked, 'STUDY'],
                  );
                }}
                themeColor="#F63D68"
              />
              <label
                htmlFor="STUDY"
                className="font-designer-16m text-[#767676]"
              >
                1:1 개인 스터디
              </label>
            </div>
            <div className="flex flex-row gap-[11px]">
              <Checkbox
                id="GROUP_STUDY"
                checked={checked.includes('GROUP_STUDY')}
                onToggle={() => {
                  setChecked(
                    checked.includes('GROUP_STUDY')
                      ? checked.filter((item) => item !== 'GROUP_STUDY')
                      : [...checked, 'GROUP_STUDY'],
                  );
                }}
                themeColor="#F63D68"
              />
              <label
                htmlFor="GROUP_STUDY"
                className="font-designer-16m text-[#767676]"
              >
                단체 스터디 그룹
              </label>
            </div>
            <div className="flex flex-row gap-[11px]">
              <Checkbox
                id="OUTSOURCING"
                checked={checked.includes('OUTSOURCING')}
                onToggle={() => {
                  setChecked(
                    checked.includes('OUTSOURCING')
                      ? checked.filter((item) => item !== 'OUTSOURCING')
                      : [...checked, 'OUTSOURCING'],
                  );
                }}
                themeColor="#F63D68"
              />
              <label
                htmlFor="OUTSOURCING"
                className="font-designer-16m text-[#767676]"
              >
                외주 프로젝트
              </label>
            </div>
            <div className="flex flex-row gap-[11px]">
              <Checkbox
                id="EXPERT_ANSWER"
                checked={checked.includes('EXPERT_ANSWER')}
                onToggle={() => {
                  setChecked(
                    checked.includes('EXPERT_ANSWER')
                      ? checked.filter((item) => item !== 'EXPERT_ANSWER')
                      : [...checked, 'EXPERT_ANSWER'],
                  );
                }}
                themeColor="#F63D68"
              />
              <label
                htmlFor="EXPERT_ANSWER"
                className="font-designer-16m text-[#767676]"
              >
                전문가 답변 서비스
              </label>
            </div>
          </div>

          <div className="font-designer-16m mt-[32px] mb-[12px] text-[#444444]">
            전문가에게 상담받고 싶은 고민거리가 있으시다면 자유롭게 적어주세요.
          </div>
          <textarea
            placeholder="Ex) 외주 프로젝트에 참여하고 싶은데 제로 베이스라 어디서부터 시작해야할지 잘 모르겠어요."
            value={consultation}
            onChange={(e) => setConsultation(e.target.value)}
            className="placeholder:font-designer-16m h-[120px] w-full resize-none rounded-[16px] bg-[#F2F2F2] px-[24px] py-[18px] placeholder:text-[#999999]"
          />
          <div className="mt-[24px] flex flex-row gap-[11px]">
            <Checkbox
              id="AGREE_TERMS_OF_SERVICE"
              checked={checked.includes('AGREE_TERMS_OF_SERVICE')}
              onToggle={() => {
                setChecked(
                  checked.includes('AGREE_TERMS_OF_SERVICE')
                    ? checked.filter(
                        (item) => item !== 'AGREE_TERMS_OF_SERVICE',
                      )
                    : [...checked, 'AGREE_TERMS_OF_SERVICE'],
                );
              }}
              themeColor="#F63D68"
            />

            <label
              htmlFor="AGREE_TERMS_OF_SERVICE"
              className="font-designer-14m text-[#444444]"
            >
              개인정보 보호정책에 동의합니다.
            </label>
          </div>

          <Button
            type="submit"
            color="primary"
            className="text-font-designer-18m mt-[60px] h-[60px] w-full rounded-[16px] py-[16px]"
            disabled={isSubmitting}
          >
            오픈 알림 신청하기
          </Button>
        </div>
      </form>
    </div>
  );
}
