import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';

import { prefetchGroupStudyDetail } from '@/features/study/group/model/use-study-query';

import StudyDetailPage from '@/features/study/group/ui/group-study-detail-page';

export default async function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  const qc = new QueryClient();

  // 서버에서 미리 패치 (API 호출이 서버에서 실행됨)
  await prefetchGroupStudyDetail(qc, id);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <StudyDetailPage id={id} />
    </HydrationBoundary>
  );
}
