import * as React from 'react';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

// Base Textarea component (from shadcn)
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

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
  disabled?: boolean;
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
  disabled = false,
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
          'rounded-100 border-border-default h-[60px] w-full border p-150 focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-background-disabled disabled:text-text-disabled',
          className,
        )}
        value={current}
        onChange={handleChange}
        minLength={minLength}
        maxLength={maxLength}
        disabled={disabled}
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
