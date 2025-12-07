'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { STRAPI_URL } from '@/shared/strapi/api/common-strapi-fetch';
import { Article } from '@/shared/strapi/api/fetch-articles';

interface BlogDetailPageProps {
  article: Article & { id: number; documentId: string };
  memberId?: number;
}

export default function BlogDetailPage({ article }: BlogDetailPageProps) {
  console.log(article);
  // 마크다운 렌더러용 커스텀 컴포넌트 설정
  const MarkdownComponents = {
    // 이미지 변환 (![alt](src) -> <Image />)
    img: (image: any) => {
      const { src, alt } = image;

      if (!src) {
        return null;
      }

      // 이미지 URL 처리 (상대 경로면 STRAPI_URL 붙이기)
      const imageUrl = src.startsWith('/') ? `${STRAPI_URL}${src}` : src;

      return (
        <span className="my-8 block">
          <Image
            src={imageUrl}
            alt={alt || 'Article Content Image'}
            width={800}
            height={500}
            className="h-auto w-full rounded-lg object-contain"
          />
        </span>
      );
    },
    // 문단 (p)
    p: ({ children }: any) => (
      <p className="font-designer-16r mb-4 leading-relaxed text-[#252B37]">
        {children}
      </p>
    ),
    // 제목 (h1 ~ h3)
    h1: ({ children }: any) => (
      <h1 className="mt-8 mb-4 text-3xl font-bold text-[#181D27]">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mt-8 mb-4 text-2xl font-bold text-[#181D27]">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-6 mb-3 text-xl font-bold text-[#181D27]">{children}</h3>
    ),
    // 리스트
    ul: ({ children }: any) => (
      <ul className="my-4 ml-4 list-inside list-disc space-y-2">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="my-4 ml-4 list-inside list-decimal space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li className="text-[#252B37]">{children}</li>,
    // 인용구
    blockquote: ({ children }: any) => (
      <blockquote className="my-8 border-l-4 border-[#4F46E5] bg-[#F5F3FF] p-4 text-[#535862] italic">
        {children}
      </blockquote>
    ),
    // 링크 (새 탭으로 열기)
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
  };

  const renderBlock = (block: any, index: number) => {
    // 1. Rich Text
    if (block.__component?.includes('rich-text')) {
      // Case A: 배열 데이터 (Blocks Editor)
      if (Array.isArray(block.body)) {
        return (
          <div key={index} className="space-y-4">
            {block.body.map((item: any, i: number) => {
              if (item.type === 'paragraph') {
                return (
                  <p
                    key={i}
                    className="font-designer-16r leading-relaxed text-[#252B37]"
                  >
                    {item.children?.map((child: any, j: number) => (
                      <span key={j}>{child.text}</span>
                    ))}
                  </p>
                );
              }

              return null;
            })}
          </div>
        );
      }

      // Case B: 문자열 데이터 (Markdown)
      return (
        <div key={index} className="blog-content-markdown">
          {/* ReactMarkdown 안에서 에러가 나지 않도록 데이터가 있을 때만 렌더링 */}
          {block.body ? (
            <ReactMarkdown components={MarkdownComponents}>
              {block.body}
            </ReactMarkdown>
          ) : null}
        </div>
      );
    }

    // 2. 인용구
    if (block.__component?.includes('quote')) {
      return (
        <blockquote
          key={index}
          className="my-8 rounded-r-lg border-l-4 border-[#4F46E5] bg-[#F5F3FF] p-6"
        >
          {block.title && (
            <p className="font-designer-18b mb-3 text-[#252B37]">
              {block.title}
            </p>
          )}
          <p className="font-designer-16r text-[#535862] italic">
            {block.body}
          </p>
        </blockquote>
      );
    }

    // 3. 이미지 (단독 블록)
    if (block.__component?.includes('media') && block.file) {
      const fileData = block.file.data || block.file;
      if (!fileData) return null;
      const imageUrl = fileData.url.startsWith('/')
        ? `${STRAPI_URL}${fileData.url}`
        : fileData.url;

      return (
        <figure key={index} className="my-8">
          <Image
            src={imageUrl}
            alt={fileData.name}
            width={1200}
            height={700}
            className="h-auto w-full rounded-lg"
          />
        </figure>
      );
    }

    // 4. 슬라이더
    if (block.__component?.includes('slider') && block.files?.data) {
      const files = block.files.data;
      if (files.length === 0) return null;

      return (
        <div key={index} className="my-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {files.map((file: any) => {
              const imageUrl = file.url.startsWith('/')
                ? `${STRAPI_URL}${file.url}`
                : file.url;

              return (
                <div key={file.id} className="overflow-hidden rounded-lg">
                  <Image
                    src={imageUrl}
                    alt={file.name}
                    width={600}
                    height={400}
                    className="h-auto w-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex w-full gap-600 py-600">
      <article className="mx-auto w-full max-w-4xl px-4">
        {/* 목록으로 돌아가기 버튼 */}
        <div className="mb-8">
          <Link
            href="/insights"
            className="font-designer-16r inline-flex items-center gap-2 text-[#4F46E5] transition-colors hover:text-[#4338CA]"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>

        <h1 className="font-designer-32b mb-6 text-[#181D27]">
          {article.title}
        </h1>

        {article.description && (
          <p className="font-designer-18r mb-6 text-[#535862]">
            {article.description}
          </p>
        )}

        <time className="font-designer-14r mb-8 block text-[#9CA3AF]">
          {new Date(article.publishedAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        {article.cover && (
          <div className="mb-10">
            {(() => {
              const coverData = article.cover as any;
              const url = coverData.url || coverData.data?.attributes?.url;
              if (!url) return null;
              const finalUrl = url.startsWith('/')
                ? `${STRAPI_URL}${url}`
                : url;

              return (
                <Image
                  src={finalUrl}
                  alt={article.title}
                  width={1200}
                  height={600}
                  className="mx-auto h-auto w-2/3 rounded-lg object-cover"
                  priority
                />
              );
            })()}
          </div>
        )}

        <div className="min-h-[200px] space-y-8">
          {article.blocks && article.blocks.length > 0 ? (
            article.blocks.map((block: any, index: number) =>
              renderBlock(block, index),
            )
          ) : (
            <p className="text-gray-400 italic">내용이 없습니다.</p>
          )}
        </div>

        <hr className="mt-12 border-t border-[#E5E7EB]" />
      </article>
    </div>
  );
}
