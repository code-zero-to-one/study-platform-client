import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useEffect,
} from 'react';
import type { AdminLessonUpsertRequest } from '@/features/admin/course-management/model/admin-course-management-contract';
import { normalizeAdminCourseMarkdownContent } from '@/features/admin/course-management/model/admin-course-markdown';

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

type StateSetter<T> = Dispatch<SetStateAction<T>>;

export const useAdminPendingCourseSelectionSync = ({
  coursesFetching,
  pendingSelectedCourseId,
  setPendingSelectedCourseId,
  setSelectedCourseId,
  showInfoToast,
  suppressNextAutoCourseSelectionRef,
  visibleCourseIds,
}: {
  coursesFetching: boolean;
  pendingSelectedCourseId?: number;
  setPendingSelectedCourseId: StateSetter<number | undefined>;
  setSelectedCourseId: StateSetter<number | undefined>;
  showInfoToast: (message: string) => void;
  suppressNextAutoCourseSelectionRef: MutableRefObject<boolean>;
  visibleCourseIds: number[];
}) => {
  useEffect(() => {
    if (!pendingSelectedCourseId) {
      return;
    }

    if (visibleCourseIds.includes(pendingSelectedCourseId)) {
      setSelectedCourseId(pendingSelectedCourseId);
      setPendingSelectedCourseId(undefined);
      return;
    }

    if (coursesFetching) {
      return;
    }

    suppressNextAutoCourseSelectionRef.current = true;
    setSelectedCourseId(undefined);
    showInfoToast(
      '방금 생성한 코스를 현재 목록에서 찾지 못했습니다. 검색어나 페이지를 확인해주세요.',
    );
    setPendingSelectedCourseId(undefined);
  }, [
    coursesFetching,
    pendingSelectedCourseId,
    setPendingSelectedCourseId,
    setSelectedCourseId,
    showInfoToast,
    suppressNextAutoCourseSelectionRef,
    visibleCourseIds,
  ]);
};

export const useAdminAutoCourseSelection = ({
  coursesFetching,
  pendingSelectedCourseId,
  selectedCourseId,
  setSelectedCourseId,
  suppressNextAutoCourseSelectionRef,
  visibleCourseIds,
}: {
  coursesFetching: boolean;
  pendingSelectedCourseId?: number;
  selectedCourseId?: number;
  setSelectedCourseId: StateSetter<number | undefined>;
  suppressNextAutoCourseSelectionRef: MutableRefObject<boolean>;
  visibleCourseIds: number[];
}) => {
  useEffect(() => {
    if (pendingSelectedCourseId) {
      return;
    }

    if (suppressNextAutoCourseSelectionRef.current) {
      suppressNextAutoCourseSelectionRef.current = false;
      return;
    }

    if (coursesFetching && visibleCourseIds.length === 0) {
      return;
    }

    if (visibleCourseIds.length === 0) {
      setSelectedCourseId(undefined);
      return;
    }

    if (selectedCourseId && visibleCourseIds.includes(selectedCourseId)) {
      return;
    }

    setSelectedCourseId(visibleCourseIds[0]);
  }, [
    coursesFetching,
    pendingSelectedCourseId,
    selectedCourseId,
    setSelectedCourseId,
    suppressNextAutoCourseSelectionRef,
    visibleCourseIds,
  ]);
};

export const useAdminStatusFilterResetSync = ({
  preserveCourseSelectionOnFilterResetRef,
  setPage,
  setSelectedCourseId,
  statusFilter,
}: {
  preserveCourseSelectionOnFilterResetRef: MutableRefObject<boolean>;
  setPage: StateSetter<number>;
  setSelectedCourseId: StateSetter<number | undefined>;
  statusFilter: string;
}) => {
  useEffect(() => {
    if (preserveCourseSelectionOnFilterResetRef.current) {
      preserveCourseSelectionOnFilterResetRef.current = false;
      return;
    }

    setPage(1);
    setSelectedCourseId(undefined);
  }, [
    preserveCourseSelectionOnFilterResetRef,
    setPage,
    setSelectedCourseId,
    statusFilter,
  ]);
};

