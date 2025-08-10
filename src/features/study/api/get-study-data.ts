import type {
  CompleteStudyRequest,
  DailyStudyDetail,
  GetDailyStudiesParams,
  GetDailyStudiesResponse,
  GetMonthlyCalendarParams,
  JoinStudyRequest,
  MonthlyCalendarResponse,
  PostDailyRetrospectRequest,
  PrepareStudyRequest,
  WeeklyParticipationResponse,
} from '@/features/study/api/types';
import { axiosClientInstance } from '@/shared/tanstack-query/axios.client';

// 스터디 상세 조회
export const getDailyStudyDetail = async (
  params: string,
): Promise<DailyStudyDetail> => {
  const res = await axiosClientInstance.get(`/study/daily/mine/${params}`);

  return res.data.content;
};

// 스터디 전체 조회
export const getDailyStudies = async (
  params?: GetDailyStudiesParams,
): Promise<GetDailyStudiesResponse> => {
  const res = await axiosClientInstance.get('/study/daily', { params });

  return res.data.content;
};

// 월 별 스터디 캘린더 조회
export const getMonthlyStudyCalendar = async (
  params: GetMonthlyCalendarParams,
): Promise<MonthlyCalendarResponse> => {
  const res = await axiosClientInstance.get('/study/daily/month', { params });

  return res.data.content;
};

export const postDailyRetrospect = async (body: PostDailyRetrospectRequest) => {
  const res = await axiosClientInstance.post('/study/daily/retrospect', body);

  return res.data;
};

// 면접 준비 시작
export const putStudyDaily = async (
  dailyId: number,
  body: PrepareStudyRequest,
) => {
  const res = await axiosClientInstance.put(
    `/study/daily/${dailyId}/prepare`,
    body,
  );

  return res.data;
};

// 면접 완료 및 회고 작성
export const completeStudy = async (
  dailyStudyId: number,
  body: CompleteStudyRequest,
) => {
  const res = await axiosClientInstance.post(
    `/study/daily/${dailyStudyId}/complete`,
    body,
  );

  return res.data;
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

  const res = await axiosClientInstance.post('/matching/apply', cleanPayload);

  return res.data;
};

// 스터디 참여 유무 확인
export const getWeeklyParticipation = async (
  studyDate: string,
): Promise<WeeklyParticipationResponse> => {
  const res = await axiosInstance.get('/study/week/participation', {
    params: { studyDate },
  });

  return res.data.content;
};