import type { Metadata } from 'next';
import { QNA_ITEMS } from '@/components/pages/class/_data/qna-data';
import { CommunityQnaDetailPage } from '@/components/pages/community/_components/community-qna-detail-page';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface Props {
  params: Promise<{ questionId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { questionId } = await params;
  const q = QNA_ITEMS.find((item) => item.id === questionId);

  if (!q) {
    return generateSEOMetadata({
      title: '질문을 찾을 수 없습니다 - ZERO-ONE',
      description: '요청하신 질문이 존재하지 않습니다.',
      path: `/community/qna/${questionId}`,
    });
  }

  return generateSEOMetadata({
    title: `${q.title} - ZERO-ONE Q&A`,
    description: q.body.slice(0, 150),
    path: `/community/qna/${questionId}`,
    keywords: ['ZERO-ONE', '질문답변', q.courseName, `Lesson ${q.lessonNum}`],
    canonicalUrl: `https://www.zeroone.it.kr/community/qna/${questionId}`,
  });
}

export default async function Page({ params }: Props) {
  const { questionId } = await params;
  return <CommunityQnaDetailPage questionId={questionId} />;
}
