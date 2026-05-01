'use client';

import { MaterialIcon } from './material-icon';

interface ImageAttachFieldProps {
  images: string[];
  setImages: (next: string[]) => void;
  max?: number;
}

export function ImageAttachField({
  images,
  setImages,
  max = 3,
}: ImageAttachFieldProps) {
  const tiles = Array.from({ length: max }).map((_, i) => {
    const has = !!images[i];
    return (
      <div
        key={i}
        style={{
          position: 'relative',
          aspectRatio: '1/1',
          border: has ? '1px solid #D5D7DA' : '1.5px dashed #D5D7DA',
          borderRadius: 10,
          background: has ? '#F5F5F5' : '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#717680',
          overflow: 'hidden',
        }}
      >
        {has ? (
          <>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                color: '#535862',
                padding: '6px 8px',
                textAlign: 'center',
                lineHeight: 1.3,
                wordBreak: 'break-all',
              }}
            >
              {images[i]}
            </div>
            <button
              type="button"
              onClick={() => setImages(images.filter((_, j) => j !== i))}
              aria-label="이미지 제거"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: 999,
                border: 0,
                background: 'rgba(16,24,40,0.7)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <MaterialIcon name="close" size={12} />
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#717680' }}>
            <MaterialIcon name="add_photo_alternate" size={20} />
            <div style={{ fontSize: 10, marginTop: 4 }}>이미지 {i + 1}</div>
          </div>
        )}
      </div>
    );
  });

  const canAdd = images.length < max;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => {
            if (!canAdd) return;
            const fname = `screenshot_${String(images.length + 1).padStart(2, '0')}.png`;
            setImages([...images, fname]);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            background: '#fff',
            color: canAdd ? '#181D27' : '#A4A7AE',
            border: '1px solid #D5D7DA',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: canAdd ? 'pointer' : 'not-allowed',
            opacity: canAdd ? 1 : 0.5,
            transition: 'background 150ms ease',
          }}
        >
          <MaterialIcon name="image" size={14} />
          이미지 첨부
        </button>
        <span
          style={{
            fontSize: 11,
            color: '#717680',
          }}
        >
          최대 {max}장 · {images.length}/{max} 첨부됨
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        {tiles}
      </div>
    </div>
  );
}
