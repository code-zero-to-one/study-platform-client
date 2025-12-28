import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STRAPI_URL } from '@/api/strapi/api/common-strapi-fetch';
import { fetchArticleBySlug } from '@/api/strapi/api/fetch-articles';
import { getServerCookie } from '@/utils/server-cookie';
import BlogDetailPage from '../ui/blog-detail-page';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slug } = await params;

  const res = await fetchArticleBySlug(slug);

  if (!res.data) {
    return {
      title: '페이지를 찾을 수 없음',
      robots: { index: false, follow: false },
    };
  }

  const article = res.data;

  // 1. SEO 블록에서 메타데이터 추출
  // article.blocks 배열을 순회하며 __component가 'shared.seo'인 블록을 찾습니다.
  const seoBlock = article.blocks?.find(
    (block: any) => block.__component === 'shared.seo',
  );

  // 2. 최종 메타데이터 값 결정 (SEO 블록 우선, 없으면 Article 기본 필드 사용)
  const metaTitle = seoBlock?.metaTitle || article.title;
  const metaDescription =
    seoBlock?.metaDescription ||
    article.description ||
    `"${metaTitle}"에 대한 상세 내용입니다.`;

  // 3. OG 이미지 결정 (SEO 블록의 shareImage 우선, 없으면 article.cover 사용)
  let imageUrl: string | undefined;

  // shared.seo 블록에 shareImage가 있고 데이터가 있다면 사용
  if (seoBlock?.shareImage?.url) {
    imageUrl = `${STRAPI_URL}${seoBlock.shareImage.url}`;
  } else if (article.cover) {
    // 없다면 article.cover 사용
    imageUrl =
      (article.cover as any).url ||
      (article.cover as any).data?.attributes?.url;
  }

  return {
    title: metaTitle, // Strapi SEO 블록에서 가져온 제목 사용
    description: metaDescription, // Strapi SEO 블록에서 가져온 설명 사용

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // OG (Open Graph) 태그 설정
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/insights/${slug}`,
      siteName: 'ZERO-ONE',
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'article',
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;

  // Strapi API에서 데이터 가져오기
  const res = await fetchArticleBySlug(slug);

  if (!res.data) {
    notFound();
  }

  const article = res.data;

  const memberIdStr = await getServerCookie('memberId');
  const memberId = memberIdStr ? Number(memberIdStr) : undefined;

  return <BlogDetailPage article={article} memberId={memberId} />;
}
