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
  excludeMissionId?: number;
}

export function useMissionDateDisabledMatcher({
  studyStartDate,
  studyEndDate,
  existingMissions,
  excludeMissionId,
}: UseMissionDateDisabledMatcherOptions) {
  return useMemo(
    () =>
      createMissionDateDisabledMatcher({
        studyStartDate,
        studyEndDate,
        existingMissions,
        excludeMissionId,
      }),
    [studyStartDate, studyEndDate, existingMissions, excludeMissionId],
  );
}
