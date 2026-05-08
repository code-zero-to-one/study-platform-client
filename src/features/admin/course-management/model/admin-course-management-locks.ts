interface AdminCourseManagementLockInputs {
  courseFormMode: 'create' | 'edit';
  createCoursePending: boolean;
  createLessonPending: boolean;
  createLessonQnaAnswerPending: boolean;
  deleteLessonPending: boolean;
  editingCourseId?: number;
  editingLessonId?: number;
  effectiveCourseId?: number;
  hydratedCompletionMessageCourseId?: number;
  hydratedLessonId?: number;
  isAwaitingBuilderFeedRefresh: boolean;
  isUploadingCourseThumbnail: boolean;
  reorderLessonsPending: boolean;
  selectedCourseId?: number;
  upsertCompletionMessagePending: boolean;
  updateBuilderFeedCurationPending: boolean;
  updateCoursePending: boolean;
  updateLessonPending: boolean;
  bulkUpdateLessonsPending: boolean;
  hasSelectedCourse: boolean;
  lessonFormMode: 'create' | 'edit';
}

export interface AdminCourseManagementLocks {
  isCompletionMessageHydrating: boolean;
  isCourseFormLocked: boolean;
  isCourseSelectionLocked: boolean;
  isLessonContextLocked: boolean;
  isLessonDetailHydrating: boolean;
  isLessonFormLocked: boolean;
  isLessonListInteractionLocked: boolean;
  isLessonMutationPending: boolean;
  isQuickCourseStatusChangeEnabled: boolean;
}

export const getAdminCourseManagementLocks = ({
  bulkUpdateLessonsPending,
  courseFormMode,
  createCoursePending,
  createLessonPending,
  createLessonQnaAnswerPending,
  deleteLessonPending,
  editingCourseId,
  editingLessonId,
  effectiveCourseId,
  hasSelectedCourse,
  hydratedCompletionMessageCourseId,
  hydratedLessonId,
  isAwaitingBuilderFeedRefresh,
  isUploadingCourseThumbnail,
  lessonFormMode,
  reorderLessonsPending,
  selectedCourseId,
  upsertCompletionMessagePending,
  updateBuilderFeedCurationPending,
  updateCoursePending,
  updateLessonPending,
}: AdminCourseManagementLockInputs): AdminCourseManagementLocks => {
  const isCourseFormLocked =
    isUploadingCourseThumbnail || createCoursePending || updateCoursePending;
  const isLessonMutationPending = createLessonPending || updateLessonPending;
  const isLessonDetailHydrating =
    lessonFormMode === 'edit' &&
    typeof editingLessonId === 'number' &&
    hydratedLessonId !== editingLessonId;
  const isLessonFormLocked = isLessonDetailHydrating || isLessonMutationPending;
  const isLessonContextLocked =
    isLessonFormLocked ||
    updateBuilderFeedCurationPending ||
    createLessonQnaAnswerPending ||
    isAwaitingBuilderFeedRefresh;
  const isLessonListInteractionLocked =
    isLessonContextLocked ||
    deleteLessonPending ||
    bulkUpdateLessonsPending ||
    reorderLessonsPending;

  return {
    isCompletionMessageHydrating:
      typeof effectiveCourseId === 'number' &&
      hydratedCompletionMessageCourseId !== effectiveCourseId,
    isCourseFormLocked,
    isCourseSelectionLocked:
      isCourseFormLocked ||
      isLessonMutationPending ||
      deleteLessonPending ||
      bulkUpdateLessonsPending ||
      reorderLessonsPending ||
      updateBuilderFeedCurationPending ||
      createLessonQnaAnswerPending ||
      upsertCompletionMessagePending,
    isLessonContextLocked,
    isLessonDetailHydrating,
    isLessonFormLocked,
    isLessonListInteractionLocked,
    isLessonMutationPending,
    isQuickCourseStatusChangeEnabled:
      courseFormMode === 'edit' &&
      hasSelectedCourse &&
      editingCourseId === selectedCourseId,
  };
};
