interface Props {
  title: string;
  value: React.ReactNode;
  unit?: string;
}

export default function MyStudyCard({ title, value, unit }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-[var(--spacing-150)] rounded-[var(--radius-100)] bg-[var(--color-background-alternative)] p-[var(--spacing-250)] text-[var(--color-text-default)]">
      <div className="text-left text-[15px] font-[var(--font-weight-regular)]">
        {title}
      </div>
      <div className="flex items-center justify-end gap-[var(--spacing-50)] text-right">
        <span className="text-[24px] font-[var(--font-weight-bold)]">
          {value}
        </span>
        {unit && (
          <span className="text-[16px] font-[var(--font-weight-medium)]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
