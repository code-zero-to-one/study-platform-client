'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { STRAPI_URL } from '@/shared/strapi/api/common-strapi-fetch';
import { Article } from '@/shared/strapi/api/fetch-articles';

interface BlogDetailPageProps {
  article: Article & { id: number; documentId: string };
  memberId?: number;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
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
        <span className="my-10 flex justify-center">
          <Image
            src={imageUrl}
            alt={alt || 'Article Content Image'}
            width={800}
            height={500}
            className="h-auto w-2/3 rounded-[10px] object-contain"
          />
        </span>
      );
    },
    // 문단 (p)
    p: ({ children }: any) => (
      <p className="font-designer-16r mb-6 leading-8 text-[#333D4B]">
        {children}
      </p>
    ),
    // 제목 (h1 ~ h5)
    h1: ({ children }: any) => (
      <h1 className="mt-16 mb-6 text-3xl leading-tight font-bold text-[#181D27]">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mt-14 mb-5 text-2xl leading-tight font-bold text-[#181D27]">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-12 mb-4 text-xl leading-tight font-bold text-[#181D27]">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="mt-10 mb-4 text-lg leading-tight font-bold text-[#181D27]">
        {children}
      </h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="mt-8 mb-3 text-base leading-tight font-bold text-[#181D27]">
        {children}
      </h5>
    ),
    // 리스트
    ul: ({ children }: any) => (
      <ul className="my-8 ml-6 list-outside list-disc space-y-3">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="my-8 ml-6 list-outside list-decimal space-y-3">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="font-designer-16r leading-8 text-[#333D4B]">{children}</li>
    ),
    // 인용구
    blockquote: ({ children }: any) => (
      <blockquote className="my-8 border-l-4 border-[#4F46E5] bg-[#F5F3FF] p-6 leading-8 text-[#535862] italic">
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
    // 구분선 (---)
    hr: () => <hr className="my-8 border-t border-[#E5E7EB]" />,
  };

  const renderBlock = (block: any, index: number) => {
    // 1. Rich Text
    if (block.__component?.includes('rich-text')) {
      // Case A: 배열 데이터 (Blocks Editor)
      if (Array.isArray(block.body)) {
        return (
          <div key={index} className="space-y-6">
            {block.body.map((item: any, i: number) => {
              if (item.type === 'paragraph') {
                return (
                  <p
                    key={i}
                    className="font-designer-16r mb-6 leading-8 text-[#333D4B]"
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
          {block.body ? (
            <ReactMarkdown
              components={MarkdownComponents}
              // Markdown 내부에 있는 <u>, <span>, <br> 등의 HTML 태그를 파싱하고 렌더링하도록 허용
              rehypePlugins={[rehypeRaw]}
            >
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
            <p className="font-designer-18b mb-3 leading-8 text-[#333D4B]">
              {block.title}
            </p>
          )}
          <p className="font-designer-16r leading-8 text-[#535862] italic">
            {block.body}
          </p>
        </blockquote>
      );
    }

    // 3. 이미지 (단독 블록 - Media)
    if (block.__component?.includes('media')) {
      console.log('Media block:', block);

      // block.file이 있는 경우 처리
      if (block.file) {
        const fileData = block.file.data || block.file;
        console.log('fileData:', fileData);
        if (!fileData) return null;

        const imageUrl = fileData.url?.startsWith('/')
          ? `${STRAPI_URL}${fileData.url}`
          : fileData.url;

        if (!imageUrl) return null;

        return (
          <figure key={index} className="my-10 flex justify-center">
            <Image
              src={imageUrl}
              alt={fileData.name || fileData.alternativeText || 'Media Image'}
              width={800}
              height={500}
              className="h-auto w-2/3 rounded-[10px]"
            />
          </figure>
        );
      }

      // block에 직접 이미지 데이터가 있는 경우 처리
      if (block.data) {
        const imageData = Array.isArray(block.data)
          ? block.data[0]
          : block.data;
        const imageUrl = imageData?.url?.startsWith('/')
          ? `${STRAPI_URL}${imageData.url}`
          : imageData?.url;

        if (!imageUrl) return null;

        return (
          <figure key={index} className="my-10 flex justify-center">
            <Image
              src={imageUrl}
              alt={imageData.name || imageData.alternativeText || 'Media Image'}
              width={800}
              height={500}
              className="h-auto w-2/3 rounded-[10px]"
            />
          </figure>
        );
      }

      return null;
    }

    // 4. 슬라이더
    if (block.__component?.includes('slider') && block.files?.data) {
      const files = block.files.data;
      if (files.length === 0) return null;

      return (
        <div key={index} className="my-10">
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

  const coverData = article.cover as any;
  const coverRawUrl = coverData?.url || coverData?.data?.attributes?.url;
  const coverUrl = coverRawUrl
    ? coverRawUrl.startsWith('/')
      ? `${STRAPI_URL}${coverRawUrl}`
      : coverRawUrl
    : undefined;

  return (
    <div className="flex w-full justify-center py-600">
      <article className="mx-auto w-full max-w-5xl">
        {/* 커버 이미지 + 제목 영역 카드 */}
        <div className="rounded-100 mb-32 overflow-hidden border border-solid border-[#D5D7DA]">
          {/* 커버 이미지 */}
          {coverUrl && (
            <div className="relative h-[360px] w-full">
              <Image
                src={coverUrl}
                alt={article.title}
                fill
                className="object-cover opacity-80"
                priority
              />
            </div>
          )}

          {/* 제목 영역 */}
          <div className="p-300">
            {/* 카테고리 버튼 */}
            {article.category && (
              <div className="mb-2.5">
                <Link
                  href={`/insights?category=${article.category.slug}`}
                  className="font-designer-15b inline-flex h-8 items-center justify-center gap-2 rounded-full bg-transparent px-3 text-[#535862] transition-colors hover:bg-[#F3F4F6]"
                >
                  {article.category.name}
                </Link>
              </div>
            )}

            {/* 제목 */}
            <h1 className="font-designer-32b mb-2.5 leading-tight text-[#181D27]">
              {article.title}
            </h1>

            {/* 발행일 */}
            <div className="mb-2.5 text-[#535862]">
              <time className="font-designer-15r">
                {formatDate(article.createdAt)}
              </time>
            </div>

            {/* 설명 */}
            {article.description && (
              <p className="font-designer-18r leading-[1.75] text-[#535862]">
                {article.description}
              </p>
            )}
          </div>
        </div>

        {/* 본문 영역 카드 */}
        <div className="rounded-100 mb-32 min-h-[200px] space-y-10 p-300">
          {article.blocks && article.blocks.length > 0 ? (
            article.blocks.map((block: any, index: number) =>
              renderBlock(block, index),
            )
          ) : (
            <p className="text-gray-400 italic">내용이 없습니다.</p>
          )}
        </div>

        {/* 저자 영역 카드 */}
        {article.author && (
          <div className="rounded-100 flex items-center justify-between border border-solid border-[#D5D7DA] p-300">
            <div className="flex flex-col gap-1">
              <span className="font-designer-20b text-[#181D27]">
                {article.author.name}
              </span>
              {article.author.email && (
                <span className="font-designer-16r text-[#535862]">
                  {article.author.email}
                </span>
              )}
            </div>
            {article.author.avatar?.url && (
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src={`${STRAPI_URL}${article.author.avatar.url}`}
                  alt={article.author.name || ''}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
