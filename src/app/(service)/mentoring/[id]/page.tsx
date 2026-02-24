import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import MentorDetailRouteClient from '@/features/mentoring/ui/mentor-detail-route-client';
import { getMentorById } from '@/mocks/mentoring-mock-data';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface MentoringDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MentoringDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const mentor = getMentorById(Number(id));

  if (!mentor) {
    return generateSEOMetadata({
      title: '1:1 멘토링 상세',
      description: '멘토 상세 정보와 멘토링 신청 흐름을 확인하세요.',
      path: `/mentoring/${id}`,
      keywords: ['1:1 멘토링', '멘토링 상세'],
    });
  }

  return generateSEOMetadata({
    title: `${mentor.nickname} 멘토링`,
    description: mentor.summary,
    path: `/mentoring/${id}`,
    keywords: ['1:1 멘토링', mentor.nickname, mentor.role, ...mentor.tags],
  });
}

export default async function MentoringDetailRoute({
  params,
}: MentoringDetailPageProps) {
  const { id } = await params;
  const mentorId = Number(id);

  if (!Number.isInteger(mentorId) || mentorId <= 0) {
    notFound();
  }

  return <MentorDetailRouteClient mentorId={mentorId} />;
}
