import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '내 활동',
};

export default function Page() {
  return <PageClient />;
}
