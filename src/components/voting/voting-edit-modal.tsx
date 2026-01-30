'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { BalanceGame } from '@/features/study/one-to-one/balance-game/types';
import {
  VotingEditFormSchema,
  VotingEditFormData,
  VotingCreateFormData,
} from '@/types/schemas/zod-schema';

interface VotingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<VotingCreateFormData>) => Promise<void>;
  initialData: BalanceGame;
}

export default function VotingEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: VotingEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // 모달이 열릴 때 배경 스크롤 방지 (스크롤바 2개 문제 해결)
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VotingEditFormData>({
    resolver: zodResolver(VotingEditFormSchema), // 옵션과 마감일은 수정 불가
    defaultValues: {
      title: initialData.title,
      description: initialData.description || '',
      tags: initialData.tags || [],
    },
  });

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      setValue('title', initialData.title);
      setValue('description', initialData.description || '');
      setValue('tags', initialData.tags || []);
    }
  }, [isOpen, initialData, setValue]);

  const watchedTags = watch('tags') || [];
  const watchedTitle = watch('title') || '';
  const watchedDescription = watch('description') || '';

  // 태그 추가
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (
      trimmedTag &&
      watchedTags.length < 3 &&
      !watchedTags.includes(trimmedTag)
    ) {
      setValue('tags', [...watchedTags, trimmedTag]);
      setTagInput('');
    }
  };

  // 태그 삭제
  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((tag) => tag !== tagToRemove),
    );
  };

  // 폼 제출
  const handleFormSubmit = async (data: VotingEditFormData) => {
    setIsSubmitting(true);
    try {
      // Only pass editable fields
      await onSubmit({
        title: data.title,
        description: data.description,
        tags: data.tags || [], // tags가 undefined일 경우 빈 배열로 전달
      });
      onClose();
    } catch (error) {
      console.error('투표 수정 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-400 backdrop-blur-sm">
      <div className="rounded-300 bg-background-default relative max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-xl">
        {/* 헤더 */}
        <div className="border-border-subtle bg-background-default sticky top-0 z-10 flex items-center justify-between border-b px-600 py-400">
          <h2 className="font-bold-h4 text-text-strong">투표 주제 수정하기</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-100 text-text-subtle hover:bg-fill-neutral-subtle-default hover:text-text-strong p-100 transition-colors disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-600">
          {/* 제목 */}
          <div className="mb-500">
            <label className="font-designer-14b text-text-strong mb-200 block">
              제목 <span className="text-text-critical">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="투표 주제를 입력해주세요"
              className={cn(
                'rounded-100 font-designer-14r w-full border px-300 py-250 transition-colors outline-none',
                errors.title
                  ? 'border-border-critical bg-background-critical'
                  : 'border-border-subtle bg-background-default focus:border-border-brand',
              )}
            />
            <div className="mt-100 flex items-center justify-between">
              {errors.title && (
                <p className="font-designer-12r text-text-critical text-red-600">
                  {errors.title.message}
                </p>
              )}
              <span className="font-designer-12r text-text-subtlest ml-auto">
                {watchedTitle.length}/200
              </span>
            </div>
          </div>

          {/* 설명 */}
          <div className="mb-500">
            <label className="font-designer-14b text-text-strong mb-200 block">
              설명 (선택)
            </label>
            <textarea
              {...register('description')}
              placeholder="주제에 대한 부연 설명을 입력해주세요"
              rows={3}
              className={cn(
                'rounded-100 font-designer-14r w-full resize-none border px-300 py-250 transition-colors outline-none',
                errors.description
                  ? 'border-border-critical bg-background-critical'
                  : 'border-border-subtle bg-background-default focus:border-border-brand',
              )}
            />
            <div className="mt-100 flex items-center justify-between">
              {errors.description && (
                <p className="font-designer-12r text-text-critical">
                  {errors.description.message}
                </p>
              )}
              <span className="font-designer-12r text-text-subtlest ml-auto">
                {watchedDescription.length}/500
              </span>
            </div>
          </div>

          {/* 태그 */}
          <div className="mb-500">
            <label className="font-designer-14b text-text-strong mb-200 block">
              태그 (선택)
              <span className="font-designer-12r text-text-subtle ml-100">
                (최대 3개)
              </span>
            </label>
            <div className="flex gap-200">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="태그 입력 후 Enter"
                disabled={watchedTags.length >= 3}
                className="rounded-100 border-border-subtle bg-background-default font-designer-14r focus:border-border-brand flex-1 border px-300 py-200 transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={watchedTags.length >= 3 || !tagInput.trim()}
                className="rounded-100 bg-fill-brand-default-default font-designer-13b text-text-inverse hover:bg-fill-brand-default-hover px-300 py-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                추가
              </button>
            </div>
            {watchedTags.length > 0 && (
              <div className="mt-200 flex flex-wrap gap-100">
                {watchedTags.map((tag) => (
                  <div
                    key={tag}
                    className="rounded-100 bg-fill-neutral-subtle-default flex items-center gap-50 px-200 py-100"
                  >
                    <span className="font-designer-12r text-text-default">
                      #{tag}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-text-subtle hover:text-text-strong transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 알림 메시지 */}
          <div className="rounded-100 bg-fill-neutral-subtle-default mb-500 p-300 text-center">
            <p className="font-designer-13r text-text-subtle">
              선택지와 마감일은 수정할 수 없습니다.
            </p>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-100 border-border-subtle bg-background-default font-designer-14b text-text-default hover:border-border-brand hover:text-text-brand flex-1 border px-400 py-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-100 bg-fill-brand-default-default font-designer-14b text-text-inverse shadow-1 hover:bg-fill-brand-default-hover hover:shadow-2 flex-1 px-400 py-300 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  수정 중...
                </span>
              ) : (
                '수정 완료'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
