'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import AdminCourseField from '@/components/admin/courses/admin-course-field';
import AdminCourseMarkdownField from '@/components/admin/courses/admin-course-markdown-field';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import { BaseInput, NativeSelect } from '@/components/common/ui/input';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import type {
  AdminBuilderFeedCurationRequest,
  AdminLessonQnaListItem,
  AdminLessonUpsertRequest,
  AdminRetrospectivePurpose,
} from '@/features/admin/course-management/model/admin-course-management-contract';
import { normalizeAdminCourseMarkdownContent } from '@/features/admin/course-management/model/admin-course-markdown';
import {
  ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS,
  getAdminRetrospectivePurposeMeta,
} from '@/features/admin/course-management/model/admin-course-presentation';
import {
  getAdminLessonPayloadValidationError,
  toAdminLessonPayload,
  useAdminLessonBuilderFeedsQuery,
  useAdminLessonDetailQuery,
  useAdminLessonQnaDetailQuery,
  useAdminLessonQnasQuery,
  useAdminLessonRetrospectivesQuery,
  useCreateAdminLessonQnaAnswerMutation,
  useUpdateAdminBuilderFeedCurationMutation,
  useUpdateAdminLessonMutation,
} from '@/features/admin/course-management/model/use-admin-course-management-query';
import { useToastStore } from '@/stores/use-toast-store';

const emptyLessonForm: AdminLessonUpsertRequest = {
  chapterNumber: 1,
  lessonNumber: 1,
  title: '',
  description: '',
  content: '',
  estimatedMinutes: 30,
  retrospectivePurpose: 'PRACTICE_PROOF',
  isFree: false,
  isPublished: false,
};

