'use client';

import Button from '@/shared/ui/button';
import Checkbox from '@/shared/ui/checkbox';
import { useState } from 'react';

export default function LandingForm() {
  const [checked, setChecked] = useState<string[]>([]);
  const [type, setType] = useState<string>('NONE');
  return (
    <div className="h-[768px] w-[720px] rounded-[24px] p-[48px] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      <form>
        <div className="flex w-full flex-col gap-75">
          <div className="mb-[12px] text-[#444444]">
            연락 받을 이메일 주소를 입력해주세요.
          </div>
          <input
            type="text"
            placeholder="zeroone@email.com"
            className="w-full rounded-[16px] bg-[#F2F2F2] px-[24px] py-[18px] placeholder:text-[#999999]"
          />
          <div className="mt-[32px] mb-[12px] text-[#444444]">
            어느 분야에서 활동하고 계신가요?
          </div>
          <select
            className={`w-full appearance-none rounded-[16px] bg-[#F2F2F2] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgMTBMMTIgMTVMMTcgMTAiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat py-[18px] pr-[50px] pl-[24px] ${
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
          <div className="mt-[32px] mb-[12px] text-[#444444]">
            제로원에서 사용해보고 싶은 기능은 무엇인가요?
            <span className="text-[#FF4C4F]"> *복수선택가능</span>
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
              />
              <label htmlFor="STUDY" className="text-[#767676]">
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
              />
              <label htmlFor="GROUP_STUDY" className="text-[#767676]">
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
              />
              <label htmlFor="OUTSOURCING" className="text-[#767676]">
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
              />
              <label htmlFor="EXPERT_ANSWER" className="text-[#767676]">
                전문가 답변 서비스
              </label>
            </div>
          </div>

          <div className="mt-[32px] mb-[12px] text-[#444444]">
            전문가에게 상담받고 싶은 고민거리가 있으시다면 자유롭게 적어주세요.
          </div>
          <textarea
            placeholder="Ex) 외주 프로젝트에 참여하고 싶은데 제로 베이스라 어디서부터 시작해야할지 잘 모르겠어요."
            className="h-[100px] w-full resize-none rounded-[16px] bg-[#F2F2F2] px-[24px] py-[18px] placeholder:text-[#999999]"
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
            />
            <label htmlFor="AGREE_TERMS_OF_SERVICE" className="text-[#444444]">
              개인정보 보호정책에 동의합니다.
            </label>
          </div>
          <Button
            color="primary"
            className="mt-[60px] w-full rounded-[16px] py-[16px]"
          >
            오픈 알림 신청하기
          </Button>
        </div>
      </form>
    </div>
  );
}
