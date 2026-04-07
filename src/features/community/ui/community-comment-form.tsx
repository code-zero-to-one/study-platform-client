'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';

interface CommunityCommentFormProps {
  authorImage: string;
  placeholder: string;
  submitLabel: string;
  value: string;
  onChange: (nextValue: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  isCompact?: boolean;
}

export default function CommunityCommentForm({
  authorImage,
  placeholder,
  submitLabel,
  value,
  onChange,
  onSubmit,
  onCancel,
  autoFocus = false,
  disabled = false,
  isCompact = false,
}: CommunityCommentFormProps) {
  const [isExpanded, setIsExpanded] = useState(autoFocus || isCompact);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmitDisabled = disabled || value.trim().length === 0;
  const shouldShowActions = isCompact || isExpanded || value.trim().length > 0;

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  const handleCancel = () => {
    onCancel?.();
    setIsExpanded(false);
  };

  return (
    <div
      className={cn(
        'border-b border-border-default pb-100 focus-within:border-border-brand',
        disabled && 'border-border-disabled',
      )}
    >
      <div className={cn('flex items-start gap-150', isCompact && 'gap-100')}>
        <Avatar image={authorImage} alt="댓글 작성자 프로필" size={36} />

        <div className="min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            placeholder={placeholder}
            rows={isCompact ? 2 : 1}
            autoFocus={autoFocus}
            disabled={disabled}
            onChange={(event) => {
              onChange(event.target.value);
              adjustTextareaHeight();
            }}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => {
              if (!isCompact && value.trim().length === 0) {
                setIsExpanded(false);
              }
            }}
            className={cn(
              'w-full resize-none overflow-hidden bg-transparent py-100 font-designer-15r leading-250 text-text-default placeholder:text-text-subtlest focus:outline-none',
              disabled && 'cursor-not-allowed text-text-disabled',
            )}
          />

          {shouldShowActions ? (
            <div className="mt-150 flex flex-wrap items-center justify-end gap-100">
              {onCancel ? (
                <Button color="secondary" size="small" onClick={handleCancel}>
                  취소
                </Button>
              ) : null}
              <Button
                color="primary"
                size="small"
                disabled={isSubmitDisabled}
                onClick={onSubmit}
              >
                {submitLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
