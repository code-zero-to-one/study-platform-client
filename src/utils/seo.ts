import type { Metadata } from 'next';

/**
 * SEO 관련 공통 설정
 */
export const SEO_CONFIG = {
  baseUrl: 'https://www.zeroone.it.kr',
  siteName: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼',
  ogImage: '/images/banner.png',
  social: {
    instagram: 'https://www.instagram.com/code_zero_to_one/',
    threads: 'https://www.threads.com/@code_zero_to_one',
    youtube:
      'https://www.youtube.com/@%EC%BD%94%EB%93%9C%EC%A0%9C%EB%A1%9C%ED%88%AC%EC%9B%90',
    facebook: 'https://www.facebook.com/zeroone.it',
  },
  locale: 'ko_KR',
} as const;

/**
 * 기본 Keywords
 */
export const DEFAULT_KEYWORDS = [
  'ZERO-ONE',
  '스터디',
  '기상',
  '멘토링',
  '스터디 그룹',
  '개발자',
  '면접 준비',
  '개발자 커뮤니티',
  '성장',
] as const;

/**
 * 페이지별 Description 템플릿
 */
export const PAGE_DESCRIPTIONS = {
  home: '나의 스터디 일정을 관리하고, 진행 중인 스터디를 한눈에 확인하세요. ZERO-ONE 플랫폼에서 효율적인 스터디 관리를 시작해보세요.',
  study:
    '다양한 그룹 스터디를 찾아보고, 새로운 스터디를 개설해보세요. ZERO-ONE에서 함께할 스터디 동료를 만나세요.',
  insights:
    'ZERO-ONE 팀이 공유하는 개발, 취업, 성장에 관한 인사이트. 최신 기술 동향, 면접 팁, 커리어 성장 조언을 읽어보세요.',
  notFound:
    '요청하신 페이지를 찾을 수 없습니다. 홈페이지로 이동하여 다시 시작하세요.',
} as const;

/**
 * 이미지 크기 가이드
 */
export const IMAGE_SIZES = {
  og: {
    width: 1200,
    height: 630,
  },
  favicon: {
    width: 32,
    height: 32,
  },
} as const;

/**
 * URL Helper
 */
export const createUrl = (path: string): string => {
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;

  return `${SEO_CONFIG.baseUrl}${trimmedPath}`;
};

/**
 * Meta Description 정규화 (120-160자)
 */
export const normalizeDescription = (
  desc: string,
  minLength = 120,
  maxLength = 160,
): string => {
  if (desc.length <= maxLength) {
    return desc;
  }

  return desc.substring(0, maxLength).trim() + '...';
};

/**
 * Title 정규화
 */
export const createTitle = (pageName: string, suffix = true): string => {
  if (suffix) {
    return `${pageName} | ${SEO_CONFIG.siteName}`;
  }

  return pageName;
};

/**
 * SEO 메타데이터 생성 유틸리티
 */
export interface SEOMetadataProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  keywords?: string[];
  author?: string;
  publishedTime?: Date;
  modifiedTime?: Date;
  canonicalUrl?: string;
}

export function generateMetadata(props: SEOMetadataProps): Metadata {
  const {
    title,
    description,
    path = '',
    ogImage = SEO_CONFIG.ogImage,
    ogType = 'website',
    keywords = [],
    author,
    publishedTime,
    modifiedTime,
    canonicalUrl,
  } = props;

  const url = `${SEO_CONFIG.baseUrl}${path}`;
  const fullTitle = `${title} | ${SEO_CONFIG.siteName}`;
  const fullOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${SEO_CONFIG.baseUrl}${ogImage}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl || url,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    openGraph: {
      type: ogType as 'website' | 'article' | 'profile',
      url,
      title: fullTitle,
      description,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    ...(author && { creator: author }),
    ...(publishedTime && { publishedTime }),
    ...(modifiedTime && { modifiedTime }),
  };

  return metadata;
}

/**
 * Organization Structured Data (Schema.org)
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.baseUrl,
    logo: `${SEO_CONFIG.baseUrl}/images/logo.png`,
    description: SEO_CONFIG.description,
    sameAs: [
      SEO_CONFIG.social.instagram,
      SEO_CONFIG.social.threads,
      SEO_CONFIG.social.youtube,
      SEO_CONFIG.social.facebook,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@zeroone.it.kr',
    },
  };
}

/**
 * Website Structured Data (Schema.org)
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.baseUrl}/study?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * BreadcrumbList Structured Data (Schema.org)
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Article Structured Data (Schema.org)
 */
export interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: Date;
  dateModified: Date;
  author?: string;
  url: string;
}

export function getArticleSchema(props: ArticleSchemaProps) {
  const {
    headline,
    description,
    image = SEO_CONFIG.ogImage,
    datePublished,
    dateModified,
    author = SEO_CONFIG.siteName,
    url,
  } = props;

  const fullImage = image.startsWith('http')
    ? image
    : `${SEO_CONFIG.baseUrl}${image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: fullImage,
    datePublished: datePublished.toISOString(),
    dateModified: dateModified.toISOString(),
    author: {
      '@type': 'Organization',
      name: author,
      url: SEO_CONFIG.baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_CONFIG.baseUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * CourseSchema (Study Program)
 */
export interface CourseSchemaProps {
  name: string;
  description: string;
  image?: string;
  url: string;
  provider?: string;
  rating?: number;
  reviewCount?: number;
}

export function getCourseSchema(props: CourseSchemaProps) {
  const {
    name,
    description,
    image = SEO_CONFIG.ogImage,
    url,
    provider = SEO_CONFIG.siteName,
    rating,
    reviewCount,
  } = props;

  const fullImage = image.startsWith('http')
    ? image
    : `${SEO_CONFIG.baseUrl}${image}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    image: fullImage,
    url,
    provider: {
      '@type': 'Organization',
      name: provider,
      sameAs: SEO_CONFIG.baseUrl,
    },
  };

  if (rating && reviewCount) {
    return {
      ...schema,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        reviewCount,
      },
    };
  }

  return schema;
}

/**
 * FAQ Schema (Schema.org)
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function getFAQSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * JSON-LD 스크립트 컴포넌트를 위한 헬퍼
 */
export function getJsonLdScript<T>(data: T): string {
  return JSON.stringify(data);
}
