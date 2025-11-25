import { notFound } from 'next/navigation';
import { getServerCookie } from '@/shared/lib/server-cookie';
import { fetchArticleBySlug } from '@/shared/strapi/api/fetch-articles';
import BlogDetailPage from '../ui/blog-detail-page';

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;

  // Strapi API에서 데이터 가져오기
  const res = await fetchArticleBySlug(slug);

  // Strapi가 배열로 반환하는 경우 처리
  let article;
  if (Array.isArray(res.data)) {
    // 배열인 경우 첫 번째 요소 사용
    article = res.data[0];
  } else {
    article = res.data;
  }

  if (!article) {
    notFound();
  }

  const memberIdStr = await getServerCookie('memberId');
  const memberId = memberIdStr ? Number(memberIdStr) : undefined;

  return <BlogDetailPage article={article} memberId={memberId} />;
}
