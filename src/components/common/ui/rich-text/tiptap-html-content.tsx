'use client';

import DOMPurify from 'dompurify';

interface TiptapHtmlContentProps {
  html: string;
}

/**
 * tiptap 에디터로 작성된 본문(HTML 또는 평문)을 렌더링하는 공용 뷰어.
 * HTML 문자열은 DOMPurify로 살균한 뒤 주입하고, 평문은 그대로 출력한다.
 * QnA/피드 상세 등 여러 곳에서 중복되던 렌더 블록을 단일 컴포넌트로 통합한다.
 */
export default function TiptapHtmlContent({ html }: TiptapHtmlContentProps) {
  const isHtml = /<[a-z]/i.test(html);

  if (!isHtml) {
    return (
      <div className="tiptap-editor">
        <div className="tiptap whitespace-pre-wrap font-designer-16r leading-relaxed text-gray-800">
          {html}
        </div>
      </div>
    );
  }

  const sanitized =
    typeof window !== 'undefined' ? DOMPurify.sanitize(html) : html;

  return (
    <div className="tiptap-editor">
      <div
        className="tiptap font-designer-16r leading-relaxed text-gray-800"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: DOMPurify로 살균한 HTML만 렌더링한다.
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </div>
  );
}
