'use client';

import {
  type ReactNode,
  createElement,
  memo,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  MENTOR_MARKDOWN_CONTENT_CLASS,
  highlightMentorMarkdownCodeBlocks,
  normalizeMentorMarkdownToSanitizedHtml,
} from '@/features/mentoring/ui/registration/markdown/mentor-markdown-rendering';

interface MentorMarkdownPreviewContentProps {
  content: unknown;
  className?: string;
  emptyMessage?: string;
}

const ALLOWED_TAG_NAMES = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'u',
  'ul',
]);

const isElementNode = (node: Node): node is Element => {
  return node.nodeType === Node.ELEMENT_NODE;
};

const isTextNode = (node: Node): node is Text => {
  return node.nodeType === Node.TEXT_NODE;
};

const toElementProps = ({
  element,
  fallbackKey,
  imageOccurrenceBySrc,
}: {
  element: Element;
  fallbackKey: string;
  imageOccurrenceBySrc: Map<string, number>;
}) => {
  const tagName = element.tagName.toLowerCase();
  const props: Record<string, unknown> = {};
  let key = fallbackKey;

  if (tagName === 'img') {
    const src = element.getAttribute('src')?.trim();
    if (src) {
      const occurrence = imageOccurrenceBySrc.get(src) ?? 0;
      imageOccurrenceBySrc.set(src, occurrence + 1);
      key = `img:${src}:${occurrence}`;
      props.src = src;
    }

    const alt = element.getAttribute('alt');
    const title = element.getAttribute('title');
    const width = element.getAttribute('width');

    if (alt) {
      props.alt = alt;
    }
    if (title) {
      props.title = title;
    }
    if (width) {
      props.width = width;
    }
  } else if (tagName === 'a') {
    const href = element.getAttribute('href');
    const title = element.getAttribute('title');

    if (href) {
      props.href = href;
    }
    if (title) {
      props.title = title;
    }

    props.target = '_blank';
    props.rel = 'noreferrer';
  } else {
    const className = element.getAttribute('class');

    if (className) {
      props.className = className;
    }
  }

  props.key = key;

  return props;
};

const renderSanitizedNode = ({
  node,
  path,
  imageOccurrenceBySrc,
}: {
  node: Node;
  path: string;
  imageOccurrenceBySrc: Map<string, number>;
}): ReactNode => {
  if (isTextNode(node)) {
    return node.textContent;
  }

  if (!isElementNode(node)) {
    return null;
  }

  const tagName = node.tagName.toLowerCase();
  const children = Array.from(node.childNodes).map((childNode, index) =>
    renderSanitizedNode({
      node: childNode,
      path: `${path}.${index}`,
      imageOccurrenceBySrc,
    }),
  );

  if (!ALLOWED_TAG_NAMES.has(tagName)) {
    return children;
  }

  return createElement(
    tagName,
    toElementProps({
      element: node,
      fallbackKey: path,
      imageOccurrenceBySrc,
    }),
    ...children,
  );
};

function MentorMarkdownPreviewContent({
  content,
  className,
  emptyMessage = '아직 작성된 소개가 없습니다.',
}: MentorMarkdownPreviewContentProps) {
  const normalizedContent = typeof content === 'string' ? content : '';
  const hasContent = normalizedContent.trim().length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizedHtml = useMemo(() => {
    return normalizeMentorMarkdownToSanitizedHtml(normalizedContent);
  }, [normalizedContent]);

  const renderedNodes = useMemo(() => {
    if (!sanitizedHtml || typeof window === 'undefined') {
      return [];
    }

    const document = new window.DOMParser().parseFromString(
      sanitizedHtml,
      'text/html',
    );
    const imageOccurrenceBySrc = new Map<string, number>();

    return Array.from(document.body.childNodes).map((node, index) =>
      renderSanitizedNode({
        node,
        path: String(index),
        imageOccurrenceBySrc,
      }),
    );
  }, [sanitizedHtml]);

  useEffect(() => {
    highlightMentorMarkdownCodeBlocks(containerRef.current ?? undefined);
  }, [renderedNodes]);

  if (!hasContent) {
    return (
      <p className="font-designer-14r text-text-subtle leading-relaxed">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(MENTOR_MARKDOWN_CONTENT_CLASS, className)}
    >
      {renderedNodes}
    </div>
  );
}

export default memo(MentorMarkdownPreviewContent);
