'use client';

import ProfileInfoCard from './ProfileInfoCard';
import ProfileInfoEditModal from './ProfileInfoEditModal';

export default function ProfileInfo() {
  return (
    <div className="flex flex-col items-start gap-[40px] border-t-[1px] border-[var(--color-border-subtle)] pt-[16px]">
      {/* 내정보 */}
      <div className="flex w-full items-center gap-[12px]">
        <div className="text-[18px] font-[700]">내정보</div>
        <ProfileInfoEditModal onSubmit={() => {}} />
      </div>

      {/* 세부 설명 */}
      <div className="flex flex-col gap-[32px]">
        <ProfileInfoCard
          title="자기소개"
          content=" 안녕하세요, 백엔드 개발자로 커리어를 준비 중인 신채호입니다. Java와
            Spring 기반의 웹 애플리케이션을 중심으로 공부하고 있으며, 협업과
            커뮤니케이션을 중요하게 생각합니다. 꾸준히 기록하고, 모르는 건
            질문하며 성장하는 개발자가 되고 싶습니다."
        />

        <ProfileInfoCard
          title="공부 주제 및 계획"
          content="CS 기본기와 백엔드 심화 내용을 집중적으로 학습하고자 합니다.
            운영체제, 네트워크, 자료구조를 중심으로 주 5일 동안 꾸준히 학습하고
            발표하며, 실무에서도 바로 활용할 수 있도록 깊이 있게 공부할
            예정입니다."
        />

        <ProfileInfoCard title="선호하는 스터디 주제" content="CS Deep Dive" />

        <ProfileInfoCard
          title="가능 시간대"
          content="평일 점심 (12:00-13:00), 평일 저녁 (18:00-21:00)"
        />

        <ProfileInfoCard
          title="기술 스택"
          content="Java, Spring Boot, MySQL, Git, Docker"
        />
      </div>
    </div>
  );
}
