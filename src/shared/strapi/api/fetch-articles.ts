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
  // 슬러그 필터
  query.append('filters[slug][$eq]', slug);
  // 전체 필드 populate (category, author, cover, blocks 모두 포함)
  query.append('populate[0]', 'category');
  query.append('populate[1]', 'cover');
  query.append('populate[2]', 'blocks');
  query.append('populate[3]', 'author');
  query.append('populate[4]', 'author.avatar');

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
