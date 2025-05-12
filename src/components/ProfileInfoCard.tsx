interface Props {
  title: string;
  content: string;
}

export default function ProfileInfoCard({ title, content }: Props) {
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="text-[16px] font-[700] text-[var(--color-text-default)]">
        {title}
      </div>
      <p className="rounded-[6px] bg-[var(--color-background-alternative)] pt-[24px] pr-[16px] pb-[24px] pl-[16px] text-[15px] leading-[23px] font-[400] text-[var(--color-text-subtle)]">
        {content}
      </p>
    </div>
  );
}
