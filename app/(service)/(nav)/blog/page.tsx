// app/(service)/(nav)/blog/page.tsx
import { fetchArticles } from '@/shared/strapi/api/fetch-articles';

export const revalidate = 60;

export default async function BlogListPage() {
  const res = await fetchArticles();

  const articles = res.data ?? [];

  return (
    <div className="mx-auto h-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">블로그</h1>

      {articles.length === 0 && (
        <p className="text-gray-500">아직 등록된 글이 없습니다.</p>
      )}

      <ul className="space-y-4">
        {articles.map((item) => (
          <li key={item.id}>
            <a
              href={`/blog/${item.slug}`}
              className="rounded-100 flex w-full cursor-pointer justify-between gap-500 border border-solid border-[#D5D7DA] p-400"
            >
              <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-100">
                  <div className="flex gap-100">
                    <span className="font-designer-18b max-w-[346px] truncate text-[#252B37]">
                      {item.title}
                    </span>
                  </div>
                  <p className="font-designer-15r line-clamp-2 max-w-[346px] text-[#535862]">
                    {item.description}
                  </p>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
