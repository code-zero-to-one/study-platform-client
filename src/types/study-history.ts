'use client';

// 백엔드 API 응답 구조에 맞춘 타입 정의

export type StudyRole = 'INTERVIEWER' | 'INTERVIEWEE';
export type AttendanceStatus = 'PRESENT' | 'PENDING' | 'ABSENT'; // 백엔드 값에 맞춤 (PRESENT, PENDING 등)
export type StudyStatus = 'COMPLETE' | 'IN_PROGRESS' | 'PENDING';

export interface StudyHistoryContent {
  studyId: number;
  title: string;
  scheduledAt: string; // ISO Date String
  status: StudyStatus;
  studyLink: string | null;
  participation: {
    role: StudyRole;
    attendance: AttendanceStatus;
  };
  partner: {
    memberId: number;
    nickname: string;
    profileImageUrl: string | null;
  };
}

export interface PageableResponse<T> {
  statusCode: number;
  timestamp: string;
  content: {
    content: T[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    numberOfElements: number;
    empty: boolean;
  };
  message: string;
}

// 프론트엔드 컴포넌트에서 사용하기 편하게 변환한 타입 (UI용)
export interface StudyHistoryItem {
  id: number;
  date: string;
  subject: string;
  role: StudyRole;
  attendance: 'ATTENDED' | 'NOT_STARTED'; // UI 표현용 (PRESENT -> ATTENDED, PENDING -> NOT_STARTED)
  link: string | null;
  status: 'COMPLETED' | 'IN_PROGRESS'; // UI 표현용
  partner: {
    id: number;
    name: string;
    profileImage: string | null;
  };
}
