'use client';

import dayjs from 'dayjs';
import { extractImageUrls } from '@/types/mentoring/markdown';
import type {
  MentoringConversationMessage,
  MentoringRequest,
} from '@/types/mentoring/management-domain';

const HTML_BREAK_PATTERN = /<br\s*\/?>/gi;
const HTML_CLOSE_BLOCK_PATTERN = /<\/(p|div|h1|h2|h3|blockquote|pre|li)>/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const HTML_ENTITY_PATTERN =
  /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;/g;
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const MULTIPLE_WHITESPACE_PATTERN = /[ \t]+/g;
const MULTIPLE_LINE_BREAK_PATTERN = /\n{3,}/g;

const decodeHtmlEntity = (value: string) => {
  switch (value) {
    case '&nbsp;':
      return ' ';
    case '&amp;':
      return '&';
    case '&lt;':
      return '<';
    case '&gt;':
      return '>';
    case '&quot;':
      return '"';
    case '&#39;':
    case '&#x27;':
      return "'";
    default:
      return value;
  }
};

export const toNoteConsultationMessagePlainText = (content: string) => {
  const withMarkdownImagePlaceholder = content.replace(
    MARKDOWN_IMAGE_PATTERN,
    (_match, url: string) => {
      return `[이미지] ${url.trim()}`;
    },
  );
  const withMarkdownLinkLabel = withMarkdownImagePlaceholder.replace(
    MARKDOWN_LINK_PATTERN,
    (_match, label: string) => label.trim(),
  );
  const strippedHtml = withMarkdownLinkLabel
    .replace(HTML_BREAK_PATTERN, '\n')
    .replace(HTML_CLOSE_BLOCK_PATTERN, '\n')
    .replace(HTML_TAG_PATTERN, ' ')
    .replace(HTML_ENTITY_PATTERN, (entity) => decodeHtmlEntity(entity))
    .replace(MULTIPLE_WHITESPACE_PATTERN, ' ')
    .replace(/\n +/g, '\n')
    .replace(/ +\n/g, '\n')
    .replace(MULTIPLE_LINE_BREAK_PATTERN, '\n\n');

  return strippedHtml.trim();
};

export const hasNoteConsultationMessageContent = (content: string) => {
  return (
    toNoteConsultationMessagePlainText(content).length > 0 ||
    extractImageUrls(content).length > 0
  );
};

export const getNoteConsultationMessageMetaLabel = (content: string) => {
  const plainTextLength = toNoteConsultationMessagePlainText(content).length;
  const imageCount = extractImageUrls(content).length;

  if (plainTextLength === 0 && imageCount === 0) {
    return '내용 없음';
  }

  const parts: string[] = [];
  if (plainTextLength > 0) {
    parts.push(`텍스트 ${plainTextLength}자`);
  }
  if (imageCount > 0) {
    parts.push(`이미지 ${imageCount}개`);
  }

  return parts.join(' · ');
};

export const getNoteConsultationMessagePreviewText = (content: string) => {
  const plainText = toNoteConsultationMessagePlainText(content);
  if (plainText.length > 0) {
    return plainText;
  }

  const imageCount = extractImageUrls(content).length;
  if (imageCount > 0) {
    return imageCount === 1 ? '[이미지 1개]' : `[이미지 ${imageCount}개]`;
  }

  return '';
};

export const getConversationWithFallback = (
  request: MentoringRequest,
): MentoringConversationMessage[] => {
  const hasMenteeMessage = request.conversation.some((message) => {
    return message.sender === 'MENTEE';
  });
  const fallbackMenteeMessage: MentoringConversationMessage | null =
    hasMenteeMessage
      ? null
      : {
          id: `${request.id}-fallback-mentee`,
          sender: 'MENTEE',
          content: request.requestMessage,
          messageContents: request.requestContents,
          attachedFiles: request.attachedFiles,
          attachedFileNames: request.attachedFileNames,
          referenceLinks: request.referenceLinks,
          createdAt: request.requestedAt,
        };

  return [
    ...(fallbackMenteeMessage ? [fallbackMenteeMessage] : []),
    ...request.conversation,
  ].sort((first, second) => {
    return dayjs(first.createdAt).valueOf() - dayjs(second.createdAt).valueOf();
  });
};

export const hasMentorReply = (request: MentoringRequest) => {
  return getConversationWithFallback(request).some((message) => {
    return message.sender === 'MENTOR';
  });
};

export const getLatestMentorReply = (request: MentoringRequest) => {
  return [...getConversationWithFallback(request)]
    .filter((message) => message.sender === 'MENTOR')
    .sort((first, second) => {
      return dayjs(first.createdAt).valueOf() - dayjs(second.createdAt).valueOf();
    })
    .at(-1);
};

export const getLastMessagePreview = (request: MentoringRequest) => {
  const messages = getConversationWithFallback(request);
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    return {
      content: getNoteConsultationMessagePreviewText(request.requestMessage),
      createdAt: request.requestedAt,
    };
  }

  return {
    content: getNoteConsultationMessagePreviewText(lastMessage.content),
    createdAt: lastMessage.createdAt,
  };
};
