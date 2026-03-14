'use client';

import Button from '@/components/common/ui/button';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';

interface MentoringSessionCancelPanelProps {
  title: string;
  description: string;
  textareaLabel: string;
  textareaPlaceholder: string;
  triggerLabel: string;
  confirmLabel: string;
  isOpen: boolean;
  isSubmitting: boolean;
  cancelReason: string;
  onOpen: () => void;
  onClose: () => void;
  onReasonChange: (nextValue: string) => void;
  onConfirm: () => void;
}

export default function MentoringSessionCancelPanel({
  title,
  description,
  textareaLabel,
  textareaPlaceholder,
  triggerLabel,
  confirmLabel,
  isOpen,
  isSubmitting,
  cancelReason,
  onOpen,
  onClose,
  onReasonChange,
  onConfirm,
}: MentoringSessionCancelPanelProps) {
  return (
    <section className="rounded-150 border-border-subtle bg-background-alternative border p-200">
      <div className="flex flex-col gap-75">
        <h2 className="font-designer-16b text-text-default">{title}</h2>
        <p className="leading-relaxed font-designer-13r text-text-subtle">
          {description}
        </p>
      </div>

      {!isOpen ? (
        <div className="mt-150 flex justify-end">
          <Button
            type="button"
            size="medium"
            color="secondary"
            disabled={isSubmitting}
            onClick={onOpen}
          >
            {triggerLabel}
          </Button>
        </div>
      ) : (
        <div className="mt-150">
          <p className="mb-100 font-designer-13m text-text-default">
            {textareaLabel}
          </p>
          <BorderedTextarea
            value={cancelReason}
            onChange={(event) => onReasonChange(event.target.value)}
            className="rounded-150 border-border-subtle mb-150 min-h-[100px] resize-none py-125"
            placeholder={textareaPlaceholder}
          />
          <div className="flex justify-end gap-100">
            <Button
              type="button"
              size="medium"
              color="secondary"
              disabled={isSubmitting}
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="button"
              size="medium"
              color="outlined"
              disabled={isSubmitting}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
