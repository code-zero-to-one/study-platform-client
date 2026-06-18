import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { STRAPI_URL } from '@/api/strapi/api/common-strapi-fetch';
import {
  fetchArticles,
  fetchCategories,
} from '@/api/strapi/api/fetch-articles';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import InsightsPagination from './ui/insights-pagination';

export const revalidate = 60;

const PAGE_SIZE = 10;

export const metadata: Metadata = generateSEOMetadata({
  title: 'ZERO-ONE 인사이트',
  description:
    'ZERO-ONE 팀이 공유하는 개발, 취업, 성장에 관한 인사이트. 최신 기술 동향, 면접 팁, 커리어 성장 조언을 읽어보세요.',
  path: '/insights',
  keywords: [
    '개발 인사이트',
    '기술 블로그',
    '면접 팁',
    '커리어',
    '개발자 성장',
    '기술 동향',
  ],
  canonicalUrl: 'https://www.zeroone.it.kr/insights',
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

interface BlogPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category: selectedCategorySlug, page: pageParam } =
    await searchParams;

  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [categoriesRes, articlesRes, allArticlesForBadge] = await Promise.all([
    fetchCategories(),
    fetchArticles({
      categorySlug: selectedCategorySlug,
      page: currentPage,
      pageSize: PAGE_SIZE,
    }),
    fetchArticles({ pageSize: 100 }),
  ]);

  const categories = categoriesRes.data ?? [];
  const articles = articlesRes.data ?? [];
  const totalPages = articlesRes.meta.pagination.pageCount;

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const recentCategorySlugs = new Set(
    (allArticlesForBadge.data ?? [])
      .filter((a) => new Date(a.publishedAt) >= threeDaysAgo)
      .map((a) => a.category?.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );

  return (
    <div className="mx-auto w-full max-w-[1280px] px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600">
      <div className="flex flex-1 flex-col gap-500">
        <div className="mb-300 flex justify-between">
          <span className="font-designer-20b sm:font-designer-28b text-text-strong">
            ZERO-ONE 인사이트
          </span>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-300 overflow-x-auto border-b border-border-default">
          <Link
            href="/insights"
            className={`shrink-0 whitespace-nowrap px-300 pb-200 transition-colors ${
              !selectedCategorySlug
                ? 'font-designer-18b border-b-2 border-text-strong text-text-strong'
                : 'font-designer-18r text-text-subtle hover:text-text-strong'
            }`}
          >
            전체
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/insights?category=${category.slug}`}
              className={cn(
                'shrink-0 whitespace-nowrap px-300 pb-200 transition-colors',
                selectedCategorySlug === category.slug
                  ? 'font-designer-18b border-b-2 border-text-strong text-text-strong'
                  : 'font-designer-18r text-text-subtle hover:text-text-strong',
              )}
            >
              <span className="relative">
                {category.name}
                {recentCategorySlugs.has(category.slug) && (
                  <span className="absolute -right-75 -top-50 h-75 w-75 rounded-full bg-pink-500" />
                )}
              </span>
            </Link>
          ))}
        </div>

        {/* 카테고리 description 콜아웃 */}
        {(() => {
          const description = selectedCategorySlug
            ? categories.find((c) => c.slug === selectedCategorySlug)
                ?.description
            : '🧑‍🍳 카테고리별로 특화된 인사이트들이 준비되어 있어요.';

          return description ? (
            <div className="flex items-start gap-300 rounded-r-150 border-l-2 border-pink-500 bg-background-accent-pink-subtle px-400 py-300">
              <p className="font-designer-18r text-text-subtle">
                {description}
              </p>
            </div>
          ) : null;
        })()}

        {/* 아티클 목록 */}
        {articles.length === 0 ? (
          <p className="text-text-subtle">아직 등록된 글이 없습니다.</p>
        ) : (
          <ul className="space-y-200">
            {articles.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/insights/${item.slug}`}
                  className="rounded-100 flex w-full cursor-pointer gap-400 border border-solid border-border-default p-300 transition-colors hover:border-border-subtle"
                >
                  <div className="flex flex-1 flex-col justify-between gap-150">
                    {item.category && (
                      <span className="font-designer-13r text-text-subtlest">
                        {item.category.name}
                      </span>
                    )}
                    <span className="font-designer-18b text-text-default">
                      {item.title}
                    </span>
                    <p className="font-designer-15r line-clamp-2 text-text-subtle">
                      {item.description}
                    </p>
                    <span className="font-designer-13r text-text-subtlest">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {item.cover?.url && (
                    <div className="rounded-100 relative h-[80px] w-[80px] flex-shrink-0 overflow-hidden sm:h-[120px] sm:w-[120px]">
                      <Image
                        src={`${STRAPI_URL}${item.cover.url}`}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Suspense>
            <InsightsPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
