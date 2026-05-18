'use client';

import type { ClipboardEvent } from 'react';
import { useMemo, useState } from 'react';
import Button from '@/components/common/ui/button';
import { NOTION_CLIPBOARD_TYPES } from '@/components/common/ui/editor/notion-clipboard-utils';

interface ClipboardFileSummary {
  name: string;
  size: number;
  type: string;
}

interface ClipboardItemSummary {
  kind: string;
  type: string;
}

interface HtmlSummary {
  imageCount: number;
  imageSources: string[];
  tableCount: number;
  textLength: number;
}

interface ClipboardSnapshot {
  capturedAt: string;
  types: string[];
  items: ClipboardItemSummary[];
  files: ClipboardFileSummary[];
  plainText: string;
  html: string;
  notionPayloads: Record<string, string>;
  htmlSummary: HtmlSummary;
}

const summarizeHtml = (html: string): HtmlSummary => {
  if (typeof window === 'undefined' || !html.trim()) {
    return {
      imageCount: 0,
      imageSources: [],
      tableCount: 0,
      textLength: 0,
    };
  }

  const document = new window.DOMParser().parseFromString(html, 'text/html');
  const imageSources = Array.from(document.querySelectorAll('img'))
    .map((image) => image.getAttribute('src') ?? '')
    .filter(Boolean);

  return {
    imageCount: imageSources.length,
    imageSources,
    tableCount: document.querySelectorAll('table').length,
    textLength: (document.body.textContent ?? '').trim().length,
  };
};

