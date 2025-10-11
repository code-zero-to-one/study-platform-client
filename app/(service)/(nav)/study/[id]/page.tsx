import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';

import { prefetchGroupStudyDetail } from '@/features/study/group/model/use-study-query';
import StudyPage from '@/features/study/group/ui/group-study-detail-page';

export default async function Page({ params }: { params: { id: string } }) {
  console.log('groupStudyId', params);
  const id = Number(params.id);
  // if (!Number.isFinite(id) || id <= 0) {
  //   return <div>유효하지 않은 ID</div>;
  // }

  const qc = new QueryClient();

  // 서버에서 미리 패치 (API 호출이 서버에서 실행됨)
  await prefetchGroupStudyDetail(qc, id);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <StudyPage id={id} />
    </HydrationBoundary>
  );
}
