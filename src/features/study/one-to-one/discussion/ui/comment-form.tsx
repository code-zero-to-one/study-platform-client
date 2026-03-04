import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { CommentFormSchema, CommentFormData } from '@/types/schemas/zod-schema';

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
  onCancel?: () => void;
}

export default function CommentForm({
  onSubmit,
  isSubmitting = false,
  placeholder = '댓글을 입력하세요...',
  autoFocus = false,
  initialValue = '',
  onCancel,
}: CommentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: {
      content: initialValue,
    },
  });

  const handleFormSubmit = async (data: CommentFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-150"
    >
      <div className="flex gap-150">
        <div className="relative flex-1">
          <textarea
            {...register('content')}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={isSubmitting}
            rows={3}
            className={cn(
              'rounded-100 border-border-subtle bg-background-default w-full resize-none border p-200',
              'font-designer-14r text-text-strong placeholder:text-text-subtlest',
              'focus:border-border-brand focus:ring-fill-brand-subtle-default transition-colors outline-none focus:ring-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              errors.content && 'border-red-500 focus:ring-red-200',
            )}
          />
          {errors.content && (
            <p className="font-designer-12r mt-50 text-red-600">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'rounded-100 bg-fill-brand-default-default font-designer-13b text-text-inverse flex h-[48px] items-center gap-100 px-300',
              'hover:bg-fill-brand-default-hover transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>등록</span>
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-100 border-border-subtle font-designer-13m text-text-subtle hover:border-border-strong hover:text-text-strong h-[48px] border px-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
