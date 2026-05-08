'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdminCourseField from '@/components/admin/courses/admin-course-field';
import AdminCourseMarkdownEditor from '@/components/admin/courses/admin-course-markdown-editor';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import MarkdownContent from '@/components/common/ui/editor/markdown-content';
import { BaseInput, NativeSelect } from '@/components/common/ui/input';
import { CLASS_INPUT_LIMITS } from '@/features/admin/course-management/model/admin-class-input-policy';
import type {
  AdminLessonSummary,
  AdminLessonUpsertRequest,
  AdminRetrospectivePurpose,
} from '@/features/admin/course-management/model/admin-course-management-contract';
import {
  ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS,
  getAdminRetrospectivePurposeMeta,
} from '@/features/admin/course-management/model/admin-course-presentation';
import {
  readAdminDraft,
  useAdminLocalDraft,
} from '@/features/admin/course-management/model/admin-draft-storage';
import {
  getAdminLessonPayloadValidationError,
  toAdminLessonPayload,
  useAdminCourseLessonsQuery,
  useAdminLessonBuilderFeedsQuery,
  useAdminLessonDetailQuery,
  useAdminLessonQnasQuery,
  useAdminLessonRetrospectivesQuery,
  useCreateAdminLessonMutation,
  useDeleteAdminLessonMutation,
  useReorderAdminLessonsMutation,
  useUpdateAdminLessonMutation,
} from '@/features/admin/course-management/model/use-admin-course-management-query';
import { useToastStore } from '@/stores/use-toast-store';

