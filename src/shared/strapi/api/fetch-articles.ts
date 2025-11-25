import {
  StrapiCollectionResponse,
  StrapiSingleResponse,
  strapiFetch,
} from './common-strapi-fetch';

// Media 타입
export interface Media {
  id: number;
  documentId: string;
  name: string;
  url: string;
  mime: string;
  formats?: Record<string, unknown>;
}

// Author 타입
export interface Author {
  id: number;
  documentId: string;
  name: string;
}

// Category 타입
export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug?: string;
}

// Rich Text 블록의 자식 요소
export interface RichTextChild {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

// Rich Text 블록의 항목
export interface RichTextItem {
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'code';
  level?: number; // heading level (1-6)
  format?: 'ordered' | 'unordered';
  children?: RichTextChild[];
  items?: RichTextItem[]; // for list items
}

// 블록 타입 정의
export interface RichTextBlock {
  __component: 'blocks.rich-text';
  body: RichTextItem[];
}

export interface QuoteBlock {
  __component: 'blocks.quote';
  title?: string;
  body: string;
}

export interface MediaBlock {
  __component: 'blocks.media';
  file: Media;
}

export interface SliderBlock {
  __component: 'blocks.slider';
  files: Media[];
}

export type Block = RichTextBlock | QuoteBlock | MediaBlock | SliderBlock;

// Strapi Article 응답
export interface Article {
  title: string;
  slug: string;
  description: string;
  cover?: Media;
  author?: Author;
  category?: Category;
  blocks?: Block[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// 전체 아티클 목록 조회
export async function fetchArticles() {
  // Strapi 5 형식: populate=*로 모든 관계 가져오기 (이미지 포함되지만 클라이언트에서 필터링)
  const query = new URLSearchParams();
  query.append('populate', '*');
  query.append('sort[0]', 'publishedAt:desc');

  return strapiFetch<StrapiCollectionResponse<Article>>(
    `/api/articles?${query.toString()}`,
  );
}

// 특정 slug로 아티클 조회 - Dynamic Zone blocks를 명시적으로 populate
export async function fetchArticleBySlug(slug: string) {
  // Strapi 5에서 Dynamic Zone을 populate하는 방법
  const query = new URLSearchParams();
  query.append('filters[slug][$eq]', slug);
  // populate 없이 기본 필드만 가져오기
  query.append('populate', '*');

  return strapiFetch<StrapiSingleResponse<Article>>(
    `/api/articles?${query.toString()}`,
  );
}
