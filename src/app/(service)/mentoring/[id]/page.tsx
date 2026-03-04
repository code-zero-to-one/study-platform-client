import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import MentorDetailRouteClient from '@/features/mentoring/ui/detail/mentor-detail-route-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface MentoringDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export async function generateMetadata({
  params,
}: MentoringDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return generateSEOMetadata({
    title: '1:1 멘토링 상세',
    description: '멘토 상세 정보와 멘토링 신청 흐름을 확인하세요.',
    path: `/mentoring/${id}`,
    keywords: ['1:1 멘토링', '멘토링 상세'],
  });
}

export default async function MentoringDetailRoute({
  params,
  searchParams,
}: MentoringDetailPageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const mentorId = Number(id);
  const showSavedToast = saved === '1';

  if (!Number.isInteger(mentorId) || mentorId <= 0) {
    notFound();
  }

  return (
    <MentorDetailRouteClient
      mentorId={mentorId}
      showSavedToast={showSavedToast}
    />
  );
}
