import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '클래스 홈',
};

export default function Page() {
  return <PageClient />;
}
