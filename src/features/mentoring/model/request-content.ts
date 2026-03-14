import { extractImageUrls } from '@/types/mentoring/markdown';
import type {
  MentoringRequestContentBlock,
  MentoringRequestFileBlock,
  MentoringRequestImageBlock,
  MentoringRequestLinkBlock,
  MentoringRequestParagraphBlock,
  MentoringRequestRichTextBlock,
  MentoringRequestRichTextNode,
} from '@/types/mentoring/request-content';

export type {
  MentoringRequestContentBlock,
  MentoringRequestFileBlock,
  MentoringRequestImageBlock,
  MentoringRequestLinkBlock,
  MentoringRequestParagraphBlock,
  MentoringRequestRichTextBlock,
  MentoringRequestRichTextNode,
} from '@/types/mentoring/request-content';

export const DEFAULT_MENTORING_REQUEST_RICH_TEXT_DOCUMENT: MentoringRequestRichTextNode[] =
  [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

interface MentoringRequestAttachmentLike {
  fileKey?: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  publicUrl?: string;
  downloadUrl?: string;
}

const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;
const HTML_LINK_PATTERN = /<a[^>]+href="([^"]+)"/gi;

const decodeHtmlEntities = (value: string) => {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const stripHtmlTags = (html: string) => {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h1|h2|h3|blockquote|pre)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  );
};

const getFileNameFromUrl = (url: string) => {
  try {
    const pathname = new URL(url, 'https://zeroone.local').pathname;
    const fileName = pathname.split('/').pop()?.trim();

    return fileName && fileName.length > 0 ? fileName : url;
  } catch {
    return url;
  }
};

const extractHtmlLinks = (html: string) => {
  return Array.from(html.matchAll(HTML_LINK_PATTERN))
    .map((match) => (match[1] ?? '').trim())
    .filter((url) => url.length > 0);
};

const getHtmlAttachmentData = (html: string) => {
  return {
    fileNames: extractImageUrls(html).map(getFileNameFromUrl),
    links: extractHtmlLinks(html),
  };
};

