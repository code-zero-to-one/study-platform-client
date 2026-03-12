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

export default function BlogDetailPage({ article }: BlogDetailPageProps) {
  // 마크다운 렌더러용 커스텀 컴포넌트 설정
  const MarkdownComponents = {
    // 비디오 태그 처리
    video: (props: any) => {
      const { src, controls, style, children } = props;

      if (!src) {
        return null;
      }

      const videoUrl = src.startsWith('/') ? `${STRAPI_URL}${src}` : src;

      return (
        <span className="mb-[18px] flex justify-center">
          <video
            controls={controls !== undefined ? controls : true}
            playsInline
            className="h-auto w-2/3 rounded-[10px]"
          >
            <source src={videoUrl} type="video/mp4" />
            {children}
          </video>
        </span>
      );
    },
    // 이미지 변환 (![alt](src) -> <Image />)
    img: (image: any) => {
      const { src, alt } = image;

      if (!src) {
        return null;
      }

      // 이미지 URL 처리 (상대 경로면 STRAPI_URL 붙이기)
      const imageUrl = src.startsWith('/') ? `${STRAPI_URL}${src}` : src;

      return (
        <span className="mb-[18px] flex justify-center">
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
      <p className="font-designer-18r mb-[18px] leading-8 text-[#333D4B]">
        {children}
      </p>
    ),
    // 제목 (h1 ~ h5)
    h1: ({ children }: any) => (
      <h1 className="mt-16 mb-200 text-3xl leading-tight font-bold text-[#181D27]">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mt-14 mb-200 text-2xl leading-tight font-bold text-[#181D27]">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-12 mb-200 text-xl leading-tight font-bold text-[#181D27]">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="mt-10 mb-200 text-lg leading-tight font-bold text-[#181D27]">
        {children}
      </h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="mt-8 mb-200 text-base leading-tight font-bold text-[#181D27]">
        {children}
      </h5>
    ),
    // 리스트
    ul: ({ children }: any) => (
      <ul className="my-8 list-inside list-disc space-y-3">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="my-8 list-inside list-decimal space-y-3">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="font-designer-18r leading-8 text-[#333D4B]">{children}</li>
    ),
    // 인용구
    blockquote: ({ children }: any) => (
      <blockquote className="my-8 border-l-4 border-[var(--color-rose-500)] bg-[var(--color-rose-200)] p-6 leading-8 text-[#535862] italic">
        {children}
      </blockquote>
    ),
    // 링크 (비디오 파일이면 video 태그로, 아니면 새 탭으로 열기)
    a: ({ href, children }: any) => {
      if (!href) {
        return <a>{children}</a>;
      }

      // 비디오 파일 확장자 체크
      const isVideoFile = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(href);

      if (isVideoFile) {
        const videoUrl = href.startsWith('/') ? `${STRAPI_URL}${href}` : href;

        return (
          <figure className="mb-[18px] flex justify-center">
            <video controls playsInline className="h-auto w-2/3 rounded-[10px]">
              <source src={videoUrl} type="video/mp4" />
              브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
          </figure>
        );
      }

      // 일반 링크
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-rose-500)] hover:underline"
        >
          {children}
        </a>
      );
    },
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
                    className="font-designer-18r mb-6 leading-8 text-[#333D4B]"
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
        <div
          key={index}
          className="font-designer-18r text-[#333D4B]"
        >
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
          className="my-8 rounded-r-lg border-l-4 border-[var(--color-rose-500)] bg-[var(--color-rose-100)] p-6"
        >
          {block.title && (
            <p className="font-designer-18b mb-3 leading-8 text-[#333D4B]">
              {block.title}
            </p>
          )}
          <p className="font-designer-18r leading-8 text-[#535862] italic">
            {block.body}
          </p>
        </blockquote>
      );
    }

    // 3. 미디어 (단독 블록 - Media: 이미지, 비디오, GIF 등)
    if (block.__component?.includes('media')) {
      // block.file이 있는 경우 처리
      if (block.file) {
        const fileData = block.file.data || block.file;
        if (!fileData) return null;

        const mediaUrl = fileData.url?.startsWith('/')
          ? `${STRAPI_URL}${fileData.url}`
          : fileData.url;

        if (!mediaUrl) return null;

        // MIME 타입이나 확장자로 비디오인지 확인
        const isVideo =
          fileData.mime?.startsWith('video/') ||
          mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);

        if (isVideo) {
          return (
            <figure key={index} className="mb-[18px] flex justify-center">
              <video
                controls
                playsInline
                className="h-auto w-2/3 rounded-[10px]"
              >
                <source src={mediaUrl} type={fileData.mime || 'video/mp4'} />
                브라우저가 비디오 태그를 지원하지 않습니다.
              </video>
            </figure>
          );
        }

        // 이미지 또는 GIF 처리
        return (
          <figure key={index} className="mb-[18px] flex justify-center">
            <Image
              src={mediaUrl}
              alt={fileData.name || fileData.alternativeText || 'Media Image'}
              width={800}
              height={500}
              className="h-auto w-2/3 rounded-[10px]"
            />
          </figure>
        );
      }

      // block에 직접 미디어 데이터가 있는 경우 처리
      if (block.data) {
        const mediaData = Array.isArray(block.data)
          ? block.data[0]
          : block.data;
        const mediaUrl = mediaData?.url?.startsWith('/')
          ? `${STRAPI_URL}${mediaData.url}`
          : mediaData?.url;

        if (!mediaUrl) return null;

        // MIME 타입이나 확장자로 비디오인지 확인
        const isVideo =
          mediaData.mime?.startsWith('video/') ||
          mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i);

        if (isVideo) {
          return (
            <figure key={index} className="mb-[18px] flex justify-center">
              <video
                controls
                playsInline
                className="h-auto w-2/3 rounded-[10px]"
              >
                <source src={mediaUrl} type={mediaData.mime || 'video/mp4'} />
                브라우저가 비디오 태그를 지원하지 않습니다.
              </video>
            </figure>
          );
        }

        // 이미지 또는 GIF 처리
        return (
          <figure key={index} className="mb-[18px] flex justify-center">
            <Image
              src={mediaUrl}
              alt={mediaData.name || mediaData.alternativeText || 'Media Image'}
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
    if (block.__component?.includes('slider')) {
      // files 데이터 확인 (여러 가능성 체크)
      let files = null;

      if (block.files?.data) {
        files = block.files.data;
      } else if (block.files && Array.isArray(block.files)) {
        files = block.files;
      } else if (block.data && Array.isArray(block.data)) {
        files = block.data;
      }

      if (!files || files.length === 0) {
        return null;
      }

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
      {/* 커버 이미지 (GNB 바로 아래, 전체 너비) */}
      {coverUrl && (
        <div className="relative h-[500px] w-full">
          <Image
            src={coverUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="flex w-full justify-center py-600">
        <article className="mx-auto w-full max-w-5xl">
          {/* 제목 영역 (테두리 제거) */}
          <div className="mb-[50px] p-300">
            {/* 카테고리 버튼 */}
            {article.category && (
              <div className="mb-100">
                <Link
                  href={`/insights?category=${article.category.slug}`}
                  className="font-designer-15b inline-flex h-8 items-center justify-center gap-2 rounded-full bg-transparent px-3 text-[#535862] transition-colors hover:bg-[#F3F4F6]"
                >
                  {article.category.name}
                </Link>
              </div>
            )}

            {/* 제목 */}
            <h1 className="font-designer-32b mb-100 leading-tight text-[#181D27]">
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

          {/* 본문 영역 카드 */}
          <div className="rounded-100 mb-[75px] min-h-[200px] space-y-10 p-300">
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
            <div className="rounded-100 flex items-center border border-solid border-[#D5D7DA] p-300">
              {article.author.avatar?.url && (
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={`${STRAPI_URL}${article.author.avatar.url}`}
                    alt={article.author.name || ''}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="ml-100 flex flex-col gap-1">
                <span className="font-designer-20b text-[#181D27]">
                  {article.author.name}
                </span>
                {article.author.email && (
                  <span className="font-designer-16r text-[#535862]">
                    {article.author.email}
                  </span>
                )}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
