'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { STRAPI_URL } from '@/api/strapi/api/common-strapi-fetch';
import { Article } from '@/api/strapi/api/fetch-articles';

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
    <div className="mb-[18px] flex justify-center">
      <div className="w-2/3">
        {/* 이미지 컨테이너 */}
        <div className="relative overflow-hidden rounded-[10px] bg-gray-100">
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
          <div className="mt-4 flex justify-center gap-2">
            {files.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 w-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-[var(--color-rose-500)]'
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
                aria-label={`${index + 1}번째 이미지로 이동`}
              />
            ))}
          </div>
        )}

        {/* 이미지 카운터 + 좌우 버튼 */}
        <div className="mt-2 flex items-center justify-center gap-4">
          {/* 이전 버튼 */}
          <button
            onClick={goToPrevious}
            className="mr-[10px] flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-2xl text-gray-700 transition-all hover:bg-gray-200"
            aria-label="이전 이미지"
          >
            &lt;
          </button>

          {/* 카운터 */}
          <div className="flex items-center text-lg font-bold text-gray-700">
            {currentIndex + 1} / {files.length}
          </div>

          {/* 다음 버튼 */}
          <button
            onClick={goToNext}
            className="ml-[10px] flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-2xl text-gray-700 transition-all hover:bg-gray-200"
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
        <figcaption className="mt-200 text-center text-[13px] text-[#8C9098]">
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
            className="mx-auto w-full rounded-[4px] sm:w-4/5"
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
            className="mx-auto w-full rounded-[4px] object-contain"
          />
        </MediaFigure>
      );
    },

    p: ({ children }: any) => (
      <p className="mb-[28px] text-[16px] leading-[1.75] text-[#333d4b] [&_strong]:font-bold [&_strong]:text-[#191f28] sm:text-[17px]">
        {children}
      </p>
    ),

    h1: ({ children }: any) => (
      <h1 className="mt-[56px] mb-[20px] text-[24px] font-bold leading-tight text-[#191f28] sm:text-[30px]">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mt-[60px] mb-[24px] text-[22px] font-bold leading-tight text-[#191f28] sm:text-[28px]">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-[40px] mb-[16px] text-[19px] font-bold leading-tight text-[#191f28] sm:text-[22px]">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="mt-[32px] mb-[12px] text-[17px] font-bold leading-tight text-[#191f28] sm:text-[18px]">
        {children}
      </h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="mt-[24px] mb-[10px] text-[16px] font-bold leading-tight text-[#191f28]">
        {children}
      </h5>
    ),

    ul: ({ children }: any) => (
      <ul className="mb-[32px] list-disc space-y-[12px] pl-[24px] text-[16px] leading-[1.75] text-[#333d4b] sm:text-[17px]">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="mb-[32px] list-decimal space-y-[12px] pl-[24px] text-[16px] leading-[1.75] text-[#333d4b] sm:text-[17px]">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li>{children}</li>,

    blockquote: ({ children }: any) => (
      <blockquote className="my-[32px] border-l-4 border-[var(--color-rose-500)] pl-[16px] text-[16px] leading-[1.75] text-[#535862] italic sm:text-[17px]">
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
              className="mx-auto w-full rounded-[4px] sm:w-4/5"
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
          className="text-[var(--color-rose-500)] underline-offset-2 hover:underline"
        >
          {children}
        </a>
      );
    },

    hr: () => <hr className="my-[48px] border-0 border-t border-[#e5e5e5]" />,

    strong: ({ children }: any) => (
      <strong className="font-bold text-[#1a1a1a]">{children}</strong>
    ),

    code: ({ children, className }: any) => {
      const isBlock = className?.includes('language-');
      if (isBlock) {
        return (
          <code className="block overflow-x-auto rounded-[4px] bg-[#F6F8FA] px-[16px] py-[12px] font-mono text-[13px] leading-[1.7] text-[#333]">
            {children}
          </code>
        );
      }

      return (
        <code className="rounded-[3px] bg-[#F0F0F0] px-[5px] py-[2px] font-mono text-[13px] text-[#E03E1A]">
          {children}
        </code>
      );
    },

    pre: ({ children }: any) => (
      <pre className="my-[32px] overflow-x-auto rounded-[4px] bg-[#F6F8FA] p-[20px] text-[13px] leading-[1.7]">
        {children}
      </pre>
    ),
  };

  const renderBlock = (block: any, index: number) => {
    // 1. Rich Text
    if (block.__component?.includes('rich-text')) {
      if (Array.isArray(block.body)) {
        return (
          <div key={index} className="space-y-[16px]">
            {block.body.map((item: any, i: number) => {
              if (item.type === 'paragraph') {
                return (
                  <p
                    key={i}
                    className="mb-[16px] text-[15px] leading-[1.8] text-[#333]"
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
        <div key={index} className="text-[15px] text-[#333]">
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
          className="my-[32px] rounded-r-[4px] border-l-4 border-[var(--color-rose-500)] bg-[var(--color-rose-50)] py-[16px] pl-[16px] pr-[20px]"
        >
          {block.title && (
            <p className="mb-[8px] text-[15px] font-bold leading-[1.8] text-[#333]">
              {block.title}
            </p>
          )}
          <p className="text-[15px] leading-[1.8] text-[#535862] italic">
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
          name: fileData.name || fileData.alternativeText,
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
              className="mx-auto w-full rounded-[4px] sm:w-4/5"
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
            alt={media.name || ''}
            width={740}
            height={500}
            className="mx-auto w-full rounded-[4px] object-contain"
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
      <div className="mx-auto w-full max-w-[740px] px-[24px] py-[56px] sm:px-[40px] lg:px-0">
        <article>
          {/* 헤더 영역 */}
          <header className="mb-[48px]">
            {/* 카테고리 */}
            {article.category && (
              <div className="mb-[12px]">
                <Link
                  href={`/insights?category=${article.category.slug}`}
                  className="font-designer-13r inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] px-[12px] py-[4px] text-[#535862] transition-colors hover:border-[var(--color-rose-500)] hover:text-[var(--color-rose-500)]"
                >
                  {article.category.name}
                </Link>
              </div>
            )}

            {/* 제목 */}
            <h1 className="mb-[16px] text-[26px] font-bold leading-[1.35] text-[#191f28] sm:text-[34px]">
              {article.title}
            </h1>

            {/* 설명 */}
            {article.description && (
              <p className="mb-[16px] text-[18px] font-bold leading-[1.75] text-[#333]">
                {article.description}
              </p>
            )}

            {/* 발행일 */}
            <time className="font-designer-14r text-[#8C9098]">
              {formatDate(article.createdAt)}
            </time>
          </header>

          {/* 본문 */}
          <section className="min-h-[200px]">
            {article.blocks && article.blocks.length > 0 ? (
              article.blocks.map((block: any, index: number) =>
                renderBlock(block, index),
              )
            ) : (
              <p className="text-[#9CA3AF] italic">내용이 없습니다.</p>
            )}
          </section>

          {/* 저자 */}
          {article.author && (
            <>
              <hr className="my-[48px] border-0 border-t border-[#e5e5e5]" />
              <footer className="flex items-center gap-[16px] rounded-[8px] border border-[#E5E7EB] p-[20px]">
                {article.author.avatar?.url && (
                  <div className="relative h-[56px] w-[56px] flex-shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={`${STRAPI_URL}${article.author.avatar.url}`}
                      alt={article.author.name || ''}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-[4px]">
                  <span className="font-designer-16b text-[#181D27]">
                    {article.author.name}
                  </span>
                  {article.author.email && (
                    <span className="font-designer-14r text-[#535862]">
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
