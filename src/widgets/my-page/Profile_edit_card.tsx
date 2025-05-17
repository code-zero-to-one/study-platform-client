import { Input } from '@/shared/shadcn/ui/input';

interface Props {
  title: string;
  description: string;
  required?: boolean;
}

export default function ProfileEditCard({
  title,
  description,
  required = false,
}: Props) {
  return (
    <div className="flex">
      <div className="flex w-[112px] gap-[8px] pt-[8px]">
        <div className="text-[14px] leading-[22px] font-[700]">{title}</div>
        {required && (
          <div className="text-[12px] leading-[18px] font-[500] text-[var(--color-text-error)]">
            필수
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[6px]">
        <Input
          placeholder="입력하세요."
          className="w-full rounded-[8px] border border-[var(--border)] pt-[3px] pr-[8px] pb-[3px] pl-[8px] focus-visible:ring-0 focus-visible:outline-none"
        />
        <div className="text-[13px] leading-[20px] font-[400] text-[var(--color-text-subtlest)]">
          {description}
        </div>
      </div>
    </div>
  );
}
