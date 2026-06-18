'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import AdminCourseField from '@/components/admin/courses/admin-course-field';
import {
  AdminCourseCompletionMessageContent,
  AdminCourseFormContent,
} from '@/components/admin/courses/admin-course-form-sections';
import AdminCoursePlanManagement from '@/components/admin/courses/admin-course-plan-management';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import MarkdownContent from '@/components/common/ui/editor/markdown-content';
import {
  getAdminCompletionMessageValidationError,
  getAdminCoursePayloadValidationError,
} from '@/features/admin/course-management/model/admin-class-input-policy';
import { uploadAdminCourseImage } from '@/features/admin/course-management/model/admin-course-image-upload';
import type {
  AdminCourseDetailResponse,
  AdminCourseFormValues,
  AdminCourseStatus,
} from '@/features/admin/course-management/model/admin-course-management-contract';
import {
  ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE,
} from '@/features/admin/course-management/model/admin-course-markdown';
import { parseAdminCourseCardTags } from '@/features/admin/course-management/model/admin-course-tag-utils';
import {
  readAdminDraft,
  useAdminLocalDraft,
} from '@/features/admin/course-management/model/admin-draft-storage';
import {
  toAdminCoursePayload,
  toAdminCourseUpdateRequest,
  useAdminCompletionMessageQuery,
  useAdminCourseDetailQuery,
  useAdminCoursesQuery,
  useCreateAdminCourseMutation,
  useUpdateAdminCourseMutation,
  useUpsertAdminCompletionMessageMutation,
} from '@/features/admin/course-management/model/use-admin-course-management-query';
import { useToastStore } from '@/stores/use-toast-store';

const COURSE_STATUS_OPTIONS: Array<{
  value: AdminCourseStatus;
  label: string;
}> = [
  { value: 'OPEN', label: '공개' },
  { value: 'COMING_SOON', label: '오픈 예정' },
  { value: 'HIDDEN', label: '비공개' },
];

const emptyCourseForm: AdminCourseFormValues = {
  slug: '',
  title: '',
  cardHeadline: '',
  cardSummary: '',
  cardTags: '',
  description: '',
  thumbnailUrl: '',
  status: 'COMING_SOON',
  durationDays: '',
};

const COURSE_THUMBNAIL_INPUT_ACCEPT =
  ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.map(
    (extension) => `.${extension}`,
  ).join(',');
const COURSE_THUMBNAIL_DEFAULT_DISPLAY_WIDTH = 560;

interface CourseDetailDraft {
  courseForm: AdminCourseFormValues;
  completionMessage: string;
  thumbnailDataUrl?: string;
  thumbnailFileName?: string;
  thumbnailFileType?: string;
}