const formatDateTime = (value: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function AdminLessonDetailPageClient({
  lessonId,
}: {
  lessonId: number;
}) {
  const lessonDetailQuery = useAdminLessonDetailQuery(lessonId);
  const lessonRetrospectivesQuery = useAdminLessonRetrospectivesQuery(lessonId);
  const lessonBuilderFeedsQuery = useAdminLessonBuilderFeedsQuery(lessonId);
  const lessonQnasQuery = useAdminLessonQnasQuery(lessonId);
  const updateLessonMutation = useUpdateAdminLessonMutation();
  const updateBuilderFeedCurationMutation =
    useUpdateAdminBuilderFeedCurationMutation();
  const createLessonQnaAnswerMutation = useCreateAdminLessonQnaAnswerMutation();

  const [selectedQnaId, setSelectedQnaId] = useState<number | undefined>();
  const qnaDetailQuery = useAdminLessonQnaDetailQuery(selectedQnaId);
  const [qnaAnswerContent, setQnaAnswerContent] = useState('');
  const currentSelectedQnaIdRef = useRef<number | undefined>(undefined);
  const currentQnaAnswerContentRef = useRef('');
  const [builderFeedOrderDrafts, setBuilderFeedOrderDrafts] = useState<
    Record<number, string>
  >({});
  const builderFeedOrderSourceValuesRef = useRef<Record<number, string>>({});
  const [isAwaitingBuilderFeedRefresh, setIsAwaitingBuilderFeedRefresh] =
    useState(false);
  const [lessonForm, setLessonForm] =
    useState<AdminLessonUpsertRequest>(emptyLessonForm);
  const [hydratedLessonSnapshot, setHydratedLessonSnapshot] = useState('');
  const [isAwaitingLessonRefresh, setIsAwaitingLessonRefresh] = useState(false);

  const isLessonFormLocked =
    updateLessonMutation.isPending || isAwaitingLessonRefresh;

  const lessonDetailSnapshot = lessonDetailQuery.data
    ? JSON.stringify({
        chapterNumber: lessonDetailQuery.data.chapterNumber,
        lessonNumber: lessonDetailQuery.data.lessonNumber,
        title: lessonDetailQuery.data.title,
        description: '',
        content: normalizeAdminCourseMarkdownContent(
          lessonDetailQuery.data.content,
        ),
        estimatedMinutes: lessonDetailQuery.data.estimatedMinutes,
        retrospectivePurpose: lessonDetailQuery.data.retrospectivePurpose,
        isFree: lessonDetailQuery.data.isFree,
        isPublished: lessonDetailQuery.data.isPublished,
      })
    : '';

  useEffect(() => {
    if (!lessonDetailQuery.data) return;
    if (hydratedLessonSnapshot === lessonDetailSnapshot) return;

    setLessonForm({
      chapterNumber: lessonDetailQuery.data.chapterNumber,
      lessonNumber: lessonDetailQuery.data.lessonNumber,
      title: lessonDetailQuery.data.title,
      description: lessonDetailQuery.data.description ?? '',
      content: normalizeAdminCourseMarkdownContent(
        lessonDetailQuery.data.content,
      ),
      estimatedMinutes: lessonDetailQuery.data.estimatedMinutes,
      retrospectivePurpose: lessonDetailQuery.data.retrospectivePurpose,
      isFree: lessonDetailQuery.data.isFree,
      isPublished: lessonDetailQuery.data.isPublished,
    });
    setHydratedLessonSnapshot(lessonDetailSnapshot);
  }, [hydratedLessonSnapshot, lessonDetailQuery.data, lessonDetailSnapshot]);

  useEffect(() => {
    if (
      !isAwaitingLessonRefresh ||
      updateLessonMutation.isPending ||
      lessonDetailQuery.isFetching
    ) {
      return;
    }

    setIsAwaitingLessonRefresh(false);
  }, [
    isAwaitingLessonRefresh,
    lessonDetailQuery.isFetching,
    updateLessonMutation.isPending,
  ]);

  useEffect(() => {
    const qnas = lessonQnasQuery.data?.qnas ?? [];

    if (lessonQnasQuery.isFetching && qnas.length === 0) {
      return;
    }

    if (qnas.length === 0) {
      setSelectedQnaId(undefined);
      return;
    }

    if (selectedQnaId && qnas.some((qna) => qna.qnaId === selectedQnaId)) {
      return;
    }

    setSelectedQnaId(qnas[0].qnaId);
  }, [lessonQnasQuery.data?.qnas, lessonQnasQuery.isFetching, selectedQnaId]);

  useEffect(() => {
    setQnaAnswerContent('');
  }, [selectedQnaId]);

  useEffect(() => {
    currentSelectedQnaIdRef.current = selectedQnaId;
  }, [selectedQnaId]);

  useEffect(() => {
    currentQnaAnswerContentRef.current = qnaAnswerContent;
  }, [qnaAnswerContent]);

  useEffect(() => {
    if (!lessonBuilderFeedsQuery.data?.feeds.length) {
      setBuilderFeedOrderDrafts({});
      builderFeedOrderSourceValuesRef.current = {};
      return;
    }

    const nextSourceValues = Object.fromEntries(
      lessonBuilderFeedsQuery.data.feeds.map((feed) => [
        feed.feedId,
        feed.featuredOrder ? String(feed.featuredOrder) : '',
      ]),
    );

    setBuilderFeedOrderDrafts((prevDrafts) => {
      const nextDrafts: Record<number, string> = {};

      lessonBuilderFeedsQuery.data?.feeds.forEach((feed) => {
        const serverValue = nextSourceValues[feed.feedId] ?? '';
        const previousSourceValue =
          builderFeedOrderSourceValuesRef.current[feed.feedId];
        const previousDraftValue = prevDrafts[feed.feedId];

        nextDrafts[feed.feedId] =
          previousDraftValue !== undefined &&
          previousDraftValue !== previousSourceValue
            ? previousDraftValue
            : serverValue;
      });

      return nextDrafts;
    });
    builderFeedOrderSourceValuesRef.current = nextSourceValues;
  }, [lessonBuilderFeedsQuery.data?.feeds]);

  useEffect(() => {
    if (
      !isAwaitingBuilderFeedRefresh ||
      updateBuilderFeedCurationMutation.isPending ||
      lessonBuilderFeedsQuery.isFetching
    ) {
      return;
    }

    setIsAwaitingBuilderFeedRefresh(false);
  }, [
    isAwaitingBuilderFeedRefresh,
    lessonBuilderFeedsQuery.isFetching,
    updateBuilderFeedCurationMutation.isPending,
  ]);

  const toFeaturedOrder = (
    draftValue: string | undefined,
    fallbackOrder: number,
  ) => {
    const parsedValue = Number.parseInt(draftValue ?? '', 10);
    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }

    return fallbackOrder > 0 ? fallbackOrder : 1;
  };

  const handleSubmitLesson = () => {
    if (isLessonFormLocked) {
      return;
    }

    const payload = toAdminLessonPayload(lessonForm);
    const validationError = getAdminLessonPayloadValidationError(payload);

    if (validationError) {
      useToastStore.getState().showToast(validationError, 'info');
      return;
    }

    setIsAwaitingLessonRefresh(true);
    updateLessonMutation.mutate(
      {
        lessonId,
        request: {
          chapterNumber: payload.chapterNumber || undefined,
          lessonNumber: payload.lessonNumber || undefined,
          title: payload.title,
          description: payload.description,
          content: payload.content,
          estimatedMinutes: payload.estimatedMinutes || undefined,
          retrospectivePurpose: payload.retrospectivePurpose,
          isFree: payload.isFree,
          isPublished: payload.isPublished,
        },
      },
      {
        onError: () => {
          setIsAwaitingLessonRefresh(false);
        },
      },
    );
  };

  const handleToggleBuilderFeedCuration = ({
    feedId,
    currentOperatorPick,
    currentFeatured,
    nextOperatorPick = currentOperatorPick,
    nextFeatured = currentFeatured,
  }: {
    feedId: number;
    currentOperatorPick: boolean;
    currentFeatured: boolean;
    nextOperatorPick?: boolean;
    nextFeatured?: boolean;
  }) => {
    if (
      updateBuilderFeedCurationMutation.isPending ||
      isAwaitingBuilderFeedRefresh
    ) {
      return;
    }

    const draftValue = builderFeedOrderDrafts[feedId];
    const fallbackOrder =
      lessonBuilderFeedsQuery.data?.feeds.find((feed) => feed.feedId === feedId)
        ?.featuredOrder ?? 1;
    const featuredOrder = nextFeatured
      ? toFeaturedOrder(draftValue, fallbackOrder)
      : null;

    setIsAwaitingBuilderFeedRefresh(true);
    updateBuilderFeedCurationMutation.mutate(
      {
        feedId,
        lessonId,
        request: {
          operatorPick: nextOperatorPick,
          featured: nextFeatured,
          featuredOrder,
        } satisfies AdminBuilderFeedCurationRequest,
      },
      {
        onSuccess: () => {
          const nextValue = featuredOrder ? String(featuredOrder) : '';
          setBuilderFeedOrderDrafts((prev) => ({
            ...prev,
            [feedId]: nextValue,
          }));
          builderFeedOrderSourceValuesRef.current = {
            ...builderFeedOrderSourceValuesRef.current,
            [feedId]: nextValue,
          };
        },
        onError: () => {
          setIsAwaitingBuilderFeedRefresh(false);
        },
      },
    );
  };

  const handleSubmitQnaAnswer = () => {
    if (createLessonQnaAnswerMutation.isPending) return;
    if (!selectedQnaId || !qnaAnswerContent.trim()) return;
    const submittedQnaId = selectedQnaId;
    const submittedContent = qnaAnswerContent;

    createLessonQnaAnswerMutation.mutate(
      { qnaId: submittedQnaId, content: submittedContent },
      {
        onSuccess: () => {
          if (
            currentSelectedQnaIdRef.current !== submittedQnaId ||
            currentQnaAnswerContentRef.current !== submittedContent
          ) {
            return;
          }

          setQnaAnswerContent('');
        },
      },
    );
  };

  if (lessonDetailQuery.isLoading) {
    return <div className="p-200">레슨 상세를 불러오는 중입니다.</div>;
  }

  if (!lessonDetailQuery.data) {
    return <div className="p-200">레슨을 찾을 수 없습니다.</div>;
  }

  return (
    <main className="flex flex-col gap-200 p-200">
      <div className="flex items-start justify-between gap-150">
        <div>
          <Link
            href="/admin/courses"
            className="font-designer-13m text-text-brand underline"
          >
            클래스 관리로 돌아가기
          </Link>
          <h1 className="font-designer-24b text-text-default mt-75">
            {lessonForm.title}
          </h1>
          <div className="mt-75 flex flex-wrap gap-50">
            <Badge color={lessonForm.isPublished ? 'green' : 'gray'}>
              {lessonForm.isPublished ? '게시' : '비게시'}
            </Badge>
            <Badge color={lessonForm.isFree ? 'blue' : 'gray'}>
              {lessonForm.isFree ? '무료' : '유료'}
            </Badge>
            <Badge
              color={
                getAdminRetrospectivePurposeMeta(
                  lessonForm.retrospectivePurpose,
                ).color
              }
            >
              {
                getAdminRetrospectivePurposeMeta(
                  lessonForm.retrospectivePurpose,
                ).label
              }
            </Badge>
          </div>
        </div>
        <div className="flex gap-75">
          <Button
            size="small"
            disabled={isLessonFormLocked}
            loading={isLessonFormLocked}
            onClick={handleSubmitLesson}
          >
            레슨 저장
          </Button>
        </div>
      </div>

      <section className="border-border-default bg-background-default rounded-150 border p-200">
        <div className="grid grid-cols-3 gap-150">
          <AdminCourseField label="챕터">
            <BaseInput
              size="m"
              type="number"
              min={1}
              disabled={isLessonFormLocked}
              value={String(lessonForm.chapterNumber)}
              onValueChange={(chapterNumber) =>
                setLessonForm((prev) => ({
                  ...prev,
                  chapterNumber: Number(chapterNumber),
                }))
              }
            />
          </AdminCourseField>
          <AdminCourseField label="레슨">
            <BaseInput
              size="m"
              type="number"
              min={1}
              disabled={isLessonFormLocked}
              value={String(lessonForm.lessonNumber)}
              onValueChange={(lessonNumber) =>
                setLessonForm((prev) => ({
                  ...prev,
                  lessonNumber: Number(lessonNumber),
                }))
              }
            />
          </AdminCourseField>
          <AdminCourseField label="예상 시간(분)">
            <BaseInput
              size="m"
              type="number"
              min={1}
              disabled={isLessonFormLocked}
              value={String(lessonForm.estimatedMinutes)}
              onValueChange={(estimatedMinutes) =>
                setLessonForm((prev) => ({
                  ...prev,
                  estimatedMinutes: Number(estimatedMinutes),
                }))
              }
            />
          </AdminCourseField>
        </div>
        <div className="mt-150 flex flex-col gap-150">
          <AdminCourseField label="레슨 제목">
            <BaseInput
              size="m"
              disabled={isLessonFormLocked}
              value={lessonForm.title}
              onValueChange={(title) =>
                setLessonForm((prev) => ({ ...prev, title }))
              }
            />
          </AdminCourseField>
          <AdminCourseField
            label="돌아보기 목적"
            helper={
              getAdminRetrospectivePurposeMeta(lessonForm.retrospectivePurpose)
                .helper
            }
          >
            <NativeSelect
              disabled={isLessonFormLocked}
              value={lessonForm.retrospectivePurpose}
              onChange={(event) =>
                setLessonForm((prev) => ({
                  ...prev,
                  retrospectivePurpose: event.target
                    .value as AdminRetrospectivePurpose,
                }))
              }
            >
              {ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </AdminCourseField>
          <div className="grid grid-cols-2 gap-150">
            <AdminCourseField label="무료 공개">
              <NativeSelect
                disabled={isLessonFormLocked}
                value={lessonForm.isFree ? 'true' : 'false'}
                onChange={(event) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    isFree: event.target.value === 'true',
                  }))
                }
              >
                <option value="false">유료 레슨</option>
                <option value="true">무료 레슨</option>
              </NativeSelect>
            </AdminCourseField>
            <AdminCourseField label="게시 상태">
              <NativeSelect
                disabled={isLessonFormLocked}
                value={lessonForm.isPublished ? 'true' : 'false'}
                onChange={(event) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    isPublished: event.target.value === 'true',
                  }))
                }
              >
                <option value="false">비게시</option>
                <option value="true">게시</option>
              </NativeSelect>
            </AdminCourseField>
          </div>
          <AdminCourseMarkdownField
            editorStateKey={String(lessonId)}
            lessonId={lessonId}
            value={lessonForm.content}
            isHydrating={isLessonFormLocked}
            hydratingText="레슨 저장 중입니다."
            placeholder="레슨 본문을 작성하세요. 마크다운/이미지 붙여넣기, 드래그 앤 드롭, 코드블록, 제목을 사용할 수 있습니다."
            onChange={(content) =>
              setLessonForm((prev) => ({
                ...prev,
                content,
              }))
            }
          />
        </div>
      </section>

      <section className="border-border-default bg-background-default rounded-150 border p-200">
        <h2 className="font-designer-18b text-text-default mb-100">
          돌아보기 제출
        </h2>
        {lessonRetrospectivesQuery.isLoading ? (
          <p className="font-designer-14r text-text-subtle">
            돌아보기 제출 목록을 불러오는 중입니다.
          </p>
        ) : (lessonRetrospectivesQuery.data?.retrospectives.length ?? 0) ===
          0 ? (
          <p className="font-designer-14r text-text-subtle">
            제출된 돌아보기가 없습니다.
          </p>
        ) : (
          <div className="grid gap-125">
            {lessonRetrospectivesQuery.data?.retrospectives.map((retro) => (
              <article
                key={retro.retrospectiveId}
                className="border-border-default rounded-100 border p-150"
              >
                <div className="mb-75 flex flex-wrap items-center gap-75">
                  <Badge
                    color={
                      retro.purpose === 'SUBJECTIVE_QUIZ' ? 'orange' : 'blue'
                    }
                  >
                    {getAdminRetrospectivePurposeMeta(retro.purpose).label}
                  </Badge>
                  <Badge color="green">
                    이해도 {retro.understandingScore}/5
                  </Badge>
                  {retro.artifactType && (
                    <Badge color="gray">{retro.artifactType}</Badge>
                  )}
                  <span className="font-designer-12r text-text-subtlest">
                    {retro.nickname} · member {retro.memberId} ·{' '}
                    {formatDateTime(retro.createdAt)}
                  </span>
                </div>
                {retro.artifactValue && (
                  <p className="font-designer-13r text-text-brand mb-75 break-all underline">
                    {retro.artifactValue}
                  </p>
                )}
                <p className="font-designer-14r text-text-default whitespace-pre-wrap">
                  {retro.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-border-default bg-background-default rounded-150 border p-200">
        <h2 className="font-designer-18b text-text-default mb-100">
          Builder Feed 운영
        </h2>
        {lessonBuilderFeedsQuery.isLoading ? (
          <p className="font-designer-14r text-text-subtle">
            Builder Feed 목록을 불러오는 중입니다.
          </p>
        ) : (lessonBuilderFeedsQuery.data?.feeds.length ?? 0) === 0 ? (
          <p className="font-designer-14r text-text-subtle">
            연결된 Builder Feed가 없습니다.
          </p>
        ) : (
          <div className="grid gap-125">
            {lessonBuilderFeedsQuery.data?.feeds.map((feed) => (
              <article
                key={feed.feedId}
                className="border-border-default rounded-100 border p-150"
              >
                <div className="mb-100 flex flex-wrap items-center gap-75">
                  <Badge color={feed.role === 'MANAGER' ? 'orange' : 'blue'}>
                    {feed.role}
                  </Badge>
                  <Badge color={feed.operatorPick ? 'green' : 'gray'}>
                    {feed.operatorPick
                      ? 'Operator Pick ON'
                      : 'Operator Pick OFF'}
                  </Badge>
                  <Badge color={feed.featured ? 'green' : 'gray'}>
                    {feed.featured
                      ? `Showcase ON #${feed.featuredOrder ?? '-'}`
                      : 'Showcase OFF'}
                  </Badge>
                  <span className="font-designer-12r text-text-subtlest">
                    {feed.nickname} · member {feed.memberId} · 좋아요{' '}
                    {feed.likeCount} · 댓글 {feed.commentCount} ·{' '}
                    {formatDateTime(feed.createdAt)}
                  </span>
                </div>
                <p className="font-designer-14r text-text-default whitespace-pre-wrap">
                  {feed.content}
                </p>
                {feed.imageUrls.length > 0 && (
                  <div className="mt-100 flex flex-col gap-50">
                    {feed.imageUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-designer-13m text-text-brand underline"
                      >
                        이미지 열기
                      </a>
                    ))}
                  </div>
                )}
                <div className="mt-125 flex flex-wrap items-end gap-100">
                  <Button
                    color={feed.operatorPick ? 'secondary' : 'outlined'}
                    size="xsmall"
                    disabled={isAwaitingBuilderFeedRefresh}
                    loading={isAwaitingBuilderFeedRefresh}
                    onClick={() =>
                      handleToggleBuilderFeedCuration({
                        feedId: feed.feedId,
                        currentOperatorPick: feed.operatorPick,
                        currentFeatured: feed.featured,
                        nextOperatorPick: !feed.operatorPick,
                      })
                    }
                  >
                    {feed.operatorPick
                      ? 'operator pick 해제'
                      : 'operator pick 지정'}
                  </Button>
                  <Button
                    color={feed.featured ? 'secondary' : 'outlined'}
                    size="xsmall"
                    disabled={isAwaitingBuilderFeedRefresh}
                    loading={isAwaitingBuilderFeedRefresh}
                    onClick={() =>
                      handleToggleBuilderFeedCuration({
                        feedId: feed.feedId,
                        currentOperatorPick: feed.operatorPick,
                        currentFeatured: feed.featured,
                        nextFeatured: !feed.featured,
                      })
                    }
                  >
                    {feed.featured ? 'showcase 해제' : 'showcase 지정'}
                  </Button>
                  <label className="flex items-center gap-75">
                    <span className="font-designer-12r text-text-subtle">
                      showcase 순서
                    </span>
                    <BaseInput
                      size="m"
                      type="number"
                      min={1}
                      disabled={isAwaitingBuilderFeedRefresh}
                      value={builderFeedOrderDrafts[feed.feedId] ?? ''}
                      onValueChange={(value) =>
                        setBuilderFeedOrderDrafts((prev) => ({
                          ...prev,
                          [feed.feedId]: value,
                        }))
                      }
                    />
                  </label>
                  <Button
                    color="secondary"
                    size="xsmall"
                    disabled={!feed.featured || isAwaitingBuilderFeedRefresh}
                    loading={isAwaitingBuilderFeedRefresh}
                    onClick={() =>
                      handleToggleBuilderFeedCuration({
                        feedId: feed.feedId,
                        currentOperatorPick: feed.operatorPick,
                        currentFeatured: feed.featured,
                        nextFeatured: true,
                      })
                    }
                  >
                    순서 저장
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-border-default bg-background-default rounded-150 border p-200">
        <h2 className="font-designer-18b text-text-default mb-100">
          레슨 QnA 관리
        </h2>
        <div className="grid grid-cols-2 gap-200">
          <div className="border-border-default rounded-100 overflow-hidden border">
            <div className="border-border-default bg-background-alternative border-b px-150 py-100">
              <p className="font-designer-13m text-text-subtle">
                질문 목록 · {lessonQnasQuery.data?.totalCount ?? 0}개
              </p>
            </div>
            <div className="max-h-modal flex flex-col overflow-y-auto">
              {lessonQnasQuery.isLoading && (
                <p className="font-designer-14r text-text-subtle p-150">
                  질문을 불러오는 중입니다.
                </p>
              )}
              {!lessonQnasQuery.isLoading &&
                (lessonQnasQuery.data?.qnas.length ?? 0) === 0 && (
                  <p className="font-designer-14r text-text-subtle p-150">
                    등록된 질문이 없습니다.
                  </p>
                )}
              {lessonQnasQuery.data?.qnas.map((qna: AdminLessonQnaListItem) => (
                <button
                  key={qna.qnaId}
                  disabled={createLessonQnaAnswerMutation.isPending}
                  type="button"
                  onClick={() => setSelectedQnaId(qna.qnaId)}
                  className={cn(
                    'border-border-default flex flex-col items-start gap-50 border-b px-150 py-125 text-left',
                    selectedQnaId === qna.qnaId &&
                      'bg-fill-brand-subtle-default',
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-100">
                    <span className="font-designer-14m text-text-default">
                      {qna.title}
                    </span>
                    <Badge
                      color={qna.author.role === 'MANAGER' ? 'orange' : 'blue'}
                    >
                      {qna.author.role}
                    </Badge>
                  </div>
                  <p className="font-designer-12r text-text-subtlest">
                    {qna.author.nickname} · 답변 {qna.answerCount}개 · 조회{' '}
                    {qna.viewCount} · {formatDateTime(qna.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-border-default rounded-100 border p-150">
            {qnaDetailQuery.isLoading ? (
              <p className="font-designer-14r text-text-subtle">
                질문 상세를 불러오는 중입니다.
              </p>
            ) : !qnaDetailQuery.data ? (
              <p className="font-designer-14r text-text-subtle">
                왼쪽에서 질문을 선택하세요.
              </p>
            ) : (
              <div className="flex flex-col gap-150">
                <div>
                  <div className="flex items-center gap-75">
                    <h3 className="font-designer-18b text-text-default">
                      {qnaDetailQuery.data.title}
                    </h3>
                    <Badge
                      color={
                        qnaDetailQuery.data.author.role === 'MANAGER'
                          ? 'orange'
                          : 'blue'
                      }
                    >
                      {qnaDetailQuery.data.author.role}
                    </Badge>
                  </div>
                  <p className="font-designer-12r text-text-subtlest mt-50">
                    작성자 {qnaDetailQuery.data.author.nickname} · 조회{' '}
                    {qnaDetailQuery.data.viewCount} ·{' '}
                    {formatDateTime(qnaDetailQuery.data.createdAt)}
                  </p>
                </div>
                <div className="border-border-subtle rounded-100 border p-125">
                  <p className="font-designer-14r text-text-default whitespace-pre-wrap">
                    {qnaDetailQuery.data.content}
                  </p>
                  {qnaDetailQuery.data.imageUrls.length > 0 && (
                    <div className="mt-125 flex flex-col gap-50">
                      {qnaDetailQuery.data.imageUrls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-designer-13m text-text-brand underline"
                        >
                          첨부 이미지 열기
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-100">
                  <h4 className="font-designer-16b text-text-default">
                    답변 {qnaDetailQuery.data.answers.length}개
                  </h4>
                  {qnaDetailQuery.data.answers.length === 0 && (
                    <p className="font-designer-14r text-text-subtle">
                      아직 등록된 답변이 없습니다.
                    </p>
                  )}
                  {qnaDetailQuery.data.answers.map((answer) => (
                    <div
                      key={answer.answerId}
                      className="border-border-subtle rounded-100 border p-125"
                    >
                      <div className="mb-50 flex items-center gap-75">
                        <Badge
                          color={
                            answer.author.role === 'MANAGER' ? 'orange' : 'blue'
                          }
                        >
                          {answer.author.role}
                        </Badge>
                        <span className="font-designer-13m text-text-default">
                          {answer.author.nickname}
                        </span>
                        <span className="font-designer-12r text-text-subtlest">
                          {formatDateTime(answer.createdAt)}
                        </span>
                      </div>
                      <p className="font-designer-14r text-text-default whitespace-pre-wrap">
                        {answer.content}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-100">
                  <AdminCourseField label="관리자 답변">
                    <BorderedTextarea
                      disabled={createLessonQnaAnswerMutation.isPending}
                      value={qnaAnswerContent}
                      placeholder="운영자/매니저 답변을 입력하세요."
                      onChange={(event) =>
                        setQnaAnswerContent(event.target.value)
                      }
                    />
                  </AdminCourseField>
                  <div className="flex justify-end">
                    <Button
                      size="small"
                      disabled={createLessonQnaAnswerMutation.isPending}
                      loading={createLessonQnaAnswerMutation.isPending}
                      onClick={handleSubmitQnaAnswer}
                    >
                      답변 등록
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
