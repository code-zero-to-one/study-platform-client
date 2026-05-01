'use client';

import { type ChangeEvent, useRef } from 'react';
import { MaterialIcon } from './material-icon';

interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
}

export function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder,
  rows = 8,
  maxLength = 5000,
  showCounter = true,
}: MarkdownEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  const wrap = (left: string, right: string = left) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end);
    const inserted = sel || '텍스트';
    const next =
      value.slice(0, start) + left + inserted + right + value.slice(end);
    onChange(next);
    setTimeout(() => {
      ta.focus();
      const pos = start + left.length;
      ta.setSelectionRange(pos, pos + inserted.length);
    }, 0);
  };

  const insertLine = (prefix: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = value.slice(0, start);
    const lineStart = before.lastIndexOf('\n') + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const tools = [
    { icon: 'format_bold', title: '굵게', onClick: () => wrap('**') },
    { icon: 'format_italic', title: '기울임', onClick: () => wrap('_') },
    { icon: 'link', title: '링크', onClick: () => wrap('[', '](url)') },
    { icon: 'code', title: '인라인 코드', onClick: () => wrap('`') },
    {
      icon: 'format_list_bulleted',
      title: '리스트',
      onClick: () => insertLine('- '),
    },
    {
      icon: 'format_list_numbered',
      title: '번호 리스트',
      onClick: () => insertLine('1. '),
    },
  ];

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    onChange(e.target.value);

  return (
    <div
      style={{
        border: '1px solid #D5D7DA',
        borderRadius: 10,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 2,
          padding: '6px 8px',
          borderBottom: '1px solid #E9EAEB',
          background: '#FAFAFA',
        }}
      >
        {tools.map((t) => (
          <button
            key={t.icon}
            type="button"
            onClick={t.onClick}
            title={t.title}
            aria-label={t.title}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: 0,
              color: '#535862',
              background: 'transparent',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E9EAEB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <MaterialIcon name={t.icon} size={16} />
          </button>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <textarea
          id={id}
          ref={taRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          style={{
            width: '100%',
            border: 0,
            outline: 'none',
            padding: '12px 14px',
            paddingBottom: showCounter ? 28 : 12,
            fontFamily: 'inherit',
            fontSize: 13,
            lineHeight: 1.6,
            resize: 'vertical',
            background: '#fff',
            color: '#181D27',
            minHeight: 88,
            display: 'block',
          }}
        />
        {showCounter ? (
          <span
            style={{
              position: 'absolute',
              right: 12,
              bottom: 8,
              fontSize: 10.5,
              color: '#A4A7AE',
              fontFamily: 'inherit',
              pointerEvents: 'none',
              background: 'rgba(255,255,255,0.85)',
              padding: '1px 6px',
              borderRadius: 4,
            }}
          >
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}
