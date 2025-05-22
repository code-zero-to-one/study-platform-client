import Image from 'next/image';
import MyStudyCard from '@/widgets/my-study/my-study-card';

export default function MyStudy() {
  return (
    <div className="flex flex-col gap-[32px]">
      <div className="flex flex-col gap-[16px]">
        <div className="flex items-center gap-[var(--spacing-75)]">
          <Image src="icons/file_icon.svg" alt="file" width={40} height={40} />
          <div className="text-[20px] leading-9 font-[var(--font-weight-bold)]">
            내 활동
          </div>
        </div>

        <div className="flex gap-[var(--spacing-200)]">
          <MyStudyCard title="총 참여" value="173" />
          <MyStudyCard title="연속 참여" value="8" unit="주" />
          <MyStudyCard title="완료" value="23" unit="회" />
        </div>

        <div className="flex gap-[var(--spacing-200)]">
          <MyStudyCard title="최대 연속 참여" value="8" unit="주" />
          <MyStudyCard title="실패" value="23" unit="회" />
        </div>
      </div>

      <div className="flex flex-col gap-[16px]">
        <div className="flex items-center gap-[var(--spacing-75)]">
          <Image src="icons/graph_icon.svg" alt="file" width={32} height={24} />
          <div className="text-[20px] leading-9 font-[var(--font-weight-bold)]">
            성장 지표
          </div>
        </div>

        <div className="flex gap-[var(--spacing-200)]">
          <MyStudyCard title="총 참여" value="173" />
          <MyStudyCard title="등급" value="S" unit="등급" />
          <MyStudyCard title="완료" value="23회" />
        </div>
      </div>
    </div>
  );
}
