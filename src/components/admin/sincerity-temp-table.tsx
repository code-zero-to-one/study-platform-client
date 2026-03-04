'use client';

import { useState } from 'react';
import Pagination from '@/components/common/ui/pagination';
import { useGetSincerityTemperatureHistoryQuery } from '@/hooks/queries/use-sincerity-temperature-history-query';
import { formatYYYYMMDD } from '@/utils/time';
import TrendingDown from 'public/icons/trending-down.svg';
import TrendingUp from 'public/icons/trending-up.svg';

interface SincerityTempTableProps {
  memberId: number;
}

export default function SincerityTempTable({
  memberId,
}: SincerityTempTableProps) {
  const [page, setPage] = useState<number>(1);

  const { data } = useGetSincerityTemperatureHistoryQuery({
    memberId,
    page,
  });

  const sincerityTemperatureHistory = data?.sincerityTemperatureHistory.content;

  return (
    <>
      <div className="border-border-default rounded-100 flex w-full flex-col gap-200 border p-200">
        <span className="font-designer-16b text-text-default">
          성실온도 내역
        </span>

        <div className="flex w-full flex-col gap-200">
          {sincerityTemperatureHistory?.length > 0 ? (
            sincerityTemperatureHistory.map((history, idx) => (
              <div className="flex items-start gap-150" key={idx}>
                <div className="w-[100px]">
                  <span className="font-designer-16r text-text-subtle">
                    {history.reasonType === 'STUDY_REVIEW' ? '스터디 리뷰' : ''}
                  </span>
                  <span className="font-designer-14r text-text-subtlest">
                    {formatYYYYMMDD(history.recordedAt)}
                  </span>
                </div>

                <div className="flex items-center">
                  {history.increment > 0 ? (
                    <>
                      <span className="text-text-information font-designer-14b">
                        +{history.increment}℃
                      </span>
                      <TrendingUp />
                    </>
                  ) : (
                    <>
                      <span className="text-text-error font-designer-14b">
                        {history.increment}℃
                      </span>
                      <TrendingDown />
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="font-designer-14r text-text-subtlest py-100 text-center">
              성실 온도 내역이 없습니다.
            </div>
          )}
        </div>
      </div>

      <Pagination
        className="mt-300"
        page={page}
        onChangePage={setPage}
        totalPages={data?.sincerityTemperatureHistory.totalPages || 1}
      />
    </>
  );
}