const toClipboardSnapshot = (
  clipboardData: DataTransfer,
): ClipboardSnapshot => {
  const html = clipboardData.getData('text/html');
  const plainText = clipboardData.getData('text/plain');
  const notionPayloads = Object.fromEntries(
    NOTION_CLIPBOARD_TYPES.map((type) => [type, clipboardData.getData(type)]),
  );

  return {
    capturedAt: new Date().toISOString(),
    types: Array.from(clipboardData.types),
    items: Array.from(clipboardData.items).map((item) => ({
      kind: item.kind,
      type: item.type,
    })),
    files: Array.from(clipboardData.files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
    plainText,
    html,
    notionPayloads,
    htmlSummary: summarizeHtml(html),
  };
};

export default function AdminClipboardInspectorPage() {
  const [snapshot, setSnapshot] = useState<ClipboardSnapshot | null>(null);
  const [copyMessage, setCopyMessage] = useState('');
  const snapshotJson = useMemo(
    () => (snapshot ? JSON.stringify(snapshot, null, 2) : ''),
    [snapshot],
  );

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    setCopyMessage('');
    setSnapshot(toClipboardSnapshot(event.clipboardData));
  };

  const handleCopySnapshot = async () => {
    if (!snapshotJson) {
      return;
    }

    try {
      await navigator.clipboard.writeText(snapshotJson);
      setCopyMessage('진단 JSON을 클립보드에 복사했습니다.');
    } catch {
      setCopyMessage('복사에 실패했습니다. 아래 JSON을 직접 복사해주세요.');
    }
  };

  return (
    <section className="flex flex-col gap-200">
      <header className="border-border-default bg-background-default rounded-150 border p-250">
        <p className="font-designer-13r text-text-subtle">
          Admin Clipboard Inspector
        </p>
        <h1 className="font-designer-28b text-text-default mt-50">
          붙여넣기 진단
        </h1>
        <p className="font-designer-15r text-text-subtle mt-100">
          Notion에서 복사한 내용을 아래 박스에 Ctrl+V 하면 브라우저가 전달한
          clipboardData를 그대로 확인합니다. 저장, 업로드, 서버 전송은 하지
          않습니다.
        </p>
      </header>

      <div
        className="border-border-default bg-background-muted rounded-150 text-text-default font-designer-16r flex min-h-500 items-center justify-center border border-dashed p-300 outline-none focus:border-border-strong"
        role="textbox"
        tabIndex={0}
        onPaste={handlePaste}
      >
        여기를 클릭한 뒤 Notion에서 복사한 내용을 Ctrl+V 하세요.
      </div>

      {snapshot && (
        <div className="grid grid-cols-2 gap-200">
          <section className="border-border-default bg-background-default rounded-150 border p-200">
            <h2 className="font-designer-20b text-text-default">요약</h2>
            <dl className="font-designer-14r text-text-subtle mt-150 grid grid-cols-2 gap-100">
              <dt>capturedAt</dt>
              <dd className="text-text-default break-all">
                {snapshot.capturedAt}
              </dd>
              <dt>types</dt>
              <dd className="text-text-default break-all">
                {snapshot.types.join(', ') || '-'}
              </dd>
              <dt>items</dt>
              <dd className="text-text-default">{snapshot.items.length}</dd>
              <dt>files</dt>
              <dd className="text-text-default">{snapshot.files.length}</dd>
              <dt>plain text length</dt>
              <dd className="text-text-default">{snapshot.plainText.length}</dd>
              <dt>html length</dt>
              <dd className="text-text-default">{snapshot.html.length}</dd>
              <dt>html text length</dt>
              <dd className="text-text-default">
                {snapshot.htmlSummary.textLength}
              </dd>
              <dt>html images</dt>
              <dd className="text-text-default">
                {snapshot.htmlSummary.imageCount}
              </dd>
              <dt>html tables</dt>
              <dd className="text-text-default">
                {snapshot.htmlSummary.tableCount}
              </dd>
              <dt>Notion blocks length</dt>
              <dd className="text-text-default">
                {snapshot.notionPayloads['text/_notion-blocks-v3-production']
                  ?.length ?? 0}
              </dd>
              <dt>Notion source length</dt>
              <dd className="text-text-default">
                {snapshot.notionPayloads['text/_notion-page-source-production']
                  ?.length ?? 0}
              </dd>
            </dl>
          </section>

          <section className="border-border-default bg-background-default rounded-150 border p-200">
            <div className="flex items-center justify-between gap-100">
              <h2 className="font-designer-20b text-text-default">
                공유용 JSON
              </h2>
              <Button size="small" onClick={handleCopySnapshot}>
                JSON 복사
              </Button>
            </div>
            {copyMessage && (
              <p className="font-designer-13r text-text-subtle mt-100">
                {copyMessage}
              </p>
            )}
            <textarea
              className="border-border-default bg-background-muted text-text-default font-designer-13r mt-150 h-600 w-full resize-y rounded-100 border p-150"
              readOnly
              value={snapshotJson}
            />
          </section>

          <section className="border-border-default bg-background-default rounded-150 col-span-2 border p-200">
            <h2 className="font-designer-20b text-text-default">
              text/html 원문
            </h2>
            <textarea
              className="border-border-default bg-background-muted text-text-default font-designer-13r mt-150 h-600 w-full resize-y rounded-100 border p-150"
              readOnly
              value={snapshot.html || '(empty)'}
            />
          </section>

          <section className="border-border-default bg-background-default rounded-150 col-span-2 border p-200">
            <h2 className="font-designer-20b text-text-default">
              text/plain 원문
            </h2>
            <textarea
              className="border-border-default bg-background-muted text-text-default font-designer-13r mt-150 h-300 w-full resize-y rounded-100 border p-150"
              readOnly
              value={snapshot.plainText || '(empty)'}
            />
          </section>

          {Object.entries(snapshot.notionPayloads).map(([type, payload]) => (
            <section
              key={type}
              className="border-border-default bg-background-default rounded-150 col-span-2 border p-200"
            >
              <h2 className="font-designer-20b text-text-default">
                {type} 원문
              </h2>
              <textarea
                className="border-border-default bg-background-muted text-text-default font-designer-13r mt-150 h-400 w-full resize-y rounded-100 border p-150"
                readOnly
                value={payload || '(empty)'}
              />
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
