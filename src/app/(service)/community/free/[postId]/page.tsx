import type { Metadata } from 'next';
import { PostDetailPage } from '@/components/pages/community/_components/post-detail-page';
import { FREE_POSTS } from '@/components/pages/community/_data/post-data';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface Props {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = FREE_POSTS.find((p) => p.id === postId);
  if (!post) {
    return generateSEOMetadata({
      title: '글을 찾을 수 없습니다 - ZERO-ONE',
      description: '요청하신 글이 존재하지 않습니다.',
      path: `/community/free/${postId}`,
    });
  }
  return generateSEOMetadata({
    title: `${post.title} - 자유게시판`,
    description: post.body.slice(0, 150),
    path: `/community/free/${postId}`,
    keywords: ['자유게시판', 'ZERO-ONE 커뮤니티', post.author],
    canonicalUrl: `https://www.zeroone.it.kr/community/free/${postId}`,
  });
}

export default async function Page({ params }: Props) {
  const { postId } = await params;
  const post = FREE_POSTS.find((p) => p.id === postId);
  return <PostDetailPage post={post} board="free" boardLabel="자유게시판" />;
}
