import Link from 'next/link';
import { getServerCookie } from '@/shared/lib/server-cookie';
import { fetchArticles } from '@/shared/strapi/api/fetch-articles';
import Sidebar from '@/widgets/home/sidebar';

export const revalidate = 60;

export default async function BlogPage() {
  const memberIdStr = await getServerCookie('memberId');
  const isLoggedIn = !!memberIdStr;

  const res = await fetchArticles();
  const articles = res.data ?? [];

  return (
    <div className="flex w-full gap-600 py-600">
      <div className="flex flex-1 flex-col gap-500">
        <div className="flex justify-between">
          <span className="font-designer-28b text-[#181D27]">
            ZERO-ONE 블로그
          </span>
        </div>

        {articles.length === 0 ? (
          <p className="text-gray-500">아직 등록된 글이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {articles.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/blog/${item.slug}`}
                  className="rounded-100 flex w-full cursor-pointer justify-between gap-500 border border-solid border-[#D5D7DA] p-400 transition-colors hover:border-[#9CA3AF]"
                >
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-100">
                      <span className="font-designer-18b max-w-[346px] truncate text-[#252B37]">
                        {item.title}
                      </span>
                      <p className="font-designer-15r line-clamp-2 max-w-[346px] text-[#535862]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isLoggedIn && <Sidebar />}
    </div>
  );
}
