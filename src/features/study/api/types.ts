export type StudyProgressStatus =
  | 'BEFORE_PROGRESSED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'ABSENT';

export interface DailyStudy {
  interviewer: string;
  interviewerImage: string;
  interviewee: string;
  intervieweeImage: string;
  studySpaceId: number;
  subject: string;
  feedback: string | undefined;
  progressStatus: StudyProgressStatus;
  link: string;
}

export interface GetDailyStudyDetailParams {
  year: number;
  month: number;
  day: number;
}

export interface GetDailyStudiesParams {
  cursor?: number;
  pageSize?: number;
  year?: number;
  month?: number;
  day?: number;
}

export interface GetDailyStudiesResponse {
  dailyStudyResponses: DailyStudy[];
}
