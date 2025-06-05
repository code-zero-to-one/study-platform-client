import { useState } from 'react';
import { Textarea } from '@/shared/shadcn/ui/textarea';

interface Props {
  defaultValue?: string;
  placeholder?: string;
  guideText?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
}

export default function ProfileInfoEditInput({
  defaultValue,
  placeholder,
  guideText,
  maxLength = 30,
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
    <div className="flex flex-col gap-[6px]">
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
  );
}
