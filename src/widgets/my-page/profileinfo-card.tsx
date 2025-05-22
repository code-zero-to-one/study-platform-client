interface Props {
  title: string;
  content: string;
}

export default function ProfileInfoCard({ title, content }: Props) {
  return (
    <div className="flex gap-[var(--spacing-500)] rounded-[var(--radius-75)] bg-[var(--color-background-alternative)] p-[var(--spacing-200)]">
      <div className="shrink-0 text-[16px] font-[700] text-[var(--color-text-default)]">
        {title}
      </div>
      <p className="flex-1 text-[15px] leading-[23px] font-[400] text-[var(--color-text-subtle)]">
        {content}
      </p>
    </div>
  );
}
