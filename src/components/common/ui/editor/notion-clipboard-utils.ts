export const NOTION_BLOCKS_CLIPBOARD_TYPE = 'text/_notion-blocks-v3-production';
export const NOTION_PAGE_SOURCE_CLIPBOARD_TYPE =
  'text/_notion-page-source-production';

export const NOTION_CLIPBOARD_TYPES = [
  NOTION_BLOCKS_CLIPBOARD_TYPE,
  NOTION_PAGE_SOURCE_CLIPBOARD_TYPE,
] as const;

export const isNotionClipboard = (clipboardData: DataTransfer) => {
  const types = Array.from(clipboardData.types);

  return NOTION_CLIPBOARD_TYPES.some((type) => types.includes(type));
};

export const getNotionClipboardPayloads = (clipboardData: DataTransfer) => {
  return Object.fromEntries(
    NOTION_CLIPBOARD_TYPES.map((type) => [type, clipboardData.getData(type)]),
  );
};

const NOTION_ATTACHMENT_SOURCE_PATTERN = /^attachment:[^\s]+/i;

export const isNotionAttachmentSource = (source: string) => {
  return NOTION_ATTACHMENT_SOURCE_PATTERN.test(source.trim());
};

export const getNotionAttachmentPlaceholderText = (alt?: string) => {
  const normalizedAlt = alt?.trim();
  if (normalizedAlt) {
    return `[Notion 이미지: ${normalizedAlt} - 원본 이미지를 다시 업로드해주세요.]`;
  }

  return '[Notion 이미지 - 원본 이미지를 다시 업로드해주세요.]';
};
