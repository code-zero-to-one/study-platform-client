import type { MentorProfile } from '@/types/mentoring/domain';
import { requireObject } from './mentor-api-contract';
import type {
  MentorDetailResponseDto,
  MentorDetailWrappedResponseDto,
  MentorProfileResponseDto,
} from './mentor-api.types';
import { mapMentorProfile } from './mentor-profile.mapper';

export const mapMentorDetailContent = (content: unknown): MentorProfile => {
  const contentObject = requireObject<MentorDetailResponseDto>({
    value: content,
    scope: 'mentor-detail-response',
    field: 'content',
  });
  const wrappedContent = contentObject as MentorDetailWrappedResponseDto;
  const mentorCandidate = wrappedContent.mentor ?? contentObject;
  const mentorField = wrappedContent.mentor ? 'content.mentor' : 'content';
  const mentor = requireObject<MentorProfileResponseDto>({
    value: mentorCandidate,
    scope: 'mentor-detail-response',
    field: mentorField,
  });

  return mapMentorProfile({
    source: mentor,
    scope: 'mentor-detail-response',
  });
};
