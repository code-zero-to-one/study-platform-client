import type {
  CompleteStudyProgressStatus,
  StudyProgressStatus,
} from '@/types/api/interview.types';

interface StudyProgressOption<T extends string> {
  label: string;
  value: T;
}

export const STUDY_PROGRESS_OPTIONS = [
  { label: '시작 전', value: 'PENDING' },
  { label: '불참', value: 'ABSENT' },
  { label: '진행중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'COMPLETE' },
] as const satisfies ReadonlyArray<StudyProgressOption<StudyProgressStatus>>;

export const STUDY_DONE_PROGRESS_OPTIONS = [
  { label: '불참', value: 'ABSENT' },
  { label: '완료', value: 'COMPLETE' },
] as const satisfies ReadonlyArray<
  StudyProgressOption<CompleteStudyProgressStatus>
>;

const LOCKED_STUDY_DONE_PROGRESS_OPTIONS = {
  ABSENT: [STUDY_DONE_PROGRESS_OPTIONS[0]],
  COMPLETE: [STUDY_DONE_PROGRESS_OPTIONS[1]],
} as const;

export const getStudyDoneProgressOptions = (
  currentStatus: StudyProgressStatus,
) => {
  if (currentStatus === 'ABSENT') {
    return LOCKED_STUDY_DONE_PROGRESS_OPTIONS.ABSENT;
  }

  if (currentStatus === 'COMPLETE') {
    return LOCKED_STUDY_DONE_PROGRESS_OPTIONS.COMPLETE;
  }

  return STUDY_DONE_PROGRESS_OPTIONS;
};
