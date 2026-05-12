'use client';
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AdminCourseCompletionMessageContent,
  AdminCourseFormContent,
} from '@/components/admin/courses/admin-course-form-sections';
import {
  AdminCourseListContent,
  AdminCourseOverviewContent,
} from '@/components/admin/courses/admin-course-overview-sections';
import {
  AdminLessonBuilderFeedContent,
  AdminLessonManagementContent,
  AdminLessonQnaContent,
  AdminLessonRetrospectivesContent,
} from '@/components/admin/courses/admin-lesson-management-sections';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import { uploadAdminCourseImage } from '@/features/admin/course-management/model/admin-course-image-upload';
import type {
  AdminBuilderFeedCurationRequest,
  AdminCourseFormValues,
  AdminCourseStatus,
  AdminCourseSummary,
  AdminLessonBulkUpdateRequest,
  AdminLessonSummary,
  AdminLessonUpsertRequest,
} from '@/features/admin/course-management/model/admin-course-management-contract';
import {
  useAdminAutoCourseSelection,
  useAdminBuilderFeedDraftSync,
  useAdminCompletionMessageSync,
  useAdminLessonContextResetSync,
  useAdminLessonHydrationSync,
  useAdminPendingCourseSelectionSync,
  useAdminQnaSelectionSync,
  useAdminStatusFilterResetSync,
} from '@/features/admin/course-management/model/admin-course-management-effects';
import { getAdminCourseManagementLocks } from '@/features/admin/course-management/model/admin-course-management-locks';
import {
  ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE,
  normalizeAdminCourseMarkdownContent,
} from '@/features/admin/course-management/model/admin-course-markdown';
import {
  getAdminLessonPayloadValidationError,
  toAdminCoursePayload,
  toAdminCourseUpdateRequest,
  toAdminLessonPayload,
  useAdminCompletionMessageQuery,
  useAdminCourseLessonsQuery,
  useAdminCoursesQuery,
  useBulkUpdateAdminLessonsMutation,
  useAdminLessonDetailQuery,
  useAdminLessonBuilderFeedsQuery,
  useAdminLessonQnaDetailQuery,
  useAdminLessonQnasQuery,
  useAdminLessonRetrospectivesQuery,
  useCreateAdminLessonQnaAnswerMutation,
  useUpdateAdminBuilderFeedCurationMutation,
  useCreateAdminCourseMutation,
  useCreateAdminLessonMutation,
  useDeleteAdminCourseMutation,
  useDeleteAdminLessonMutation,
  useReorderAdminLessonsMutation,
  useUpdateAdminCourseMutation,
  useUpdateAdminLessonMutation,
  useUpsertAdminCompletionMessageMutation,
} from '@/features/admin/course-management/model/use-admin-course-management-query';
import { useToastStore } from '@/stores/use-toast-store';

const COURSE_STATUS_OPTIONS: Array<{
  value: AdminCourseStatus;
  label: string;
  color: 'green' | 'orange' | 'gray';
}> = [
  { value: 'OPEN', label: '공개', color: 'green' },
  { value: 'COMING_SOON', label: '오픈 예정', color: 'orange' },
  { value: 'HIDDEN', label: '비공개', color: 'gray' },
];

const COURSE_THUMBNAIL_INPUT_ACCEPT =
  ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.map(
    (extension) => `.${extension}`,
  ).join(',');
const COURSE_THUMBNAIL_DEFAULT_DISPLAY_WIDTH = 560;

const emptyCourseForm: AdminCourseFormValues = {
  slug: '',
  title: '',
  cardHeadline: '',
  cardSummary: '',
  cardTags: '',
  regularPrice: '',
  discountPrice: '',
  description: '',
  thumbnailUrl: '',
  status: 'COMING_SOON',
  durationDays: '',
  earlyBirdEndsAt: null,
};

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

const getStatusMeta = (status: AdminCourseStatus) =>
  COURSE_STATUS_OPTIONS.find((option) => option.value === status) ??
  COURSE_STATUS_OPTIONS[2];

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const toKstOffsetDateTime = (value: string) => {
  if (!value) return undefined;

  return `${value}:00+09:00`;
};

