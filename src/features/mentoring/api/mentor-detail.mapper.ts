import type { MentorProfile } from '@/types/mentoring/domain';
import { requireObject } from './mentor-api-contract';
import type {
  MentorDetailResponseDto,
  MentorProfileResponseDto,
} from './mentor-api.types';
import { mapMentorProfile } from './mentor-profile.mapper';

export const mapMentorDetailContent = (content: unknown): MentorProfile => {
  const contentObject = requireObject<MentorDetailResponseDto>({
    value: content,
    scope: 'mentor-detail-response',
    field: 'content',
  });
  const mentor = requireObject<MentorProfileResponseDto>({
    value: contentObject.mentor,
    scope: 'mentor-detail-response',
    field: 'content.mentor',
  });

  return mapMentorProfile({
    source: mentor,
    scope: 'mentor-detail-response',
  });
};
