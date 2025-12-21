'use client';

import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';

import AccountInfoModal from '@/components/modals/account-info-modal';
import AddAccountModal from '@/components/modals/add-account-modal';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import { BaseInput } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { useAuth } from '@/hooks/use-auth';

export default function SettlementManagementPage() {
  const [page, setPage] = useState<number>(1);

  // 검색 필터 상태
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1), // 2025.01.01
    to: new Date(2025, 11, 7), // 2025.12.07
  });

  // Mock data - 실제로는 API에서 가져올 데이터
  const settlements = [
    {
      id: 1,
      title: '딥러닝 실전 5기',
      code: 'SET-20251206-001',
      status: '정산대기' as const,
      revenue: 1500000,
      refund: -300000,
      total: 1200000,
      date: '2025-12-06 14:21',
    },
    {
      id: 2,
      title: 'UX/UI 스터디 2기',
      code: 'SET-20251206-001',
      status: '정산요청' as const,
      revenue: 800000,
      refund: -200000,
      total: 600000,
      date: '2025-12-06 14:21',
    },
    {
      id: 3,
      title: '딥러닝 실전 5기',
      code: 'SET-20251206-001',
      status: '정산완료' as const,
      revenue: 680000,
      refund: 0,
      total: 680000,
      date: '2025-12-06 14:21',
    },
  ];

  const totalCount = 3;
  const totalPages = 1;

  // 연결된 계좌 여부 (mock)
  const hasAccount = true;

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

  const { data } = useAuth();

  if (!data.roleIds.includes('ROLE_MENTOR')) {
    return <div>해당 페이지에 접근할 권한이 없습니다.</div>;
  }

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
            {settlements.length > 0 ? (
              settlements.map((settlement) => (
                <tr
                  key={settlement.id}
                  className="border-b-border-default border-b"
                >
                  {/* 스터디명 + 상태 */}
                  <td className="py-200 pl-250">
                    <div className="flex flex-col gap-50">
                      <div className="flex items-center gap-[10px]">
                        <h3 className="font-designer-16m text-text-default">
                          {settlement.title}
                        </h3>
                        <Badge
                          color={
                            settlement.status === '정산대기'
                              ? 'gray'
                              : settlement.status === '정산요청'
                                ? 'blue'
                                : 'green'
                          }
                          shape="rectangle"
                        >
                          {settlement.status}
                        </Badge>
                      </div>
                      <div className="font-designer-13r text-text-subtlest">
                        {settlement.code}
                      </div>
                    </div>
                  </td>

                  {/* 매출액 / 환불액 */}
                  <td className="py-200">
                    <div className="flex flex-col gap-50">
                      <div className="font-designer-13r text-text-subtlest">
                        매출 {settlement.revenue.toLocaleString()}원
                      </div>
                      <div className="font-designer-13r text-text-subtlest">
                        환불 {settlement.refund.toLocaleString()}원
                      </div>
                    </div>
                  </td>

                  {/* 최종 정산 금액 */}
                  <td className="py-200 pr-250">
                    <div className="flex flex-col gap-50">
                      <div className="font-designer-14m text-text-default">
                        {settlement.total.toLocaleString()}원
                      </div>
                      <div className="font-designer-13r text-text-subtlest">
                        {settlement.date}
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
