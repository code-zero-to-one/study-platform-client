import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMentoringMethodType } from '@/features/mentoring/model/mentor-permission';
import MentoringApplyRouteClient from '@/features/mentoring/ui/mentoring-apply-route-client';
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
  type: string | undefined,
  fallbackType: MentoringMethodType,
): MentoringMethodType => {
  if (isMentoringMethodType(type)) {
    return type;
  }

  return fallbackType;
};

const parseSelectedType = (value: string | undefined) => {
  if (isMentoringMethodType(value)) {
    return value;
  }

  return undefined;
};

export async function generateMetadata({
  params,
  searchParams,
}: MentoringApplyRouteProps): Promise<Metadata> {
  const { id } = await params;
  const { type } = await searchParams;

  const mentor = getMentorById(Number(id));

  if (!mentor) {
    const fallbackType = resolveMethod(type, 'note');

    return generateSEOMetadata({
      title: '멘토링 신청',
      description: `${getMethodLabel(fallbackType)} 신청 정보를 확인하세요.`,
      path: `/mentoring/${id}/apply?type=${fallbackType}`,
    });
  }

  const fallbackType = getEnabledMentoringMethods(mentor)[0] ?? 'note';
  const selectedType = resolveMethod(type, fallbackType);

  return generateSEOMetadata({
    title: `${mentor.nickname} 멘토링 신청`,
    description: `${mentor.nickname} 멘토에게 ${getMethodLabel(selectedType)}을 신청합니다.`,
    path: `/mentoring/${id}/apply?type=${selectedType}`,
  });
}

export default async function MentoringApplyRoute({
  params,
  searchParams,
}: MentoringApplyRouteProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const mentorId = Number(id);

  if (!Number.isInteger(mentorId) || mentorId <= 0) {
    notFound();
  }

  return (
    <MentoringApplyRouteClient
      mentorId={mentorId}
      selectedType={parseSelectedType(type)}
    />
  );
}