const Section = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      'border-border-default bg-background-default rounded-150 border p-200',
      className,
    )}
  >
    <div className="mb-150">
      <h2 className="font-designer-20b text-text-default">{title}</h2>
      {description && (
        <p className="font-designer-14r text-text-subtle mt-50">
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
);

const CourseStatusBadge = ({ status }: { status: AdminCourseStatus }) => {
  const meta = getStatusMeta(status);

  return (
    <Badge color={meta.color} shape="rectangle">
      {meta.label}
    </Badge>
  );
};

export default function AdminCourseManagementPageClient() {
  const [statusFilter, setStatusFilter] = useState<AdminCourseStatus | ''>('');
  const [page, setPage] = useState(1);
  const [courseSearch, setCourseSearch] = useState('');
  const [lessonSearch, setLessonSearch] = useState('');
  const [lessonPublishedFilter, setLessonPublishedFilter] = useState<
    'ALL' | 'PUBLISHED' | 'UNPUBLISHED'
  >('ALL');
  const [lessonAccessFilter, setLessonAccessFilter] = useState<
    'ALL' | 'FREE' | 'PAID'
  >('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState<
    number | undefined
  >();
  const [pendingSelectedCourseId, setPendingSelectedCourseId] = useState<
    number | undefined
  >();
  const [selectedLessonIds, setSelectedLessonIds] = useState<number[]>([]);
  const [courseFormMode, setCourseFormMode] = useState<'create' | 'edit'>(
    'create',
  );
  const [editingCourseId, setEditingCourseId] = useState<number | undefined>();
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
  const [isUploadingCourseThumbnail, setIsUploadingCourseThumbnail] =
    useState(false);
  const [courseThumbnailDisplayWidth, setCourseThumbnailDisplayWidth] =
    useState(COURSE_THUMBNAIL_DEFAULT_DISPLAY_WIDTH);
  const [lessonFormMode, setLessonFormMode] = useState<'create' | 'edit'>(
    'create',
  );
  const [editingLessonId, setEditingLessonId] = useState<number | undefined>();
  const [selectedQnaId, setSelectedQnaId] = useState<number | undefined>();
  const [qnaAnswerContent, setQnaAnswerContent] = useState('');
  const [builderFeedOrderDrafts, setBuilderFeedOrderDrafts] = useState<
    Record<number, string>
  >({});
  const builderFeedOrderSourceValuesRef = useRef<Record<number, string>>({});
  const [isAwaitingBuilderFeedRefresh, setIsAwaitingBuilderFeedRefresh] =
    useState(false);
  const [lessonForm, setLessonForm] =
    useState<AdminLessonUpsertRequest>(emptyLessonForm);
  const [lessonEditorResetVersion, setLessonEditorResetVersion] = useState(0);
  const [hydratedLessonId, setHydratedLessonId] = useState<number | undefined>(
    undefined,
  );
  const [hydratedLessonSnapshot, setHydratedLessonSnapshot] = useState('');
  const [completionMessage, setCompletionMessage] = useState('');
  const [
    hydratedCompletionMessageCourseId,
    setHydratedCompletionMessageCourseId,
  ] = useState<number | undefined>(undefined);
  const currentEffectiveCourseIdRef = useRef<number | undefined>(undefined);
  const preserveCourseSelectionOnFilterResetRef = useRef(false);
  const suppressNextAutoCourseSelectionRef = useRef(false);
  const completionMessageSourceRef = useRef<{
    courseId?: number;
    message: string;
  }>({
    message: '',
  });
  const currentCompletionMessageRef = useRef('');
  const currentSelectedQnaIdRef = useRef<number | undefined>(undefined);
  const currentQnaAnswerContentRef = useRef('');
  const showInfoToast = useCallback((message: string) => {
    useToastStore.getState().showToast(message, 'info');
  }, []);

  const courseParams = useMemo(
    () => ({
      status: statusFilter || undefined,
      page: page - 1,
      size: 20,
    }),
    [page, statusFilter],
  );

  const coursesQuery = useAdminCoursesQuery(courseParams);
  const visibleCourses = useMemo(
    () => coursesQuery.data?.content ?? [],
    [coursesQuery.data?.content],
  );

  const filteredCourses = useMemo(() => {
    const keyword = courseSearch.trim().toLowerCase();
    const courses = visibleCourses;
    if (!keyword) return courses;

    return courses.filter((course) =>
      [course.title, course.slug].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [courseSearch, visibleCourses]);

  const selectedCourse = visibleCourses.find(
    (course) => course.courseId === selectedCourseId,
  );
  const effectiveCourseId = selectedCourse?.courseId ?? selectedCourseId;
  const totalCoursePages = Math.max(coursesQuery.data?.totalPages ?? 1, 1);
  const isSelectedCourseHiddenBySearch =
    Boolean(courseSearch.trim()) &&
    Boolean(selectedCourse) &&
    !filteredCourses.some(
      (course) => course.courseId === selectedCourse.courseId,
    );

  const lessonsQuery = useAdminCourseLessonsQuery(effectiveCourseId);
  const filteredLessons = useMemo(() => {
    const keyword = lessonSearch.trim().toLowerCase();
    const lessons = lessonsQuery.data ?? [];

    return lessons.filter((lesson) => {
      const matchKeyword =
        !keyword ||
        [lesson.title, `${lesson.chapterNumber}-${lesson.lessonNumber}`].some(
          (value) => value.toLowerCase().includes(keyword),
        );
      const matchPublished =
        lessonPublishedFilter === 'ALL' ||
        (lessonPublishedFilter === 'PUBLISHED' && lesson.isPublished) ||
        (lessonPublishedFilter === 'UNPUBLISHED' && !lesson.isPublished);
      const matchAccess =
        lessonAccessFilter === 'ALL' ||
        (lessonAccessFilter === 'FREE' && lesson.isFree) ||
        (lessonAccessFilter === 'PAID' && !lesson.isFree);

      return matchKeyword && matchPublished && matchAccess;
    });
  }, [
    lessonAccessFilter,
    lessonPublishedFilter,
    lessonSearch,
    lessonsQuery.data,
  ]);
  const lessonDetailQuery = useAdminLessonDetailQuery(editingLessonId);
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
  const lessonQnasQuery = useAdminLessonQnasQuery(editingLessonId);
  const lessonRetrospectivesQuery =
    useAdminLessonRetrospectivesQuery(editingLessonId);
  const lessonBuilderFeedsQuery =
    useAdminLessonBuilderFeedsQuery(editingLessonId);
  const qnaDetailQuery = useAdminLessonQnaDetailQuery(selectedQnaId);
  const completionMessageQuery =
    useAdminCompletionMessageQuery(effectiveCourseId);

  const createCourseMutation = useCreateAdminCourseMutation();
  const updateCourseMutation = useUpdateAdminCourseMutation();
  const deleteCourseMutation = useDeleteAdminCourseMutation();
  const createLessonMutation = useCreateAdminLessonMutation();
  const updateLessonMutation = useUpdateAdminLessonMutation();
  const deleteLessonMutation = useDeleteAdminLessonMutation();
  const bulkUpdateLessonsMutation = useBulkUpdateAdminLessonsMutation();
  const reorderLessonsMutation = useReorderAdminLessonsMutation();
  const createLessonQnaAnswerMutation = useCreateAdminLessonQnaAnswerMutation();
  const updateBuilderFeedCurationMutation =
    useUpdateAdminBuilderFeedCurationMutation();
  const upsertCompletionMessageMutation =
    useUpsertAdminCompletionMessageMutation();
  useAdminPendingCourseSelectionSync({
    coursesFetching: coursesQuery.isFetching,
    pendingSelectedCourseId,
    setPendingSelectedCourseId,
    setSelectedCourseId,
    showInfoToast,
    suppressNextAutoCourseSelectionRef,
    visibleCourseIds: visibleCourses.map((course) => course.courseId),
  });

  useAdminAutoCourseSelection({
    coursesFetching: coursesQuery.isFetching,
    pendingSelectedCourseId,
    selectedCourseId,
    setSelectedCourseId,
    suppressNextAutoCourseSelectionRef,
    visibleCourseIds: visibleCourses.map((course) => course.courseId),
  });

  useAdminStatusFilterResetSync({
    preserveCourseSelectionOnFilterResetRef,
    setPage,
    setSelectedCourseId,
    statusFilter,
  });

  useEffect(() => {
    if (page <= totalCoursePages) {
      return;
    }

    setPage(totalCoursePages);
  }, [page, totalCoursePages]);

  useAdminLessonContextResetSync({
    effectiveCourseId,
    setBuilderFeedOrderDrafts,
    setEditingLessonId,
    setHydratedLessonId,
    setHydratedLessonSnapshot,
    setLessonEditorResetVersion,
    setLessonForm,
    setLessonFormMode,
    setQnaAnswerContent,
    setSelectedLessonIds,
    setSelectedQnaId,
  });

  useAdminCompletionMessageSync({
    completionMessage,
    completionMessageData: completionMessageQuery.data,
    completionMessageSourceRef,
    currentCompletionMessageRef,
    currentEffectiveCourseIdRef,
    effectiveCourseId,
    hydratedCompletionMessageCourseId,
    setCompletionMessage,
    setHydratedCompletionMessageCourseId,
  });

  useAdminLessonHydrationSync({
    hydratedLessonSnapshot,
    lessonDetail: lessonDetailQuery.data
      ? {
          ...lessonDetailQuery.data,
          content: lessonDetailQuery.data.content,
        }
      : undefined,
    lessonDetailSnapshot,
    lessonFormMode,
    setHydratedLessonId,
    setHydratedLessonSnapshot,
    setLessonForm,
  });

  useAdminQnaSelectionSync({
    currentQnaAnswerContentRef,
    currentSelectedQnaIdRef,
    qnaAnswerContent,
    qnas: lessonQnasQuery.data?.qnas ?? [],
    qnasFetching: lessonQnasQuery.isFetching,
    selectedQnaId,
    setQnaAnswerContent,
    setSelectedQnaId,
  });

  useAdminBuilderFeedDraftSync({
    builderFeedOrderSourceValuesRef,
    editingLessonId,
    feeds: lessonBuilderFeedsQuery.data?.feeds ?? [],
    isAwaitingBuilderFeedRefresh,
    lessonBuilderFeedsFetching: lessonBuilderFeedsQuery.isFetching,
    setBuilderFeedOrderDrafts,
    setIsAwaitingBuilderFeedRefresh,
    updateBuilderFeedCurationPending:
      updateBuilderFeedCurationMutation.isPending,
  });

  useEffect(() => {
    setSelectedLessonIds((prev) => {
      const nextSelectedLessonIds = prev.filter((lessonId) =>
        filteredLessons.some((lesson) => lesson.lessonId === lessonId),
      );

      return nextSelectedLessonIds.length === prev.length
        ? prev
        : nextSelectedLessonIds;
    });
  }, [filteredLessons]);

  useEffect(() => {
    if (
      lessonFormMode !== 'create' ||
      typeof editingLessonId === 'number' ||
      lessonForm.title ||
      lessonForm.content ||
      lessonForm.chapterNumber !== emptyLessonForm.chapterNumber ||
      lessonForm.lessonNumber !== emptyLessonForm.lessonNumber ||
      lessonForm.estimatedMinutes !== emptyLessonForm.estimatedMinutes ||
      lessonForm.retrospectivePurpose !==
        emptyLessonForm.retrospectivePurpose ||
      lessonForm.isFree !== emptyLessonForm.isFree ||
      lessonForm.isPublished !== emptyLessonForm.isPublished
    ) {
      return;
    }

    const suggestedLessonNumber = (lessonsQuery.data?.length ?? 0) + 1;
    if (lessonForm.lessonNumber === suggestedLessonNumber) {
      return;
    }

    setLessonForm((prev) => ({
      ...prev,
      lessonNumber: suggestedLessonNumber,
    }));
  }, [editingLessonId, lessonForm, lessonFormMode, lessonsQuery.data]);

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

  const clearPendingCourseSelection = useCallback(() => {
    setPendingSelectedCourseId(undefined);
  }, []);

  const revealCourseInAllStatusFilter = useCallback(
    (courseId: number, nextStatus: AdminCourseStatus) => {
      if (!statusFilter || statusFilter === nextStatus) {
        return;
      }

      preserveCourseSelectionOnFilterResetRef.current = true;
      setPendingSelectedCourseId(courseId);
      setStatusFilter('');
    },
    [statusFilter],
  );

  const resetCourseForm = useCallback(
    ({
      preservePendingSelection = false,
    }: {
      preservePendingSelection?: boolean;
    } = {}) => {
      setCourseFormMode('create');
      setEditingCourseId(undefined);
      setCourseForm(emptyCourseForm);
      setCourseFormTouchedFields({});
      setCourseThumbnailFile(null);
      setCourseThumbnailPreviewUrl(null);
      setCourseThumbnailDisplayWidth(COURSE_THUMBNAIL_DEFAULT_DISPLAY_WIDTH);
      if (!preservePendingSelection) {
        clearPendingCourseSelection();
      }
    },
    [clearPendingCourseSelection],
  );
  const isCourseFormLocked =
    isUploadingCourseThumbnail ||
    createCourseMutation.isPending ||
    updateCourseMutation.isPending;

  const handleSelectCourse = (courseId: number) => {
    if (
      isCourseFormLocked ||
      createLessonMutation.isPending ||
      updateLessonMutation.isPending ||
      deleteLessonMutation.isPending ||
      bulkUpdateLessonsMutation.isPending ||
      reorderLessonsMutation.isPending ||
      updateBuilderFeedCurationMutation.isPending ||
      createLessonQnaAnswerMutation.isPending ||
      upsertCompletionMessageMutation.isPending
    ) {
      return;
    }

    clearPendingCourseSelection();
    setSelectedCourseId(courseId);
  };

  useEffect(() => {
    if (
      courseFormMode !== 'edit' ||
      !editingCourseId ||
      pendingSelectedCourseId
    ) {
      return;
    }

    if (editingCourseId === selectedCourseId) {
      return;
    }

    resetCourseForm();
  }, [
    courseFormMode,
    editingCourseId,
    pendingSelectedCourseId,
    resetCourseForm,
    selectedCourseId,
  ]);

  const resetLessonForm = ({
    nextLessonNumber = (lessonsQuery.data?.length ?? 0) + 1,
  }: {
    nextLessonNumber?: number;
  } = {}) => {
    setLessonFormMode('create');
    setEditingLessonId(undefined);
    setHydratedLessonId(undefined);
    setHydratedLessonSnapshot('');
    setSelectedQnaId(undefined);
    setQnaAnswerContent('');
    setLessonEditorResetVersion((prev) => prev + 1);
    setLessonForm({
      ...emptyLessonForm,
      lessonNumber: nextLessonNumber,
    });
  };

  const handleEditCourse = (course: AdminCourseSummary) => {
    if (
      isCourseFormLocked ||
      createLessonMutation.isPending ||
      updateLessonMutation.isPending ||
      deleteLessonMutation.isPending ||
      bulkUpdateLessonsMutation.isPending ||
      reorderLessonsMutation.isPending ||
      updateBuilderFeedCurationMutation.isPending ||
      createLessonQnaAnswerMutation.isPending ||
      upsertCompletionMessageMutation.isPending
    ) {
      return;
    }

    clearPendingCourseSelection();
    setCourseFormMode('edit');
    setEditingCourseId(course.courseId);
    setSelectedCourseId(course.courseId);
    setCourseFormTouchedFields({});
    setCourseThumbnailFile(null);
    setCourseThumbnailPreviewUrl(null);
    setCourseForm({
      ...emptyCourseForm,
      slug: course.slug,
      title: course.title,
      status: course.status,
    });
  };

  const handleChangeCourseThumbnail = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    const fileExtension =
      selectedFile.name.split('.').pop()?.toLowerCase() ?? '';
    if (
      !ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.includes(
        fileExtension as (typeof ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS)[number],
      )
    ) {
      useToastStore
        .getState()
        .showToast(
          'jpg, jpeg, png, webp, gif, heic, heif 형식만 업로드할 수 있습니다.',
          'info',
        );
      return;
    }

    if (selectedFile.size > ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE) {
      useToastStore
        .getState()
        .showToast('썸네일 이미지는 5MB 이하만 업로드할 수 있습니다.', 'info');
      return;
    }

    setCourseThumbnailFile(selectedFile);
    setCourseFormTouchedFields((prev) => ({ ...prev, thumbnailUrl: true }));
  };

  const handleClearCourseThumbnailSelection = () => {
    setCourseThumbnailFile(null);
    setCourseThumbnailPreviewUrl(null);
    setCourseFormTouchedFields((prev) => {
      if (!prev.thumbnailUrl) {
        return prev;
      }

      const next = { ...prev };
      delete next.thumbnailUrl;
      return next;
    });
  };

  const handleSubmitCourse = async () => {
    if (isCourseFormLocked) {
      return;
    }

    if (courseFormMode === 'create' && !courseThumbnailFile) {
      useToastStore
        .getState()
        .showToast('코스 썸네일 이미지를 첨부해주세요.', 'info');
      return;
    }

    let uploadedThumbnailUrl = courseForm.thumbnailUrl;

    if (courseThumbnailFile) {
      try {
        setIsUploadingCourseThumbnail(true);
        uploadedThumbnailUrl =
          await uploadAdminCourseImage(courseThumbnailFile);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '코스 이미지를 업로드하지 못했습니다. 다시 시도해주세요.';
        useToastStore.getState().showToast(message, 'error');
        return;
      } finally {
        setIsUploadingCourseThumbnail(false);
      }
    }

    const payload = toAdminCoursePayload({
      ...courseForm,
      thumbnailUrl: uploadedThumbnailUrl,
    });

    if (courseFormMode === 'create') {
      try {
        const response = await createCourseMutation.mutateAsync(payload);
        setPendingSelectedCourseId(response.courseId);
        setCourseSearch('');
        setStatusFilter('');
        setPage(1);
        resetCourseForm({ preservePendingSelection: true });
      } catch {
        return;
      }
      return;
    }

    if (!editingCourseId) return;

    const updateRequest = toAdminCourseUpdateRequest({
      basePayload: {
        ...payload,
        thumbnailUrl: courseThumbnailFile
          ? uploadedThumbnailUrl
          : payload.thumbnailUrl,
      },
      touchedFields: courseFormTouchedFields,
    });

    if (Object.keys(updateRequest).length === 0) {
      useToastStore.getState().showToast('수정한 항목이 없습니다.', 'info');
      return;
    }

    try {
      await updateCourseMutation.mutateAsync({
        courseId: editingCourseId,
        request: updateRequest,
      });
    } catch {
      return;
    }

    if (courseFormTouchedFields.status) {
      revealCourseInAllStatusFilter(editingCourseId, payload.status);
    }

    setCourseThumbnailFile(null);
    setCourseThumbnailPreviewUrl(null);
    setCourseForm((prev) => ({
      ...prev,
      thumbnailUrl: uploadedThumbnailUrl,
    }));
    setCourseFormTouchedFields({});
  };

  const handleDeleteCourse = (course: AdminCourseSummary) => {
    if (deleteCourseMutation.isPending) return;

    const confirmed = window.confirm(
      `${course.title} 코스를 삭제할까요? 수강 이력이 있으면 실제 삭제되지 않고 비공개 처리됩니다.`,
    );
    if (!confirmed) return;

    deleteCourseMutation.mutate(course.courseId, {
      onSuccess: (response) => {
        if (response.deleted) {
          if (
            selectedCourseId === course.courseId ||
            editingCourseId === course.courseId
          ) {
            setSelectedCourseId(undefined);
            resetCourseForm();
            resetLessonForm();
          }
          return;
        }

        if (response.status === 'HIDDEN') {
          preserveCourseSelectionOnFilterResetRef.current = true;
          setPendingSelectedCourseId(course.courseId);

          if (statusFilter && statusFilter !== 'HIDDEN') {
            setStatusFilter('');
          }
        }

        if (
          courseFormMode === 'edit' &&
          editingCourseId === course.courseId &&
          response.status
        ) {
          setCourseForm((prev) => ({
            ...prev,
            status: response.status ?? prev.status,
          }));
        }
      },
    });
  };

  const handleEditLesson = (lesson: AdminLessonSummary) => {
    if (
      createLessonMutation.isPending ||
      updateLessonMutation.isPending ||
      updateBuilderFeedCurationMutation.isPending ||
      createLessonQnaAnswerMutation.isPending ||
      isAwaitingBuilderFeedRefresh ||
      (lessonFormMode === 'edit' &&
        typeof editingLessonId === 'number' &&
        hydratedLessonId !== editingLessonId)
    ) {
      return;
    }

    setLessonFormMode('edit');
    setEditingLessonId(lesson.lessonId);
    setHydratedLessonId(undefined);
    setHydratedLessonSnapshot('');
    setSelectedQnaId(undefined);
    setQnaAnswerContent('');
    setLessonEditorResetVersion((prev) => prev + 1);
    setLessonForm({
      chapterNumber: lesson.chapterNumber,
      lessonNumber: lesson.lessonNumber,
      title: lesson.title,
      description: '',
      content: '',
      estimatedMinutes: 30,
      retrospectivePurpose: lesson.retrospectivePurpose,
      isFree: lesson.isFree,
      isPublished: lesson.isPublished,
    });
  };

  const handleSubmitLesson = () => {
    if (
      !effectiveCourseId ||
      createLessonMutation.isPending ||
      updateLessonMutation.isPending
    ) {
      return;
    }
    const payload = toAdminLessonPayload(lessonForm);
    const validationError = getAdminLessonPayloadValidationError(payload);

    if (validationError) {
      useToastStore.getState().showToast(validationError, 'info');
      return;
    }

    if (lessonFormMode === 'create') {
      createLessonMutation.mutate(
        { courseId: effectiveCourseId, request: payload },
        {
          onSuccess: () =>
            resetLessonForm({
              nextLessonNumber: (lessonsQuery.data?.length ?? 0) + 2,
            }),
        },
      );
      return;
    }

    if (!editingLessonId) return;
    updateLessonMutation.mutate(
      {
        courseId: effectiveCourseId,
        lessonId: editingLessonId,
        request: {
          chapterNumber: payload.chapterNumber || undefined,
          lessonNumber: payload.lessonNumber || undefined,
          title: payload.title,
          description: '',
          content: payload.content,
          estimatedMinutes: payload.estimatedMinutes || undefined,
          retrospectivePurpose: payload.retrospectivePurpose,
          isFree: payload.isFree,
          isPublished: payload.isPublished,
        },
      },
      { onSuccess: () => resetLessonForm() },
    );
  };

  const {
    isCompletionMessageHydrating,
    isCourseSelectionLocked,
    isLessonContextLocked,
    isLessonDetailHydrating,
    isLessonFormLocked,
    isLessonListInteractionLocked,
    isLessonMutationPending,
  } = getAdminCourseManagementLocks({
    bulkUpdateLessonsPending: bulkUpdateLessonsMutation.isPending,
    courseFormMode,
    createCoursePending: createCourseMutation.isPending,
    createLessonPending: createLessonMutation.isPending,
    createLessonQnaAnswerPending: createLessonQnaAnswerMutation.isPending,
    deleteLessonPending: deleteLessonMutation.isPending,
    editingCourseId,
    editingLessonId,
    effectiveCourseId,
    hasSelectedCourse: Boolean(selectedCourse),
    hydratedCompletionMessageCourseId,
    hydratedLessonId,
    isAwaitingBuilderFeedRefresh,
    isUploadingCourseThumbnail,
    lessonFormMode,
    reorderLessonsPending: reorderLessonsMutation.isPending,
    selectedCourseId: selectedCourse?.courseId,
    upsertCompletionMessagePending: upsertCompletionMessageMutation.isPending,
    updateBuilderFeedCurationPending:
      updateBuilderFeedCurationMutation.isPending,
    updateCoursePending: updateCourseMutation.isPending,
    updateLessonPending: updateLessonMutation.isPending,
  });

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

  const handleDeleteLesson = (lesson: AdminLessonSummary) => {
    if (!effectiveCourseId || isLessonListInteractionLocked) return;
    const confirmed = window.confirm(
      `${lesson.title} 레슨을 삭제할까요? 수강 이력이 있으면 실제 삭제되지 않고 비게시 처리됩니다.`,
    );
    if (!confirmed) return;

    deleteLessonMutation.mutate(
      {
        courseId: effectiveCourseId,
        lessonId: lesson.lessonId,
      },
      {
        onSuccess: (response) => {
          if (response.deleted) {
            if (editingLessonId === lesson.lessonId) {
              resetLessonForm();
            }
            return;
          }

          if (
            lessonFormMode === 'edit' &&
            editingLessonId === lesson.lessonId &&
            typeof response.isPublished === 'boolean'
          ) {
            setLessonForm((prev) => ({
              ...prev,
              isPublished: response.isPublished,
            }));
          }
        },
      },
    );
  };

  const handleToggleLessonSelection = (lessonId: number) => {
    if (isLessonListInteractionLocked) return;
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId],
    );
  };

  const handleToggleSelectAllLessons = () => {
    if (isLessonListInteractionLocked) return;
    if (filteredLessons.length === 0) return;
    const filteredLessonIds = filteredLessons.map((lesson) => lesson.lessonId);
    const allSelected = filteredLessonIds.every((lessonId) =>
      selectedLessonIds.includes(lessonId),
    );

    setSelectedLessonIds((prev) =>
      allSelected
        ? prev.filter((lessonId) => !filteredLessonIds.includes(lessonId))
        : Array.from(new Set([...prev, ...filteredLessonIds])),
    );
  };

  const handleBulkLessonUpdate = (
    request: Omit<AdminLessonBulkUpdateRequest, 'lessonIds'>,
    confirmMessage: string,
  ) => {
    if (
      !effectiveCourseId ||
      selectedLessonIds.length === 0 ||
      isLessonListInteractionLocked
    ) {
      return;
    }
    if (!window.confirm(confirmMessage)) return;

    bulkUpdateLessonsMutation.mutate(
      {
        courseId: effectiveCourseId,
        request: {
          lessonIds: selectedLessonIds,
          ...request,
        },
      },
      {
        onSuccess: () => {
          setSelectedLessonIds([]);

          if (
            typeof editingLessonId === 'number' &&
            selectedLessonIds.includes(editingLessonId)
          ) {
            setLessonForm((prev) => ({
              ...prev,
              isFree: request.isFree ?? prev.isFree,
              isPublished: request.isPublished ?? prev.isPublished,
            }));
          }
        },
      },
    );
  };

  const handleMoveLesson = (lessonId: number, direction: -1 | 1) => {
    if (
      !effectiveCourseId ||
      !lessonsQuery.data ||
      isLessonListInteractionLocked
    ) {
      return;
    }
    const currentIndex = lessonsQuery.data.findIndex(
      (lesson) => lesson.lessonId === lessonId,
    );
    const nextIndex = currentIndex + direction;
    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= lessonsQuery.data.length
    ) {
      return;
    }

    const nextLessons = [...lessonsQuery.data];
    const [target] = nextLessons.splice(currentIndex, 1);
    nextLessons.splice(nextIndex, 0, target);

    reorderLessonsMutation.mutate(
      {
        courseId: effectiveCourseId,
        request: {
          orderedLessonIds: nextLessons.map((lesson) => lesson.lessonId),
        },
      },
      {
        onSuccess: () => {
          if (typeof editingLessonId === 'number') {
            setHydratedLessonId(undefined);
            setHydratedLessonSnapshot('');
          }
        },
      },
    );
  };

  const handleSaveCompletionMessage = () => {
    if (!effectiveCourseId || upsertCompletionMessageMutation.isPending) return;

    const courseId = effectiveCourseId;
    const submittedMessage = completionMessage;
    upsertCompletionMessageMutation.mutate(
      {
        courseId,
        request: { message: submittedMessage },
      },
      {
        onSuccess: (response) => {
          if (currentEffectiveCourseIdRef.current !== courseId) {
            return;
          }

          const nextMessage = response.message ?? '';
          if (currentCompletionMessageRef.current === submittedMessage) {
            setCompletionMessage(nextMessage);
          }
          setHydratedCompletionMessageCourseId(courseId);
          completionMessageSourceRef.current = {
            courseId,
            message: nextMessage,
          };
        },
      },
    );
  };

  const handleCopySlug = async (slug: string) => {
    if (!navigator?.clipboard) return;

    try {
      await navigator.clipboard.writeText(slug);
      useToastStore.getState().showToast('slug를 복사했습니다.', 'success');
    } catch {
      useToastStore.getState().showToast('slug 복사에 실패했습니다.', 'error');
    }
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
    if (!editingLessonId) return;
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
        lessonId: editingLessonId,
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

  const selectedQna = qnaDetailQuery.data;
  const isLessonListFiltered =
    lessonSearch.trim().length > 0 ||
    lessonPublishedFilter !== 'ALL' ||
    lessonAccessFilter !== 'ALL';
  const lessonSummaries = lessonsQuery.data ?? [];
  const publishedLessonCount = lessonSummaries.filter(
    (lesson) => lesson.isPublished,
  ).length;
  const freeLessonCount = lessonSummaries.filter(
    (lesson) => lesson.isFree,
  ).length;
  const allFilteredLessonsSelected =
    filteredLessons.length > 0 &&
    filteredLessons.every((lesson) =>
      selectedLessonIds.includes(lesson.lessonId),
    );

  return (
    <main className="flex flex-col gap-200 p-200">
      <div className="flex items-start justify-between gap-200">
        <div>
          <h1 className="font-designer-24b text-text-default">클래스 관리</h1>
          <p className="font-designer-14r text-text-subtle mt-75">
            코스 공개 상태, 레슨 구성, 돌아보기 목적, 완주 메시지를 관리자 API
            기준으로 관리합니다.
          </p>
        </div>
        <Button
          color="outlined"
          size="small"
          disabled={isCourseSelectionLocked}
          onClick={() => resetCourseForm()}
        >
          새 코스 입력
        </Button>
      </div>

      <Section
        title="운영 요약"
        description={
          selectedCourse
            ? `${selectedCourse.title} 기준 운영 상태판입니다.`
            : '코스를 선택하면 운영 요약을 확인할 수 있습니다.'
        }
      >
        <AdminCourseOverviewContent
          builderFeedCount={lessonBuilderFeedsQuery.data?.feeds.length ?? 0}
          editingLessonId={editingLessonId}
          freeLessonCount={freeLessonCount}
          lessonCount={lessonSummaries.length}
          publishedLessonCount={publishedLessonCount}
          qnaCount={lessonQnasQuery.data?.totalCount ?? 0}
          retrospectiveCount={
            lessonRetrospectivesQuery.data?.retrospectives.length ?? 0
          }
          selectedCourse={selectedCourse}
          selectedStatusLabel={
            selectedCourse ? getStatusMeta(selectedCourse.status).label : '-'
          }
        />
      </Section>

      <Section
        title="코스 목록"
        description="코스는 제목 중심으로 선택하고 slug는 보조 식별자로만 확인합니다. 관리자 운영은 목록/버튼 중심으로 진행합니다."
      >
        <AdminCourseListContent
          courseSearch={courseSearch}
          coursesLoading={coursesQuery.isLoading}
          deleteCoursePending={deleteCourseMutation.isPending}
          filteredCourses={filteredCourses}
          formatDateTime={formatDateTime}
          isCourseSelectionLocked={isCourseSelectionLocked}
          isSelectedCourseHiddenBySearch={isSelectedCourseHiddenBySearch}
          onCopySlug={handleCopySlug}
          onDeleteCourse={handleDeleteCourse}
          onEditCourse={handleEditCourse}
          onResetCourseSearch={() => setCourseSearch('')}
          onSelectCourse={handleSelectCourse}
          onSetCourseSearch={setCourseSearch}
          onSetPage={setPage}
          onSetStatusFilter={setStatusFilter}
          page={page}
          renderCourseStatusBadge={(status) => (
            <CourseStatusBadge status={status} />
          )}
          selectedCourseId={selectedCourseId}
          statusFilter={statusFilter}
          statusOptions={COURSE_STATUS_OPTIONS}
          totalCourses={coursesQuery.data?.totalElements ?? 0}
          totalPages={coursesQuery.data?.totalPages ?? 1}
          visibleCourses={visibleCourses}
        />
      </Section>

      <div className="grid grid-cols-2 gap-200">
        <Section
          title={courseFormMode === 'create' ? '코스 생성' : '코스 수정'}
          description={
            courseFormMode === 'create'
              ? 'slug는 URL 식별자이지만 관리 흐름은 목록/버튼으로 진행합니다.'
              : '현재 코스 상세 조회 API가 없어 수정한 필드만 부분 반영합니다. 비어 보이는 칸이 기존 운영값 없음이라는 뜻은 아닙니다.'
          }
        >
          <AdminCourseFormContent
            courseForm={courseForm}
            courseFormMode={courseFormMode}
            courseThumbnailFileName={courseThumbnailFile?.name}
            courseThumbnailHasFile={Boolean(courseThumbnailFile)}
            courseThumbnailPreviewUrl={
              courseThumbnailPreviewUrl || courseForm.thumbnailUrl || undefined
            }
            courseThumbnailStatusText={
              courseThumbnailFile?.name ||
              (courseForm.thumbnailUrl
                ? '현재 저장된 썸네일 이미지가 있습니다.'
                : '선택된 파일이 없습니다.')
            }
            courseThumbnailDisplayWidth={courseThumbnailDisplayWidth}
            handleChangeCourseThumbnail={handleChangeCourseThumbnail}
            handleClearCourseThumbnailSelection={
              handleClearCourseThumbnailSelection
            }
            handleSubmitCourse={handleSubmitCourse}
            isCourseFormLocked={isCourseFormLocked}
            isUploadingCourseThumbnail={isUploadingCourseThumbnail}
            onChangeCourseThumbnailDisplayWidth={setCourseThumbnailDisplayWidth}
            resetCourseForm={() => resetCourseForm()}
            statusOptions={COURSE_STATUS_OPTIONS}
            thumbnailAccept={COURSE_THUMBNAIL_INPUT_ACCEPT}
            toDateTimeLocal={toDateTimeLocal}
            toKstOffsetDateTime={toKstOffsetDateTime}
            updateCourseFormField={updateCourseFormField}
          />
        </Section>

        <Section
          title="완주 메시지"
          description={
            selectedCourse
              ? `${selectedCourse.title} 완주 페이지에 노출할 운영자 메시지입니다.`
              : '코스를 선택하면 완주 메시지를 관리할 수 있습니다.'
          }
        >
          <AdminCourseCompletionMessageContent
            completionMessage={completionMessage}
            completionMessageHydrating={isCompletionMessageHydrating}
            completionMessageUpdatedAt={completionMessageQuery.data?.updatedAt}
            effectiveCourseId={effectiveCourseId}
            formatDateTime={formatDateTime}
            onChangeCompletionMessage={setCompletionMessage}
            onSaveCompletionMessage={handleSaveCompletionMessage}
            upsertCompletionMessagePending={
              upsertCompletionMessageMutation.isPending
            }
          />
        </Section>
      </div>

      <Section
        title="레슨 관리"
        description={
          selectedCourse
            ? `${selectedCourse.title}의 챕터/레슨, 돌아보기 목적, 무료 공개, 게시 상태를 관리합니다.`
            : '코스를 선택하면 레슨 목록이 표시됩니다.'
        }
      >
        <AdminLessonManagementContent
          allFilteredLessonsSelected={allFilteredLessonsSelected}
          bulkUpdateLessonsMutationPending={bulkUpdateLessonsMutation.isPending}
          createLessonMutationPending={isLessonMutationPending}
          deleteLessonMutationPending={deleteLessonMutation.isPending}
          editingLessonId={editingLessonId}
          effectiveCourseId={effectiveCourseId}
          filteredLessons={filteredLessons}
          formatDateTime={formatDateTime}
          handleBulkLessonUpdate={handleBulkLessonUpdate}
          handleDeleteLesson={handleDeleteLesson}
          handleEditLesson={handleEditLesson}
          handleMoveLesson={handleMoveLesson}
          handleSubmitLesson={handleSubmitLesson}
          handleToggleLessonSelection={handleToggleLessonSelection}
          handleToggleSelectAllLessons={handleToggleSelectAllLessons}
          isLessonContextLocked={isLessonContextLocked}
          isLessonDetailHydrating={isLessonDetailHydrating}
          isLessonFormLocked={isLessonFormLocked}
          isLessonListFiltered={isLessonListFiltered}
          isLessonListInteractionLocked={isLessonListInteractionLocked}
          lessonAccessFilter={lessonAccessFilter}
          lessonDetailQueryIsFetching={lessonDetailQuery.isFetching}
          lessonEditorStateKey={
            lessonFormMode === 'edit' && editingLessonId
              ? `edit:${hydratedLessonId ?? editingLessonId}:${lessonEditorResetVersion}`
              : `create:${lessonEditorResetVersion}`
          }
          lessonForm={lessonForm}
          lessonFormMode={lessonFormMode}
          lessonPublishedFilter={lessonPublishedFilter}
          lessonSearch={lessonSearch}
          lessonsQueryIsLoading={lessonsQuery.isLoading}
          reorderLessonsMutationPending={reorderLessonsMutation.isPending}
          resetLessonForm={() => resetLessonForm()}
          selectedLessonIds={selectedLessonIds}
          setLessonAccessFilter={setLessonAccessFilter}
          setLessonForm={setLessonForm}
          setLessonPublishedFilter={setLessonPublishedFilter}
          setLessonSearch={setLessonSearch}
          updateLessonMutationPending={updateLessonMutation.isPending}
        />
      </Section>

      <Section
        title="레슨 돌아보기 제출 목록"
        description={
          editingLessonId
            ? '선택한 레슨에 실제로 제출된 인증/결과물/주관식 답변을 확인합니다.'
            : '레슨 돌아보기를 보려면 먼저 위에서 레슨 수정 버튼을 눌러 대상 레슨을 선택하세요.'
        }
      >
        <AdminLessonRetrospectivesContent
          editingLessonId={editingLessonId}
          formatDateTime={formatDateTime}
          lessonRetrospectives={lessonRetrospectivesQuery.data?.retrospectives}
          lessonRetrospectivesLoading={lessonRetrospectivesQuery.isLoading}
        />
      </Section>

      <Section
        title="Builder Feed 운영"
        description={
          editingLessonId
            ? '선택한 레슨의 결과물 피드를 보고 operator pick / showcase 노출 순서를 관리합니다.'
            : 'Builder Feed 운영을 하려면 먼저 위에서 레슨 수정 버튼을 눌러 대상 레슨을 선택하세요.'
        }
      >
        <AdminLessonBuilderFeedContent
          builderFeedOrderDrafts={builderFeedOrderDrafts}
          editingLessonId={editingLessonId}
          feeds={lessonBuilderFeedsQuery.data?.feeds}
          formatDateTime={formatDateTime}
          handleToggleBuilderFeedCuration={handleToggleBuilderFeedCuration}
          isAwaitingBuilderFeedRefresh={isAwaitingBuilderFeedRefresh}
          isLoading={lessonBuilderFeedsQuery.isLoading}
          setBuilderFeedOrderDrafts={setBuilderFeedOrderDrafts}
        />
      </Section>

      <Section
        title="레슨 QnA 관리"
        description={
          editingLessonId
            ? '선택한 레슨의 질문을 확인하고 관리자 답변을 남깁니다. 숨김/비게시 레슨도 admin API로 확인합니다.'
            : '레슨 QnA를 보려면 먼저 위에서 레슨 수정 버튼을 눌러 대상 레슨을 선택하세요.'
        }
      >
        <AdminLessonQnaContent
          answerMutationPending={createLessonQnaAnswerMutation.isPending}
          editingLessonId={editingLessonId}
          formatDateTime={formatDateTime}
          handleSubmitQnaAnswer={handleSubmitQnaAnswer}
          qnaAnswerContent={qnaAnswerContent}
          qnaCount={lessonQnasQuery.data?.totalCount ?? 0}
          qnaDetailLoading={qnaDetailQuery.isLoading}
          qnaListLoading={lessonQnasQuery.isLoading}
          qnas={lessonQnasQuery.data?.qnas}
          selectedQna={selectedQna}
          selectedQnaId={selectedQnaId}
          setQnaAnswerContent={setQnaAnswerContent}
          setSelectedQnaId={setSelectedQnaId}
        />
      </Section>
    </main>
  );
}
