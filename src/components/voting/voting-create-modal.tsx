'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { Modal } from '@/components/ui/modal';
import {
  VotingCreateFormSchema,
  VotingCreateFormData,
} from '@/types/schemas/zod-schema';

interface VotingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VotingCreateFormData) => Promise<void>;
}

export default function VotingCreateModal({
  isOpen,
  onClose,
  onSubmit,
}: VotingCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

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
  const handleFormSubmit = async (data: VotingCreateFormData) => {
    setIsSubmitting(true);
    try {
      // endsAt이 빈 문자열이면 undefined로 변환
      const submitData = {
        ...data,
        endsAt:
          data.endsAt && data.endsAt.trim() !== '' ? data.endsAt : undefined,
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

  return (
    <Modal.Root
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-subtle flex items-center justify-between border-b">
            <Modal.Title className="font-bold-h4 text-text-strong">
              새 투표 주제 만들기
            </Modal.Title>
            <Modal.Close asChild>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-100 text-text-subtle hover:bg-fill-neutral-subtle-default hover:text-text-strong p-100 transition-colors disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="px-600 py-400">
            <form
              id="create-voting"
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex flex-col"
            >
              {/* 제목 */}
              <div className="mb-500">
                <label className="font-designer-14b text-text-strong mb-200 block">
                  제목 <span className="text-text-critical">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="투표 주제를 입력해주세요 (예: 내가 자주 쓰는 생성형 AI는?)"
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

              {/* 선택지 */}
              <div className="mb-500">
                <label className="font-designer-14b text-text-strong mb-200 block">
                  선택지 <span className="text-text-critical">*</span>
                  <span className="font-designer-12r text-text-subtle ml-100">
                    (최소 2개, 최대 5개)
                  </span>
                </label>
                <div className="flex flex-col gap-200">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-200">
                      <div className="bg-fill-brand-subtle-default font-designer-13b text-text-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <input
                          {...register(`options.${index}.label`)}
                          type="text"
                          placeholder={`선택지 ${index + 1}`}
                          className={cn(
                            'rounded-100 font-designer-14r w-full border px-300 py-200 transition-colors outline-none',
                            errors.options?.[index]?.label
                              ? 'border-border-critical bg-background-critical'
                              : 'border-border-subtle bg-background-default focus:border-border-brand',
                          )}
                        />
                        {errors.options?.[index]?.label && (
                          <p className="font-designer-12r text-text-critical mt-50">
                            {errors.options[index]?.label?.message}
                          </p>
                        )}
                      </div>
                      {fields.length > 2 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="rounded-100 text-text-subtle hover:bg-fill-critical-subtle-default hover:text-text-critical p-150 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.options && (
                  <p className="font-designer-12r text-text-critical mt-200">
                    {errors.options.message || errors.options.root?.message}
                  </p>
                )}
                {fields.length < 5 && (
                  <button
                    type="button"
                    onClick={() => append({ label: '' })}
                    className="rounded-100 border-border-brand font-designer-13b text-text-brand hover:bg-fill-brand-subtle-default mt-200 flex items-center gap-100 border border-dashed px-300 py-200 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    선택지 추가
                  </button>
                )}
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

              {/* 마감 시간 */}
              <div className="mb-500">
                <label className="font-designer-14b text-text-strong mb-200 block">
                  투표 마감 시간 (선택)
                </label>
                <input
                  type="date"
                  value={selectedDateOnly}
                  onChange={handleDateChange}
                  min={getTodayDateString()}
                  className="rounded-100 border-border-subtle bg-background-default font-designer-14r focus:border-border-brand w-full border px-300 py-200 transition-colors outline-none"
                />
                {selectedDateOnly && (
                  <p className="font-designer-12r text-text-subtle mt-100">
                    선택한 날짜의 23시 59분에 마감됩니다
                  </p>
                )}
                {!selectedDateOnly && (
                  <p className="font-designer-12r text-text-subtlest mt-100">
                    미입력 시 7일 후 자동 마감됩니다
                  </p>
                )}
              </div>
            </form>
          </Modal.Body>

          <Modal.Footer className="flex items-center gap-200">
            <Modal.Close asChild>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-100 border-border-subtle bg-background-default font-designer-14b text-text-default hover:border-border-brand hover:text-text-brand flex-1 border px-400 py-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                취소
              </button>
            </Modal.Close>
            <button
              type="submit"
              form="create-voting"
              disabled={isSubmitting}
              className="rounded-100 bg-fill-brand-default-default font-designer-14b text-text-inverse shadow-1 hover:bg-fill-brand-default-hover hover:shadow-2 flex-1 px-400 py-300 transition-all disabled:cursor-not-allowed disabled:opacity-50"
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
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
