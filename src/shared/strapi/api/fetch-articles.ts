import { StrapiCollectionResponse, strapiFetch } from './common-strapi-fetch';

// Strapi Article 응답 (필요한 필드만 우선 정의)
export interface Article {
  title: string;
  slug: string;
  description?: string;
}

export async function fetchArticles() {
  return strapiFetch<StrapiCollectionResponse<Article>>(
    '/api/articles?populate=*',
  );
}
