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
          <span className="font-designer-28b text-[#181D27]">블로그</span>
        </div>

        {articles.length === 0 ? (
          <p className="text-gray-500">아직 등록된 글이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {articles.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/blog/${item.slug}`}
                  className="rounded-100 flex w-full cursor-pointer gap-500 border border-solid border-[#D5D7DA] p-400 transition-colors hover:border-[#9CA3AF]"
                >
                  <div className="flex flex-1 flex-col justify-between gap-200">
                    <div className="flex flex-col gap-100">
                      <span className="font-designer-18b line-clamp-1 text-[#252B37]">
                        {item.title}
                      </span>
                      <p className="font-designer-15r line-clamp-2 text-[#535862]">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-300">
                      {item.author && (
                        <span className="font-designer-14r text-[#9CA3AF]">
                          {item.author.name}
                        </span>
                      )}
                      {item.category && (
                        <>
                          {item.author && (
                            <span className="font-designer-14r text-[#9CA3AF]">
                              •
                            </span>
                          )}
                          <span className="font-designer-14r rounded-full bg-[#E5E7EB] px-200 py-50 text-[#535862]">
                            {item.category.name}
                          </span>
                        </>
                      )}
                      {item.publishedAt && (
                        <span className="font-designer-14r text-[#9CA3AF]">
                          {new Date(item.publishedAt).toLocaleDateString(
                            'ko-KR',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </span>
                      )}
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
