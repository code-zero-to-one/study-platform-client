import { Textarea } from '@/shared/shadcn/ui/textarea';
import { useState } from 'react';

interface Props {
  title: string;
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  guideText?: string;
  onChange?: (value: string) => void;
}

export default function ProfileEditTextarea({
  title,
  defaultValue,
  required = false,
  maxLength = 30,
  placeholder,
  guideText,
  onChange,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [count, setCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > maxLength) {
      return;
    }
    setValue(e.target.value);
    onChange?.(e.target.value);
    setCount(e.target.value.length);
  };

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
      <div className="flex max-w-[335px] flex-col gap-[6px]">
        <Textarea
          placeholder={placeholder}
          className="h-[60px] w-full rounded-[8px] border border-[var(--border)] p-[12px] focus-visible:ring-0 focus-visible:outline-none"
          value={value}
          onChange={handleChange}
        />
        <div className="flex justify-between text-[13px] leading-[20px] font-[400] text-[var(--color-text-subtlest)]">
          <div>{guideText}</div>
          <div>
            {count}/{maxLength}
          </div>
        </div>
      </div>
    </div>
  );
}
