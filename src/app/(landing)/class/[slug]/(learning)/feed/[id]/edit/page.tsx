import { redirect } from 'next/navigation';

// 피드 수정 경로는 상세 페이지로 영구 이동시키는 리다이렉트 스텁이다.
// 클라이언트 useEffect 리다이렉트 대신 서버 redirect()로 처리한다.
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  redirect(`/class/${slug}/feed/${id}`);
}
