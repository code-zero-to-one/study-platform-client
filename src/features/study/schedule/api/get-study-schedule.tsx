// 매칭 결과 목록, 오늘의 스터디 상세 정보, 나의 스터디 캘린더
import {
  GetDailyStudiesParams,
  GetDailyStudiesResponse,
  GetMonthlyCalendarParams,
  MonthlyCalendarResponse,
  StudyStatus,
  WeeklyParticipationResponse,
} from '@/features/study/schedule/api/schedule-types';
import { axiosInstance } from '@/shared/tanstack-query/axios';

// 스터디 전체 조회
export const getDailyStudies = async (
  params?: GetDailyStudiesParams,
): Promise<GetDailyStudiesResponse> => {
  const res = await axiosInstance.get('/study/daily', { params });

  return res.data.content;
};

// 월 별 스터디 캘린더 조회
export const getMonthlyStudyCalendar = async (
  params: GetMonthlyCalendarParams,
): Promise<MonthlyCalendarResponse> => {
  const res = await axiosInstance.get('/study/daily/month', { params });

  return res.data.content;
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

// 스터디 시작/종료 유무 확인
export const getStudyStatus = async (): Promise<StudyStatus> => {
  const res = await axiosInstance.get('/matching/system-status');

  return res.data.content.status as StudyStatus;
};
