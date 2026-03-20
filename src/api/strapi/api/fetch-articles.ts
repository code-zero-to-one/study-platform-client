import qs from 'qs';
import { StrapiCollectionResponse, strapiFetch } from './common-strapi-fetch';

// Media 타입
interface Media {
  id: number;
  documentId: string;
  name: string;
  url: string;
  mime: string;
  formats?: any;
}

// Strapi Article 응답 타입
export interface Article {
  category: {
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    id: number;
    slug: string;
    documentId: string;
    description: string;
  };
  author: {
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    id: number;
    email: string;
    documentId: string;
    avatar?: Media;
  };
  title: string;
  slug: string;
  description: string;
  cover?: Media;
  blocks?: any[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Category 타입
export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// 카테고리 탭 노출 순서 (slug 기준, 앞에 없는 항목은 뒤로 정렬)
const CATEGORY_SLUG_ORDER = [
  'insight-wrap',
  'career-boost',
  'named-recipe',
  'patch-note',
];

// 전체 아티클 목록 조회 (최신 publishedAt 내림차순)
export async function fetchArticles() {
  const query = new URLSearchParams();
  query.append('populate', '*');
  query.append('sort', 'publishedAt:desc');

  return strapiFetch<StrapiCollectionResponse<Article>>(
    `/api/articles?${query.toString()}`,
  );
}

// 카테고리 목록 조회
export async function fetchCategories() {
  const res = await strapiFetch<StrapiCollectionResponse<Category>>(
    '/api/categories?populate=*',
  );

  const sorted = [...res.data].sort((a, b) => {
    const ai = CATEGORY_SLUG_ORDER.indexOf(a.slug);
    const bi = CATEGORY_SLUG_ORDER.indexOf(b.slug);
    const aOrder = ai === -1 ? Infinity : ai;
    const bOrder = bi === -1 ? Infinity : bi;
    return aOrder - bOrder;
  });

  return { ...res, data: sorted };
}

// 특정 slug로 아티클 조회
export async function fetchArticleBySlug(slug: string) {
  // qs를 사용하여 쿼리 구성
  const query = qs.stringify(
    {
      filters: {
        slug: {
          $eq: slug,
        },
      },
      populate: {
        category: true,
        cover: true,
        author: {
          populate: ['avatar'],
        },
        blocks: {
          populate: '*',
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

  const response = await strapiFetch<StrapiCollectionResponse<Article>>(
    `/api/articles?${query}`,
  );

  const singleData =
    response.data && response.data.length > 0 ? response.data[0] : null;

  return {
    data: singleData,
    meta: response.meta,
  };
}
