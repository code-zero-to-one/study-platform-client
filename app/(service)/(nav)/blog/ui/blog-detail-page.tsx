'use client';

import Link from 'next/link';
import { createElement } from 'react';
import {
  Article,
  QuoteBlock,
  RichTextBlock,
  RichTextChild,
  RichTextItem,
} from '@/shared/strapi/api/fetch-articles';

interface BlogDetailPageProps {
  article: Article & { id: number; documentId: string };
  memberId?: number;
}

export default function BlogDetailPage({ article }: BlogDetailPageProps) {
  // Rich Text 자식 요소 렌더링
  const renderRichTextChildren = (
    children: RichTextChild[],
    keyPrefix: string,
  ) => {
    return children.map((child: RichTextChild, j: number) => {
      const text = child.text || '';
      const key = `${keyPrefix}-${j}`;

      if (child.code) {
        return (
          <code key={key} className="rounded bg-gray-100 px-1 py-0.5 text-sm">
            {text}
          </code>
        );
      }

      let element = <span key={key}>{text}</span>;

      if (child.bold) element = <strong key={key}>{element}</strong>;
      if (child.italic) element = <em key={key}>{element}</em>;
      if (child.underline) element = <u key={key}>{element}</u>;
      if (child.strikethrough) element = <s key={key}>{element}</s>;

      return element;
    });
  };

  // Rich Text 블록 렌더링
  const renderRichTextBlock = (block: RichTextBlock, index: number) => {
    return (
      <div key={index} className="space-y-4">
        {block.body?.map((item: RichTextItem, i: number) => {
          // 단락
          if (item.type === 'paragraph') {
            return (
              <p
                key={i}
                className="font-designer-16r leading-relaxed text-[#252B37]"
              >
                {item.children &&
                  renderRichTextChildren(item.children, `p-${i}`)}
              </p>
            );
          }

          // 제목
          if (item.type === 'heading') {
            const level = Math.min(Math.max(item.level || 2, 1), 6);
            const text =
              item.children?.map((c: RichTextChild) => c.text).join('') || '';
            const headingClasses = {
              h1: 'font-designer-32b mt-10 mb-6 text-[#181D27]',
              h2: 'font-designer-24b mt-8 mb-4 text-[#181D27]',
              h3: 'font-designer-20b mt-6 mb-3 text-[#181D27]',
              h4: 'font-designer-18b mt-5 mb-2 text-[#181D27]',
              h5: 'font-designer-16b mt-4 mb-2 text-[#181D27]',
              h6: 'font-designer-14b mt-3 mb-2 text-[#181D27]',
            };

            const tagName = `h${level}` as
              | 'h1'
              | 'h2'
              | 'h3'
              | 'h4'
              | 'h5'
              | 'h6';

            return createElement(
              tagName,
              {
                key: i,
                className: headingClasses[tagName],
              },
              text,
            );
          }

          // 리스트
          if (item.type === 'list') {
            const ListTag = item.format === 'ordered' ? 'ol' : 'ul';
            const listClasses =
              item.format === 'ordered'
                ? 'list-decimal list-inside space-y-2 ml-4'
                : 'list-disc list-inside space-y-2 ml-4';

            // 리스트는 items 필드를 사용하거나 children을 리스트 아이템으로 사용
            const listItems = item.items || item.children || [];

            return (
              <ListTag
                key={i}
                className={`font-designer-16r text-[#252B37] ${listClasses}`}
              >
                {listItems.map(
                  (listItem: RichTextItem | RichTextChild, liIndex: number) => {
                    // RichTextItem인 경우 children을 렌더링
                    if ('type' in listItem && listItem.children) {
                      return (
                        <li key={liIndex}>
                          {renderRichTextChildren(
                            listItem.children,
                            `li-${i}-${liIndex}`,
                          )}
                        </li>
                      );
                    }
                    // RichTextChild인 경우 직접 렌더링
                    if ('text' in listItem) {
                      return (
                        <li key={liIndex}>
                          {renderRichTextChildren(
                            [listItem],
                            `li-${i}-${liIndex}`,
                          )}
                        </li>
                      );
                    }

                    return null;
                  },
                )}
              </ListTag>
            );
          }

          // 인용구
          if (item.type === 'quote') {
            return (
              <blockquote
                key={i}
                className="my-4 border-l-4 border-[#4F46E5] bg-[#F5F3FF] pl-4 italic"
              >
                {item.children &&
                  renderRichTextChildren(item.children, `quote-${i}`)}
              </blockquote>
            );
          }

          // 코드 블록
          if (item.type === 'code') {
            const code =
              item.children?.map((c: RichTextChild) => c.text).join('') || '';

            return (
              <pre
                key={i}
                className="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100"
              >
                <code>{code}</code>
              </pre>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // 인용구 블록 렌더링
  const renderQuoteBlock = (block: QuoteBlock, index: number) => {
    return (
      <blockquote
        key={index}
        className="my-8 rounded-r-lg border-l-4 border-[#4F46E5] bg-[#F5F3FF] p-6"
      >
        {block.title && (
          <p className="font-designer-18b mb-3 text-[#252B37]">{block.title}</p>
        )}
        <p className="font-designer-16r text-[#535862] italic">{block.body}</p>
      </blockquote>
    );
  };

  // 마크다운 문자열을 렌더링하는 함수
  const renderMarkdownBody = (body: string, index: number) => {
    const lines = body.split('\n');
    const elements: React.ReactElement[] = [];
    let currentList: string[] = [];

    lines.forEach((line: string, i: number) => {
      // 제목 처리 (## 또는 ###)
      if (line.startsWith('## ')) {
        if (currentList.length > 0) {
          elements.push(
            <ul
              key={`list-${i}`}
              className="ml-4 list-inside list-disc space-y-1"
            >
              {currentList.map((item, idx) => (
                <li key={idx} className="font-designer-16r text-[#252B37]">
                  {item}
                </li>
              ))}
            </ul>,
          );
          currentList = [];
        }
        elements.push(
          <h2 key={i} className="font-designer-24b mt-8 mb-4 text-[#181D27]">
            {line.replace(/^## /, '')}
          </h2>,
        );
      } else if (line.startsWith('### ')) {
        if (currentList.length > 0) {
          elements.push(
            <ul
              key={`list-${i}`}
              className="ml-4 list-inside list-disc space-y-1"
            >
              {currentList.map((item, idx) => (
                <li key={idx} className="font-designer-16r text-[#252B37]">
                  {item}
                </li>
              ))}
            </ul>,
          );
          currentList = [];
        }
        elements.push(
          <h3 key={i} className="font-designer-20b mt-6 mb-3 text-[#181D27]">
            {line.replace(/^### /, '')}
          </h3>,
        );
      } else if (line.trim().startsWith('- ')) {
        // 리스트 항목 처리
        currentList.push(line.replace(/^- /, '').trim());
      } else if (line.trim() === '') {
        // 빈 줄 - 리스트가 있으면 먼저 렌더링
        if (currentList.length > 0) {
          elements.push(
            <ul
              key={`list-${i}`}
              className="ml-4 list-inside list-disc space-y-1"
            >
              {currentList.map((item, idx) => (
                <li key={idx} className="font-designer-16r text-[#252B37]">
                  {item}
                </li>
              ))}
            </ul>,
          );
          currentList = [];
        }
        elements.push(<br key={i} />);
      } else {
        // 일반 단락
        if (currentList.length > 0) {
          elements.push(
            <ul
              key={`list-${i}`}
              className="ml-4 list-inside list-disc space-y-1"
            >
              {currentList.map((item, idx) => (
                <li key={idx} className="font-designer-16r text-[#252B37]">
                  {item}
                </li>
              ))}
            </ul>,
          );
          currentList = [];
        }
        elements.push(
          <p
            key={i}
            className="font-designer-16r leading-relaxed text-[#252B37]"
          >
            {line}
          </p>,
        );
      }
    });

    // 마지막 리스트 처리
    if (currentList.length > 0) {
      elements.push(
        <ul key="list-final" className="ml-4 list-inside list-disc space-y-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="font-designer-16r text-[#252B37]">
              {item}
            </li>
          ))}
        </ul>,
      );
    }

    return (
      <div key={index} className="space-y-4">
        {elements}
      </div>
    );
  };

  // 블록 렌더링 메인 함수 (이미지 블록 제외)
  const renderBlock = (block: Record<string, unknown>, index: number) => {
    const component = block.__component as string;

    // shared.* 형식도 처리
    if (component === 'shared.rich-text' || component === 'blocks.rich-text') {
      // body가 마크다운 문자열인 경우 처리
      if (typeof block.body === 'string') {
        return renderMarkdownBody(block.body, index);
      }

      // 구조화된 body인 경우 기존 로직 사용
      return renderRichTextBlock(block as unknown as RichTextBlock, index);
    }

    if (component === 'shared.quote' || component === 'blocks.quote') {
      return renderQuoteBlock(block as unknown as QuoteBlock, index);
    }

    // 이미지 관련 블록은 렌더링하지 않음
    if (
      component === 'shared.media' ||
      component === 'blocks.media' ||
      component === 'shared.slider' ||
      component === 'blocks.slider'
    ) {
      return null;
    }

    return null;
  };

  return (
    <div className="flex w-full gap-600 py-600">
      <article className="mx-auto w-full max-w-4xl px-4">
        <div className="mb-6">
          <Link
            href="/blog"
            className="font-designer-16r inline-flex items-center gap-2 text-[#4F46E5] hover:text-[#4338CA]"
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

        <div className="mb-8 flex flex-wrap items-center gap-4 text-[#9CA3AF]">
          {article.publishedAt && (
            <time className="font-designer-14r">
              {new Date(article.publishedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
          {article.author && (
            <>
              {article.publishedAt && (
                <span className="font-designer-14r">•</span>
              )}
              <span className="font-designer-14r">
                작성자: {article.author.name}
              </span>
            </>
          )}
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {article.blocks && article.blocks.length > 0 ? (
            article.blocks
              .map((block, index) =>
                renderBlock(block as unknown as Record<string, unknown>, index),
              )
              .filter((element) => element !== null)
          ) : (
            <p className="font-designer-16r text-[#9CA3AF]">
              콘텐츠가 없습니다.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
