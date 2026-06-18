import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '멘토 스터디 후기',
};

export default function Page() {
  return <PageClient />;
}
