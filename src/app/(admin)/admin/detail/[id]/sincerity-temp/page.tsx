import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getSincerityTemperatureHistoryInServer } from '@/api/endpoints/admin/sincerity-temperature-history.server';
import SincerityTempTable from '@/components/admin/sincerity-temp-table';
import { getSincerityPresetByLevelName } from '@/config/sincerity-temp-presets';
import { GetSincerityTemperatureHistoryResponse } from '@/types/api/admin.types';

const LEVEL_NAME_MAP = {
  FIRST: '1단계',
  SECOND: '2단계',
  THIRD: '3단계',
  FOURTH: '4단계',
};

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
        memberId,
        page: 1,
      }),
  });

  const data: GetSincerityTemperatureHistoryResponse =
    await queryClient.getQueryData([
      'sincerityTemperatureHistory',
      memberId,
      1,
    ]);

  const temperPreset = getSincerityPresetByLevelName(
    LEVEL_NAME_MAP[data.sincerityTempLevel],
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-300">
        <div className="border-border-default rounded-100 flex w-full flex-col gap-200 border p-200">
          <span className="font-designer-16b text-text-default">
            현재 성실 온도
          </span>

          <div className="flex items-center">
            <temperPreset.Icon className="h-400 w-400" />
            <span
              className={`${temperPreset.textClass} font-designer-14b pl-[2px]`}
            >
              {data.currentSincerityTemperature} ℃
            </span>
          </div>
        </div>

        <SincerityTempTable memberId={memberId} />
      </div>
    </HydrationBoundary>
  );
}
