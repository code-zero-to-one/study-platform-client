'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VotingCreateFormSchema, VotingCreateFormData } from '@/types/schemas/zod-schema';
import { X, Plus, Trash2, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface VotingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VotingCreateFormData) => Promise<void>;
}

export default function VotingCreateModal({ isOpen, onClose, onSubmit }: VotingCreateModalProps) {
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
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<VotingCreateFormData>({
    resolver: zodResolver(VotingCreateFormSchema),
    defaultValues: {
      title: '',
      description: '',
      options: [{ label: '' }, { label: '' }],
      tags: [],
      endsAt: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const watchedTags = watch('tags') || [];
  const watchedTitle = watch('title') || '';
  const watchedDescription = watch('description') || '';
  const watchedEndsAt = watch('endsAt') || '';

  // 날짜만 선택하고 시간은 23:59로 고정하는 핸들러
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      // 선택한 날짜의 23:59로 설정
      const dateTimeString = `${selectedDate}T23:59`;
      setValue('endsAt', dateTimeString);
    } else {
      setValue('endsAt', '');
    }
  };

  // 날짜만 추출 (표시용)
  const selectedDateOnly = watchedEndsAt ? watchedEndsAt.split('T')[0] : '';

  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 태그 추가
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && watchedTags.length < 3 && !watchedTags.includes(trimmedTag)) {
      setValue('tags', [...watchedTags, trimmedTag]);
      setTagInput('');
    }
  };

  // 태그 삭제
  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // 폼 제출
  const handleFormSubmit = async (data: VotingCreateFormData) => {
    setIsSubmitting(true);
    try {
      // endsAt이 빈 문자열이면 undefined로 변환
      const submitData = {
        ...data,
        endsAt: data.endsAt && data.endsAt.trim() !== '' ? data.endsAt : undefined,
      };
      await onSubmit(submitData);
      reset();
      onClose();
    } catch (error) {
      console.error('투표 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setTagInput('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-400">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-300 bg-background-default shadow-xl">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-background-default px-600 py-400">
          <h2 className="font-bold-h4 text-text-strong">새 투표 주제 만들기</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-100 p-100 text-text-subtle transition-colors hover:bg-fill-neutral-subtle-default hover:text-text-strong disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-600">
          {/* 제목 */}
          <div className="mb-500">
            <label className="mb-200 block font-designer-14b text-text-strong">
              제목 <span className="text-text-critical">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="투표 주제를 입력해주세요 (예: 내가 자주 쓰는 생성형 AI는?)"
              className={cn(
                'w-full rounded-100 border px-300 py-250 font-designer-14r outline-none transition-colors',
                errors.title
                  ? 'border-border-critical bg-background-critical'
                  : 'border-border-subtle bg-background-default focus:border-border-brand'
              )}
            />
            <div className="mt-100 flex items-center justify-between">
              {errors.title && (
                <p className="font-designer-12r text-text-critical text-red-600">{errors.title.message}</p>
              )}
              <span className="ml-auto font-designer-12r text-text-subtlest">
                {watchedTitle.length}/200
              </span>
            </div>
          </div>

          {/* 설명 */}
          <div className="mb-500">
            <label className="mb-200 block font-designer-14b text-text-strong">
              설명 (선택)
            </label>
            <textarea
              {...register('description')}
              placeholder="주제에 대한 부연 설명을 입력해주세요"
              rows={3}
              className={cn(
                'w-full resize-none rounded-100 border px-300 py-250 font-designer-14r outline-none transition-colors',
                errors.description
                  ? 'border-border-critical bg-background-critical'
                  : 'border-border-subtle bg-background-default focus:border-border-brand'
              )}
            />
            <div className="mt-100 flex items-center justify-between">
              {errors.description && (
                <p className="font-designer-12r text-text-critical">{errors.description.message}</p>
              )}
              <span className="ml-auto font-designer-12r text-text-subtlest">
                {watchedDescription.length}/500
              </span>
            </div>
          </div>

          {/* 선택지 */}
          <div className="mb-500">
            <label className="mb-200 block font-designer-14b text-text-strong">
              선택지 <span className="text-text-critical">*</span>
              <span className="ml-100 font-designer-12r text-text-subtle">(최소 2개, 최대 5개)</span>
            </label>
            <div className="flex flex-col gap-200">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-200">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fill-brand-subtle-default font-designer-13b text-text-brand">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      {...register(`options.${index}.label`)}
                      type="text"
                      placeholder={`선택지 ${index + 1}`}
                      className={cn(
                        'w-full rounded-100 border px-300 py-200 font-designer-14r outline-none transition-colors',
                        errors.options?.[index]?.label
                          ? 'border-border-critical bg-background-critical'
                          : 'border-border-subtle bg-background-default focus:border-border-brand'
                      )}
                    />
                    {errors.options?.[index]?.label && (
                      <p className="mt-50 font-designer-12r text-text-critical">
                        {errors.options[index]?.label?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 2 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-100 p-150 text-text-subtle transition-colors hover:bg-fill-critical-subtle-default hover:text-text-critical"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.options && (
              <p className="mt-200 font-designer-12r text-text-critical">
                {errors.options.message || errors.options.root?.message}
              </p>
            )}
            {fields.length < 5 && (
              <button
                type="button"
                onClick={() => append({ label: '' })}
                className="mt-200 flex items-center gap-100 rounded-100 border border-dashed border-border-brand px-300 py-200 font-designer-13b text-text-brand transition-colors hover:bg-fill-brand-subtle-default"
              >
                <Plus className="h-4 w-4" />
                선택지 추가
              </button>
            )}
          </div>

          {/* 태그 */}
          <div className="mb-500">
            <label className="mb-200 block font-designer-14b text-text-strong">
              태그 (선택)
              <span className="ml-100 font-designer-12r text-text-subtle">(최대 3개)</span>
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
                className="flex-1 rounded-100 border border-border-subtle bg-background-default px-300 py-200 font-designer-14r outline-none transition-colors focus:border-border-brand disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={watchedTags.length >= 3 || !tagInput.trim()}
                className="rounded-100 bg-fill-brand-default-default px-300 py-200 font-designer-13b text-text-inverse transition-colors hover:bg-fill-brand-default-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                추가
              </button>
            </div>
            {watchedTags.length > 0 && (
              <div className="mt-200 flex flex-wrap gap-100">
                {watchedTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-50 rounded-100 bg-fill-neutral-subtle-default px-200 py-100"
                  >
                    <span className="font-designer-12r text-text-default">#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-text-subtle transition-colors hover:text-text-strong"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 마감 시간 */}
          <div className="mb-500">
            <label className="mb-200 block font-designer-14b text-text-strong">
              투표 마감 시간 (선택)
            </label>
            <input
              type="date"
              value={selectedDateOnly}
              onChange={handleDateChange}
              min={getTodayDateString()}
              className="w-full rounded-100 border border-border-subtle bg-background-default px-300 py-200 font-designer-14r outline-none transition-colors focus:border-border-brand"
            />
            {selectedDateOnly && (
              <p className="mt-100 font-designer-12r text-text-subtle">
                선택한 날짜의 23시 59분에 마감됩니다
              </p>
            )}
            {!selectedDateOnly && (
              <p className="mt-100 font-designer-12r text-text-subtlest">
                미입력 시 7일 후 자동 마감됩니다
              </p>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 rounded-100 border border-border-subtle bg-background-default px-400 py-300 font-designer-14b text-text-default transition-colors hover:border-border-brand hover:text-text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-100 bg-fill-brand-default-default px-400 py-300 font-designer-14b text-text-inverse shadow-1 transition-all hover:bg-fill-brand-default-hover hover:shadow-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </span>
              ) : (
                '주제 만들기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
