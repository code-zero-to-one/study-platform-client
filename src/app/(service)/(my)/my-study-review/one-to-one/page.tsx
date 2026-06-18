import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '1:1 멘토링 후기',
};

export default function Page() {
  return <PageClient />;
}
