import { axiosInstance } from '@/api/client/axios';
import {
  WeeklyReservationRequest,
  WeeklyReservationResponse,
  ReservationUserItem,
  Participant,
  JoinStudyRequest,
} from '@/features/study/participation/api/participation-types';

// 스터디 신청 목록 서버데이터 -> UI 매핑 함수
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

// 스터디 신청 목록
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

// CS 스터디 매칭 신청
export const postJoinStudy = async (payload: JoinStudyRequest) => {
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );

  const res = await axiosInstance.post('/matching/apply', cleanPayload);

  return res.data;
};
