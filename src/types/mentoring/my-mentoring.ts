export type MyMentoringMethod = 'ONLINE' | 'OFFLINE' | 'CALL';
export type MyMentoringStatus = 'REQUESTED' | 'PENDING' | 'CONFIRMED';

export interface MyMentoringItem {
  id: string;
  title: string;
  mentorName: string;
  method: MyMentoringMethod;
  status: MyMentoringStatus;
  mentoringTime?: string;
  requestedAt: string;
  pendingWindow?: string;
  description: string;
  paymentMethodLabel: string;
  paymentAmountLabel: string;
  paymentStatusLabel: string;
  paymentStatusTone: 'green' | 'orange';
}
