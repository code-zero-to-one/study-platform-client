'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/common/ui/button';
import Checkbox from '@/components/common/ui/checkbox';
import { useToastStore } from '@/stores/use-toast-store';

const CHEVRON_BG_STYLE = {
  backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMTBMMTIgMTVMMTcgMTAiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+")`,
  backgroundSize: '20px',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'calc(100% - 14px) center',
};

const INTEREST_OPTIONS = [
  { id: 'TECH_INTERVIEW', label: '1:1 개발자 멘토링' },
  { id: 'BOOK_STUDY', label: '인사이트/지식 컨텐츠' },
  { id: 'MENTOR_TUTORING', label: '커뮤니티 질문/답변' },
  { id: 'MISSION_CHALLENGE', label: '그룹스터디 개설' },
  { id: 'FUNDED_PROJECT', label: '유료스터디 오픈' },
  { id: 'OUTSOURCING', label: '사이드프로젝트 팀 매칭' },
];

const INPUT_CLASS =
  'h-[48px] w-full rounded-[10px] border border-gray-200 bg-gray-50 px-[16px] font-designer-14m text-text-strong placeholder:text-gray-400 outline-none transition-colors focus:border-rose-400 focus:ring-[2px] focus:ring-rose-100';

const SELECT_CLASS =
  'h-[48px] w-full appearance-none rounded-[10px] border border-gray-200 bg-gray-50 px-[16px] pr-[44px] font-designer-14m outline-none transition-colors focus:border-rose-400 focus:ring-[2px] focus:ring-rose-100';

export default function LandingForm() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const [checked, setChecked] = useState<string[]>([]);
  const [type, setType] = useState<string>('NONE');
  const [experience, setExperience] = useState<string>('NONE');
  const [email, setEmail] = useState<string>('');
  const [consultation, setConsultation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleCheck = (id: string) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!email.trim()) {
        showToast('이메일을 입력해주세요.', 'info');

        return;
      }
      if (type === 'NONE') {
        showToast('어느 분야에서 활동하고 계신가요?', 'info');

        return;
      }
      if (experience === 'NONE') {
        showToast('경력이 얼마나 되시나요?', 'info');

        return;
      }
      if (checked.length === 0) {
        showToast('관심 기능을 하나 이상 선택해주세요.', 'info');

        return;
      }
      if (!checked.includes('AGREE_TERMS_OF_SERVICE')) {
        showToast('개인정보 보호정책에 동의해주세요.', 'info');

        return;
      }

      const response = await fetch('/api/notify-user-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          type,
          experience,
          features: checked.filter((item) => item !== 'AGREE_TERMS_OF_SERVICE'),
          consultation: consultation.trim(),
          agreeTerms: checked.includes('AGREE_TERMS_OF_SERVICE'),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast('신청이 성공적으로 제출되었습니다!', 'success');
        setEmail('');
        setType('NONE');
        setExperience('NONE');
        setChecked([]);
        setConsultation('');
        router.push('/login');
      } else {
        showToast(result.error || '오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
      showToast(
        '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-[20px] border border-gray-200 bg-gray-0 p-[24px] shadow-1 md:p-[36px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
        {/* Email */}
        <div>
          <label className="mb-[8px] block font-designer-14b text-text-default">
            알림 받을 이메일
          </label>
          <input
            type="email"
            placeholder="zeroone@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="mb-[8px] block font-designer-14b text-text-default">
            어느 분야에서 활동하고 계신가요?
          </label>
          <select
            className={`${SELECT_CLASS} ${type === 'NONE' ? 'text-gray-400' : 'text-text-strong'}`}
            style={CHEVRON_BG_STYLE}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="NONE" hidden>
              유형을 선택해주세요
            </option>
            <option value="FRONTEND">프론트엔드 개발자</option>
            <option value="BACKEND">백엔드 개발자</option>
            <option value="PLANNER">서비스 기획자</option>
            <option value="DESIGNER">UI/UX 디자이너</option>
            <option value="MARKETER">마케터</option>
            <option value="OTHER">기타</option>
          </select>
        </div>

        {/* Experience */}
        <div>
          <label className="mb-[8px] block font-designer-14b text-text-default">
            경력이 얼마나 되시나요?
          </label>
          <select
            className={`${SELECT_CLASS} ${experience === 'NONE' ? 'text-gray-400' : 'text-text-strong'}`}
            style={CHEVRON_BG_STYLE}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="NONE" hidden>
              경력을 선택해주세요
            </option>
            <option value="NEWBIE">뉴비</option>
            <option value="JOBSEEKER">취업준비중(0년차)</option>
            <option value="JUNIOR">주니어(1-3년차)</option>
            <option value="MIDDLE">미들(4-6년차)</option>
            <option value="SENIOR">시니어(7년차 이상)</option>
          </select>
        </div>

        {/* Interest Features */}
        <div>
          <label className="mb-[8px] block font-designer-14b text-text-default">
            어떤 알림을 받고 싶으세요?
            <span className="ml-[6px] font-designer-13b text-rose-500">
              복수선택
            </span>
          </label>
          <div className="grid grid-cols-1 gap-[10px] md:grid-cols-2">
            {INTEREST_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center gap-[10px]">
                <Checkbox
                  id={option.id}
                  checked={checked.includes(option.id)}
                  onToggle={() => toggleCheck(option.id)}
                  themeColor="#F63D68"
                />
                <label
                  htmlFor={option.id}
                  className="font-designer-14m text-text-subtle"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation */}
        <div>
          <label className="mb-[8px] block font-designer-14b text-text-default">
            지금 가장 막히는 지점이 있다면 알려주세요
          </label>
          <textarea
            placeholder="Ex) 바이브코딩으로 앱은 만들었는데 배포를 어떻게 하는지 모르겠어요"
            value={consultation}
            onChange={(e) => setConsultation(e.target.value)}
            className="h-[100px] w-full resize-none rounded-[10px] border border-gray-200 bg-gray-50 px-[16px] py-[14px] font-designer-14m text-text-strong placeholder:text-gray-400 outline-none transition-colors focus:border-rose-400 focus:ring-[2px] focus:ring-rose-100"
          />
        </div>

        {/* Terms */}
        <div className="flex items-center gap-[10px]">
          <Checkbox
            id="AGREE_TERMS_OF_SERVICE"
            checked={checked.includes('AGREE_TERMS_OF_SERVICE')}
            onToggle={() => toggleCheck('AGREE_TERMS_OF_SERVICE')}
            themeColor="#F63D68"
          />
          <label
            htmlFor="AGREE_TERMS_OF_SERVICE"
            className="font-designer-14m text-text-subtle"
          >
            개인정보 보호정책에 동의합니다.
          </label>
          <button
            type="button"
            onClick={() =>
              window.open(
                'https://www.notion.so/gaan/13efbb391d7980cea50fc6864d60f4f7?p=29bfbb391d7980fba669f8d4de741021&pm=s',
                '_blank',
              )
            }
            className="font-designer-14m text-rose-500 underline hover:text-rose-600"
          >
            보기
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          color="primary"
          className="mt-[8px] h-[52px] w-full rounded-[12px]"
          disabled={isSubmitting}
        >
          맞춤 스터디 · 멘토 알림 신청
        </Button>
      </form>
    </div>
  );
}
