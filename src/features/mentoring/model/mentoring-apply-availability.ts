import type { MentorAvailability } from '@/types/mentoring/availability';

export const getMentoringApplyAvailableTimeSlots = (
  availability: MentorAvailability | undefined,
) => {
  if (!availability) {
    return [];
  }

  return availability.slots
    .map((slot) => slot.label.trim())
    .filter((label) => label.length > 0);
};

export const getMentoringApplyAvailabilityLoadingState = ({
  hasSelectedDate,
  isLoading,
  hasAvailability,
}: {
  hasSelectedDate: boolean;
  isLoading: boolean;
  hasAvailability: boolean;
}) => {
  return hasSelectedDate && isLoading && !hasAvailability;
};

export const getMentoringApplyAvailabilityStatusMessage = ({
  hasSelectedDate,
  isLoading,
  isError,
  availableTimeSlotCount,
}: {
  hasSelectedDate: boolean;
  isLoading: boolean;
  isError: boolean;
  availableTimeSlotCount: number;
}) => {
  if (!hasSelectedDate) {
    return undefined;
  }

  if (isLoading) {
    return '선택한 날짜의 상담 가능 시간을 확인하고 있습니다.';
  }

  if (isError) {
    return '가능 시간을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
  }

  if (availableTimeSlotCount === 0) {
    return '선택한 날짜에 가능한 시간이 없습니다.';
  }

  return undefined;
};
