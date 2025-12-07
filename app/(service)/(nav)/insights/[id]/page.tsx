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
  console.log(res);

  if (!res.data) {
    notFound();
  }

  const article = res.data;

  const memberIdStr = await getServerCookie('memberId');
  const memberId = memberIdStr ? Number(memberIdStr) : undefined;

  return <BlogDetailPage article={article} memberId={memberId} />;
}
