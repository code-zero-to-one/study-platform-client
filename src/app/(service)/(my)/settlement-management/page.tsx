import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '정산 관리',
};

export default function Page() {
  return <PageClient />;
}
