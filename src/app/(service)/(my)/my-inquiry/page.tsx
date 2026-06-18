import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '내 문의',
};

export default function Page() {
  return <PageClient />;
}
