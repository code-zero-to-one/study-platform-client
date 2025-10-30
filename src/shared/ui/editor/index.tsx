'use client';

import React, { useMemo } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

interface EditorProps {
  value?: string;
  onValueChange?: (val: string) => void;
  placeholder?: string;
}

export const SlateBaseEditor: React.FC<EditorProps> = ({
  value = '',
  onValueChange,
  placeholder,
}) => {
  const editor = useMemo(() => withReact(createEditor()), []);

  const initialValue: Descendant[] = useMemo(
    () => [{ type: 'paragraph', children: [{ text: value }] }],
    [value],
  );

  return (
    <div className="min-h-[120px] rounded border p-2">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(val) => {
          const text = val
            .map((node) => {
              if ('children' in node) {
                return node.children
                  .map((child) => ('text' in child ? child.text : ''))
                  .join('');
              } else if ('text' in node) {
                return node.text;
              }

              return '';
            })
            .join('\n');

          onValueChange?.(text);
        }}
      >
        <Editable
          placeholder={placeholder || '내용을 입력하세요.'}
          className="min-h-[100px] outline-none"
        />
      </Slate>
    </div>
  );
};
