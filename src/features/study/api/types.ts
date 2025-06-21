export type StudyProgressStatus =
  | 'NONE'
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

export interface GetMonthlyCalendarParams {
  year: number;
  month: number;
}

export interface MonthlyCalendarResponse {
  calender: {
    [day: string]: {
      [slot: string]: StudyProgressStatus;
    };
  };
}
