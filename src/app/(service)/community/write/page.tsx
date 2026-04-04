import type { Metadata } from 'next';
import CommunityWritePageClient from '@/features/community/ui/pages/community-write-page-client';

export const metadata: Metadata = {
  title: '커뮤니티 글 작성 | ZERO-ONE',
  description: 'ZERO-ONE 커뮤니티 글 작성 페이지입니다.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CommunityWritePage() {
  return <CommunityWritePageClient mode="create" />;
}
