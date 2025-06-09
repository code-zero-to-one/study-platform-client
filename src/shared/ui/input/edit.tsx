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
    <div className='flex flex-col gap-75'>
      <Textarea
        placeholder={placeholder}
        className='h-[60px] w-full rounded-100 border border-border-default p-150 focus-visible:ring-0 focus-visible:outline-none'
        value={value}
        onChange={handleChange}
      />
      <div className='flex justify-between'>
        <div className='font-designer-14m text-text-subtle'>{guideText}</div>
        <div className='font-designer-14m text-text-subtle'>
          {count}/{maxLength}
        </div>
      </div>
    </div>
  );
}
