import { Textarea } from '@/shared/shadcn/ui/textarea';

interface Props {
  value: string;
  placeholder?: string;
  guideText?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
}

export default function TextAreaInputProvider({
  value,
  placeholder,
  guideText,
  maxLength = 30,
  onChange,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > maxLength) {
      return;
    }
    onChange?.(e.target.value);
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
        <div className='font-designer-13r text-text-subtle'>{guideText}</div>
        <div className='font-designer-13r text-text-subtle'>
          {value.length}/{maxLength}
        </div>
      </div>
    </div>
  );
}

export const TextAreaInput = {
  Provider: TextAreaInputProvider,
} as const;