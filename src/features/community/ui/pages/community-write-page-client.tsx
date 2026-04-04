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
import { useCommunityWriteController } from '@/features/community/model/use-community-write-controller';
import MentorMarkdownEditor from '@/features/mentoring/ui/registration/markdown/mentor-markdown-editor';
import { COMMUNITY_WRITE_TITLE_MAX_LENGTH } from '@/types/schemas/community-write-schema';
import CommunitySectionShell from '../community-section-shell';

export default function CommunityWritePageClient() {
  const { form, state, actions, viewModel } = useCommunityWriteController();
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <PageContainer className="flex flex-col gap-400 xl:gap-500">
      <CommunitySectionShell className="gap-250 border-b border-border-subtle pb-300">
        <Link
          href="/community"
          className="inline-flex items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-default"
        >
          <ChevronLeft className="h-16 w-16" />
          커뮤니티로 돌아가기
        </Link>

        <div className="flex flex-col gap-200 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-100">
            <p className="font-designer-12m text-text-subtle">글 작성</p>
            <h1 className="font-designer-28b text-text-strong">
              새 글 작성하기
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
              loadingText="게시 중..."
            >
              게시하기
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
              <FilePenLine className="text-text-brand h-18 w-18" />글 유형
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
            placeholder="제목을 입력해주세요."
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
              <MentorMarkdownEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="내용을 작성해주세요."
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
