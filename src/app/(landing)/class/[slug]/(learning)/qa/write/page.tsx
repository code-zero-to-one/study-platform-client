import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '질문 작성',
};

export default function Page() {
  return <PageClient />;
}
