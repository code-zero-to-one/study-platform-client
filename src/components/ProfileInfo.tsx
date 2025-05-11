'use client';

export default function ProfileInfo() {
  return (
    <div className="flex flex-col items-start gap-[40px] rounded-[8px] border border-[#E0E0E0] p-[20px]">
      {/* 내정보 */}
      <div className="flex w-full justify-between">
        <div className="text-[18px] font-[700]">내정보</div>
        <div className="text-[14px] font-[500] text-[var(--color-text-brand)]">
          편집
        </div>
      </div>

      {/* 세부 설명 */}
      <div className="flex flex-col gap-[32px]">
        {/* 자기소개 */}
        <div className="flex flex-col gap-[12px]">
          <div className="text-[16px] font-[700] text-[var(--color-text-default)]">
            자기소개
          </div>
          <p className="rounded-[6px] bg-[var(--color-background-alternative)] pt-[24px] pr-[16px] pb-[24px] pl-[16px] text-[15px] leading-[23px] font-[400] text-[var(--color-text-subtle)]">
            안녕하세요, 백엔드 개발자로 커리어를 준비 중인 신채호입니다. Java와
            Spring 기반의 웹 애플리케이션을 중심으로 공부하고 있으며, 협업과
            커뮤니케이션을 중요하게 생각합니다. 꾸준히 기록하고, 모르는 건
            질문하며 성장하는 개발자가 되고 싶습니다.
          </p>
        </div>

        {/* 공부 주제 및 계획 */}
        <div className="flex flex-col gap-[12px]">
          <div className="text-[16px] font-[700] text-[var(--color-text-default)]">
            공부 주제 및 계획
          </div>
          <p className="rounded-[6px] bg-[var(--color-background-alternative)] pt-[24px] pr-[16px] pb-[24px] pl-[16px] text-[15px] leading-[23px] font-[400] text-[var(--color-text-subtle)]">
            CS 기본기와 백엔드 심화 내용을 집중적으로 학습하고자 합니다.
            운영체제, 네트워크, 자료구조를 중심으로 주 5일 동안 꾸준히 학습하고
            발표하며, 실무에서도 바로 활용할 수 있도록 깊이 있게 공부할
            예정입니다.
          </p>
        </div>

        {/* 선호하는 스터디 주제 */}
        <div className="flex flex-col gap-[12px]">
          <div className="text-[16px] font-[700] text-[var(--color-text-default)]">
            선호하는 스터디 주제
          </div>
          <p className="rounded-[6px] bg-[var(--color-background-alternative)] pt-[24px] pr-[16px] pb-[24px] pl-[16px] text-[15px] leading-[23px] font-[400] text-[var(--color-text-subtle)]">
            CS Deep Dive
          </p>
        </div>

        {/* 가능 시간대 */}
        <div className="flex flex-col gap-[12px]">
          <div className="text-[16px] font-[700] text-[var(--color-text-default)]">
            가능 시간대
          </div>
          <p className="rounded-[6px] bg-[var(--color-background-alternative)] pt-[24px] pr-[16px] pb-[24px] pl-[16px] text-[15px] leading-[23px] font-[400] text-[var(--color-text-subtle)]">
            평일 점심 (12:00-13:00), 평일 저녁 (18:00-21:00)
          </p>
        </div>

        {/* 기술 스택 */}
        <div className="flex flex-col gap-[12px]">
          <div className="text-[16px] font-[700] text-[var(--color-text-default)]">
            기술 스택
          </div>
          <p className="rounded-[6px] bg-[var(--color-background-alternative)] pt-[24px] pr-[16px] pb-[24px] pl-[16px] text-[15px] leading-[23px] font-[400] text-[var(--color-text-subtle)]">
            Java, Spring Boot, MySQL, Git, Docker
          </p>
        </div>
      </div>
    </div>
  );
}
