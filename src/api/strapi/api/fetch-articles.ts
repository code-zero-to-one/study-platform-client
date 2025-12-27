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
  // qs를 사용해서 복잡한 쿼리 구성
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
      encodeValuesOnly: true, // 대괄호를 인코딩하지 않음
    }
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
