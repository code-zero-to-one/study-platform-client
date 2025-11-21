import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { Textarea } from '@/components/ui/(shadcn)/ui/textarea';

interface Props {
  id?: string;
  value?: string;
  placeholder?: string;
  guideText?: string;
  minLength?: number;
  maxLength?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hideMeta?: boolean;
  className?: string;
}

function TextAreaInput({
  id,
  value,
  placeholder,
  guideText,
  minLength = 0,
  maxLength = 30,
  onChange,
  hideMeta = false,
  className,
}: Props) {
  const current = value ?? '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > maxLength) {
      e.target.value = e.target.value.slice(0, maxLength);
    }
    onChange?.(e);
  };

  return (
    <div className="flex flex-col gap-75">
      <Textarea
        id={id}
        placeholder={placeholder}
        className={cn(
          'rounded-100 border-border-default h-[60px] w-full border p-150 focus-visible:ring-0 focus-visible:outline-none',
          className,
        )}
        value={current}
        onChange={handleChange}
        minLength={minLength}
        maxLength={maxLength}
      />
      {!hideMeta && (
        <div className="font-designer-13r text-text-subtlest flex justify-between">
          <div>{guideText}</div>
          <div>
            {current.length}/{maxLength}
          </div>
        </div>
      )}
    </div>
  );
}

export default TextAreaInput;
