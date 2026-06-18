import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: '멘토링 신청 관리',
};

export default function MentoringManagementRequestsPage() {
  notFound();
}
