'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { STRAPI_URL } from '@/api/strapi/api/common-strapi-fetch';
import { Article } from '@/api/strapi/api/fetch-articles';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

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

// 이미지 슬라이더 컴포넌트
function ImageSlider({ files }: { files: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="mb-225 flex justify-center">
      <div className="w-2/3">
        {/* 이미지 컨테이너 */}
        <div className="relative overflow-hidden rounded-125 bg-background-accent-gray-subtle">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {files.map((file: any, idx: number) => {
              const imageUrl = file.url?.startsWith('/')
                ? `${STRAPI_URL}${file.url}`
                : file.url;

              return (
                <div key={file.id || idx} className="min-w-full">
                  <Image
                    src={imageUrl}
                    alt={file.name || file.alternativeText || 'Slider Image'}
                    width={800}
                    height={500}
                    className="h-auto w-full object-contain"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 인디케이터 (점) */}
        {files.length > 1 && (
          <div className="mt-100 flex justify-center gap-50">
            {files.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-75 w-75 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-200 bg-background-brand-default'
                    : 'bg-fill-neutral-default-default hover:bg-fill-neutral-default-hover',
                )}
                aria-label={`${index + 1}번째 이미지로 이동`}
              />
            ))}
          </div>
        )}

        {/* 이미지 카운터 + 좌우 버튼 */}
        <div className="mt-50 flex items-center justify-center gap-100">
          {/* 이전 버튼 */}
          <button
            onClick={goToPrevious}
            className="mr-125 flex h-500 w-500 items-center justify-center rounded-full bg-transparent text-2xl text-text-subtle transition-all hover:bg-fill-neutral-default-default"
            aria-label="이전 이미지"
          >
            &lt;
          </button>

          {/* 카운터 */}
          <div className="flex items-center text-lg font-bold text-text-subtle">
            {currentIndex + 1} / {files.length}
          </div>

          {/* 다음 버튼 */}
          <button
            onClick={goToNext}
            className="ml-125 flex h-500 w-500 items-center justify-center rounded-full bg-transparent text-2xl text-text-subtle transition-all hover:bg-fill-neutral-default-default"
            aria-label="다음 이미지"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

// 미디어(이미지/비디오) 블록 공통 래퍼
function MediaFigure({
  caption,
  children,
}: {
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="my-800 w-full">
      {children}
      {caption && (
        <figcaption className="mt-200 text-center font-designer-13r text-text-subtlest">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function BlogDetailPage({ article }: BlogDetailPageProps) {
  const MarkdownComponents = {
    video: (props: any) => {
      const { src, children } = props;
      if (!src) return null;
      const videoUrl = src.startsWith('/') ? `${STRAPI_URL}${src}` : src;

      return (
        <MediaFigure>
          <video
            controls
            playsInline
            className="mx-auto w-full rounded-50 sm:w-4/5"
          >
            <source src={videoUrl} type="video/mp4" />
            {children}
          </video>
        </MediaFigure>
      );
    },

    img: (image: any) => {
      const { src, alt } = image;
      if (!src) return null;
      const imageUrl = src.startsWith('/') ? `${STRAPI_URL}${src}` : src;

      return (
        <MediaFigure>
          <Image
            src={imageUrl}
            alt={alt || ''}
            width={740}
            height={500}
            className="mx-auto w-full rounded-50 object-contain"
          />
        </MediaFigure>
      );
    },

    p: ({ children }: any) => (
      <p className="mb-350 text-[16px] leading-[1.75] text-text-default [&_strong]:font-bold [&_strong]:text-text-strong sm:text-[17px]">
        {children}
      </p>
    ),

    h1: ({ children }: any) => (
      <h1 className="mt-700 mb-250 text-[24px] font-bold leading-tight text-text-strong sm:text-[30px]">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mt-[60px] mb-300 text-[22px] font-bold leading-tight text-text-strong sm:text-[28px]">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-500 mb-200 text-[19px] font-bold leading-tight text-text-strong sm:text-[22px]">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="mt-400 mb-150 text-[17px] font-bold leading-tight text-text-strong sm:text-[18px]">
        {children}
      </h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="mt-300 mb-125 text-[16px] font-bold leading-tight text-text-strong">
        {children}
      </h5>
    ),

    ul: ({ children }: any) => (
      <ul className="mb-400 list-disc space-y-150 pl-300 text-[16px] leading-[1.75] text-text-default sm:text-[17px]">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="mb-400 list-decimal space-y-150 pl-300 text-[16px] leading-[1.75] text-text-default sm:text-[17px]">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li>{children}</li>,

    blockquote: ({ children }: any) => (
      <blockquote className="my-400 border-l-4 border-border-brand pl-200 text-[16px] leading-[1.75] text-text-subtle italic sm:text-[17px]">
        {children}
      </blockquote>
    ),

    a: ({ href, children }: any) => {
      if (!href) return <a>{children}</a>;

      const isVideoFile = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(href);
      if (isVideoFile) {
        const videoUrl = href.startsWith('/') ? `${STRAPI_URL}${href}` : href;

        return (
          <MediaFigure>
            <video
              controls
              playsInline
              className="mx-auto w-full rounded-50 sm:w-4/5"
            >
              <source src={videoUrl} type="video/mp4" />
              브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
          </MediaFigure>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-brand underline-offset-2 hover:underline"
        >
          {children}
        </a>
      );
    },

    hr: () => <hr className="my-600 border-0 border-t border-border-subtle" />,

    strong: ({ children }: any) => (
      <strong className="font-bold text-text-strong">{children}</strong>
    ),

    // block code: pre가 배경/패딩/overflow 전담하므로 스타일 없이 반환
    // inline code: 배경·색상·패딩만 담당
    code: ({ children, className }: any) => {
      const isBlock = className?.includes('language-');
      if (isBlock) {
        return (
          <code className="font-mono font-designer-13r leading-[1.7] text-text-default">
            {children}
          </code>
        );
      }

      return (
        <code className="rounded-25 bg-background-accent-gray-subtle px-75 py-25 font-mono font-designer-13r text-text-error">
          {children}
        </code>
      );
    },

    // pre가 블록 코드의 배경·패딩·overflow·radius를 단독 담당
    pre: ({ children }: any) => (
      <pre className="my-400 overflow-x-auto rounded-50 bg-background-alternative p-250 font-designer-13r leading-[1.7] text-text-default">
        {children}
      </pre>
    ),
  };

  const renderBlock = (block: any, index: number) => {
    // 1. Rich Text
    if (block.__component?.includes('rich-text')) {
      if (Array.isArray(block.body)) {
        return (
          <div key={index} className="space-y-200">
            {block.body.map((item: any, i: number) => {
              if (item.type === 'paragraph') {
                return (
                  <p
                    key={i}
                    className="mb-200 text-[16px] leading-[1.75] text-text-default"
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

      return (
        <div key={index} className="text-[16px] text-text-default">
          {block.body ? (
            <ReactMarkdown
              components={MarkdownComponents}
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
          className="my-400 rounded-r-50 border-l-4 border-border-brand bg-background-accent-rose-subtle py-200 pl-200 pr-250"
        >
          {block.title && (
            <p className="mb-100 text-[16px] font-bold leading-[1.75] text-text-default">
              {block.title}
            </p>
          )}
          <p className="text-[16px] leading-[1.75] text-text-subtle italic">
            {block.body}
          </p>
        </blockquote>
      );
    }

    // 3. 미디어
    if (block.__component?.includes('media')) {
      const resolveMedia = (raw: any) => {
        const fileData = raw?.data || raw;
        if (!fileData) return null;
        const url = fileData.url?.startsWith('/')
          ? `${STRAPI_URL}${fileData.url}`
          : fileData.url;
        if (!url) return null;

        return {
          url,
          mime: fileData.mime,
          name: fileData.name,
          alt: fileData.alternativeText || '',
        };
      };

      const media = resolveMedia(block.file) ?? resolveMedia(block.data);
      if (!media) return null;

      const isVideo =
        media.mime?.startsWith('video/') ||
        /\.(mp4|webm|ogg|mov)$/i.test(media.url);

      if (isVideo) {
        return (
          <MediaFigure key={index}>
            <video
              controls
              playsInline
              className="mx-auto w-full rounded-50 sm:w-4/5"
            >
              <source src={media.url} type={media.mime || 'video/mp4'} />
              브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
          </MediaFigure>
        );
      }

      return (
        <MediaFigure key={index}>
          <Image
            src={media.url}
            alt={media.alt}
            width={740}
            height={500}
            className="mx-auto w-full rounded-50 object-contain"
          />
        </MediaFigure>
      );
    }

    // 4. 슬라이더
    if (block.__component?.includes('slider')) {
      let files = null;
      if (block.files?.data) files = block.files.data;
      else if (block.files && Array.isArray(block.files)) files = block.files;
      else if (block.data && Array.isArray(block.data)) files = block.data;

      if (!files || files.length === 0) return null;

      return <ImageSlider key={index} files={files} />;
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
    <div className="w-full">
      {/* 커버 이미지 */}
      {coverUrl && (
        <div className="relative h-[360px] w-full sm:h-[480px]">
          <Image
            src={coverUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 본문 전체 래퍼 */}
      <div className="mx-auto w-full max-w-[740px] px-300 py-700 sm:px-500 lg:px-0">
        <article>
          {/* 헤더 영역 */}
          <header className="mb-600">
            {/* 카테고리 */}
            {article.category && (
              <div className="mb-150">
                <Link
                  href={`/insights?category=${article.category.slug}`}
                  className="font-designer-13r inline-flex items-center gap-50 rounded-full border border-border-default px-150 py-50 text-text-subtle transition-colors hover:border-border-brand hover:text-text-brand"
                >
                  {article.category.name}
                </Link>
              </div>
            )}

            {/* 제목 */}
            <h1 className="mb-200 text-[26px] font-bold leading-[1.35] text-text-strong sm:text-[34px]">
              {article.title}
            </h1>

            {/* 설명 */}
            {article.description && (
              <p className="mb-200 text-[18px] font-bold leading-[1.75] text-text-default">
                {article.description}
              </p>
            )}

            {/* 발행일 */}
            <time className="font-designer-14r text-text-subtlest">
              {formatDate(article.publishedAt)}
            </time>
          </header>

          {/* 본문 */}
          <section className="min-h-[200px]">
            {article.blocks && article.blocks.length > 0 ? (
              article.blocks.map((block: any, index: number) =>
                renderBlock(block, index),
              )
            ) : (
              <p className="text-text-subtlest italic">내용이 없습니다.</p>
            )}
          </section>

          {/* 저자 */}
          {article.author && (
            <>
              <hr className="my-600 border-0 border-t border-border-subtle" />
              <footer className="flex items-center gap-200 rounded-100 border border-border-default p-250">
                {article.author.avatar?.url && (
                  <div className="relative h-[56px] w-[56px] flex-shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={
                        article.author.avatar.url.startsWith('/')
                          ? `${STRAPI_URL}${article.author.avatar.url}`
                          : article.author.avatar.url
                      }
                      alt={article.author.name || ''}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-50">
                  <span className="font-designer-16b text-text-strong">
                    {article.author.name}
                  </span>
                  {article.author.email && (
                    <span className="font-designer-14r text-text-subtle">
                      {article.author.email}
                    </span>
                  )}
                </div>
              </footer>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
