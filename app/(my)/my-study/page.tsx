import Image from 'next/image';

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
          <div className="flex flex-1 flex-col gap-[var(--spacing-150)] rounded-[var(--radius-100)] bg-[var(--color-background-alternative)] p-[var(--spacing-250)] text-[var(--color-text-default)]">
            <div className="text-left text-[15px] font-[var(--font-weight-regular)]">
              총 참여
            </div>
            <div className="text-right text-[24px] font-[var(--font-weight-bold)]">
              173
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-[var(--spacing-150)] rounded-[var(--radius-100)] bg-[var(--color-background-alternative)] p-[var(--spacing-250)] text-[var(--color-text-default)]">
            <div className="text-left text-[15px] font-[var(--font-weight-regular)]">
              연속 참여
            </div>
            <div className="text-right text-[24px] font-[var(--font-weight-bold)]">
              173
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-[var(--spacing-150)] rounded-[var(--radius-100)] bg-[var(--color-background-alternative)] p-[var(--spacing-250)] text-[var(--color-text-default)]">
            <div className="text-left text-[15px] font-[var(--font-weight-regular)]">
              완료
            </div>
            <div className="text-right text-[24px] font-[var(--font-weight-bold)]">
              173
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
