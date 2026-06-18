import type { Metadata } from 'next';
import PageClient from './page-client';

export const metadata: Metadata = {
  title: '레슨',
};

export default function Page(props: {
  params: Promise<{ slug: string; id: string }>;
}) {
  return <PageClient {...props} />;
}
