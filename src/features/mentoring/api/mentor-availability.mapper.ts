import {
  parseMentoringMethodType,
} from '@/features/mentoring/model/mentoring-method';
import type {
  MentorAvailability,
  MentorAvailableSlot,
  MentoringReservableMethodType,
} from '@/types/mentoring/availability';
import {
  requireArray,
  requireInteger,
  requireNonEmptyString,
  requireObject,
  toContractError,
} from './mentor-api-contract';

const MENTOR_AVAILABILITY_SCOPE = 'mentor-availability-response';

const toOptionalInteger = (value: unknown) => {
  if (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value)
  ) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    if (Number.isFinite(parsed) && Number.isInteger(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const toReservableMethod = (
  value: unknown,
  field: string,
): MentoringReservableMethodType => {
  const parsed = parseMentoringMethodType(value);

  if (!parsed || parsed === 'note') {
    throw toContractError({
      scope: MENTOR_AVAILABILITY_SCOPE,
      field,
      causeData: value,
    });
  }

  return parsed;
};

const mapMentorAvailableSlot = (
  value: unknown,
  index: number,
): MentorAvailableSlot => {
  const source = requireObject<Record<string, unknown>>({
    value,
    scope: MENTOR_AVAILABILITY_SCOPE,
    field: `content.slots[${index}]`,
  });
  const startTime = requireNonEmptyString({
    value: source.startTime,
    scope: MENTOR_AVAILABILITY_SCOPE,
    field: `content.slots[${index}].startTime`,
  });
  const endTime = requireNonEmptyString({
    value: source.endTime,
    scope: MENTOR_AVAILABILITY_SCOPE,
    field: `content.slots[${index}].endTime`,
  });
  const labelValue =
    typeof source.label === 'string' ? source.label.trim() : '';

  return {
    startTime,
    endTime,
    label: labelValue.length > 0 ? labelValue : `${startTime}~${endTime}`,
  };
};

export const mapMentorAvailabilityContent = (
  content: unknown,
): MentorAvailability => {
  const source = requireObject<Record<string, unknown>>({
    value: content,
    scope: MENTOR_AVAILABILITY_SCOPE,
    field: 'content',
  });
  const slotValues = requireArray<unknown>({
    value: source.slots ?? [],
    scope: MENTOR_AVAILABILITY_SCOPE,
    field: 'content.slots',
  });

  return {
    mentorId: requireInteger({
      value: source.mentorId,
      scope: MENTOR_AVAILABILITY_SCOPE,
      field: 'content.mentorId',
    }),
    method: toReservableMethod(source.method, 'content.method'),
    date: requireNonEmptyString({
      value: source.date,
      scope: MENTOR_AVAILABILITY_SCOPE,
      field: 'content.date',
    }),
    timezone:
      (typeof source.timezone === 'string' && source.timezone.trim()) ||
      'Asia/Seoul',
    durationMinutes: toOptionalInteger(source.durationMinutes),
    slots: slotValues.map((slot, index) => mapMentorAvailableSlot(slot, index)),
  };
};
