import { axiosInstance } from '@/shared/tanstack-query/axios';
import {
  WeeklyReservationRequest,
  WeeklyReservationResponse,
  ReservationUserItem,
  Participant,
} from './participation-types';

export function mapReservation(user: ReservationUserItem): Participant {
  const original = user.profileImage?.resizedImages.find(
    (img) => img.imageSizeType.imageTypeName === 'ORIGINAL',
  )?.resizedImageUrl;

  return {
    id: user.memberId,
    name: user.memberName,
    avatarUrl: original ?? null,
    simpleIntroduction: user.simpleIntroduction,
  };
}

export const getReservationMembers = async (
  params: WeeklyReservationRequest,
): Promise<WeeklyReservationResponse> => {
  const { cursor, pageSize = 50, firstMemberId } = params;

  const res = await axiosInstance.get('/members/study-reservation', {
    params: {
      ...(cursor !== null ? { cursor } : {}),
      'page-size': pageSize,
      ...(firstMemberId !== null ? { 'first-member-id': firstMemberId } : {}),
    },
  });

  return res.data.content;
};
