import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '내 스터디',
};

export default function Page() {
  return <PageClient />;
}
