import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  parseMentoringApplyRouteMentorId,
  parseMentoringApplySelectedType,
} from '@/features/mentoring/model/mentoring-apply-route-contract';
import MentoringApplyRouteClient from '@/features/mentoring/ui/apply/mentoring-apply-route-client';
import {
  getEnabledMentoringMethods,
  getMentorById,
  getMethodLabel,
} from '@/mocks/mentoring-mock-data';
import type { MentoringMethodType } from '@/types/mentoring/domain';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface MentoringApplyRouteProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

const resolveMethod = (
  type: MentoringMethodType | undefined,
  fallbackType: MentoringMethodType,
): MentoringMethodType => {
  if (type) {
    return type;
  }

  return fallbackType;
};

export async function generateMetadata({
  params,
  searchParams,
}: MentoringApplyRouteProps): Promise<Metadata> {
  const { id } = await params;
  const rawSearchParams = await searchParams;
  const selectedType = parseMentoringApplySelectedType(rawSearchParams.type);

  const mentor = getMentorById(Number(id));

  if (!mentor) {
    const fallbackType = resolveMethod(selectedType, 'note');

    return generateSEOMetadata({
      title: '멘토링 신청',
      description: `${getMethodLabel(fallbackType)} 신청 정보를 확인하세요.`,
      path: `/mentoring/${id}/apply?type=${fallbackType}`,
    });
  }

  const fallbackType = getEnabledMentoringMethods(mentor)[0] ?? 'note';
  const resolvedType = resolveMethod(selectedType, fallbackType);

  return generateSEOMetadata({
    title: `${mentor.nickname} 멘토링 신청`,
    description: `${mentor.nickname} 멘토에게 ${getMethodLabel(resolvedType)}을 신청합니다.`,
    path: `/mentoring/${id}/apply?type=${resolvedType}`,
  });
}

export default async function MentoringApplyRoute({
  params,
  searchParams,
}: MentoringApplyRouteProps) {
  const { id } = await params;
  const rawSearchParams = await searchParams;
  const mentorId = parseMentoringApplyRouteMentorId(id);
  const selectedType = parseMentoringApplySelectedType(rawSearchParams.type);

  if (!mentorId) {
    notFound();
  }

  return (
    <MentoringApplyRouteClient mentorId={mentorId} selectedType={selectedType} />
  );
}
