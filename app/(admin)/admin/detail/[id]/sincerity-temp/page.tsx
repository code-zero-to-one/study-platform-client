import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getSincerityTemperatureHistoryInServer } from '@/features/admin/api/sincerity-temperature-history.server';
import { GetSincerityTemperatureHistoryResponse } from '@/features/admin/api/types';
import SincerityTempTable from '@/features/admin/ui/sincerity-temp-table';

export default async function SincerityTempPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const queryClient = new QueryClient();
  const { id } = await params;

  const memberId = Number(id);

  // 서버 side에서 첫 페이지 데이터 미리 가져오기
  await queryClient.prefetchQuery({
    queryKey: ['sincerityTemperatureHistory', memberId, 1], // "sincerityTemperatureHistory", memberId, page
    queryFn: () =>
      getSincerityTemperatureHistoryInServer({
        memberId: Number(memberId),
        page: 1,
      }),
  });

  const data: GetSincerityTemperatureHistoryResponse =
    await queryClient.getQueryData([
      'sincerityTemperatureHistory',
      memberId,
      1,
    ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-300">
        <div className="border-border-default rounded-100 flex w-full flex-col gap-200 border p-200">
          <span className="font-designer-16b text-text-default">
            현재 성실 온도
          </span>

          <div className="font-designer-14r text-text-subtle">
            {data.currentSincerityTemperature} ℃
          </div>
        </div>

        <SincerityTempTable memberId={Number(memberId)} />
      </div>
    </HydrationBoundary>
  );
}
