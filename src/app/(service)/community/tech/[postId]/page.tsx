import type { Metadata } from 'next';
import { PostDetailPage } from '@/components/pages/community/_components/post-detail-page';
import { TECH_POSTS } from '@/components/pages/community/_data/post-data';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface Props {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = TECH_POSTS.find((p) => p.id === postId);
  if (!post) {
    return generateSEOMetadata({
      title: '글을 찾을 수 없습니다 - ZERO-ONE',
      description: '요청하신 글이 존재하지 않습니다.',
      path: `/community/tech/${postId}`,
    });
  }
  return generateSEOMetadata({
    title: `${post.title} - 테크 한입`,
    description: post.body.slice(0, 150),
    path: `/community/tech/${postId}`,
    keywords: ['테크 한입', 'ZERO-ONE 커뮤니티', post.author],
    canonicalUrl: `https://www.zeroone.it.kr/community/tech/${postId}`,
  });
}

export default async function Page({ params }: Props) {
  const { postId } = await params;
  const post = TECH_POSTS.find((p) => p.id === postId);
  return <PostDetailPage post={post} board="tech" boardLabel="테크 한입" />;
}
