'use client';

import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import React, { useReducer } from 'react';
import { DateRange } from 'react-day-picker';

import type { StudySettlementSummaryResponse } from '@/api/openapi/models';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import DatePicker from '@/components/common/ui/date-picker';
import { BaseInput } from '@/components/common/ui/input';
import Pagination from '@/components/common/ui/pagination';
import { useGetSettlementAccount } from '@/hooks/queries/payment/settlement-account-queries';
import { useGetMySettlements } from '@/hooks/queries/payment/settlement-user-queries';
import { formatToKST } from '@/utils/time';

const AccountInfoModal = dynamic(
  () => import('@/components/payment/modals/account-info-modal'),
  { ssr: false },
);

const AddAccountModal = dynamic(
  () => import('@/components/payment/modals/add-account-modal'),
  { ssr: false },
);

const SETTLEMENT_STATUS_MAP: Record<
  NonNullable<StudySettlementSummaryResponse['status']>,
  {
    label: string;
    color: 'primary' | 'red' | 'green' | 'blue' | 'orange' | 'gray';
  }
> = {
  PENDING: { label: '정산대기', color: 'gray' },
  APPROVED: { label: '정산승인', color: 'blue' },
  COMPLETED: { label: '정산완료', color: 'green' },
};

interface SettlementState {
  page: number;
  keyword: string;
  dateRange: DateRange | undefined;
  accountInfoModalOpen: boolean;
  addAccountModalOpen: boolean;
}

type SettlementAction =
  | { type: 'setPage'; page: number }
  | { type: 'setKeyword'; keyword: string }
  | { type: 'setDateRange'; range: DateRange | undefined }
  | { type: 'setAccountInfoModalOpen'; open: boolean }
  | { type: 'setAddAccountModalOpen'; open: boolean };

const INITIAL_SETTLEMENT: SettlementState = {
  page: 1,
  keyword: '',
  dateRange: { from: undefined, to: undefined },
  accountInfoModalOpen: false,
  addAccountModalOpen: false,
};

function settlementReducer(
  state: SettlementState,
  action: SettlementAction,
): SettlementState {
  switch (action.type) {
    case 'setPage':
      return { ...state, page: action.page };
    case 'setKeyword':
      return { ...state, keyword: action.keyword };
    case 'setDateRange':
      return { ...state, dateRange: action.range };
    case 'setAccountInfoModalOpen':
      return { ...state, accountInfoModalOpen: action.open };
    case 'setAddAccountModalOpen':
      return { ...state, addAccountModalOpen: action.open };
    default:
      return state;
  }
}

