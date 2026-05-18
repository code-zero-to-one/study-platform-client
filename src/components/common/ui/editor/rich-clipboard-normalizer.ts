import { convertHtmlTableElementToMarkdownTable } from './markdown-table-utils';
import {
  getNotionAttachmentPlaceholderText,
  isNotionAttachmentSource,
} from './notion-clipboard-utils';

interface RichClipboardNormalizationResult {
  html: string;
  hasChanges: boolean;
  notionAttachmentCount: number;
  tableCount: number;
}

const replaceElementWithParagraphLines = (
  document: Document,
  element: Element,
  lines: readonly string[],
) => {
  const fragment = document.createDocumentFragment();

  lines.forEach((line) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    fragment.appendChild(paragraph);
  });

  element.replaceWith(fragment);
};

const normalizeTables = (document: Document) => {
  let tableCount = 0;

  Array.from(document.querySelectorAll('table')).forEach((table) => {
    const markdownTable = convertHtmlTableElementToMarkdownTable(table);
    if (!markdownTable) {
      return;
    }

    replaceElementWithParagraphLines(
      document,
      table,
      markdownTable.split('\n'),
    );
    tableCount += 1;
  });

  return tableCount;
};

const normalizeNotionAttachmentImages = (document: Document) => {
  let notionAttachmentCount = 0;

  Array.from(document.querySelectorAll('img')).forEach((image) => {
    const source = image.getAttribute('src') ?? '';
    if (!isNotionAttachmentSource(source)) {
      return;
    }

    const paragraph = document.createElement('p');
    paragraph.textContent = getNotionAttachmentPlaceholderText(
      image.getAttribute('alt') ?? undefined,
    );
    image.replaceWith(paragraph);
    notionAttachmentCount += 1;
  });

  return notionAttachmentCount;
};

export const normalizeRichClipboardHtml = (
  html: string,
): RichClipboardNormalizationResult => {
  if (typeof window === 'undefined' || !html.trim()) {
    return {
      html,
      hasChanges: false,
      notionAttachmentCount: 0,
      tableCount: 0,
    };
  }

  const document = new window.DOMParser().parseFromString(html, 'text/html');
  const tableCount = normalizeTables(document);
  const notionAttachmentCount = normalizeNotionAttachmentImages(document);

  return {
    html: document.body.innerHTML,
    hasChanges: tableCount > 0 || notionAttachmentCount > 0,
    notionAttachmentCount,
    tableCount,
  };
};
