export type MyMentoringMethod = 'ONLINE' | 'OFFLINE' | 'CALL';
export type MyMentoringStatus = 'CONFIRMED' | 'PENDING';

export interface MyMentoringItem {
  id: number;
  title: string;
  mentorName: string;
  method: MyMentoringMethod;
  status: MyMentoringStatus;
  mentoringTime?: string;
  requestedAt: string;
  pendingWindow?: string;
  description: string;
}
