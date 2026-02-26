'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import FormField from '@/components/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  BALANCE_GAME_TAG_MAX_COUNT,
  BALANCE_GAME_TAG_MAX_LEN,
  BALANCE_GAME_TAG_MIN_QUERY_LEN,
} from '@/features/study/one-to-one/balance-game/const/tags';
import { useBalanceGameTagSuggestionsQuery } from '@/features/study/one-to-one/balance-game/model/use-balance-game-query';
import { useDebounce } from '@/hooks/use-debounce';
import {
  VotingCreateFormSchema,
  VotingCreateFormData,
} from '@/types/schemas/zod-schema';
import VotingDeadlineField from './voting-deadline-field';
import VotingModalFooter from './voting-modal-footer';
import VotingModalHeader from './voting-modal-header';
import VotingOptionFields from './voting-option-fields';
import VotingTagField from './voting-tag-field';

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
  return (
    <Modal.Root
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <VotingCreateForm onSubmit={onSubmit} onClose={onClose} />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface VotingCreateFormProps {
  onClose: () => void;
  onSubmit: (data: VotingCreateFormData) => Promise<void>;
}

function VotingCreateForm({ onClose, onSubmit }: VotingCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const methods = useForm<VotingCreateFormData>({
    resolver: zodResolver(VotingCreateFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      options: [{ label: '' }, { label: '' }],
      tags: [],
      endsAt: '',
    },
  });

  const { register, handleSubmit, control, watch, setValue, reset, formState } =
    methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const watchedTags = watch('tags') || [];

  const debouncedTagQuery = useDebounce(tagInput, 300);
  const trimmedTagQuery = debouncedTagQuery.trim();
  const { data: tagSuggestions = [], isFetching: isTagLoading } =
    useBalanceGameTagSuggestionsQuery(trimmedTagQuery, {
      size: 10,
      enabled: trimmedTagQuery.length >= BALANCE_GAME_TAG_MIN_QUERY_LEN,
      minLength: BALANCE_GAME_TAG_MIN_QUERY_LEN,
      sort: 'popular',
    });

  const handleAddTag = (value: string) => {
    const trimmedTag = value.trim();
    if (
      trimmedTag &&
      trimmedTag.length <= BALANCE_GAME_TAG_MAX_LEN &&
      watchedTags.length < BALANCE_GAME_TAG_MAX_COUNT &&
      !watchedTags.includes(trimmedTag)
    ) {
      setValue('tags', [...watchedTags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleFormSubmit = async (data: VotingCreateFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        endsAt:
          data.endsAt && data.endsAt.trim() !== '' ? data.endsAt : undefined,
      };
      await onSubmit(submitData);
      reset();
      setTagInput('');
      onClose();
    } catch (error) {
      console.error('투표 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setTagInput('');
      onClose();
    }
  };

  return (
    <FormProvider {...methods}>
      <VotingModalHeader
        title="새 투표 주제 만들기"
        onClose={handleClose}
        disabled={isSubmitting}
      />

      <Modal.Body className="px-600 py-400">
        <form
          id="create-voting"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-500"
        >
          <FormField<VotingCreateFormData, 'title'>
            name="title"
            label="제목"
            required
            direction="vertical"
            showCounterRight
            maxCharCount={200}
          >
            <BaseInput
              placeholder="투표 주제를 입력해주세요 (예: 내가 자주 쓰는 생성형 AI는?)"
              maxLength={200}
            />
          </FormField>

          <FormField<VotingCreateFormData, 'description'>
            name="description"
            label="설명 (선택)"
            direction="vertical"
            showCounterRight
            maxCharCount={500}
          >
            <TextAreaInput
              placeholder="주제에 대한 부연 설명을 입력해주세요"
              maxLength={500}
              hideMeta
            />
          </FormField>

          <VotingOptionFields
            fields={fields}
            register={register}
            append={append}
            remove={remove}
            errors={formState.errors}
          />

          <VotingTagField
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onAddTag={handleAddTag}
            selectedTags={watchedTags}
            onRemoveTag={handleRemoveTag}
            suggestions={tagSuggestions}
            isLoading={isTagLoading}
          />

          <VotingDeadlineField />
        </form>
      </Modal.Body>

      <VotingModalFooter isSubmitting={isSubmitting} onCancel={handleClose} />
    </FormProvider>
  );
}