export const useAdminLessonContextResetSync = ({
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
}: {
  effectiveCourseId?: number;
  setBuilderFeedOrderDrafts: StateSetter<Record<number, string>>;
  setEditingLessonId: StateSetter<number | undefined>;
  setHydratedLessonId: StateSetter<number | undefined>;
  setHydratedLessonSnapshot: StateSetter<string>;
  setLessonEditorResetVersion: StateSetter<number>;
  setLessonForm: StateSetter<AdminLessonUpsertRequest>;
  setLessonFormMode: StateSetter<'create' | 'edit'>;
  setQnaAnswerContent: StateSetter<string>;
  setSelectedLessonIds: StateSetter<number[]>;
  setSelectedQnaId: StateSetter<number | undefined>;
}) => {
  useEffect(() => {
    setSelectedLessonIds([]);
  }, [effectiveCourseId, setSelectedLessonIds]);

  useEffect(() => {
    setLessonFormMode('create');
    setEditingLessonId(undefined);
    setHydratedLessonId(undefined);
    setHydratedLessonSnapshot('');
    setSelectedQnaId(undefined);
    setQnaAnswerContent('');
    setBuilderFeedOrderDrafts({});
    setLessonEditorResetVersion((prev) => prev + 1);
    setLessonForm({
      ...emptyLessonForm,
      lessonNumber: 1,
    });
  }, [
    effectiveCourseId,
    setBuilderFeedOrderDrafts,
    setEditingLessonId,
    setHydratedLessonId,
    setHydratedLessonSnapshot,
    setLessonEditorResetVersion,
    setLessonForm,
    setLessonFormMode,
    setQnaAnswerContent,
    setSelectedQnaId,
  ]);
};

export const useAdminCompletionMessageSync = ({
  completionMessage,
  completionMessageData,
  completionMessageSourceRef,
  currentCompletionMessageRef,
  currentEffectiveCourseIdRef,
  effectiveCourseId,
  hydratedCompletionMessageCourseId,
  setCompletionMessage,
  setHydratedCompletionMessageCourseId,
}: {
  completionMessage: string;
  completionMessageData?: { message?: string };
  completionMessageSourceRef: MutableRefObject<{
    courseId?: number;
    message: string;
  }>;
  currentCompletionMessageRef: MutableRefObject<string>;
  currentEffectiveCourseIdRef: MutableRefObject<number | undefined>;
  effectiveCourseId?: number;
  hydratedCompletionMessageCourseId?: number;
  setCompletionMessage: StateSetter<string>;
  setHydratedCompletionMessageCourseId: StateSetter<number | undefined>;
}) => {
  useEffect(() => {
    currentEffectiveCourseIdRef.current = effectiveCourseId;
  }, [currentEffectiveCourseIdRef, effectiveCourseId]);

  useEffect(() => {
    currentCompletionMessageRef.current = completionMessage;
  }, [completionMessage, currentCompletionMessageRef]);

  useEffect(() => {
    if (effectiveCourseId) {
      setCompletionMessage('');
    }
    setHydratedCompletionMessageCourseId(undefined);
    completionMessageSourceRef.current = {
      courseId: effectiveCourseId,
      message: '',
    };
  }, [
    completionMessageSourceRef,
    effectiveCourseId,
    setCompletionMessage,
    setHydratedCompletionMessageCourseId,
  ]);

  useEffect(() => {
    if (!effectiveCourseId) {
      setCompletionMessage('');
      setHydratedCompletionMessageCourseId(undefined);
      completionMessageSourceRef.current = { courseId: undefined, message: '' };
      return;
    }

    if (!completionMessageData) {
      return;
    }

    const serverMessage = completionMessageData.message ?? '';
    const previousSource = completionMessageSourceRef.current;
    const shouldSyncLocalValue =
      hydratedCompletionMessageCourseId !== effectiveCourseId ||
      (previousSource.courseId === effectiveCourseId &&
        completionMessage === previousSource.message);

    if (shouldSyncLocalValue) {
      setCompletionMessage(serverMessage);
    }

    completionMessageSourceRef.current = {
      courseId: effectiveCourseId,
      message: serverMessage,
    };
    setHydratedCompletionMessageCourseId(effectiveCourseId);
  }, [
    completionMessage,
    completionMessageData,
    completionMessageSourceRef,
    effectiveCourseId,
    hydratedCompletionMessageCourseId,
    setCompletionMessage,
    setHydratedCompletionMessageCourseId,
  ]);
};

