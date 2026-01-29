// 명예의 전당 API 타입 정의

export interface ApiResponse<T> {
  statusCode: number;
  timestamp: string;
  content: T;
  message: string;
}

export interface Ranker {
  rank: number;
  userId: number;
  nickname: string;
  profileImage: string | null;
  score: number;
  sincerity: number | null;
  major: string;
  lastActive: string;
}

export interface Rankings {
  attendanceRankings: Ranker[];
  studyLogRankings: Ranker[];
  sincerityRankings: Ranker[];
  baseDate: string;
}

export interface MVPTeamMember {
  userId: number;
  nickname: string;
  profileImage: string | null;
}

export interface SharedLink {
  id: number;
  title: string;
  url: string;
  sharedAt: string;
}

export interface MVPTeam {
  id: number;
  studyId: number;
  studyTitle: string;
  members: [MVPTeamMember, MVPTeamMember];
  sharedLinks: SharedLink[];
  weekDate: string;
  weekStartDate: string;
  weekEndDate: string;
  totalSharedLinks: number;
}

export interface HallOfFameData {
  rankings: Rankings;
  mvpTeam: MVPTeam | null;
}

export type HallOfFameResponse = ApiResponse<HallOfFameData>;

