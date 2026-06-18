import type { MentorDirectoryPage } from '@/types/mentoring/domain';
import {
  requireArray,
  requireInteger,
  requireObject,
  toContractError,
} from './mentor-api-contract';
import type {
  MentorListResponseDto,
  MentorProfileResponseDto,
} from './mentor-api.types';
import { mapMentorProfile } from './mentor-profile.mapper';

const requireBooleanValue = ({
  value,
  field,
}: {
  value: unknown;
  field: string;
}) => {
  if (typeof value !== 'boolean') {
    throw toContractError({
      scope: 'mentor-list-response',
      field,
      causeData: value,
    });
  }

  return value;
};

export const mapMentorListContent = (content: unknown): MentorDirectoryPage => {
  const contentObject = requireObject<MentorListResponseDto>({
    value: content,
    scope: 'mentor-list-response',
    field: 'content',
  });
  const mentors = requireArray<MentorProfileResponseDto>({
    value: contentObject.content,
    scope: 'mentor-list-response',
    field: 'content.content',
  });

  const page = requireInteger({
    value: contentObject.page,
    scope: 'mentor-list-response',
    field: 'content.page',
  });
  const size = requireInteger({
    value: contentObject.size,
    scope: 'mentor-list-response',
    field: 'content.size',
  });
  const totalElements = requireInteger({
    value: contentObject.totalElements,
    scope: 'mentor-list-response',
    field: 'content.totalElements',
  });
  const totalPages = requireInteger({
    value: contentObject.totalPages,
    scope: 'mentor-list-response',
    field: 'content.totalPages',
  });

  if (page < 1 || size < 1 || totalElements < 0 || totalPages < 0) {
    throw toContractError({
      scope: 'mentor-list-response',
      field: 'content.pagination',
      causeData: contentObject,
    });
  }

  return {
    mentors: mentors.map((mentor) =>
      mapMentorProfile({
        source: mentor,
        scope: 'mentor-list-response',
      }),
    ),
    page,
    size,
    totalElements,
    totalPages,
    hasNext: requireBooleanValue({
      value: contentObject.hasNext,
      field: 'content.hasNext',
    }),
    hasPrevious: requireBooleanValue({
      value: contentObject.hasPrevious,
      field: 'content.hasPrevious',
    }),
  };
};
