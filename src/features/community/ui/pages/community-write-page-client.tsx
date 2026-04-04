'use client';

import { ChevronLeft, FilePenLine } from 'lucide-react';
import Link from 'next/link';
import { Controller } from 'react-hook-form';
import Button from '@/components/common/ui/button';
import ChipButton from '@/components/common/ui/chip/chip-button';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import FormSectionCard from '@/components/common/ui/form/form-section-card';
import { BaseInput } from '@/components/common/ui/input';
import PageContainer from '@/components/common/ui/page-container';
import {
  useCommunityWriteController,
  type CommunityWriteMode,
} from '@/features/community/model/use-community-write-controller';
import type { CommunityBoard } from '@/types/community/domain';
import { COMMUNITY_WRITE_TITLE_MAX_LENGTH } from '@/types/schemas/community-write-schema';
import CommunityMarkdownEditor from '../community-markdown-editor';
import CommunitySectionShell from '../community-section-shell';

interface CommunityWritePageClientProps {
  initialBoard?: CommunityBoard;
  mode: CommunityWriteMode;
  postId?: number;
  returnPage?: number;
}

export default function CommunityWritePageClient({
  initialBoard,
  mode,
  postId,
  returnPage,
}: CommunityWritePageClientProps) {
  const { form, state, actions, viewModel } = useCommunityWriteController({
    initialBoard,
    mode,
    postId,
    returnPage,
  });
  const {
    control,
    register,
    formState: { errors },
  } = form;

  if (!state.isAccessReady) {
    return (
      <PageContainer className="flex flex-col gap-400 xl:gap-500">
        <CommunitySectionShell className="gap-250">
          <p className="font-designer-16r text-text-subtle">
            에디터를 불러오는 중입니다.
          </p>
        </CommunitySectionShell>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-400 xl:gap-500">
      <CommunitySectionShell className="gap-250 border-b border-border-default pb-300">
        <Link
          href={viewModel.backHref}
          className="inline-flex items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-default"
        >
          <ChevronLeft className="h-16 w-16" />
          뒤로
        </Link>

        <div className="flex flex-col gap-200 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-100">
            <p className="font-designer-12m text-text-subtle">
              {viewModel.pageDescription}
            </p>
            <h1 className="font-designer-28b text-text-strong">
              {viewModel.pageTitle}
            </h1>
          </div>

          <div className="flex gap-100">
            <Button
              type="button"
              color="outlined"
              size="large"
              onClick={actions.handleCancel}
            >
              취소
            </Button>
            <Button
              type="submit"
              size="large"
              form="community-write-form"
              disabled={viewModel.isSubmitDisabled}
              loading={state.isSubmitting}
              loadingText={viewModel.submitLabel}
            >
              {viewModel.submitLabel}
            </Button>
          </div>
        </div>
      </CommunitySectionShell>

      <form
        id="community-write-form"
        onSubmit={actions.handleSubmit}
        className="flex flex-col gap-250"
      >
        <FormSectionCard
          title={
            <span className="inline-flex items-center gap-75">
              <FilePenLine className="text-text-brand h-225 w-225" />
              게시판
            </span>
          }
        >
          <div className="flex flex-wrap gap-100">
            {viewModel.boardOptions.map((option) => (
              <ChipButton
                key={option.id}
                variant="state"
                active={option.id === viewModel.selectedBoard}
                onClick={() => actions.handleBoardChange(option.id)}
              >
                {option.label}
              </ChipButton>
            ))}
          </div>
        </FormSectionCard>

        <FormSectionCard title="제목">
          <BaseInput
            {...register('title')}
            placeholder="제목을 입력해 주세요."
            maxLength={COMMUNITY_WRITE_TITLE_MAX_LENGTH}
            hideMeta={false}
          />
          <FieldErrorText
            message={viewModel.titleError ?? errors.title?.message}
          />
        </FormSectionCard>

        <FormSectionCard
          title="내용"
          description="마크다운과 이미지 첨부를 지원합니다."
        >
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <CommunityMarkdownEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="글 내용을 작성해 주세요."
              />
            )}
          />
          <FieldErrorText
            message={viewModel.contentError ?? errors.content?.message}
          />
        </FormSectionCard>
      </form>
    </PageContainer>
  );
}
