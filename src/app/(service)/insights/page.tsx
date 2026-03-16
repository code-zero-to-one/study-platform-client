import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { STRAPI_URL } from '@/api/strapi/api/common-strapi-fetch';
import {
  fetchArticles,
  fetchCategories,
} from '@/api/strapi/api/fetch-articles';
import Banner from '@/components/home/banner';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const revalidate = 60;

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

// 날짜 포맷팅 함수
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category: selectedCategorySlug } = await searchParams;

  // 카테고리 목록과 아티클 목록을 병렬로 가져오기
  const [categoriesRes, articlesRes] = await Promise.all([
    fetchCategories(),
    fetchArticles(selectedCategorySlug),
  ]);

  const categories = categoriesRes.data ?? [];
  const articles = articlesRes.data ?? [];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600">
      <div className="flex flex-1 flex-col gap-500">
        {/* 배너 */}
        <div className="mb-400 sm:mb-600">
          <Banner />
        </div>

        <div className="flex justify-between">
          <span className="font-designer-20b sm:font-designer-28b text-text-strong">
            ZERO-ONE 인사이트
          </span>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-200 overflow-x-auto border-b border-border-default">
          <Link
            href="/insights"
            className={`shrink-0 whitespace-nowrap px-300 pb-200 transition-colors ${
              !selectedCategorySlug
                ? 'font-designer-15b border-b-2 border-text-strong text-text-strong'
                : 'font-designer-15r text-text-subtle hover:text-text-strong'
            }`}
          >
            전체
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/insights?category=${category.slug}`}
              className={`shrink-0 whitespace-nowrap px-300 pb-200 transition-colors ${
                selectedCategorySlug === category.slug
                  ? 'font-designer-15b border-b-2 border-text-strong text-text-strong'
                  : 'font-designer-15r text-text-subtle hover:text-text-strong'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

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
                  {/* 왼쪽: 텍스트 콘텐츠 */}
                  <div className="flex flex-1 flex-col justify-between gap-150">
                    {/* 카테고리 */}
                    {item.category && (
                      <span className="font-designer-13r text-text-subtlest">
                        {item.category.name}
                      </span>
                    )}
                    {/* 제목 */}
                    <span className="font-designer-18b text-text-default">
                      {item.title}
                    </span>
                    {/* Description */}
                    <p className="font-designer-15r line-clamp-2 text-text-subtle">
                      {item.description}
                    </p>
                    {/* 생성일 */}
                    <span className="font-designer-13r text-text-subtlest">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {/* 오른쪽: 커버 이미지 */}
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
      </div>
    </div>
  );
}
