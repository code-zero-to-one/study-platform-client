import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '클래스 결제 관리',
};

export default function Page() {
  return <PageClient />;
}
