const MARKDOWN_TABLE_SEPARATOR_CELL_PATTERN = /^:?-{3,}:?$/;

export const normalizeTableCell = (value: string) =>
  value.replace(/\s+/g, ' ').trim();

const splitMarkdownTableRow = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) {
    return [];
  }

  const normalized = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const withoutTrailingPipe = normalized.endsWith('|')
    ? normalized.slice(0, -1)
    : normalized;

  return withoutTrailingPipe.split('|').map(normalizeTableCell);
};

const isMarkdownTableSeparatorRow = (line: string) => {
  const cells = splitMarkdownTableRow(line);

  return (
    cells.length >= 2 &&
    cells.every((cell) => MARKDOWN_TABLE_SEPARATOR_CELL_PATTERN.test(cell))
  );
};

const isMarkdownTableBlock = (lines: readonly string[]) => {
  if (lines.length < 2 || !isMarkdownTableSeparatorRow(lines[1] ?? '')) {
    return false;
  }

  const headerCells = splitMarkdownTableRow(lines[0] ?? '');
  const separatorCells = splitMarkdownTableRow(lines[1] ?? '');

  return (
    headerCells.length >= 2 && headerCells.length === separatorCells.length
  );
};

const appendCells = (
  document: Document,
  rowElement: HTMLTableRowElement,
  tagName: 'td' | 'th',
  cells: readonly string[],
) => {
  cells.forEach((cell) => {
    const cellElement = document.createElement(tagName);
    cellElement.textContent = cell;
    rowElement.appendChild(cellElement);
  });
};

const createTableElement = (document: Document, lines: readonly string[]) => {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headerRow = document.createElement('tr');

  appendCells(document, headerRow, 'th', splitMarkdownTableRow(lines[0] ?? ''));
  thead.appendChild(headerRow);

  lines.slice(2).forEach((line) => {
    const cells = splitMarkdownTableRow(line);
    if (cells.length === 0) {
      return;
    }

    const bodyRow = document.createElement('tr');
    appendCells(document, bodyRow, 'td', cells);
    tbody.appendChild(bodyRow);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
};

export const convertTabularTextToMarkdownTable = (text: string) => {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split('\t').map(normalizeTableCell))
    .filter((cells) => cells.length >= 2 && cells.some(Boolean));

  if (rows.length === 0) {
    return undefined;
  }

  const columnCount = Math.max(...rows.map((cells) => cells.length));
  if (columnCount < 2) {
    return undefined;
  }

  const normalizedRows = rows.map((cells) =>
    Array.from({ length: columnCount }, (_, index) => cells[index] ?? ''),
  );
  const header = normalizedRows[0] ?? [];
  const bodyRows = normalizedRows.slice(1);
  const separator = Array.from({ length: columnCount }, () => '---');
  const toMarkdownRow = (cells: readonly string[]) =>
    `| ${cells.join(' | ')} |`;

  return [
    toMarkdownRow(header),
    toMarkdownRow(separator),
    ...bodyRows.map(toMarkdownRow),
  ].join('\n');
};

/**
 * 탭 구분 텍스트(스프레드시트 등에서 복사)를 실제 `<table>` HTML 문자열로 변환합니다.
 * TipTap 에디터에 insertContent로 넣으면 실제 표 노드(WYSIWYG)로 파싱됩니다.
 */
export const convertTabularTextToHtmlTable = (
  text: string,
): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const markdown = convertTabularTextToMarkdownTable(text);
  if (!markdown) {
    return undefined;
  }

  const document = window.document.implementation.createHTMLDocument('');
  const table = createTableElement(document, markdown.split('\n'));

  return table.outerHTML;
};

export const convertHtmlTableElementToMarkdownTable = (table: Element) => {
  const rows = Array.from(table.querySelectorAll('tr'))
    .map((row) =>
      Array.from(row.querySelectorAll('th,td')).map((cell) =>
        normalizeTableCell(cell.textContent ?? ''),
      ),
    )
    .filter((cells) => cells.length >= 2 && cells.some(Boolean));

  if (rows.length === 0) {
    return undefined;
  }

  return convertTabularTextToMarkdownTable(
    rows.map((cells) => cells.join('\t')).join('\n'),
  );
};

export const convertHtmlTableToMarkdownTable = (html: string) => {
  if (typeof window === 'undefined' || !html.trim()) {
    return undefined;
  }

  const document = new window.DOMParser().parseFromString(html, 'text/html');
  const tables = Array.from(document.querySelectorAll('table'));
  if (tables.length !== 1) {
    return undefined;
  }

  const table = tables[0];
  if (!table) {
    return undefined;
  }

  return convertHtmlTableElementToMarkdownTable(table);
};

export const isHtmlTableOnlyPaste = (html: string) => {
  if (typeof window === 'undefined' || !html.trim()) {
    return false;
  }

  const document = new window.DOMParser().parseFromString(html, 'text/html');
  const tables = Array.from(document.querySelectorAll('table'));
  if (tables.length !== 1) {
    return false;
  }

  const table = tables[0];
  if (!table || table.querySelector('img,video,audio,iframe,canvas,svg')) {
    return false;
  }

  const body = document.body.cloneNode(true) as HTMLElement;
  body
    .querySelectorAll('script,style,meta,link,table')
    .forEach((element) => element.remove());

  if (normalizeTableCell(body.textContent ?? '')) {
    return false;
  }

  return !body.querySelector('img,video,audio,iframe,canvas,svg');
};

export const renderMarkdownTablesInHtml = (html: string) => {
  if (typeof window === 'undefined' || !html.trim()) {
    return html;
  }

  const document = new window.DOMParser().parseFromString(html, 'text/html');
  const children = Array.from(document.body.children);
  let index = 0;

  while (index < children.length) {
    const child = children[index];
    if (!child || child.tagName.toLowerCase() !== 'p') {
      index += 1;
      continue;
    }

    const lines: string[] = [];
    const paragraphElements: Element[] = [];
    let nextIndex = index;

    while (nextIndex < children.length) {
      const nextChild = children[nextIndex];
      if (!nextChild || nextChild.tagName.toLowerCase() !== 'p') {
        break;
      }

      const line = normalizeTableCell(nextChild.textContent ?? '');
      if (!line.includes('|')) {
        break;
      }

      lines.push(line);
      paragraphElements.push(nextChild);
      nextIndex += 1;
    }

    if (isMarkdownTableBlock(lines)) {
      const table = createTableElement(document, lines);
      paragraphElements[0]?.replaceWith(table);
      paragraphElements.slice(1).forEach((element) => element.remove());
      index = nextIndex;
      continue;
    }

    index += 1;
  }

  return document.body.innerHTML;
};
