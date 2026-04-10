import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STRAPI_URL } from '@/api/strapi/api/common-strapi-fetch';
import { fetchArticleBySlug } from '@/api/strapi/api/fetch-articles';
import { readAuthenticatedMemberId } from '@/features/auth/model/server-auth-session';
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
  const seoBlock = article.blocks?.find(
    (block) => block.__component === 'shared.seo',
  );

  // 2. 최종 메타데이터 값 결정 (SEO 블록 우선, 없으면 Article 기본 필드 사용)
  const metaTitle = seoBlock?.metaTitle || article.title;
  const metaDescription =
    seoBlock?.metaDescription ||
    article.description ||
    `"${metaTitle}"에 대한 상세 내용입니다.`;

  // 3. OG 이미지 결정 (SEO 블록의 shareImage 우선, 없으면 article.cover 사용)
  let imageUrl: string | undefined;

  if (seoBlock?.shareImage?.url) {
    const shareImageUrl = seoBlock.shareImage.url;
    imageUrl = shareImageUrl.startsWith('http')
      ? shareImageUrl
      : `${STRAPI_URL}${shareImageUrl}`;
  } else if (article.cover) {
    const cover = article.cover as {
      url?: string;
      data?: { attributes?: { url?: string } };
    };
    const coverUrl = cover.url || cover.data?.attributes?.url;
    if (coverUrl) {
      imageUrl = coverUrl.startsWith('http')
        ? coverUrl
        : `${STRAPI_URL}${coverUrl}`;
    }
  }

  const fallbackImage = '/images/banner.png';

  const canonicalUrl = `https://www.zeroone.it.kr/insights/${slug}`;

  return {
    title: `${metaTitle} | ZERO-ONE`,
    description: metaDescription,
    keywords: [
      metaTitle,
      'ZERO-ONE',
      article.category?.name || 'insights',
      '개발',
      '성장',
      '기술',
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
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
      type: 'article',
      url: canonicalUrl,
      title: `${metaTitle} | ZERO-ONE`,
      description: metaDescription,
      siteName: 'ZERO-ONE',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: metaTitle,
            },
          ]
        : [
            {
              url: `https://www.zeroone.it.kr${fallbackImage}`,
              width: 1200,
              height: 630,
              alt: 'ZERO-ONE',
            },
          ],
      publishedTime: article.createdAt ? article.createdAt : undefined,
      modifiedTime: article.updatedAt ? article.updatedAt : undefined,
      authors: ['ZERO-ONE'],
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
  const memberId = await readAuthenticatedMemberId();

  return <BlogDetailPage article={article} memberId={memberId} />;
}
