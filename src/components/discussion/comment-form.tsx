import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CommentFormSchema, CommentFormData } from '@/types/schemas/zod-schema';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-150">
      <div className="flex gap-150">
        <div className="relative flex-1">
          <textarea
            {...register('content')}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={isSubmitting}
            rows={3}
            className={cn(
              'w-full resize-none rounded-100 border border-border-subtle bg-background-default p-200',
              'font-designer-14r text-text-strong placeholder:text-text-subtlest',
              'outline-none transition-colors focus:border-border-brand focus:ring-2 focus:ring-fill-brand-subtle-default',
              'disabled:cursor-not-allowed disabled:opacity-50',
              errors.content && 'border-red-500 focus:ring-red-200',
            )}
          />
          {errors.content && (
            <p className="mt-50 font-designer-12r text-red-600">{errors.content.message}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex h-[48px] items-center gap-100 rounded-100 bg-fill-brand-default-default px-300 font-designer-13b text-text-inverse',
              'transition-colors hover:bg-fill-brand-default-hover',
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
              className="h-[48px] rounded-100 border border-border-subtle px-300 font-designer-13m text-text-subtle transition-colors hover:border-border-strong hover:text-text-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