export default function SettlementManagementPage() {
  const [state, dispatch] = useReducer(settlementReducer, INITIAL_SETTLEMENT);
  const {
    page,
    keyword,
    dateRange,
    accountInfoModalOpen,
    addAccountModalOpen,
  } = state;

  const isSettlementCode = keyword.startsWith('SET-');

  const { data } = useGetMySettlements({
    page: page - 1,
    size: 8,
    startDate:
      dateRange?.from && dateRange.from.toISOString()
        ? format(formatToKST(dateRange.from.toISOString()), 'yyyy-MM-dd')
        : undefined,
    endDate:
      dateRange?.to && dateRange.to.toISOString()
        ? format(formatToKST(dateRange.to.toISOString()), 'yyyy-MM-dd')
        : undefined,
    studyTitle: isSettlementCode ? undefined : keyword,
    settlementCode: isSettlementCode ? keyword : undefined,
  });

  const { data: accountData, isError } = useGetSettlementAccount();
  const hasAccount = !isError && !!accountData;

  const totalCount = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;

  const handleShowAccount = () => {
    if (hasAccount) {
      // 연결된 계좌가 있을 경우 계좌 정보 보기 (추후 구현)
      dispatch({ type: 'setAccountInfoModalOpen', open: true });

      return;
    }
    dispatch({ type: 'setAddAccountModalOpen', open: true });
  };

  return (
    <div className="flex flex-col gap-300">
      <div className="flex items-center justify-between">
        <div className="font-designer-20b text-text-default">정산 관리</div>
        <Button color="primary" size="small" onClick={handleShowAccount}>
          연결된 계좌 보기
        </Button>

        <AddAccountModal
          open={addAccountModalOpen}
          onOpenChange={(open) =>
            dispatch({ type: 'setAddAccountModalOpen', open })
          }
        />
        <AccountInfoModal
          data={accountData}
          open={accountInfoModalOpen}
          onOpenChange={(open) =>
            dispatch({ type: 'setAccountInfoModalOpen', open })
          }
        />
      </div>

      {/* 날짜 선택 & 검색 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-100">
          <DatePicker
            mode="range"
            selected={dateRange}
            onSelect={(range) => dispatch({ type: 'setDateRange', range })}
          />
        </div>

        {/* 검색 */}
        <div className="w-[240px]">
          <BaseInput
            placeholder="스터디명 혹은 정산 ID 검색"
            size="m"
            value={keyword}
            onChange={(e) =>
              dispatch({ type: 'setKeyword', keyword: e.target.value })
            }
          />
        </div>
      </div>

      {/* 정산 내역 테이블 */}
      <div className="rounded-tl-100 rounded-tr-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-background-alternative border-b-border-default border-b">
            <tr>
              <th className="font-designer-14m text-text-subtlest py-100 pl-250 text-left">
                스터디명
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 text-left">
                총 매출액 / 환불액
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 text-left">
                최종 정산 내역
              </th>
            </tr>
          </thead>
          <tbody>
            {data && data.content.length > 0 ? (
              data.content.map((settlement) => (
                <tr
                  key={settlement.settlementId}
                  className="border-b-border-default border-b"
                >
                  {/* 스터디명 + 상태 */}
                  <td className="py-200 pl-250">
                    <div className="flex flex-col gap-50">
                      <div className="flex items-center gap-[10px]">
                        <h3 className="font-designer-16m text-text-default">
                          {settlement.groupStudyTitle || '-'}
                        </h3>
                        {settlement.status && (
                          <Badge
                            color={
                              SETTLEMENT_STATUS_MAP[settlement.status].color
                            }
                            shape="rectangle"
                          >
                            {SETTLEMENT_STATUS_MAP[settlement.status].label}
                          </Badge>
                        )}
                      </div>
                      <div className="font-designer-13r text-text-subtlest">
                        {settlement.settlementCode || '-'}
                      </div>
                    </div>
                  </td>

                  {/* 매출액 / 환불액 */}
                  <td className="py-200">
                    <div className="flex flex-col gap-50">
                      <div className="font-designer-13r text-text-subtlest">
                        매출{' '}
                        {settlement.totalSalesAmount?.toLocaleString() || 0}원
                      </div>
                      <div className="font-designer-13r text-text-subtlest">
                        환불{' '}
                        {settlement.totalRefundAmount?.toLocaleString() || 0}원
                      </div>
                    </div>
                  </td>

                  {/* 최종 정산 금액 */}
                  <td className="py-200 pr-250">
                    <div className="flex flex-col gap-50">
                      <div className="font-designer-14m text-text-default">
                        {settlement.settlementAmount?.toLocaleString() || 0}원
                      </div>
                      <div className="font-designer-13r text-text-subtlest">
                        {formatToKST(settlement.settledAt)
                          ? format(
                              formatToKST(settlement.settledAt)!,
                              'yyyy-MM-dd HH:mm',
                            )
                          : '-'}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="border-b-border-default border-b py-[200px] text-center"
                >
                  <p className="font-designer-16r text-text-default">
                    정산 내역이 없습니다.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <span className="text-icon-subtlest font-designer-13r">
          총 {totalCount}건
        </span>
        <Pagination
          page={page}
          onChangePage={(page) => dispatch({ type: 'setPage', page })}
          totalPages={totalPages}
        />
        <div />
      </div>
    </div>
  );
}
