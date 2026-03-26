# 공용 마크다운 에디터 사용법

## 목적

`src/components/common/ui/editor/markdown-editor.tsx`는 TipTap 기반 공용 에디터 코어입니다.

- 도메인 정책 없이 `value / onChange / placeholder / normalizeContent / imageConfig`만 받습니다.
- 이미지 업로드를 지원할 수도 있고, 텍스트 전용으로도 쓸 수 있습니다.
- 현재 멘토링 도메인은 이 공용 코어 위에 얇은 래퍼를 올려서 사용합니다.

## 파일 위치

- 공용 코어: `src/components/common/ui/editor/markdown-editor.tsx`
- 멘토링 래퍼 예시: `src/features/mentoring/ui/registration/markdown/mentor-markdown-editor.tsx`
- 멘토링 마크다운 정책: `src/types/mentoring/markdown.ts`

## 가장 중요한 점

이 컴포넌트 이름은 `MarkdownEditor`지만, 부모에 넘기는 값은 전통적인 Markdown 문자열이 아니라 **정규화된 HTML 문자열**입니다.

즉 `onChange`로 받는 값은 내부적으로 아래 흐름을 따릅니다.

1. TipTap 에디터 상태 변경
2. `editor.getHTML()`
3. `normalizeContent(...)`
4. 부모 `onChange(next)`

그래서 사용하는 쪽에서는 다음을 반드시 구분해야 합니다.

- 입력 컴포넌트: `MarkdownEditor`
- 저장/검증 포맷: 각 도메인이 원하는 HTML 정규화 문자열
- 렌더링: 별도 preview/render 컴포넌트에서 처리

## 기본 Props

### `value`

- 타입: `string`
- 현재 에디터에 표시할 HTML 문자열입니다.

### `onChange`

- 타입: `(next: string) => void`
- 정규화된 HTML 문자열을 부모 상태로 올립니다.

### `placeholder`

- 타입: `string | undefined`
- 에디터가 비어 있을 때 보여줄 문구입니다.

### `normalizeContent`

- 타입: `(content: unknown) => string`
- 도메인별 HTML 정규화 함수를 주입할 때 사용합니다.
- 생략하면 `normalizeMarkdownContent`를 사용합니다.

### `imageConfig`

- 타입: `MarkdownEditorImageConfig | undefined`
- 이미지 업로드를 활성화할 때만 넣습니다.
- 생략하면 이미지 업로드, 붙여넣기, 드롭, 이미지 버튼이 비활성화됩니다.

```ts
export interface MarkdownEditorImageConfig {
  allowedImageExtensions: readonly string[];
  maxImageCount: number;
  maxImageFileSize: number;
  uploadImageFile: (file: File) => Promise<string>;
}
```

## 텍스트 전용 사용 예시

```tsx
'use client';

import { useState } from 'react';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';

export default function ExampleEditor() {
  const [value, setValue] = useState('');

  return (
    <MarkdownEditor
      value={value}
      onChange={setValue}
      placeholder="내용을 입력해주세요."
    />
  );
}
```

이 경우:

- 서식 툴바는 동작합니다.
- 이미지 업로드 기능은 없습니다.

## 이미지 업로드 포함 사용 예시

```tsx
'use client';

import { useCallback, useState } from 'react';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;

export default function ExampleEditorWithImages() {
  const [value, setValue] = useState('');

  const handleUploadImageFile = useCallback(async (file: File) => {
    const publicUrl = await uploadSomewhere(file);

    return publicUrl;
  }, []);

  return (
    <MarkdownEditor
      value={value}
      onChange={setValue}
      placeholder="내용을 입력해주세요."
      imageConfig={{
        allowedImageExtensions: ALLOWED_IMAGE_EXTENSIONS,
        maxImageCount: 3,
        maxImageFileSize: 5 * 1024 * 1024,
        uploadImageFile: handleUploadImageFile,
      }}
    />
  );
}
```

`uploadImageFile`은 **업로드 완료 후 최종 public URL 문자열을 반환**해야 합니다.

## 멘토링 도메인 사용 예시

