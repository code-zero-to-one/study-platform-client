import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '완료한 스터디',
};

export default function Page() {
  return <PageClient />;
}