const getHtmlMessageLines = (html: string) => {
  const plainText = stripHtmlTags(html)
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const attachmentData = getHtmlAttachmentData(html);
  const imageLines = attachmentData.fileNames.map((fileName) => {
    return `[이미지] ${fileName}`;
  });
  const linkLines = attachmentData.links.map((url) => {
    return `[링크] ${url}`;
  });

  return [...plainText, ...imageLines, ...linkLines];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const getStringField = (
  source: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = source[key];

  return typeof value === 'string' ? value : undefined;
};

const getChildren = (
  node: MentoringRequestRichTextNode,
): MentoringRequestRichTextNode[] => {
  const children = node.children;
  if (!Array.isArray(children)) {
    return [];
  }

  return children.filter(isRecord);
};

const getPlainTextFromRichTextNode = (
  node: MentoringRequestRichTextNode,
): string => {
  const text = getStringField(node, 'text');
  if (text !== undefined) {
    return text;
  }

  return getChildren(node).map(getPlainTextFromRichTextNode).join('');
};

const walkRichTextNodes = (
  nodes: MentoringRequestRichTextNode[],
  visitor: (node: MentoringRequestRichTextNode) => void,
) => {
  nodes.forEach((node) => {
    visitor(node);
    walkRichTextNodes(getChildren(node), visitor);
  });
};

const getRichTextAttachmentData = (nodes: MentoringRequestRichTextNode[]) => {
  const fileNames: string[] = [];
  const links: string[] = [];

  walkRichTextNodes(nodes, (node) => {
    const nodeType = getStringField(node, 'type');
    if (nodeType === 'image' || nodeType === 'file') {
      const fileName = getStringField(node, 'fileName')?.trim();
      if (fileName) {
        fileNames.push(fileName);
      }

      return;
    }

    if (nodeType === 'link') {
      const url = getStringField(node, 'url')?.trim();
      if (url) {
        links.push(url);
      }
    }
  });

  return {
    fileNames,
    links,
  };
};

const toRichTextMessageLines = (nodes: MentoringRequestRichTextNode[]) => {
  return nodes.flatMap((node) => {
    const nodeType = getStringField(node, 'type');

    if (nodeType === 'image') {
      const fileName = getStringField(node, 'fileName')?.trim();

      return fileName ? [`[이미지] ${fileName}`] : [];
    }

    if (nodeType === 'file') {
      const fileName = getStringField(node, 'fileName')?.trim();

      return fileName ? [`[첨부파일] ${fileName}`] : [];
    }

    if (nodeType === 'link') {
      const url = getStringField(node, 'url')?.trim();

      return url ? [`[링크] ${url}`] : [];
    }

    if (nodeType === 'bulleted-list' || nodeType === 'numbered-list') {
      const children = getChildren(node);

      return children
        .map((item, index) => {
          const itemText = getPlainTextFromRichTextNode(item).trim();
          if (!itemText) {
            return '';
          }

          return nodeType === 'numbered-list'
            ? `${index + 1}. ${itemText}`
            : `- ${itemText}`;
        })
        .filter((line) => line.length > 0);
    }

    const text = getPlainTextFromRichTextNode(node).trim();

    return text ? [text] : [];
  });
};

const createBlockId = () => {
  return `request-block-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

export const parseMentoringRequestRichTextDocument = (
  document: string,
): MentoringRequestRichTextNode[] => {
  if (HTML_TAG_PATTERN.test(document)) {
    return [];
  }

  try {
    const parsed = JSON.parse(document);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isRecord);
  } catch {
    return [];
  }
};

export const serializeMentoringRequestRichTextDocument = (
  document: MentoringRequestRichTextNode[],
) => {
  return JSON.stringify(document);
};

export const isMentoringRequestHtmlDocument = (document: string) => {
  return HTML_TAG_PATTERN.test(document);
};

export const createMentoringRequestParagraphBlock = (
  text = '',
): MentoringRequestParagraphBlock => {
  return {
    id: createBlockId(),
    type: 'paragraph',
    text,
  };
};

export const createMentoringRequestImageBlock = ({
  fileName,
  fileSize,
  mimeType,
  fileKey,
  publicUrl,
  downloadUrl,
  file,
}: {
  fileName: string;
  fileSize: number;
  mimeType?: string;
  fileKey?: string;
  publicUrl?: string;
  downloadUrl?: string;
  file?: File;
}): MentoringRequestImageBlock => {
  return {
    id: createBlockId(),
    type: 'image',
    fileName,
    fileSize,
    mimeType,
    fileKey,
    publicUrl,
    downloadUrl,
    file,
  };
};

export const createMentoringRequestFileBlock = ({
  fileName,
  fileSize,
  mimeType,
  fileKey,
  downloadUrl,
  publicUrl,
  file,
}: {
  fileName: string;
  fileSize: number;
  mimeType?: string;
  fileKey?: string;
  downloadUrl?: string;
  publicUrl?: string;
  file?: File;
}): MentoringRequestFileBlock => {
  return {
    id: createBlockId(),
    type: 'file',
    fileName,
    fileSize,
    mimeType,
    fileKey,
    downloadUrl,
    publicUrl,
    file,
  };
};

export const createMentoringRequestLinkBlock = (
  url: string,
): MentoringRequestLinkBlock => {
  return {
    id: createBlockId(),
    type: 'link',
    url,
  };
};

export const createMentoringRequestRichTextBlock = (
  document: MentoringRequestRichTextNode[] = DEFAULT_MENTORING_REQUEST_RICH_TEXT_DOCUMENT,
  id?: string,
): MentoringRequestRichTextBlock => {
  return {
    id: id ?? createBlockId(),
    type: 'richText',
    document: serializeMentoringRequestRichTextDocument(document),
  };
};

export const createMentoringRequestHtmlBlock = (
  html: string,
  id?: string,
): MentoringRequestRichTextBlock => {
  return {
    id: id ?? createBlockId(),
    type: 'richText',
    document: html,
  };
};

export const convertMentoringRequestLegacyTextToHtml = (text: string) => {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return '';
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => {
      return `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
};

export const convertMentoringRequestContentsToHtml = (
  contents: MentoringRequestContentBlock[],
) => {
  return contents
    .flatMap((block) => {
      if (block.type === 'richText') {
        if (isMentoringRequestHtmlDocument(block.document)) {
          return block.document.trim().length > 0 ? [block.document] : [];
        }

        return [
          convertMentoringRequestLegacyTextToHtml(
            buildMentoringRequestMessage([block]),
          ),
        ].filter((html) => html.trim().length > 0);
      }

      if (block.type === 'paragraph') {
        const trimmed = block.text.trim();

        return trimmed.length > 0 ? [`<p>${escapeHtml(trimmed)}</p>`] : [];
      }

      if (block.type === 'link') {
        const url = block.url.trim();
        if (url.length === 0) {
          return [];
        }

        const escapedUrl = escapeHtml(url);

        return [`<p><a href="${escapedUrl}">${escapedUrl}</a></p>`];
      }

      const label = block.type === 'image' ? '[이미지]' : '[첨부파일]';
      const fileName = block.fileName.trim();

      return fileName.length > 0
        ? [`<p>${label} ${escapeHtml(fileName)}</p>`]
        : [];
    })
    .join('');
};

export const getMentoringRequestTextLength = (
  contents: MentoringRequestContentBlock[],
) => {
  return contents.reduce((length, block) => {
    if (block.type === 'paragraph') {
      return length + block.text.trim().length;
    }

    if (block.type === 'richText') {
      if (isMentoringRequestHtmlDocument(block.document)) {
        return length + stripHtmlTags(block.document).trim().length;
      }

      const parsedDocument = parseMentoringRequestRichTextDocument(
        block.document,
      );
      const plainText = parsedDocument
        .map(getPlainTextFromRichTextNode)
        .join('');

      return length + plainText.trim().length;
    }

    return length;
  }, 0);
};

export const hasMentoringRequestAttachment = (
  contents: MentoringRequestContentBlock[],
) => {
  return contents.some((block) => {
    if (block.type === 'richText') {
      if (isMentoringRequestHtmlDocument(block.document)) {
        const attachmentData = getHtmlAttachmentData(block.document);

        return (
          attachmentData.fileNames.length > 0 || attachmentData.links.length > 0
        );
      }

      const parsedDocument = parseMentoringRequestRichTextDocument(
        block.document,
      );
      const attachmentData = getRichTextAttachmentData(parsedDocument);

      return (
        attachmentData.fileNames.length > 0 || attachmentData.links.length > 0
      );
    }

    return (
      block.type === 'image' || block.type === 'file' || block.type === 'link'
    );
  });
};

export const buildMentoringRequestMessage = (
  contents: MentoringRequestContentBlock[],
) => {
  const lines = contents
    .map((block) => {
      if (block.type === 'richText') {
        if (isMentoringRequestHtmlDocument(block.document)) {
          return getHtmlMessageLines(block.document).join('\n\n');
        }

        const parsedDocument = parseMentoringRequestRichTextDocument(
          block.document,
        );

        return toRichTextMessageLines(parsedDocument).join('\n\n');
      }

      if (block.type === 'paragraph') {
        return block.text.trim();
      }
      if (block.type === 'image') {
        return `[이미지] ${block.fileName}`;
      }
      if (block.type === 'file') {
        return `[첨부파일] ${block.fileName}`;
      }

      return `[링크] ${block.url}`;
    })
    .filter((line) => line.length > 0);

  return lines.join('\n\n').trim();
};

export const getMentoringRequestAttachedFileNames = (
  contents: MentoringRequestContentBlock[],
) => {
  const fileNames: string[] = [];

  contents.forEach((block) => {
    if (block.type === 'image' || block.type === 'file') {
      fileNames.push(block.fileName);

      return;
    }

    if (block.type === 'richText') {
      if (isMentoringRequestHtmlDocument(block.document)) {
        const attachmentData = getHtmlAttachmentData(block.document);

        fileNames.push(...attachmentData.fileNames);

        return;
      }

      const parsedDocument = parseMentoringRequestRichTextDocument(
        block.document,
      );
      const attachmentData = getRichTextAttachmentData(parsedDocument);

      fileNames.push(...attachmentData.fileNames);
    }
  });

  return Array.from(new Set(fileNames));
};

export const getMentoringRequestAttachmentFileKeys = (
  contents: MentoringRequestContentBlock[],
) => {
  return Array.from(
    new Set(
      contents.flatMap((block) => {
        if (block.type !== 'image' && block.type !== 'file') {
          return [];
        }

        const fileKey = block.fileKey?.trim();

        return fileKey ? [fileKey] : [];
      }),
    ),
  );
};

export const getMentoringRequestReferenceLinks = (
  contents: MentoringRequestContentBlock[],
) => {
  const links: string[] = [];

  contents.forEach((block) => {
    if (block.type === 'link') {
      links.push(block.url);

      return;
    }

    if (block.type === 'richText') {
      if (isMentoringRequestHtmlDocument(block.document)) {
        const attachmentData = getHtmlAttachmentData(block.document);

        links.push(...attachmentData.links);

        return;
      }

      const parsedDocument = parseMentoringRequestRichTextDocument(
        block.document,
      );
      const attachmentData = getRichTextAttachmentData(parsedDocument);

      links.push(...attachmentData.links);
    }
  });

  return Array.from(new Set(links));
};

export const sanitizeMentoringRequestContents = (
  contents: MentoringRequestContentBlock[],
): MentoringRequestContentBlock[] => {
  const sanitized = contents.filter((block) => {
    if (block.type === 'richText') {
      if (isMentoringRequestHtmlDocument(block.document)) {
        const plainText = stripHtmlTags(block.document);
        const attachmentData = getHtmlAttachmentData(block.document);

        return (
          plainText.trim().length > 0 ||
          attachmentData.fileNames.length > 0 ||
          attachmentData.links.length > 0
        );
      }

      const parsedDocument = parseMentoringRequestRichTextDocument(
        block.document,
      );
      const plainText = parsedDocument
        .map(getPlainTextFromRichTextNode)
        .join('');
      const attachmentData = getRichTextAttachmentData(parsedDocument);

      return (
        plainText.trim().length > 0 ||
        attachmentData.fileNames.length > 0 ||
        attachmentData.links.length > 0
      );
    }

    if (block.type === 'paragraph') {
      return block.text.trim().length > 0;
    }

    if (block.type === 'link') {
      return block.url.trim().length > 0;
    }

    return block.fileName.trim().length > 0;
  });

  return sanitized;
};

export const createMentoringRequestAttachmentBlock = (
  attachment: MentoringRequestAttachmentLike,
) => {
  const commonFields = {
    fileKey: attachment.fileKey,
    fileName: attachment.fileName,
    fileSize: attachment.fileSize,
    mimeType: attachment.mimeType,
    publicUrl: attachment.publicUrl,
    downloadUrl: attachment.downloadUrl,
  };

  if (attachment.mimeType?.startsWith('image/')) {
    return createMentoringRequestImageBlock(commonFields);
  }

  return createMentoringRequestFileBlock(commonFields);
};

export const mergeMentoringRequestContentsWithAttachments = ({
  contents,
  attachments,
}: {
  contents?: MentoringRequestContentBlock[];
  attachments?: MentoringRequestAttachmentLike[];
}) => {
  const normalizedContents = contents ?? [];
  const normalizedAttachments = attachments ?? [];

  if (normalizedAttachments.length === 0) {
    return normalizedContents;
  }

  const existingAttachmentKeys = new Set(
    normalizedContents.flatMap((block) => {
      if (block.type !== 'image' && block.type !== 'file') {
        return [];
      }

      const candidates = [block.fileKey, block.fileName]
        .map((value) => value?.trim())
        .filter((value): value is string => !!value);

      return candidates;
    }),
  );
  const nextAttachmentBlocks = normalizedAttachments.flatMap((attachment) => {
    const attachmentKeys = [attachment.fileKey, attachment.fileName]
      .map((value) => value?.trim())
      .filter((value): value is string => !!value);
    const alreadyExists = attachmentKeys.some((value) => {
      return existingAttachmentKeys.has(value);
    });

    if (alreadyExists) {
      return [];
    }

    attachmentKeys.forEach((value) => {
      existingAttachmentKeys.add(value);
    });

    return [createMentoringRequestAttachmentBlock(attachment)];
  });

  return [...normalizedContents, ...nextAttachmentBlocks];
};
