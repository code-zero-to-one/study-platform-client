interface Props {
  title: string;
  children: React.ReactNode;
  isRequired?: boolean;
}

export default function ProfileInfoEditCard({
  title,
  children,
  isRequired = false,
}: Props) {
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center gap-[6px] text-[14px] leading-[22px] font-[700] text-[var(--color-text-default)]">
        <div>{title}</div>
        {isRequired && (
          <div className="text-[13px] leading-[20px] font-[500] text-[var(--color-text-error)]">
            필수
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[6px]">{children}</div>
    </div>
  );
}
