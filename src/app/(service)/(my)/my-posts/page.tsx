import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '내 게시글',
};

export default function Page() {
  return <PageClient />;
}
