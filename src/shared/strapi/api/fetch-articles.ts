import {
  StrapiCollectionResponse,
  StrapiSingleResponse,
  strapiFetch,
} from './common-strapi-fetch';

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

// 전체 아티클 목록 조회
export async function fetchArticles() {
  return strapiFetch<StrapiCollectionResponse<Article>>(
    '/api/articles?populate=*',
  );
}

// 특정 slug로 아티클 조회
export async function fetchArticleBySlug(slug: string) {
  const query = new URLSearchParams();

  // 1. 슬러그 필터
  query.append('filters[slug][$eq]', slug);

  // 2. Populate 설정
  // 현재 cover를 따로 명시하지 않습니다.
  // 대신 'populate=*'를 사용하면 최상위 관계(blocks 포함)를 자동으로 가져옵니다.
  query.append('populate', '*');

  // 만약 위 설정으로 블록 내부(이미지 등)가 안 보인다면,
  // 나중에 아래 주석을 풀어서 단계적으로 시도해봐야 합니다.
  // query.append('populate[blocks][populate]', '*');

  console.log(`Fetching slug: ${slug}, Query: ${query.toString()}`); // 디버깅용 로그

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
