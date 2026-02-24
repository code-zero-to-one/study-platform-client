import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MentorScreeningRecord,
  UpsertMentorScreeningParams,
} from '@/types/mentoring-admin';

interface MentorScreeningState {
  recordsByMentorId: Record<number, MentorScreeningRecord>;
  hasHydrated: boolean;
  upsertRecord: (payload: UpsertMentorScreeningParams) => void;
  clearRecord: (mentorId: number) => void;
  reset: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type PersistedState = Pick<MentorScreeningState, 'recordsByMentorId'>;

export const DEFAULT_MENTOR_SCREENING_RECORD: MentorScreeningRecord = {
  status: 'PENDING',
};

export const useMentorScreeningStore = create<MentorScreeningState>()(
  persist(
    (set): MentorScreeningState => ({
      recordsByMentorId: {},
      hasHydrated: false,
      upsertRecord: ({
        mentorId,
        status,
        note,
        startedAt,
        startedByMemberId,
        reviewedAt,
        reviewedByMemberId,
      }) => {
        const trimmedNote = note?.trim();
        const normalizedNote =
          trimmedNote && trimmedNote.length > 0 ? trimmedNote : undefined;
        const nowIso = new Date().toISOString();

        set((state) => ({
          recordsByMentorId: (() => {
            const previous = state.recordsByMentorId[mentorId];
            const previousStartedAt = previous?.startedAt;
            const previousStartedByMemberId = previous?.startedByMemberId;
            const nextStartedAt =
              status === 'PENDING'
                ? undefined
                : previousStartedAt ??
                  startedAt ??
                  reviewedAt ??
                  nowIso;
            const nextStartedByMemberId =
              status === 'PENDING'
                ? undefined
                : previousStartedByMemberId ?? startedByMemberId;
            const nextReviewedAt =
              status === 'APPROVED' || status === 'REJECTED'
                ? reviewedAt ?? nowIso
                : undefined;
            const nextReviewedByMemberId =
              status === 'APPROVED' || status === 'REJECTED'
                ? reviewedByMemberId
                : undefined;

            return {
              ...state.recordsByMentorId,
              [mentorId]: {
                status,
                note: normalizedNote,
                startedAt: nextStartedAt,
                startedByMemberId: nextStartedByMemberId,
                reviewedAt: nextReviewedAt,
                reviewedByMemberId: nextReviewedByMemberId,
              },
            };
          })(),
        }));
      },
      clearRecord: (mentorId) => {
        set((state) => {
          const nextRecordsByMentorId = { ...state.recordsByMentorId };
          delete nextRecordsByMentorId[mentorId];

          return {
            recordsByMentorId: nextRecordsByMentorId,
          };
        });
      },
      reset: () => {
        set({
          recordsByMentorId: {},
        });
      },
      setHasHydrated: (hasHydrated) => {
        set({
          hasHydrated,
        });
      },
    }),
    {
      name: 'mentor-screening-admin-storage',
      version: 2,
      migrate: (persistedState) => {
        if (!persistedState) {
          return persistedState;
        }

        const typedState = persistedState as PersistedState;
        const normalizedRecordsByMentorId = Object.fromEntries(
          Object.entries(typedState.recordsByMentorId ?? {}).map(
            ([mentorId, record]) => {
              return [
                Number(mentorId),
                {
                  status: record.status,
                  note: record.note,
                  startedAt:
                    record.status !== 'PENDING'
                      ? record.startedAt ??
                        record.reviewedAt ??
                        new Date().toISOString()
                      : undefined,
                  startedByMemberId: record.startedByMemberId,
                  reviewedAt:
                    record.status === 'APPROVED' || record.status === 'REJECTED'
                      ? record.reviewedAt
                      : undefined,
                  reviewedByMemberId:
                    record.status === 'APPROVED' || record.status === 'REJECTED'
                      ? record.reviewedByMemberId
                      : undefined,
                } satisfies MentorScreeningRecord,
              ];
            },
          ),
        ) as Record<number, MentorScreeningRecord>;

        return {
          recordsByMentorId: normalizedRecordsByMentorId,
        };
      },
      partialize: (state): PersistedState => ({
        recordsByMentorId: state.recordsByMentorId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
