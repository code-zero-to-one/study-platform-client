import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MentorOperationRecord,
  UpsertMentorOperationParams,
} from '@/types/mentoring/admin-domain';

interface MentorOperationState {
  recordsByMentorId: Record<number, MentorOperationRecord>;
  hasHydrated: boolean;
  upsertRecord: (payload: UpsertMentorOperationParams) => void;
  clearRecord: (mentorId: number) => void;
  reset: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type PersistedState = Pick<MentorOperationState, 'recordsByMentorId'>;

export const DEFAULT_MENTOR_OPERATION_RECORD: MentorOperationRecord = {
  status: 'OPEN',
  history: [],
};

const createHistoryId = () => {
  return `mentor-operation-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

const normalizeReason = (value: string | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
};

const normalizeRecord = (
  record: Partial<MentorOperationRecord> | undefined,
): MentorOperationRecord => {
  return {
    status: record?.status ?? 'OPEN',
    reason: normalizeReason(record?.reason),
    changedAt: record?.changedAt,
    changedByMemberId: record?.changedByMemberId,
    history: (record?.history ?? []).filter(
      (entry) => entry && entry.toStatus && entry.changedAt,
    ),
  };
};

export const useMentorOperationStore = create<MentorOperationState>()(
  persist(
    (set): MentorOperationState => ({
      recordsByMentorId: {},
      hasHydrated: false,
      upsertRecord: ({
        mentorId,
        status,
        reason,
        changedAt,
        changedByMemberId,
      }) => {
        const normalizedReason = normalizeReason(reason);
        const nowIso = changedAt ?? new Date().toISOString();

        set((state) => {
          const previous = normalizeRecord(state.recordsByMentorId[mentorId]);
          const isSameStatus = previous.status === status;
          const isSameReason =
            (previous.reason ?? undefined) === (normalizedReason ?? undefined);

          if (isSameStatus && isSameReason) {
            return state;
          }

          return {
            recordsByMentorId: {
              ...state.recordsByMentorId,
              [mentorId]: {
                status,
                reason: normalizedReason,
                changedAt: nowIso,
                changedByMemberId,
                history: [
                  ...previous.history,
                  {
                    id: createHistoryId(),
                    fromStatus: previous.status,
                    toStatus: status,
                    reason: normalizedReason,
                    changedAt: nowIso,
                    changedByMemberId,
                  },
                ],
              },
            },
          };
        });
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
      name: 'mentor-operation-admin-storage',
      version: 1,
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
                normalizeRecord(record),
              ] as const;
            },
          ),
        ) as Record<number, MentorOperationRecord>;

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
