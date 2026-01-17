import { useMemo } from 'react';
import { createMissionDateDisabledMatcher } from '@/utils/time';

export interface MissionPeriod {
  missionId?: number;
  startDate?: string;
  endDate?: string;
}

export interface UseMissionDateDisabledMatcherOptions {
  studyStartDate?: string;
  studyEndDate?: string;
  existingMissions?: MissionPeriod[];
  editingMissionId?: number;
}

export function useMissionDateDisabledMatcher({
  studyStartDate,
  studyEndDate,
  existingMissions,
  editingMissionId,
}: UseMissionDateDisabledMatcherOptions) {
  return useMemo(
    () =>
      createMissionDateDisabledMatcher({
        studyStartDate,
        studyEndDate,
        existingMissions,
        editingMissionId,
      }),
    [studyStartDate, studyEndDate, existingMissions, editingMissionId],
  );
}
