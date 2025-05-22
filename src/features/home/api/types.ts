export interface DailyStudy {
  interviewer: string;
  interviewee: string;
  subject: string;
  feedBack: string | null;
  progressStatus: 'IN_PROGRESS' | 'COMPLETED' | string;
  link: string;
}

export interface GetDailyStudiesParams {
  cursor?: number;
  pageSize?: number;
  planTime?: string;
  pageable?: {
    page: number;
    size: number;
    sort: string[];
  };
}

export interface GetDailyStudiesResponse {
  dailyStudyResponses: DailyStudy[];
}