interface CourseDetailResetState {
  courseForm: AdminCourseFormValues;
  completionMessage: string;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const toAdminCourseFormValues = (
  courseDetail: AdminCourseDetailResponse,
): AdminCourseFormValues => ({
  slug: courseDetail.slug,
  title: courseDetail.title,
  cardHeadline: courseDetail.cardHeadline ?? '',
  cardSummary: courseDetail.cardSummary ?? '',
  cardTags: courseDetail.cardTags.join(', '),
  description: courseDetail.description ?? '',
  thumbnailUrl: courseDetail.thumbnailUrl ?? '',
  status: courseDetail.status,
  durationDays:
    typeof courseDetail.durationDays === 'number'
      ? String(courseDetail.durationDays)
      : '',
});

const CoursePreviewPanel = ({
  courseForm,
  completionMessage,
  thumbnailPreviewUrl,
}: {
  courseForm: AdminCourseFormValues;
  completionMessage: string;
  thumbnailPreviewUrl?: string;
}) => {
  const tags = parseAdminCourseCardTags(courseForm.cardTags);

  return (
    <div className="border-border-default bg-background-default rounded-150 flex min-h-screen flex-col border p-200">
      <div className="mb-150 flex items-center justify-between gap-100">
        <div>
          <h2 className="font-designer-20b text-text-default">미리보기</h2>
          <p className="font-designer-13r text-text-subtle mt-50">
            코스 카드와 상세 화면에서 보일 핵심 값을 확인합니다.
          </p>
        </div>
        <Button
          asChild={!!courseForm.slug}
          color="outlined"
          size="xsmall"
          disabled={!courseForm.slug}
        >
          {courseForm.slug ? (
            <Link href={`/class/${courseForm.slug}`} target="_blank">
              공개 화면 열기
            </Link>
          ) : (
            <span>공개 화면 열기</span>
          )}
        </Button>
      </div>

      <div className="border-border-default rounded-150 border p-150">
        <div className="bg-background-alternative rounded-100 flex aspect-video w-full items-center justify-center overflow-hidden">
          {thumbnailPreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="코스 썸네일 미리보기"
              className="h-full w-full object-cover"
              src={thumbnailPreviewUrl}
            />
          ) : (
            <span className="font-designer-14r text-text-subtle">
              썸네일 미리보기
            </span>
          )}
        </div>
        <div className="mt-150 flex flex-wrap gap-50">
          <Badge color="blue">{courseForm.status}</Badge>
          {tags.map((tag) => (
            <Badge key={tag} color="gray">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="font-designer-14b text-text-brand mt-125">
          {courseForm.cardHeadline || '카드 헤드라인'}
        </p>
        <h3 className="font-designer-20b text-text-default mt-50">
          {courseForm.title || '코스 제목'}
        </h3>
        <p className="font-designer-14r text-text-subtle mt-75">
          {courseForm.cardSummary || '카드 요약이 여기에 표시됩니다.'}
        </p>
        <div className="mt-125 flex items-baseline gap-75">
          <span className="font-designer-16b text-text-default">
            가격/얼리버드는 플랜 정책에서 자동 계산
          </span>
        </div>
      </div>

      <div className="border-border-default rounded-150 mt-150 flex-1 overflow-auto border p-150">
        <div className="mb-125 flex items-center justify-between gap-100">
          <h3 className="font-designer-18b text-text-default">코스 상세</h3>
          <span className="font-designer-13r text-text-subtlest">
            기간 {courseForm.durationDays || '-'}일
          </span>
        </div>
        <MarkdownContent
          content={courseForm.description}
          emptyMessage="공개 상세 설명이 아직 없습니다."
        />
      </div>

      <div className="bg-background-alternative rounded-100 mt-150 p-125">
        <p className="font-designer-12r text-text-subtle">완주 메시지</p>
        <p className="font-designer-14r text-text-default mt-50 whitespace-pre-wrap">
          {completionMessage || '완주 메시지는 선택 입력입니다.'}
        </p>
      </div>
    </div>
  );
};

export default function AdminCourseDetailPageClient({
  courseId,
}: {
  courseId?: number;
}) {
  const router = useRouter();
  const isCreateMode = typeof courseId !== 'number';
  const draftKey = `course:${courseId ?? 'new'}`;
  const [hasInitializedDraft, setHasInitializedDraft] = useState(isCreateMode);
  const coursesQuery = useAdminCoursesQuery({ page: 0, size: 50 });
  const courseDetailQuery = useAdminCourseDetailQuery(courseId);
  const selectedCourse = useMemo(
    () =>
      coursesQuery.data?.content.find((course) => course.courseId === courseId),
    [courseId, coursesQuery.data?.content],
  );
  const createCourseMutation = useCreateAdminCourseMutation();
  const updateCourseMutation = useUpdateAdminCourseMutation();
  const completionMessageQuery = useAdminCompletionMessageQuery(courseId);
  const upsertCompletionMessageMutation =
    useUpsertAdminCompletionMessageMutation();
  const [courseForm, setCourseForm] =
    useState<AdminCourseFormValues>(emptyCourseForm);
  const [courseFormTouchedFields, setCourseFormTouchedFields] = useState<
    Partial<Record<keyof AdminCourseFormValues, boolean>>
  >({});
  const [courseThumbnailFile, setCourseThumbnailFile] = useState<File | null>(
    null,
  );
  const [courseThumbnailPreviewUrl, setCourseThumbnailPreviewUrl] = useState<
    string | null
  >(null);
  const [courseThumbnailDraftDataUrl, setCourseThumbnailDraftDataUrl] =
    useState<string>();
  const [courseThumbnailDraftFileMeta, setCourseThumbnailDraftFileMeta] =
    useState<{ name: string; type: string }>();
  const [isUploadingCourseThumbnail, setIsUploadingCourseThumbnail] =
    useState(false);
  const [courseThumbnailDisplayWidth, setCourseThumbnailDisplayWidth] =
    useState(COURSE_THUMBNAIL_DEFAULT_DISPLAY_WIDTH);
  const [completionMessage, setCompletionMessage] = useState('');
  const [resetState, setResetState] = useState<CourseDetailResetState>({
    courseForm: emptyCourseForm,
    completionMessage: '',
  });
  const draftValue = useMemo<CourseDetailDraft>(
    () => ({
      courseForm,
      completionMessage,
      thumbnailDataUrl: courseThumbnailDraftDataUrl,
      thumbnailFileName: courseThumbnailDraftFileMeta?.name,
      thumbnailFileType: courseThumbnailDraftFileMeta?.type,
    }),
    [
      completionMessage,
      courseForm,
      courseThumbnailDraftDataUrl,
      courseThumbnailDraftFileMeta?.name,
      courseThumbnailDraftFileMeta?.type,
    ],
  );
  const {
    status: courseDraftStatus,
    setStatus: setCourseDraftStatus,
    clearDraft: clearCourseDraft,
  } = useAdminLocalDraft({
    draftKey,
    value: draftValue,
    enabled: hasInitializedDraft,
  });

  useEffect(() => {
    if (hasInitializedDraft) return;
    const draft = readAdminDraft<CourseDetailDraft>(draftKey);
    if (draft) {
      setCourseForm(draft.courseForm);
      setCompletionMessage(draft.completionMessage);
      setResetState({
        courseForm: draft.courseForm,
        completionMessage: draft.completionMessage,
      });
      setCourseThumbnailDraftDataUrl(draft.thumbnailDataUrl);
      if (draft.thumbnailFileName || draft.thumbnailFileType) {
        setCourseThumbnailDraftFileMeta({
          name: draft.thumbnailFileName ?? 'thumbnail',
          type: draft.thumbnailFileType ?? 'image/png',
        });
      }
      setCourseDraftStatus('restored');
      setHasInitializedDraft(true);
      return;
    }

    if (isCreateMode) {
      setResetState({
        courseForm: emptyCourseForm,
        completionMessage: '',
      });
      setHasInitializedDraft(true);
      return;
    }

    if (!courseDetailQuery.data) return;

    const initialCourseForm = toAdminCourseFormValues(courseDetailQuery.data);
    setCourseForm(initialCourseForm);
    setResetState((prev) => ({
      ...prev,
      courseForm: initialCourseForm,
    }));
    setCourseFormTouchedFields({});
    setCourseThumbnailDraftDataUrl(undefined);
    setCourseThumbnailDraftFileMeta(undefined);
    setHasInitializedDraft(true);
  }, [
    courseDetailQuery.data,
    draftKey,
    hasInitializedDraft,
    isCreateMode,
    setCourseDraftStatus,
  ]);

  useEffect(() => {
    if (!hasInitializedDraft) return;
    if (readAdminDraft<CourseDetailDraft>(draftKey)) return;
    const nextCompletionMessage = completionMessageQuery.data?.message ?? '';
    setCompletionMessage(nextCompletionMessage);
    setResetState((prev) => ({
      ...prev,
      completionMessage: nextCompletionMessage,
    }));
  }, [completionMessageQuery.data?.message, draftKey, hasInitializedDraft]);

  useEffect(() => {
    if (!courseThumbnailFile) {
      setCourseThumbnailPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(courseThumbnailFile);
    setCourseThumbnailPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [courseThumbnailFile]);

  const updateCourseFormField = <FieldName extends keyof AdminCourseFormValues>(
    field: FieldName,
    value: AdminCourseFormValues[FieldName],
  ) => {
    setCourseForm((prev) => ({ ...prev, [field]: value }));
    setCourseFormTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const isCourseFormLocked =
    (!isCreateMode && !hasInitializedDraft) ||
    isUploadingCourseThumbnail ||
    createCourseMutation.isPending ||
    updateCourseMutation.isPending;

  const handleChangeCourseThumbnail = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;

    if (file.size > ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE) {
      useToastStore
        .getState()
        .showToast('이미지는 10MB 이하로 첨부해주세요.', 'info');
      return;
    }

    setCourseThumbnailFile(file);
    setCourseFormTouchedFields((prev) => ({ ...prev, thumbnailUrl: true }));
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      if (typeof fileReader.result !== 'string') return;
      setCourseThumbnailDraftDataUrl(fileReader.result);
      setCourseThumbnailDraftFileMeta({ name: file.name, type: file.type });
    });
    fileReader.readAsDataURL(file);
  };

  const dataUrlToFile = async (
    dataUrl: string,
    fileName: string,
    type: string,
  ) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return new File([blob], fileName, { type: type || blob.type });
  };

  const handleSubmitCourse = async () => {
    if (isCourseFormLocked) return;
    const basePayload = toAdminCoursePayload(courseForm);
    if (!basePayload.slug || !basePayload.title) {
      useToastStore.getState().showToast('Slug와 제목을 입력해주세요.', 'info');
      return;
    }
    const courseValidationError =
      getAdminCoursePayloadValidationError(basePayload);
    if (courseValidationError) {
      useToastStore.getState().showToast(courseValidationError, 'info');
      return;
    }
    const trimmedCompletionMessage = completionMessage.trim();
    const hasPendingThumbnailUpload = Boolean(
      courseThumbnailFile || courseThumbnailDraftDataUrl,
    );
    const hasCompletionMessageChanged =
      completionMessage !== resetState.completionMessage;
    const hasAttemptedToClearCompletionMessage =
      !trimmedCompletionMessage &&
      hasCompletionMessageChanged &&
      resetState.completionMessage.trim().length > 0;

    if (hasAttemptedToClearCompletionMessage) {
      useToastStore
        .getState()
        .showToast(
          '완주 메시지는 비워서 저장할 수 없습니다. 새 문구를 입력하거나 기존 값을 유지해주세요.',
          'info',
        );
      return;
    }

    if (hasCompletionMessageChanged && trimmedCompletionMessage) {
      const completionMessageValidationError =
        getAdminCompletionMessageValidationError(completionMessage);
      if (completionMessageValidationError) {
        useToastStore
          .getState()
          .showToast(completionMessageValidationError, 'info');
        return;
      }
    }

    let uploadedThumbnailUrl = basePayload.thumbnailUrl;
    if (hasPendingThumbnailUpload) {
      setIsUploadingCourseThumbnail(true);
      try {
        const thumbnailFile =
          courseThumbnailFile ??
          (courseThumbnailDraftDataUrl
            ? await dataUrlToFile(
                courseThumbnailDraftDataUrl,
                courseThumbnailDraftFileMeta?.name ?? 'thumbnail.png',
                courseThumbnailDraftFileMeta?.type ?? 'image/png',
              )
            : undefined);
        if (!thumbnailFile) return;
        uploadedThumbnailUrl = await uploadAdminCourseImage(thumbnailFile);
      } finally {
        setIsUploadingCourseThumbnail(false);
      }
    }

    const payload = { ...basePayload, thumbnailUrl: uploadedThumbnailUrl };
    if (isCreateMode) {
      const response = await createCourseMutation.mutateAsync(payload);
      if (hasCompletionMessageChanged && trimmedCompletionMessage) {
        await upsertCompletionMessageMutation.mutateAsync({
          courseId: response.courseId,
          request: { message: trimmedCompletionMessage },
        });
      }
      clearCourseDraft();
      setCourseForm(emptyCourseForm);
      setCourseThumbnailFile(null);
      setCourseThumbnailDraftDataUrl(undefined);
      setCourseThumbnailDraftFileMeta(undefined);
      router.push(`/admin/courses/${response.courseId}`);
      return;
    }

    if (!courseId) return;
    const request = toAdminCourseUpdateRequest({
      basePayload: payload,
      touchedFields: {
        ...courseFormTouchedFields,
        thumbnailUrl:
          courseFormTouchedFields.thumbnailUrl || hasPendingThumbnailUpload,
      },
    });
    await updateCourseMutation.mutateAsync({ courseId, request });
    if (hasCompletionMessageChanged && trimmedCompletionMessage) {
      await upsertCompletionMessageMutation.mutateAsync({
        courseId,
        request: { message: trimmedCompletionMessage },
      });
    }
    const nextCourseForm = {
      ...courseForm,
      thumbnailUrl: uploadedThumbnailUrl,
    };
    clearCourseDraft();
    setCourseThumbnailFile(null);
    setCourseThumbnailDraftDataUrl(undefined);
    setCourseThumbnailDraftFileMeta(undefined);
    setCourseForm(nextCourseForm);
    setCompletionMessage(trimmedCompletionMessage);
    setCourseFormTouchedFields({});
    setResetState({
      courseForm: nextCourseForm,
      completionMessage: trimmedCompletionMessage,
    });
  };

  const handleSaveCompletionMessage = () => {
    if (!courseId) return;
    const validationError =
      getAdminCompletionMessageValidationError(completionMessage);
    if (validationError) {
      useToastStore.getState().showToast(validationError, 'info');
      return;
    }

    upsertCompletionMessageMutation.mutate({
      courseId,
      request: { message: completionMessage },
    });
  };

  return (
    <main className="flex flex-col gap-200 p-200">
      <header className="sticky top-0 z-10 bg-background-default flex items-center justify-between gap-200 py-100">
        <div>
          <p className="font-designer-13r text-text-subtle">코스 관리</p>
          <h1 className="font-designer-24b text-text-default">
            {isCreateMode
              ? '새 코스 등록'
              : selectedCourse?.title || '코스 상세/편집'}
          </h1>
        </div>
        <div className="flex gap-75">
          <Button asChild color="outlined" size="small">
            <Link href="/admin/courses">취소</Link>
          </Button>
          {!isCreateMode && courseId && (
            <Button asChild color="secondary" size="small">
              <Link href={`/admin/courses/${courseId}/lessons`}>레슨 관리</Link>
            </Button>
          )}
          <Button
            size="small"
            disabled={isCourseFormLocked}
            loading={isCourseFormLocked}
            onClick={handleSubmitCourse}
          >
            {isCreateMode ? '코스 생성' : '변경사항 저장'}
          </Button>
        </div>
      </header>

      {!isCreateMode && !selectedCourse && !coursesQuery.isLoading && (
        <div className="border-border-default rounded-150 border p-200">
          <p className="font-designer-14r text-text-subtle">
            코스 목록 메타 정보를 아직 불러오지 못했습니다. 상세 편집은 코스
            상세 조회 응답 기준으로 계속 진행할 수 있습니다.
          </p>
        </div>
      )}

      {!isCreateMode && courseDetailQuery.isLoading && !hasInitializedDraft && (
        <div className="border-border-default rounded-150 border p-200">
          <p className="font-designer-14r text-text-subtle">
            코스 상세 정보를 불러오는 중입니다.
          </p>
        </div>
      )}

      {!isCreateMode && courseDetailQuery.isError && !hasInitializedDraft && (
        <div className="border-border-error rounded-150 border p-200">
          <p className="font-designer-14r text-text-default">
            코스 상세 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.
          </p>
        </div>
      )}

      <section className="grid min-h-screen grid-cols-2 gap-200">
        <div className="border-border-default bg-background-default rounded-150 min-h-screen border p-200">
          <div className="mb-150">
            <h2 className="font-designer-20b text-text-default">
              코스 정보 편집
            </h2>
            <p className="font-designer-13r text-text-subtle mt-50">
              코스 판매/노출 정보를 수정합니다. count 값은 입력하지 않습니다.
            </p>
          </div>
          {!isCreateMode && !hasInitializedDraft ? (
            <div className="font-designer-14r text-text-subtle flex min-h-screen items-center justify-center">
              코스 편집 폼을 준비하는 중입니다.
            </div>
          ) : (
            <AdminCourseFormContent
              courseForm={courseForm}
              courseFormMode={isCreateMode ? 'create' : 'edit'}
              courseThumbnailFileName={
                courseThumbnailFile?.name || courseThumbnailDraftFileMeta?.name
              }
              courseThumbnailHasFile={Boolean(
                courseThumbnailFile || courseThumbnailDraftDataUrl,
              )}
              courseThumbnailPreviewUrl={
                courseThumbnailPreviewUrl ||
                courseThumbnailDraftDataUrl ||
                courseForm.thumbnailUrl ||
                undefined
              }
              courseThumbnailStatusText={
                courseThumbnailFile?.name ||
                courseThumbnailDraftFileMeta?.name ||
                (courseForm.thumbnailUrl
                  ? '현재 저장된 썸네일 이미지가 있습니다.'
                  : '선택된 파일이 없습니다.')
              }
              courseThumbnailDisplayWidth={courseThumbnailDisplayWidth}
              handleChangeCourseThumbnail={handleChangeCourseThumbnail}
              handleClearCourseThumbnailSelection={() => {
                setCourseThumbnailFile(null);
                setCourseThumbnailDraftDataUrl(undefined);
                setCourseThumbnailDraftFileMeta(undefined);
                setCourseFormTouchedFields((prev) => ({
                  ...prev,
                  thumbnailUrl: true,
                }));
              }}
              handleSubmitCourse={handleSubmitCourse}
              isCourseFormLocked={isCourseFormLocked}
              isUploadingCourseThumbnail={isUploadingCourseThumbnail}
              onChangeCourseThumbnailDisplayWidth={
                setCourseThumbnailDisplayWidth
              }
              resetCourseForm={() => {
                setCourseForm(
                  isCreateMode ? emptyCourseForm : resetState.courseForm,
                );
                setCompletionMessage(
                  isCreateMode ? '' : resetState.completionMessage,
                );
                setCourseFormTouchedFields({});
                setCourseThumbnailFile(null);
                setCourseThumbnailDraftDataUrl(undefined);
                setCourseThumbnailDraftFileMeta(undefined);
                setCourseThumbnailDisplayWidth(
                  COURSE_THUMBNAIL_DEFAULT_DISPLAY_WIDTH,
                );
                clearCourseDraft();
              }}
              statusOptions={COURSE_STATUS_OPTIONS}
              thumbnailAccept={COURSE_THUMBNAIL_INPUT_ACCEPT}
              updateCourseFormField={updateCourseFormField}
            />
          )}

          <div className="border-border-subtle mt-200 border-t pt-150">
            <p className="font-designer-13r text-text-subtle mb-100">
              자동 임시저장:{' '}
              {courseDraftStatus === 'saving'
                ? '저장 중...'
                : courseDraftStatus === 'restored'
                  ? '임시저장본 복구됨'
                  : courseDraftStatus === 'saved'
                    ? '임시저장됨'
                    : '대기 중'}
            </p>
            <AdminCourseField
              label="완주 메시지"
              helper="코스 완료 후 수강생에게 표시하는 선택 문구입니다. 200자 이내로 짧게 관리합니다."
            >
              <AdminCourseCompletionMessageContent
                completionMessage={completionMessage}
                completionMessageHydrating={completionMessageQuery.isLoading}
                completionMessageUpdatedAt={
                  completionMessageQuery.data?.updatedAt
                }
                effectiveCourseId={courseId}
                formatDateTime={formatDateTime}
                onChangeCompletionMessage={setCompletionMessage}
                onSaveCompletionMessage={handleSaveCompletionMessage}
                upsertCompletionMessagePending={
                  upsertCompletionMessageMutation.isPending
                }
              />
            </AdminCourseField>
          </div>

          {!isCreateMode && courseId && (
            <div className="mt-200">
              <AdminCoursePlanManagement courseId={courseId} />
            </div>
          )}
        </div>

        <CoursePreviewPanel
          completionMessage={completionMessage}
          courseForm={courseForm}
          thumbnailPreviewUrl={
            courseThumbnailPreviewUrl ||
            courseThumbnailDraftDataUrl ||
            courseForm.thumbnailUrl ||
            undefined
          }
        />
      </section>
    </main>
  );
}
