import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '마이페이지',
};

export default function Page() {
  return <PageClient />;
}