const emptyLessonForm: AdminLessonUpsertRequest = {
  chapterNumber: 1,
  lessonNumber: 1,
  title: '',
  content: '',
  estimatedMinutes: 30,
  retrospectivePurpose: 'PRACTICE_PROOF',
  isFree: false,
  isPublished: false,
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const countWords = (content: string) =>
  content.trim() ? content.trim().split(/\s+/).length : 0;

const getLineCount = (content: string) => content.split('\n').length;

const LessonStatusBadges = ({ lesson }: { lesson: AdminLessonSummary }) => (
  <div className="flex flex-wrap gap-50">
    <Badge color={lesson.isPublished ? 'green' : 'gray'}>
      {lesson.isPublished ? '게시' : '비게시'}
    </Badge>
    <Badge color={lesson.isFree ? 'blue' : 'gray'}>
      {lesson.isFree ? '무료' : '유료'}
    </Badge>
    <Badge
      color={
        getAdminRetrospectivePurposeMeta(lesson.retrospectivePurpose).color
      }
    >
      {getAdminRetrospectivePurposeMeta(lesson.retrospectivePurpose).label}
    </Badge>
  </div>
);

const OperationCard = ({
  title,
  description,
  count,
  href,
  disabled,
}: {
  title: string;
  description: string;
  count: string;
  href: string;
  disabled: boolean;
}) => (
  <div className="border-border-default rounded-100 border p-125">
    <div className="mb-100 flex items-start justify-between gap-100">
      <div>
        <p className="font-designer-14b text-text-default">{title}</p>
        <p className="font-designer-12r text-text-subtle mt-25">
          {description}
        </p>
      </div>
      <Badge color="gray">{count}</Badge>
    </div>
    <Button asChild color="secondary" size="xsmall" disabled={disabled}>
      <Link
        className={cn(disabled && 'pointer-events-none opacity-60')}
        href={href}
      >
        관리 페이지로 이동
      </Link>
    </Button>
  </div>
);

const groupLessonsByChapter = (lessons: AdminLessonSummary[]) => {
  return lessons.reduce<Record<number, AdminLessonSummary[]>>((acc, lesson) => {
    if (!acc[lesson.chapterNumber]) {
      acc[lesson.chapterNumber] = [];
    }
    acc[lesson.chapterNumber].push(lesson);
    return acc;
  }, {});
};

export default function AdminLessonManagementPageClient({
  courseId,
}: {
  courseId: number;
}) {
  const lessonsQuery = useAdminCourseLessonsQuery(courseId);
  const lessons = lessonsQuery.data ?? [];
  const [lessonSearch, setLessonSearch] = useState('');
  const [chapterFilter, setChapterFilter] = useState<'ALL' | string>('ALL');
  const [publishedFilter, setPublishedFilter] = useState<
    'ALL' | 'PUBLISHED' | 'UNPUBLISHED'
  >('ALL');
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'FREE' | 'PAID'>(
    'ALL',
  );
  const [editingLessonId, setEditingLessonId] = useState<number | undefined>();
  const [lessonFormMode, setLessonFormMode] = useState<'create' | 'edit'>(
    'create',
  );
  const [lessonForm, setLessonForm] =
    useState<AdminLessonUpsertRequest>(emptyLessonForm);
  const [hydratedLessonId, setHydratedLessonId] = useState<
    number | undefined
  >();
  const [editorVersion, setEditorVersion] = useState(0);
  const draftKey = `lesson:${courseId}:${lessonFormMode}:${editingLessonId ?? 'new'}`;
  const {
    status: lessonDraftStatus,
    setStatus: setLessonDraftStatus,
    clearDraft: clearLessonDraft,
  } = useAdminLocalDraft({
    draftKey,
    value: lessonForm,
  });

  const createLessonMutation = useCreateAdminLessonMutation();
  const updateLessonMutation = useUpdateAdminLessonMutation();
  const deleteLessonMutation = useDeleteAdminLessonMutation();
  const reorderLessonsMutation = useReorderAdminLessonsMutation();
  const lessonDetailQuery = useAdminLessonDetailQuery(editingLessonId);
  const qnasQuery = useAdminLessonQnasQuery(editingLessonId);
  const retrospectivesQuery =
    useAdminLessonRetrospectivesQuery(editingLessonId);
  const builderFeedsQuery = useAdminLessonBuilderFeedsQuery(editingLessonId);

  const chapters = useMemo(
    () =>
      Array.from(new Set(lessons.map((lesson) => lesson.chapterNumber))).sort(
        (a, b) => a - b,
      ),
    [lessons],
  );

  const filteredLessons = useMemo(() => {
    const keyword = lessonSearch.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const matchKeyword =
        !keyword ||
        [lesson.title, `${lesson.chapterNumber}-${lesson.lessonNumber}`].some(
          (value) => value.toLowerCase().includes(keyword),
        );
      const matchChapter =
        chapterFilter === 'ALL' ||
        lesson.chapterNumber === Number(chapterFilter);
      const matchPublished =
        publishedFilter === 'ALL' ||
        (publishedFilter === 'PUBLISHED' && lesson.isPublished) ||
        (publishedFilter === 'UNPUBLISHED' && !lesson.isPublished);
      const matchAccess =
        accessFilter === 'ALL' ||
        (accessFilter === 'FREE' && lesson.isFree) ||
        (accessFilter === 'PAID' && !lesson.isFree);

      return matchKeyword && matchChapter && matchPublished && matchAccess;
    });
  }, [accessFilter, chapterFilter, lessonSearch, lessons, publishedFilter]);

  const selectedLesson = lessons.find(
    (lesson) => lesson.lessonId === editingLessonId,
  );
  const groupedLessons = useMemo(
    () => groupLessonsByChapter(filteredLessons),
    [filteredLessons],
  );
  const isLessonFormLocked =
    createLessonMutation.isPending ||
    updateLessonMutation.isPending ||
    lessonDetailQuery.isFetching;
  const isListFiltered =
    Boolean(lessonSearch.trim()) ||
    chapterFilter !== 'ALL' ||
    publishedFilter !== 'ALL' ||
    accessFilter !== 'ALL';

  useEffect(() => {
    if (
      lessonFormMode === 'create' ||
      editingLessonId ||
      lessons.length === 0
    ) {
      return;
    }
    const firstLesson = lessons[0];
    if (!firstLesson) return;
    setEditingLessonId(firstLesson.lessonId);
    setLessonFormMode('edit');
    setLessonForm({
      chapterNumber: firstLesson.chapterNumber,
      lessonNumber: firstLesson.lessonNumber,
      title: firstLesson.title,
      content: '',
      estimatedMinutes: 30,
      retrospectivePurpose: firstLesson.retrospectivePurpose,
      isFree: firstLesson.isFree,
      isPublished: firstLesson.isPublished,
    });
    setHydratedLessonId(undefined);
  }, [editingLessonId, lessonFormMode, lessons]);

  useEffect(() => {
    if (
      !lessonDetailQuery.data ||
      lessonDetailQuery.data.lessonId === hydratedLessonId
    ) {
      return;
    }

    const serverLessonForm = {
      chapterNumber: lessonDetailQuery.data.chapterNumber,
      lessonNumber: lessonDetailQuery.data.lessonNumber,
      title: lessonDetailQuery.data.title,
      content: lessonDetailQuery.data.content,
      estimatedMinutes: lessonDetailQuery.data.estimatedMinutes,
      retrospectivePurpose: lessonDetailQuery.data.retrospectivePurpose,
      isFree: lessonDetailQuery.data.isFree,
      isPublished: lessonDetailQuery.data.isPublished,
    };
    const draft = readAdminDraft<AdminLessonUpsertRequest>(
      `lesson:${courseId}:edit:${lessonDetailQuery.data.lessonId}`,
    );

    setLessonForm(draft ?? serverLessonForm);
    if (draft) {
      setLessonDraftStatus('restored');
    }
    setHydratedLessonId(lessonDetailQuery.data.lessonId);
    setEditorVersion((prev) => prev + 1);
  }, [
    courseId,
    hydratedLessonId,
    lessonDetailQuery.data,
    setLessonDraftStatus,
  ]);

  useEffect(() => {
    if (lessonFormMode !== 'create') return;
    const draft = readAdminDraft<AdminLessonUpsertRequest>(
      `lesson:${courseId}:create:new`,
    );
    if (!draft) return;
    setLessonForm(draft);
    setLessonDraftStatus('restored');
    setEditorVersion((prev) => prev + 1);
  }, [courseId, lessonFormMode, setLessonDraftStatus]);

  const startCreateLesson = () => {
    setLessonFormMode('create');
    setEditingLessonId(undefined);
    setHydratedLessonId(undefined);
    setLessonForm({
      ...(readAdminDraft<AdminLessonUpsertRequest>(
        `lesson:${courseId}:create:new`,
      ) ?? emptyLessonForm),
      lessonNumber: lessons.length + 1,
    });
    setEditorVersion((prev) => prev + 1);
  };

  const selectLesson = (lesson: AdminLessonSummary) => {
    if (isLessonFormLocked) return;
    setLessonFormMode('edit');
    setEditingLessonId(lesson.lessonId);
    setHydratedLessonId(undefined);
    setLessonForm({
      chapterNumber: lesson.chapterNumber,
      lessonNumber: lesson.lessonNumber,
      title: lesson.title,
      content: '',
      estimatedMinutes: 30,
      retrospectivePurpose: lesson.retrospectivePurpose,
      isFree: lesson.isFree,
      isPublished: lesson.isPublished,
    });
    setEditorVersion((prev) => prev + 1);
  };

  const handleSubmitLesson = () => {
    const payload = toAdminLessonPayload(lessonForm);
    const validationError = getAdminLessonPayloadValidationError(payload);
    if (validationError) {
      useToastStore.getState().showToast(validationError, 'info');
      return;
    }

    if (lessonFormMode === 'create') {
      createLessonMutation.mutate(
        { courseId, request: payload },
        {
          onSuccess: (response) => {
            clearLessonDraft();
            setEditingLessonId(response.lessonId);
            setLessonFormMode('edit');
            setHydratedLessonId(undefined);
          },
        },
      );
      return;
    }

    if (!editingLessonId) return;
    updateLessonMutation.mutate(
      {
        courseId,
        lessonId: editingLessonId,
        request: payload,
      },
      { onSuccess: clearLessonDraft },
    );
  };

  const handleDeleteLesson = (lesson: AdminLessonSummary) => {
    const confirmed = window.confirm(
      `${lesson.title} 레슨을 삭제할까요? 돌아보기 이력이 있으면 실제 삭제되지 않고 비게시 처리됩니다.`,
    );
    if (!confirmed) return;

    deleteLessonMutation.mutate(
      { courseId, lessonId: lesson.lessonId },
      {
        onSuccess: () => {
          if (editingLessonId === lesson.lessonId) {
            startCreateLesson();
          }
        },
      },
    );
  };

  const handleMoveLesson = (lessonId: number, direction: -1 | 1) => {
    if (isListFiltered) return;
    const currentIndex = lessons.findIndex(
      (lesson) => lesson.lessonId === lessonId,
    );
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= lessons.length)
      return;

    const orderedLessonIds = lessons.map((lesson) => lesson.lessonId);
    const targetLessonId = orderedLessonIds[targetIndex];
    if (typeof targetLessonId !== 'number') return;
    orderedLessonIds[targetIndex] = lessonId;
    orderedLessonIds[currentIndex] = targetLessonId;

    reorderLessonsMutation.mutate({ courseId, request: { orderedLessonIds } });
  };

  return (
    <main className="flex flex-col gap-200 p-200">
      <header className="sticky top-0 z-10 bg-background-default flex items-center justify-between gap-200 py-100">
        <div className="flex flex-col items-start gap-50">
          <Link
            href={`/admin/courses/${courseId}`}
            className="font-designer-13r text-text-subtle hover:text-text-default"
          >
            ← 코스 관리로 돌아가기
          </Link>
          <div>
            <p className="font-designer-13r text-text-subtle">레슨 관리</p>
            <h1 className="font-designer-24b text-text-default">
              코스 #{courseId} 레슨 관리
            </h1>
          </div>
        </div>
        <div className="flex gap-75">
          {lessonFormMode !== 'create' && (
            <Button color="secondary" size="small" onClick={startCreateLesson}>
              새 레슨 추가
            </Button>
          )}
          <Button
            size="small"
            disabled={isLessonFormLocked}
            loading={
              createLessonMutation.isPending || updateLessonMutation.isPending
            }
            onClick={handleSubmitLesson}
          >
            {lessonFormMode === 'create' ? '새 레슨 생성' : '변경사항 저장'}
          </Button>
        </div>
      </header>

      <section className="grid min-h-screen grid-cols-2 gap-200">
        <div className="border-border-default bg-background-default rounded-150 min-h-screen overflow-auto border p-200">
          <div className="mb-150 flex flex-wrap items-end gap-100">
            <AdminCourseField label="레슨 검색">
              <BaseInput
                size="m"
                value={lessonSearch}
                placeholder="제목 또는 1-2 검색"
                onValueChange={setLessonSearch}
              />
            </AdminCourseField>
            <AdminCourseField label="챕터">
              <NativeSelect
                value={chapterFilter}
                onChange={(event) => setChapterFilter(event.target.value)}
              >
                <option value="ALL">전체</option>
                {chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    Chapter {chapter}
                  </option>
                ))}
              </NativeSelect>
            </AdminCourseField>
            <AdminCourseField label="게시 상태">
              <NativeSelect
                value={publishedFilter}
                onChange={(event) =>
                  setPublishedFilter(
                    event.target.value as 'ALL' | 'PUBLISHED' | 'UNPUBLISHED',
                  )
                }
              >
                <option value="ALL">전체</option>
                <option value="PUBLISHED">게시</option>
                <option value="UNPUBLISHED">비게시</option>
              </NativeSelect>
            </AdminCourseField>
            <AdminCourseField label="유형">
              <NativeSelect
                value={accessFilter}
                onChange={(event) =>
                  setAccessFilter(event.target.value as 'ALL' | 'FREE' | 'PAID')
                }
              >
                <option value="ALL">전체</option>
                <option value="FREE">무료</option>
                <option value="PAID">유료</option>
              </NativeSelect>
            </AdminCourseField>
          </div>

          {lessonsQuery.isLoading && (
            <p className="font-designer-14r text-text-subtle py-300 text-center">
              레슨을 불러오는 중입니다.
            </p>
          )}
          {!lessonsQuery.isLoading && filteredLessons.length === 0 && (
            <p className="font-designer-14r text-text-subtle py-300 text-center">
              조건에 맞는 레슨이 없습니다.
            </p>
          )}
          <div className="flex flex-col gap-150">
            {Object.entries(groupedLessons).map(([chapter, chapterLessons]) => (
              <div key={chapter}>
                <p className="font-designer-13b text-text-subtle mb-75">
                  Chapter {chapter}
                </p>
                <div className="border-border-default rounded-100 overflow-hidden border">
                  {chapterLessons.map((lesson, index) => {
                    const globalIndex = lessons.findIndex(
                      (item) => item.lessonId === lesson.lessonId,
                    );

                    return (
                      <div
                        key={lesson.lessonId}
                        className={cn(
                          'border-border-default flex items-start justify-between gap-100 border-b p-125',
                          editingLessonId === lesson.lessonId &&
                            'bg-fill-brand-subtle-default',
                        )}
                      >
                        <button
                          className="flex flex-1 flex-col items-start gap-50 text-left"
                          type="button"
                          onClick={() => selectLesson(lesson)}
                        >
                          <span className="font-designer-14b text-text-default">
                            {lesson.chapterNumber}-{lesson.lessonNumber}.{' '}
                            {lesson.title}
                          </span>
                          <LessonStatusBadges lesson={lesson} />
                          <span className="font-designer-12r text-text-subtlest">
                            돌아보기 {lesson.retrospectiveCount}건 · 수정{' '}
                            {formatDateTime(lesson.updatedAt)}
                          </span>
                        </button>
                        <div className="flex gap-50">
                          <Button
                            color="secondary"
                            size="xsmall"
                            disabled={isListFiltered || globalIndex === 0}
                            loading={reorderLessonsMutation.isPending}
                            onClick={() =>
                              handleMoveLesson(lesson.lessonId, -1)
                            }
                          >
                            위
                          </Button>
                          <Button
                            color="secondary"
                            size="xsmall"
                            disabled={
                              isListFiltered ||
                              globalIndex === lessons.length - 1
                            }
                            loading={reorderLessonsMutation.isPending}
                            onClick={() => handleMoveLesson(lesson.lessonId, 1)}
                          >
                            아래
                          </Button>
                          <Button
                            color="outlined"
                            size="xsmall"
                            loading={deleteLessonMutation.isPending}
                            onClick={() => handleDeleteLesson(lesson)}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border-default bg-background-default rounded-150 min-h-screen overflow-auto border p-200">
          <div className="mb-150 flex items-start justify-between gap-100">
            <div>
              <h2 className="font-designer-20b text-text-default">
                {lessonFormMode === 'create'
                  ? '레슨 기본정보 생성'
                  : '레슨 기본정보 수정'}
              </h2>
              <p className="font-designer-13r text-text-subtle mt-50">
                긴 운영 목록은 이 화면에 펼치지 않고 각 관리 페이지로
                이동합니다.
              </p>
            </div>
            {selectedLesson && <LessonStatusBadges lesson={selectedLesson} />}
          </div>

          {lessonFormMode === 'create' && (
            <div className="border-border-brand bg-fill-brand-subtle-default mb-150 rounded-125 border px-150 py-125">
              <p className="font-designer-14b text-text-brand">
                생성 모드입니다. 아직 저장되지 않은 새 레슨을 작성하고 있습니다.
              </p>
              <p className="font-designer-12r text-text-subtle mt-50">
                기존 레슨을 수정하려면 왼쪽 목록에서 레슨을 선택하세요.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-150">
            <AdminCourseField label="챕터" helper="필수 · 1 이상의 정수">
              <BaseInput
                size="m"
                type="number"
                min={1}
                step={1}
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
            <AdminCourseField
              label="레슨 번호"
              helper="선택 · 1 이상의 정수 · 생성 시 비우면 자동 채번"
            >
              <BaseInput
                size="m"
                type="number"
                min={1}
                step={1}
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
            <AdminCourseField
              label="예상 시간(분)"
              helper="선택 · 1 이상의 정수"
            >
              <BaseInput
                size="m"
                type="number"
                min={1}
                step={1}
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
            <AdminCourseField
              label="레슨 제목"
              helper="필수 · trim 저장 · 최대 150자"
            >
              <BaseInput
                size="m"
                disabled={isLessonFormLocked}
                value={lessonForm.title}
                placeholder="1일차 오리엔테이션"
                maxLength={CLASS_INPUT_LIMITS.lesson.titleMax}
                onValueChange={(title) =>
                  setLessonForm((prev) => ({ ...prev, title }))
                }
              />
            </AdminCourseField>
            <AdminCourseField
              label="돌아보기 목적"
              helper={`선택 · PRACTICE_PROOF / ARTIFACT_SHARE / SUBJECTIVE_QUIZ · ${getAdminRetrospectivePurposeMeta(lessonForm.retrospectivePurpose).helper}`}
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
              <AdminCourseField
                label="무료 공개"
                helper="생성 시 필수 · 무료/유료 여부"
              >
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
              <AdminCourseField
                label="게시 상태"
                helper="생성 시 필수 · 게시/비게시 여부"
              >
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
          </div>

          {lessonFormMode === 'edit' && (
            <div className="mt-200 grid grid-cols-3 gap-125">
              <OperationCard
                count={`${retrospectivesQuery.data?.retrospectives.length ?? selectedLesson?.retrospectiveCount ?? 0}건`}
                description="제출 목록과 검증 결과는 별도 페이지에서 확인합니다."
                disabled={!editingLessonId}
                href={`/admin/lessons/${editingLessonId ?? 0}/reflections?courseId=${courseId}`}
                title="돌아보기 제출 관리"
              />
              <OperationCard
                count={`${builderFeedsQuery.data?.feeds.length ?? 0}건`}
                description="결과물 피드 큐레이션은 별도 운영 페이지에서 처리합니다."
                disabled={!editingLessonId}
                href={`/admin/lessons/${editingLessonId ?? 0}/builder-feed?courseId=${courseId}`}
                title="Builder Feed 관리"
              />
              <OperationCard
                count={`${qnasQuery.data?.totalCount ?? 0}건`}
                description="질문 목록과 관리자 답변은 별도 페이지에서 처리합니다."
                disabled={!editingLessonId}
                href={`/admin/lessons/${editingLessonId ?? 0}/qna?courseId=${courseId}`}
                title="레슨 QnA 관리"
              />
            </div>
          )}
        </div>
      </section>

      <section className="min-h-screen">
        <div className="mb-125 flex items-center justify-between gap-100">
          <div>
            <h2 className="font-designer-24b text-text-default">본문 작성</h2>
            <p className="font-designer-14r text-text-subtle mt-50">
              왼쪽은 마크다운 작성, 오른쪽은 실제 수강생 화면에 가까운 실시간
              미리보기입니다. unsafe HTML/script와 외부 이미지 scheme은 저장
              정책에서 허용되지 않습니다.
            </p>
          </div>
          <div className="font-designer-13r text-text-subtle flex gap-125">
            <span>
              자동 임시저장:{' '}
              {lessonDraftStatus === 'saving'
                ? '저장 중...'
                : lessonDraftStatus === 'restored'
                  ? '임시저장본 복구됨'
                  : lessonDraftStatus === 'saved'
                    ? '임시저장됨'
                    : '대기 중'}
            </span>
            <span>글자 {lessonForm.content.length}</span>
            <span>단어 {countWords(lessonForm.content)}</span>
            <span>라인 {getLineCount(lessonForm.content)}</span>
          </div>
        </div>

        <div className="grid min-h-screen grid-cols-2 gap-200">
          <div className="border-border-default bg-background-default rounded-150 min-h-screen overflow-hidden border">
            <div className="border-border-default flex items-center justify-between border-b px-150 py-100">
              <div className="flex gap-50">
                {[
                  'H1',
                  'H2',
                  'H3',
                  'Bold',
                  'Italic',
                  'Underline',
                  '목록',
                  '번호 목록',
                  '인용',
                  '코드',
                  '코드블록',
                  '링크',
                  '이미지',
                  '테이블',
                ].map((tool) => (
                  <span
                    key={tool}
                    className="font-designer-12r text-text-subtle"
                  >
                    {tool}
                  </span>
                ))}
              </div>
              <Badge color="gray">Markdown</Badge>
            </div>
            <div className="admin-lesson-full-editor flex min-h-screen">
              <div className="bg-background-alternative text-text-subtlest font-designer-12r min-w-400 border-border-default border-r px-75 py-100 text-right">
                {Array.from({
                  length: Math.min(getLineCount(lessonForm.content), 200),
                }).map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
              <div className="flex-1 overflow-auto">
                {isLessonFormLocked ? (
                  <div className="font-designer-14r text-text-subtle flex min-h-screen items-center justify-center">
                    레슨 본문을 불러오는 중입니다.
                  </div>
                ) : (
                  <AdminCourseMarkdownEditor
                    editorStateKey={`${lessonFormMode}:${editingLessonId ?? 'new'}:${editorVersion}`}
                    value={lessonForm.content}
                    placeholder="레슨 본문을 작성하세요. 이미지, 코드블록, 표, 링크를 사용할 수 있습니다."
                    onChange={(content) =>
                      setLessonForm((prev) => ({ ...prev, content }))
                    }
                  />
                )}
              </div>
            </div>
          </div>

          <div className="border-border-default bg-background-default rounded-150 min-h-screen overflow-auto border p-200">
            <div className="mb-150 flex items-start justify-between gap-100">
              <div>
                <p className="font-designer-13r text-text-subtle">
                  실시간 미리보기
                </p>
                <h3 className="font-designer-24b text-text-default mt-50">
                  {lessonForm.title || '레슨 제목'}
                </h3>
              </div>
              <Button
                color="secondary"
                size="xsmall"
                onClick={() => {
                  navigator.clipboard
                    .writeText(lessonForm.content)
                    .catch((): undefined => undefined);
                  useToastStore
                    .getState()
                    .showToast('본문을 복사했습니다.', 'success');
                }}
              >
                복사
              </Button>
            </div>
            <MarkdownContent
              content={lessonForm.content}
              emptyMessage="본문을 작성하면 이 영역에 제목, 문단, 목록, 코드블록, 이미지가 렌더링됩니다."
            />
          </div>
        </div>
      </section>

      <style jsx global>{`
        .admin-lesson-full-editor .admin-course-markdown-editor .tiptap-editor {
          min-height: 78vh;
        }
      `}</style>
    </main>
  );
}
