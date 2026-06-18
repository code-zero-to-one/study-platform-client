import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { ArrowRightIcon } from 'lucide-react';
import { getAccountHistoriesInServer } from '@/api/endpoints/admin/account-history.server';
import Badge from '@/components/common/ui/badge';
import { GetAccountHistoriesResponse } from '@/types/api/admin.types';
import { formatHHMM, formatYYYYMMDD } from '@/utils/time';

export default async function AccountHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const queryClient = new QueryClient();
  const { id: memberId } = await params;

  // 서버 side에서 첫 페이지 데이터 미리 가져오기
  await queryClient.prefetchQuery({
    queryKey: ['accountHistory', memberId],
    queryFn: () => getAccountHistoriesInServer({ memberId: Number(memberId) }),
  });

  const data: GetAccountHistoriesResponse = await queryClient.getQueryData([
    'accountHistory',
    memberId,
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-300">
        <div className="border-border-default rounded-100 flex w-full flex-col gap-200 border p-200">
          <div className="flex items-center gap-150">
            <span className="font-designer-16b text-text-default w-[73px]">
              계정 생성일
            </span>
            <div className="font-designer-14r text-text-subtle">
              {formatYYYYMMDD(data.joinedAt)}
            </div>
          </div>

          <div className="flex items-center gap-150">
            <span className="font-designer-16b text-text-default w-[73px]">
              최근 접속
            </span>
            <div className="font-designer-14r text-text-subtle">
              {data.loginMostRecentlyAt
                ? formatYYYYMMDD(data.loginMostRecentlyAt)
                : '기록 없음'}
            </div>
          </div>

          <div className="flex items-center gap-150">
            <span className="font-designer-16b text-text-default w-[73px]">
              권한
            </span>
            <div className="font-designer-14r text-text-subtle">일반</div>
          </div>

          <div className="flex items-center gap-150">
            <span className="font-designer-16b text-text-default w-[73px]">
              계정 상태
            </span>

            <Badge color="green">활성</Badge>
          </div>
        </div>

        <RecentLoginHistory loginHists={data.loginHists} />
        <RecentRoleChangeHistory roleChangeHists={data.roleChangeHists} />
        <RecentStatusChangeHistory
          memberStatusChangeHists={data.memberStatusChangeHists}
        />
      </div>
    </HydrationBoundary>
  );
}

function RecentLoginHistory({
  loginHists,
}: Pick<GetAccountHistoriesResponse, 'loginHists'>) {
  return (
    <div className="border-border-default rounded-100 flex w-full flex-col gap-150 border p-200">
      <h3 className="font-designer-16b text-text-default">최근 로그인 기록</h3>

      <ul>
        {loginHists.map((hist) => (
          <li
            key={hist}
            className="font-designer-14r text-text-subtle border-b-border-subtle flex items-center gap-100 border-b py-100"
          >
            <span>{formatYYYYMMDD(hist)}</span>
            <span>{formatHHMM(hist)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentRoleChangeHistory({
  roleChangeHists,
}: Pick<GetAccountHistoriesResponse, 'roleChangeHists'>) {
  return (
    <div className="border-border-default rounded-100 flex w-full flex-col gap-150 border p-200">
      <h3 className="font-designer-16b text-text-default">권한 변경 이력</h3>

      {roleChangeHists.length > 0 ? (
        <ul>
          {roleChangeHists.map((hist) => (
            <li
              key={hist.changedAt}
              className="font-designer-14r text-text-subtle flex justify-between py-100"
            >
              <div className="flex items-center gap-100">
                <span>{formatYYYYMMDD(hist.changedAt)}</span>
                <span>{formatHHMM(hist.changedAt)}</span>
              </div>

              <div className="flex items-center gap-200">
                <span>{hist.from}</span>

                <ArrowRightIcon width={20} height={20} />

                <span>{hist.to}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="font-designer-14r text-text-subtle flex justify-center">
          변경 이력이 없습니다.
        </div>
      )}
    </div>
  );
}

function RecentStatusChangeHistory({
  memberStatusChangeHists,
}: Pick<GetAccountHistoriesResponse, 'memberStatusChangeHists'>) {
  return (
    <div className="border-border-default rounded-100 flex w-full flex-col gap-150 border p-200">
      <h3 className="font-designer-16b text-text-default">
        계정 상태 변경 이력
      </h3>

      {memberStatusChangeHists.length > 0 ? (
        <ul>
          {memberStatusChangeHists.map((hist) => (
            <li
              key={hist.changedAt}
              className="font-designer-14r text-text-subtle flex justify-between py-100"
            >
              <div className="flex items-center gap-100">
                <span>{formatYYYYMMDD(hist.changedAt)}</span>
                <span>{formatHHMM(hist.changedAt)}</span>
              </div>

              <div className="flex items-center gap-200">
                <Badge
                  color={hist.from === '활성' ? 'green' : 'gray'}
                  shape="rectangle"
                >
                  {hist.from}
                </Badge>

                <ArrowRightIcon width={20} height={20} />

                <Badge
                  color={hist.to === '활성' ? 'green' : 'gray'}
                  shape="rectangle"
                >
                  {hist.to}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="font-designer-14r text-text-subtle flex justify-center">
          변경 이력이 없습니다.
        </div>
      )}
    </div>
  );
}
