import type { Metadata } from 'next';
import ClassDetailPageClient from './page-client';

export const metadata: Metadata = {
  title: '클래스 상세 | ZERO-ONE',
  description:
    '코드 한 줄 몰라도 괜찮아요. Claude와 함께 바이브 코딩으로 나만의 웹사이트를 완성하는 코스를 만나보세요.',
};

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ClassDetailPageClient params={params} />;
}
