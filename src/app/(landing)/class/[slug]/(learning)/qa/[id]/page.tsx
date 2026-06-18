import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '질문 상세',
};

export default function Page(props: {
  params: Promise<{ slug: string; id: string }>;
}) {
  return <PageClient {...props} />;
}
