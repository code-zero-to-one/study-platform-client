import ChipDropdown, { Option } from '@/shared/ui/chip-dropdown';

interface Props {
  title: string;
  options: Option[];
  defaultValueIds?: number[];
  required?: boolean;
  placeholder?: string;
  onChange?: (value: (string | number)[]) => void;
}

export default function ProfileEditChipDropdown({
  title,
  defaultValueIds,
  required,
  placeholder,
  options,
  onChange,
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
        <ChipDropdown
          placeholder={placeholder}
          defaultValueIds={defaultValueIds}
          options={options}
          onChange={(value) => onChange(value)}
        />
      </div>
    </div>
  );
}
