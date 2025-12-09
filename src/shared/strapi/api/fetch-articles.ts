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

// 전체 아티클 목록 조회
export async function fetchArticles(categorySlug?: string) {
  const query = new URLSearchParams();
  query.append('populate', '*');

  if (categorySlug) {
    query.append('filters[category][slug][$eq]', categorySlug);
  }

  return strapiFetch<StrapiCollectionResponse<Article>>(
    `/api/articles?${query.toString()}`,
  );
}

// 카테고리 목록 조회
export async function fetchCategories() {
  return strapiFetch<StrapiCollectionResponse<Category>>(
    '/api/categories?populate=*',
  );
}

// 특정 slug로 아티클 조회
export async function fetchArticleBySlug(slug: string) {
  const query = new URLSearchParams();
  // 1. 슬러그 필터
  query.append('filters[slug][$eq]', slug);

  // 2. Populate 설정: 문제가 되는 blocks만 확인
  query.append('populate[blocks][populate]', '*'); // 다른 필드 제거 후 테스트

  console.log(`Fetching slug: ${slug}, Query: ${query.toString()}`);

  const response = await strapiFetch<StrapiCollectionResponse<Article>>(
    `/api/articles?${query.toString()}`,
  );

  const singleData =
    response.data && response.data.length > 0 ? response.data[0] : null;

  return {
    data: singleData,
    meta: response.meta,
  };
}
