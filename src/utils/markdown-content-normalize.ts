import {
  hasHtmlMediaTag,
  isHtmlContent,
  toNonEmptyTrimmedString,
} from './markdown-content-shared';
import { getRichContentVisibleText } from './markdown-content-text';

export const normalizeMarkdownContent = (content: unknown): string => {
  const trimmed = toNonEmptyTrimmedString(content);
  if (!trimmed) {
    return '';
  }

  if (!isHtmlContent(trimmed)) {
    return trimmed;
  }

  if (hasHtmlMediaTag(trimmed)) {
    return trimmed;
  }

  return getRichContentVisibleText(trimmed).length > 0 ? trimmed : '';
};
