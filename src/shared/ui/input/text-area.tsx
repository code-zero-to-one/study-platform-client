import { Textarea } from '@/shared/shadcn/ui/textarea';

interface Props {
  value?: string;
  placeholder?: string;
  guideText?: string;
  maxLength?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hideMeta?: boolean;
}

function TextAreaInput({
  value,
  placeholder,
  guideText,
  maxLength = 30,
  onChange,
  hideMeta = false,
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
        placeholder={placeholder}
        className="rounded-100 border-border-default h-[60px] w-full border p-150 focus-visible:ring-0 focus-visible:outline-none"
        value={current}
        onChange={handleChange}
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
