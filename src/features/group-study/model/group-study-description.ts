import { getRichContentVisibleTextLength } from '@/utils/markdown-content-text';

export const getGroupStudyDescriptionTextLength = (content: unknown) =>
  getRichContentVisibleTextLength(content);