멘토링에서는 공용 코어를 직접 쓰지 않고, 아래 래퍼를 통해 정책을 주입합니다.

```tsx
'use client';

import { memo, useCallback } from 'react';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import {
  requestMentorMarkdownImageUploadTicket,
  uploadMentorMarkdownImageFile,
} from '@/features/mentoring/model/mentor-markdown-image-upload';
import {
  MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  MENTOR_MARKDOWN_MAX_IMAGE_COUNT,
  MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE,
  normalizeMentorMarkdownContent,
} from '@/types/mentoring/markdown';

function MentorMarkdownEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const handleUploadImageFile = useCallback(async (file: File) => {
    const ticket = await requestMentorMarkdownImageUploadTicket({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    await uploadMentorMarkdownImageFile({
      uploadUrl: ticket.uploadUrl,
      file,
    });

    return ticket.publicUrl;
  }, []);

  return (
    <MarkdownEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      normalizeContent={normalizeMentorMarkdownContent}
      imageConfig={{
        allowedImageExtensions: MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
        maxImageCount: MENTOR_MARKDOWN_MAX_IMAGE_COUNT,
        maxImageFileSize: MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE,
        uploadImageFile: handleUploadImageFile,
      }}
    />
  );
}

export default memo(MentorMarkdownEditor);
```

이 구조의 장점은:

- 공용 코어는 멘토링 도메인을 모름
- 멘토링은 자기 정책만 래퍼에서 주입
- 다른 도메인도 같은 방식으로 별도 래퍼를 만들 수 있음

## 현재 제공 기능

- 볼드, 이탤릭, 밑줄, 취소선
- H1, H2, H3
- 인용문
- 순서 없는 목록, 순서 있는 목록
- 링크 삽입
- 코드블록
- 이미지 업로드
- 이미지 붙여넣기
- 이미지 드롭
- 이미지 폭 조절

## 붙여넣기/업로드 동작

이미지 관련 입력은 아래 순서로 처리됩니다.

1. 클립보드 파일
2. Clipboard API 이미지
3. HTML의 `img src`
4. 텍스트 이미지 URL

성공하면 업로드를 거쳐 최종 public URL을 본문에 삽입합니다.

## 주의사항

### 1. 저장 포맷은 HTML 기준

부모에서 Markdown 원문을 기대하면 안 됩니다.

```tsx
onChange(normalizeContent(updatedEditor.getHTML()));
```

즉 검증과 저장도 HTML 기준으로 설계해야 합니다.

### 2. 도메인 정책은 공용 코어에 넣지 않기

예:

- 이미지 개수 제한
- 허용 확장자
- 업로드 API
- 저장용 정규화 규칙

이런 값은 wrapper에서 넣어야 합니다.

### 3. 이미지 기능이 필요 없으면 `imageConfig`를 빼기

공용 코어는 `imageConfig`가 없을 때 이미지 기능을 자동으로 숨깁니다.

### 4. 렌더러와 에디터를 분리하기

입력용 에디터와 출력용 렌더러는 분리해서 생각해야 합니다.

- 입력: `MarkdownEditor`
- 출력: 도메인별 preview/render 컴포넌트

특히 멘토링처럼 preview 최적화나 이미지 깜빡임 대응이 필요하면,
출력은 별도 React 렌더 경로를 두는 편이 안전합니다.

## 추천 사용 패턴

새 도메인에서 도입할 때는 아래 순서를 권장합니다.

1. 공용 `MarkdownEditor`를 직접 쓰지 말고 도메인 래퍼를 만든다.
2. 도메인 전용 `normalizeContent`를 정의한다.
3. 이미지 정책이 있으면 `imageConfig`를 wrapper에서 주입한다.
4. preview/render도 도메인 컴포넌트로 분리한다.

## 한 줄 요약

공용 `MarkdownEditor`는 **도메인 정책 없는 TipTap 편집 코어**이고,  
실제 사용은 **도메인별 wrapper가 정규화와 이미지 정책을 주입하는 방식**이 이 저장소의 표준입니다.