export const useAdminLessonHydrationSync = ({
  hydratedLessonSnapshot,
  lessonDetail,
  lessonDetailSnapshot,
  lessonFormMode,
  setHydratedLessonId,
  setHydratedLessonSnapshot,
  setLessonForm,
}: {
  hydratedLessonSnapshot: string;
  lessonDetail?: AdminLessonUpsertRequest & { lessonId: number };
  lessonDetailSnapshot: string;
  lessonFormMode: 'create' | 'edit';
  setHydratedLessonId: StateSetter<number | undefined>;
  setHydratedLessonSnapshot: StateSetter<string>;
  setLessonForm: StateSetter<AdminLessonUpsertRequest>;
}) => {
  useEffect(() => {
    if (!lessonDetail || lessonFormMode !== 'edit') {
      return;
    }

    if (hydratedLessonSnapshot === lessonDetailSnapshot) {
      return;
    }

    setLessonForm({
      chapterNumber: lessonDetail.chapterNumber,
      lessonNumber: lessonDetail.lessonNumber,
      title: lessonDetail.title,
      content: normalizeAdminCourseMarkdownContent(lessonDetail.content),
      estimatedMinutes: lessonDetail.estimatedMinutes,
      retrospectivePurpose: lessonDetail.retrospectivePurpose,
      isFree: lessonDetail.isFree,
      isPublished: lessonDetail.isPublished,
    });
    setHydratedLessonId(lessonDetail.lessonId);
    setHydratedLessonSnapshot(lessonDetailSnapshot);
  }, [
    hydratedLessonSnapshot,
    lessonDetail,
    lessonDetailSnapshot,
    lessonFormMode,
    setHydratedLessonId,
    setHydratedLessonSnapshot,
    setLessonForm,
  ]);
};

export const useAdminQnaSelectionSync = ({
  currentQnaAnswerContentRef,
  currentSelectedQnaIdRef,
  qnaAnswerContent,
  qnas,
  qnasFetching,
  selectedQnaId,
  setQnaAnswerContent,
  setSelectedQnaId,
}: {
  currentQnaAnswerContentRef: MutableRefObject<string>;
  currentSelectedQnaIdRef: MutableRefObject<number | undefined>;
  qnaAnswerContent: string;
  qnas: Array<{
    qnaId: number;
  }>;
  qnasFetching: boolean;
  selectedQnaId?: number;
  setQnaAnswerContent: StateSetter<string>;
  setSelectedQnaId: StateSetter<number | undefined>;
}) => {
  useEffect(() => {
    currentSelectedQnaIdRef.current = selectedQnaId;
  }, [currentSelectedQnaIdRef, selectedQnaId]);

  useEffect(() => {
    currentQnaAnswerContentRef.current = qnaAnswerContent;
  }, [currentQnaAnswerContentRef, qnaAnswerContent]);

  useEffect(() => {
    if (qnasFetching && qnas.length === 0) {
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
  }, [qnas, qnasFetching, selectedQnaId, setSelectedQnaId]);

  useEffect(() => {
    setQnaAnswerContent('');
  }, [selectedQnaId, setQnaAnswerContent]);
};

export const useAdminBuilderFeedDraftSync = ({
  builderFeedOrderSourceValuesRef,
  editingLessonId,
  feeds,
  isAwaitingBuilderFeedRefresh,
  lessonBuilderFeedsFetching,
  setBuilderFeedOrderDrafts,
  setIsAwaitingBuilderFeedRefresh,
  updateBuilderFeedCurationPending,
}: {
  builderFeedOrderSourceValuesRef: MutableRefObject<Record<number, string>>;
  editingLessonId?: number;
  feeds: Array<{
    feedId: number;
    featuredOrder?: number;
  }>;
  isAwaitingBuilderFeedRefresh: boolean;
  lessonBuilderFeedsFetching: boolean;
  setBuilderFeedOrderDrafts: StateSetter<Record<number, string>>;
  setIsAwaitingBuilderFeedRefresh: StateSetter<boolean>;
  updateBuilderFeedCurationPending: boolean;
}) => {
  useEffect(() => {
    if (!editingLessonId || feeds.length === 0) {
      setBuilderFeedOrderDrafts({});
      builderFeedOrderSourceValuesRef.current = {};
      setIsAwaitingBuilderFeedRefresh(false);
      return;
    }

    const nextSourceValues = Object.fromEntries(
      feeds.map((feed) => [
        feed.feedId,
        feed.featuredOrder ? String(feed.featuredOrder) : '',
      ]),
    );

    setBuilderFeedOrderDrafts((prevDrafts) => {
      const nextDrafts: Record<number, string> = {};

      feeds.forEach((feed) => {
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
  }, [
    builderFeedOrderSourceValuesRef,
    editingLessonId,
    feeds,
    setBuilderFeedOrderDrafts,
    setIsAwaitingBuilderFeedRefresh,
  ]);

  useEffect(() => {
    if (
      !isAwaitingBuilderFeedRefresh ||
      updateBuilderFeedCurationPending ||
      lessonBuilderFeedsFetching
    ) {
      return;
    }

    setIsAwaitingBuilderFeedRefresh(false);
  }, [
    isAwaitingBuilderFeedRefresh,
    lessonBuilderFeedsFetching,
    setIsAwaitingBuilderFeedRefresh,
    updateBuilderFeedCurationPending,
  ]);
};
