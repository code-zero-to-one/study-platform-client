'use client';

import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';

import type { StudySettlementSummaryResponseStatusEnum } from '@/api/openapi/models';
import AccountInfoModal from '@/components/modals/account-info-modal';
import AddAccountModal from '@/components/modals/add-account-modal';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import { BaseInput } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { useGetSettlementAccount } from '@/hooks/queries/settlement-account';
import { useGetMySettlements } from '@/hooks/queries/settlement-user-api';

type SettlementStatus = '정산대기' | '정산승인' | '정산완료';

const STATUS_TEXT_MAP: Record<
  StudySettlementSummaryResponseStatusEnum,
  SettlementStatus
> = {
  PENDING: '정산대기',
  APPROVED: '정산승인',
  COMPLETED: '정산완료',
};

const getStatusBadgeColor = (
  status: SettlementStatus,
): 'primary' | 'red' | 'green' | 'blue' | 'orange' | 'gray' => {
  switch (status) {
    case '정산대기':
      return 'gray';
    case '정산승인':
      return 'blue';
    case '정산완료':
      return 'green';
    default:
      return 'gray';
  }
};

export default function SettlementManagementPage() {
  const [page, setPage] = useState<number>(1);

  // 검색 필터 상태
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { data } = useGetMySettlements({
    page: page - 1,
    size: 8,
    startDate: dateRange?.from
      ? dateRange.from.toISOString().split('T')[0]
      : undefined,
    endDate: dateRange?.to
      ? dateRange.to.toISOString().split('T')[0]
      : undefined,
    studyTitle: keyword || undefined,
  });

  const { data: accountData, isError } = useGetSettlementAccount();
  const hasAccount = !isError && !!accountData;

  const totalCount = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;

  const [accountInfoModalOpen, setAccountInfoModalOpen] =
    useState<boolean>(false);
  const [addAccountModalOpen, setAddAccountModalOpen] =
    useState<boolean>(false);

  const handleShowAccount = () => {
    if (hasAccount) {
      // 연결된 계좌가 있을 경우 계좌 정보 보기 (추후 구현)
      setAccountInfoModalOpen(true);

      return;
    }
    setAddAccountModalOpen(true);
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
          onOpenChange={setAddAccountModalOpen}
        />
        <AccountInfoModal
          data={accountData}
          open={accountInfoModalOpen}
          onOpenChange={setAccountInfoModalOpen}
        />
      </div>

      {/* 날짜 선택 & 검색 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-100">
          <DatePicker
            mode="range"
            selected={dateRange}
            onSelect={(range) => setDateRange(range as DateRange)}
          />
        </div>

        {/* 검색 */}
        <div className="w-[240px]">
          <BaseInput
            placeholder="스터디명 혹은 정산 ID 검색"
            size="m"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
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
                            color={getStatusBadgeColor(
                              STATUS_TEXT_MAP[settlement.status],
                            )}
                            shape="rectangle"
                          >
                            {STATUS_TEXT_MAP[settlement.status]}
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
                        {settlement.settledAt || settlement.scheduledAt || '-'}
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
                  <p className="font-designer-16r text-text-subtlest">
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
          onChangePage={setPage}
          totalPages={totalPages}
        />
        <div />
      </div>
    </div>
  );
}
