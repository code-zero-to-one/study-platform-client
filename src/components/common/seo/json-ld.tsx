import React from 'react';

interface JsonLdProps<T> {
  data: T;
}

/**
 * JSON-LD Structured Data 컴포넌트
 * 서버 컴포넌트에서 사용하여 head에 스크립트 주입
 */
export function JsonLd<T>({ data }: JsonLdProps<T>): React.ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

/**
 * BreadcrumbList 컴포넌트
 * 네비게이션 경로를 구조화된 데이터로 표현
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbListProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbList({
  items,
}: BreadcrumbListProps): React.ReactNode {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={schema} />;
}

/**
 * Article Schema 컴포넌트
 * 블로그 포스트, 뉴스 기사 등의 구조화된 데이터
 */
interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string | string[];
  datePublished: Date | string;
  dateModified: Date | string;
  author?: string | { name: string; url?: string };
  url: string;
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = 'ZERO-ONE',
  url,
}: ArticleSchemaProps): React.ReactNode {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image:
      typeof image === 'string'
        ? [image]
        : image || ['https://www.zeroone.it.kr/images/og-default.png'],
    datePublished:
      typeof datePublished === 'string'
        ? datePublished
        : datePublished.toISOString(),
    dateModified:
      typeof dateModified === 'string'
        ? dateModified
        : dateModified.toISOString(),
    author:
      typeof author === 'string' ? { '@type': 'Person', name: author } : author,
    publisher: {
      '@type': 'Organization',
      name: 'ZERO-ONE',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.zeroone.it.kr/images/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return <JsonLd data={schema} />;
}

/**
 * Course Schema 컴포넌트
 * 스터디 프로그램의 구조화된 데이터
 */
interface CourseSchemaProps {
  name: string;
  description: string;
  image?: string;
  url: string;
  provider?: string;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  instructor?: string;
}

interface CourseSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image: string;
  url: string;
  provider: {
    '@type': string;
    name: string;
    sameAs: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
  };
  duration?: string;
  instructor?: {
    '@type': string;
    name: string;
  };
}

export function CourseSchema({
  name,
  description,
  image,
  url,
  provider = 'ZERO-ONE',
  rating,
  reviewCount,
  duration,
  instructor,
}: CourseSchemaProps): React.ReactNode {
  const schema: CourseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    image: image || 'https://www.zeroone.it.kr/images/og-default.png',
    url,
    provider: {
      '@type': 'Organization',
      name: provider,
      sameAs: 'https://www.zeroone.it.kr',
    },
  };

  if (rating && reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
    };
  }

  if (duration) {
    schema.duration = duration;
  }

  if (instructor) {
    schema.instructor = {
      '@type': 'Person',
      name: instructor,
    };
  }

  return <JsonLd data={schema} />;
}

/**
 * FAQ Schema 컴포넌트
 */
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps): React.ReactNode {
  const schema = {
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

  return <JsonLd data={schema} />;
}

/**
 * Product/Review Schema 컴포넌트
 */
interface ReviewSchemaProps {
  name: string;
  description: string;
  image?: string;
  ratingValue: number;
  reviewCount: number;
  url: string;
  brand?: string;
}

export function ReviewSchema({
  name,
  description,
  image,
  ratingValue,
  reviewCount,
  url,
  brand = 'ZERO-ONE',
}: ReviewSchemaProps): React.ReactNode {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image || 'https://www.zeroone.it.kr/images/og-default.png',
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
    },
    url,
  };

  return <JsonLd data={schema} />;
}

/**
 * Organization Schema 컴포넌트
 */
interface ContactPoint {
  contactType: string;
  email?: string;
  phone?: string;
}

interface OrganizationSchemaProps {
  name?: string;
  description?: string;
  logo?: string;
  url?: string;
  contactPoints?: ContactPoint[];
  sameAs?: string[];
}

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  logo: string;
  url: string;
  sameAs: string[];
  contactPoint?: Array<{
    '@type': string;
    contactType: string;
    email?: string;
    phone?: string;
  }>;
}

export function OrganizationSchema({
  name = 'ZERO-ONE',
  description = '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼',
  logo = 'https://www.zeroone.it.kr/images/logo.png',
  url = 'https://www.zeroone.it.kr',
  contactPoints,
  sameAs = ['https://www.instagram.com/zero_one_it'],
}: OrganizationSchemaProps): React.ReactNode {
  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    logo,
    url,
    sameAs,
  };

  if (contactPoints && contactPoints.length > 0) {
    schema.contactPoint = contactPoints.map((cp) => ({
      '@type': 'ContactPoint',
      ...cp,
    }));
  }

  return <JsonLd data={schema} />;
}
