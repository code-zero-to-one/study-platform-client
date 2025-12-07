// ✅ 전체 오류 수정 버전

'use client';

import { useEffect, useState } from 'react';

export interface Author {
  id: number;
  documentId: string;
  name: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export default function CreateArticlePage() {
  const API = process.env.NEXT_PUBLIC_STRAPI_URL;
  const TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const [cover, setCover] = useState<File | null>(null);

  const [authorId, setAuthorId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [blocks, setBlocks] = useState<any[]>([]);

  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------
  // Fetch Relations
  // -----------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      const authorsRes = await fetch(API + '/api/authors', {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }).then((r) => r.json());

      const categoryRes = await fetch(API + '/api/categories', {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }).then((r) => r.json());

      setAuthors(authorsRes.data);
      setCategories(categoryRes.data);
    };

    loadData();
  }, []);

  // -----------------------------------------------------
  // File Upload
  // -----------------------------------------------------
  const uploadFile = async (file: File): Promise<number> => {
    const form = new FormData();
    form.append('files', file);

    const res = await fetch(API + '/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: form,
    });

    const data = await res.json();

    return data?.[0]?.id;
  };

  // -----------------------------------------------------
  // Add Blocks
  // -----------------------------------------------------
  const addRichText = () => {
    setBlocks((prev) => [
      ...prev,
      { __component: 'shared.rich-text', body: '' },
    ]);
  };

  const addQuote = () => {
    setBlocks((prev) => [
      ...prev,
      { __component: 'shared.quote', quote: '', quoteAuthor: '' },
    ]);
  };

  const addMedia = () => {
    setBlocks((prev) => [...prev, { __component: 'shared.media', file: null }]);
  };

  const addSlider = () => {
    setBlocks((prev) => [...prev, { __component: 'shared.slider', files: [] }]);
  };

  const addSeo = () => {
    setBlocks((prev) => [
      ...prev,
      { __component: 'shared.seo', metaTitle: '', metaDescription: '' },
    ]);
  };

  // -----------------------------------------------------
  // Submit Article
  // -----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // 1) Upload cover
      let coverId = null;
      if (cover) {
        coverId = await uploadFile(cover);
      }

      // 2) Upload files inside dynamic blocks
      const processedBlocks = await Promise.all(
        blocks.map(async (block) => {
          // Media
          if (
            block.__component === 'shared.media' &&
            block.file instanceof File
          ) {
            const fileId = await uploadFile(block.file);
            return { ...block, file: fileId };
          }

          // Slider
          if (block.__component === 'shared.slider' && block.files.length > 0) {
            const uploadedIds = [];
            for (const f of block.files) {
              if (f instanceof File) {
                const id = await uploadFile(f);
                uploadedIds.push(id);
              }
            }
            return { ...block, files: uploadedIds };
          }

          return block;
        }),
      );

      // 3) POST article
      const res = await fetch(API + '/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            title,
            slug,
            description,
            cover: coverId,
            author: authorId,
            category: categoryId,
            blocks: processedBlocks, // 🔥 Dynamic Zone 필드 이름 여기!
            publishedAt: null,
          },
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.log('❌ Strapi Error:', json);
        throw new Error(json.error?.message || 'Unknown Error');
      }

      setResult('Article created successfully! 🎉');
    } catch (err: any) {
      setResult('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Create Article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            className="w-full border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block font-medium">Slug</label>
          <input
            type="text"
            className="w-full border p-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Description</label>
          <input
            type="text"
            className="w-full border p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Cover */}
        <div>
          <label className="block font-medium">Cover Image</label>
          <input
            type="file"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Author */}
        <div>
          <label className="block font-medium">Author</label>
          <select
            className="w-full border p-2"
            onChange={(e) => setAuthorId(Number(e.target.value))}
          >
            <option>Select Author</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium">Category</label>
          <select
            className="w-full border p-2"
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            <option>Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* BLOCKS */}
        <div className="space-y-4 rounded border p-4">
          <h2 className="text-lg font-semibold">Blocks</h2>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="border px-3 py-1"
              onClick={addRichText}
            >
              + Rich Text
            </button>

            <button
              type="button"
              className="border px-3 py-1"
              onClick={addQuote}
            >
              + Quote
            </button>

            <button
              type="button"
              className="border px-3 py-1"
              onClick={addMedia}
            >
              + Media
            </button>

            <button
              type="button"
              className="border px-3 py-1"
              onClick={addSlider}
            >
              + Slider
            </button>

            <button type="button" className="border px-3 py-1" onClick={addSeo}>
              + Seo
            </button>
          </div>

          {blocks.map((block, i) => (
            <div key={i} className="space-y-2 rounded border bg-gray-50 p-3">
              <div className="font-medium">{block.__component}</div>

              {/* Rich Text */}
              {block.__component === 'shared.rich-text' && (
                <textarea
                  className="w-full border p-2"
                  rows={4}
                  value={block.body}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b, idx) =>
                        idx === i ? { ...b, body: e.target.value } : b,
                      ),
                    )
                  }
                />
              )}

              {/* Quote */}
              {block.__component === 'shared.quote' && (
                <>
                  <input
                    className="w-full border p-2"
                    placeholder="Quote"
                    value={block.quote}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b, idx) =>
                          idx === i ? { ...b, quote: e.target.value } : b,
                        ),
                      )
                    }
                  />

                  <input
                    className="w-full border p-2"
                    placeholder="Quote Author"
                    value={block.quoteAuthor}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b, idx) =>
                          idx === i ? { ...b, quoteAuthor: e.target.value } : b,
                        ),
                      )
                    }
                  />
                </>
              )}

              {/* Media */}
              {block.__component === 'shared.media' && (
                <input
                  type="file"
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b, idx) =>
                        idx === i
                          ? { ...b, file: e.target.files?.[0] ?? null }
                          : b,
                      ),
                    )
                  }
                />
              )}

              {/* Slider */}
              {block.__component === 'shared.slider' && (
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b, idx) =>
                        idx === i
                          ? { ...b, files: Array.from(e.target.files || []) }
                          : b,
                      ),
                    )
                  }
                />
              )}

              {/* SEO */}
              {block.__component === 'shared.seo' && (
                <>
                  <input
                    className="w-full border p-2"
                    placeholder="Meta Title"
                    value={block.metaTitle}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b, idx) =>
                          idx === i ? { ...b, metaTitle: e.target.value } : b,
                        ),
                      )
                    }
                  />

                  <input
                    className="w-full border p-2"
                    placeholder="Meta Description"
                    value={block.metaDescription}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b, idx) =>
                          idx === i
                            ? { ...b, metaDescription: e.target.value }
                            : b,
                        ),
                      )
                    }
                  />
                </>
              )}
            </div>
          ))}
        </div>

        <button
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white"
        >
          {loading ? 'Processing...' : 'Create Article'}
        </button>
      </form>

      {result && <p className="mt-4 text-sm">{result}</p>}
    </div>
  );
}
