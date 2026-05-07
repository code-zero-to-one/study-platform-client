import type { Metadata } from 'next';
import ClassDomainTestPage from '@/features/class-domain-test/ui/class-domain-test-page';

export const metadata: Metadata = {
  title: 'Class API Test - ZERO-ONE',
  description: 'Class domain API smoke test page',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ClassDomainTestPage />;
}
