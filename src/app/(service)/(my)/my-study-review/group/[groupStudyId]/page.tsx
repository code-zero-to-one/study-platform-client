import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '그룹 스터디 후기 상세',
};

export default function Page() {
  return <PageClient />;
}
