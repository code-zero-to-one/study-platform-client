'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/button';
import Checkbox from '@/components/ui/checkbox';

export default function LandingForm() {
  const router = useRouter();
  const [checked, setChecked] = useState<string[]>([]);
  const [type, setType] = useState<string>('NONE');
  const [experience, setExperience] = useState<string>('NONE');
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
        alert('어느 분야에서 활동하고 계신가요?');

        return;
      }

      if (experience === 'NONE') {
        alert('경력이 얼마나 되시나요?');

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
          experience,
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
        setExperience('NONE');
        setChecked([]);
        setConsultation('');
        // 로그인 페이지로 이동
        router.push('/login');
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
    <div className="w-[680px] rounded-[24px] p-[48px] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
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
            <option value="DESIGNER">UI/UX 디자이너</option>
            <option value="MARKETER">마케터</option>
            <option value="OTHER">기타</option>
          </select>
          <div className="font-designer-16m mt-[32px] mb-[12px] text-[#444444]">
            경력이 얼마나 되시나요?
          </div>
          <select
            className={`h-[60px] w-full appearance-none rounded-[16px] bg-[#F2F2F2] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMTBMMTIgMTVMMTcgMTAiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat py-[18px] pr-[50px] pl-[24px] ${
              experience === 'NONE' ? 'text-[#999999]' : 'text-[#111111]'
            }`}
            style={{ backgroundPosition: 'calc(100% - 12px) center' }}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="NONE" hidden>
              경력을 선택해주세요.
            </option>
            <option value="NEWBIE">뉴비</option>
            <option value="JOBSEEKER">취업준비중(0년차)</option>
            <option value="JUNIOR">주니어(1-3년차)</option>
            <option value="MIDDLE">미들(4-6년차)</option>
            <option value="SENIOR">시니어(7년차 이상)</option>
          </select>
          <div className="font-designer-16m mt-[32px] mb-[12px] text-[#444444]">
            제로원에서 가장 먼저 선보였으면 하는 기능은 무엇인가요?
            <span className="font-designer-14m text-[#FF4C4F]">
              *복수선택가능
            </span>
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-row gap-[11px]">
              <Checkbox
                id="TECH_INTERVIEW"
                checked={checked.includes('TECH_INTERVIEW')}
                onToggle={() => {
                  setChecked(
                    checked.includes('TECH_INTERVIEW')
                      ? checked.filter((item) => item !== 'TECH_INTERVIEW')
                      : [...checked, 'TECH_INTERVIEW'],
                  );
                }}
                themeColor="#F63D68"
              />
              <label
                htmlFor="TECH_INTERVIEW"
                className="font-designer-16m text-[#767676]"
              >
                1:1 파트너 면접 스터디
              </label>
            </div>
            <div className="flex flex-row gap-[11px]">
              <Checkbox
                id="BOOK_STUDY"
                checked={checked.includes('BOOK_STUDY')}
                onToggle={() => {
                  setChecked(
                    checked.includes('BOOK_STUDY')
                      ? checked.filter((item) => item !== 'BOOK_STUDY')
                      : [...checked, 'BOOK_STUDY'],
                  );
                }}
                themeColor="#F63D68"
              />
              <label
                htmlFor="BOOK_STUDY"
                className="font-designer-16m text-[#767676]"
              >
                책/인강 스터디
              </label>
            </div>
            <div className="flex flex-row gap-[11px]">
              <Checkbox
                id="MENTOR_TUTORING"
                checked={checked.includes('MENTOR_TUTORING')}
                onToggle={() => {
                  setChecked(
                    checked.includes('MENTOR_TUTORING')
                      ? checked.filter((item) => item !== 'MENTOR_TUTORING')
                      : [...checked, 'MENTOR_TUTORING'],
                  );
                }}
                themeColor="#F63D68"
              />
              <label
                htmlFor="MENTOR_TUTORING"
                className="font-designer-16m text-[#767676]"
              >
                멘토 주도 1:1/그룹 과외형 스터디
              </label>
            </div>
            <div className="flex flex-row gap-[11px]">
              <Checkbox
                id="MISSION_CHALLENGE"
                checked={checked.includes('MISSION_CHALLENGE')}
                onToggle={() => {
                  setChecked(
                    checked.includes('MISSION_CHALLENGE')
                      ? checked.filter((item) => item !== 'MISSION_CHALLENGE')
                      : [...checked, 'MISSION_CHALLENGE'],
                  );
                }}
                themeColor="#F63D68"
              />
              <label
                htmlFor="MISSION_CHALLENGE"
                className="font-designer-16m text-[#767676]"
              >
                미션인증 챌린지 스터디
              </label>
            </div>
            <div className="flex flex-row gap-[11px]">
              <Checkbox
                id="FUNDED_PROJECT"
                checked={checked.includes('FUNDED_PROJECT')}
                onToggle={() => {
                  setChecked(
                    checked.includes('FUNDED_PROJECT')
                      ? checked.filter((item) => item !== 'FUNDED_PROJECT')
                      : [...checked, 'FUNDED_PROJECT'],
                  );
                }}
                themeColor="#F63D68"
              />
              <label
                htmlFor="FUNDED_PROJECT"
                className="font-designer-16m text-[#767676]"
              >
                펀딩받는 실전프로젝트 스터디
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
                SI 외주 프로젝트
              </label>
            </div>
          </div>

          <div className="font-designer-16m mt-[32px] mb-[12px] text-[#444444]">
            요즘 계속 생각나는 고민(질문)이 있으시다면 자유롭게 적어주세요.
            진심을 다해 돕겠습니다.
          </div>
          <textarea
            placeholder="Ex) 3년차 프론트엔드 개발자고 외주를 하고 싶은데 어디서부터 시작해야할지 잘 모르겠어요. 그럴 실력이 되는지도 모르겠고... 팀을 찾고 같이 하면 좋을 것 같아요"
            value={consultation}
            onChange={(e) => setConsultation(e.target.value)}
            className="placeholder:font-designer-16m h-[120px] w-full resize-none rounded-[16px] bg-[#F2F2F2] px-[24px] py-[18px] placeholder:text-[#999999]"
          />
          <div className="mt-[24px] flex flex-row items-center gap-[11px]">
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

            <button
              type="button"
              onClick={() =>
                window.open(
                  'https://www.notion.so/gaan/13efbb391d7980cea50fc6864d60f4f7?p=29bfbb391d7980fba669f8d4de741021&pm=s',
                  '_blank',
                )
              }
              className="font-designer-14m text-[#F63D68] underline hover:text-[#E5353A]"
            >
              보기
            </button>
          </div>

          <Button
            type="submit"
            color="primary"
            className="text-font-designer-18m mt-[60px] h-[60px] w-full rounded-[16px] py-[16px]"
            disabled={isSubmitting}
          >
            내 관심분야 스터디 오픈 알림 신청하기
          </Button>
        </div>
      </form>
    </div>
  );
}
