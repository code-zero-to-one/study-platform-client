'use client';

export interface StudyHistoryItem {
  id: number;
  date: string;
  subject: string;
  role: 'INTERVIEWER' | 'INTERVIEWEE';
  attendance: 'ATTENDED' | 'NOT_STARTED';
  link: string | null;
  status: 'COMPLETED' | 'IN_PROGRESS';
}


