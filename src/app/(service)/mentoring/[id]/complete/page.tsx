import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  parseMentoringApplyRouteMentorId,
  parseMentoringRequestId,
} from '@/features/mentoring/model/mentoring-apply-route-contract';
import MentoringPaymentCompletePageClient from '@/features/mentoring/ui/complete/mentoring-payment-complete-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface MentoringPaymentCompleteRouteProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ requestId?: string }>;
}

export async function generateMetadata({
  params,
}: MentoringPaymentCompleteRouteProps): Promise<Metadata> {
  const { id } = await params;

  return generateSEOMetadata({
    title: '멘토링 신청 완료',
    description: '결제와 신청이 완료된 뒤 다음 진행 단계를 확인하세요.',
    path: `/mentoring/${id}/complete`,
  });
}

export default async function MentoringPaymentCompleteRoute({
  params,
  searchParams,
}: MentoringPaymentCompleteRouteProps) {
  const { id } = await params;
  const { requestId: rawRequestId } = await searchParams;
  const mentorId = parseMentoringApplyRouteMentorId(id);
  const requestId = parseMentoringRequestId(rawRequestId);

  if (!mentorId || !requestId) {
    notFound();
  }

  return (
    <MentoringPaymentCompletePageClient
      mentorId={mentorId}
      requestId={requestId}
    />
  );
}
