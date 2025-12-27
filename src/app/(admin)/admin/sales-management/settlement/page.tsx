'use client';

import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import AdminSettlementModal from '@/components/modals/admin-settlement-modal';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import SingleDropdown from '@/components/ui/dropdown/single';
import { BaseInput } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';

type SalesStatus =
  | '결제대기'
  | '결제취소'
  | '결제완료'
  | '환불요청'
  | '환불완료';

const getStatusBadgeColor = (
  status: SalesStatus,
): 'primary' | 'red' | 'green' | 'blue' | 'orange' | 'gray' => {
  switch (status) {
    case '결제대기':
      return 'blue';
    case '결제취소':
      return 'red';
    case '결제완료':
      return 'green';
    case '환불요청':
      return 'orange';
    case '환불완료':
      return 'gray';
    default:
      return 'gray';
  }
};

const mockSalesData = [
  {
    id: 'PAY-20251206-001',
    studyTitle: '데이터 분석 Python 스터디(진행전)',
    buyer: '김민정(1)',
    amount: 150000,
    paymentType: '카드(신한)',
    status: '결제대기' as SalesStatus,
    date: '2025.12.08 12:11',
  },
  {
    id: 'PAY-20251206-001',
    studyTitle: '데이터 분석 Python 스터디(진행전)',
    buyer: '김민정(2)',
    amount: 150000,
    paymentType: '카드(신한)',
    status: '결제취소' as SalesStatus,
    date: '2025.12.08 12:11',
  },
  {
    id: 'PAY-20251206-001',
    studyTitle: '데이터 분석 Python 스터디(진행전)',
    buyer: '김민정(3)',
    amount: 150000,
    paymentType: '카드(신한)',
    status: '결제완료' as SalesStatus,
    date: '2025.12.08 12:11',
  },
  {
    id: 'PAY-20251206-001',
    studyTitle: '데이터 분석 Python 스터디',
    buyer: '김민정(1)',
    amount: 150000,
    paymentType: '무통장입금',
    status: '환불요청' as SalesStatus,
    date: '2025.12.08 12:11',
  },
];

const filterOptions = [
  { value: 'all', label: '전체' },
  { value: 'payment_pending', label: '결제대기' },
  { value: 'payment_complete', label: '결제완료' },
  { value: 'payment_cancel', label: '결제취소' },
  { value: 'refund_request', label: '환불요청' },
  { value: 'refund_complete', label: '환불완료' },
];

export default function SettlementPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [page, setPage] = useState<number>(1);

  return (
    <>
      {/* 필터 영역 */}
      <div className="flex items-center justify-between py-100">
        <div className="flex items-center gap-100">
          {/* 상태 필터 드롭다운 */}
          <div className="w-[160px]">
            <SingleDropdown
              options={filterOptions}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value || 'all')}
              placeholder="전체"
              size="m"
            />
          </div>

          <DatePicker
            mode="range"
            selected={dateRange}
            onSelect={(range) => setDateRange(range as DateRange)}
          />
        </div>

        {/* 검색 */}
        <div className="w-[300px]">
          <BaseInput
            placeholder="스터디명 혹은 결제ID 검색"
            size="m"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-tl-100 rounded-tr-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-background-alternative border-b-border-default border-b">
            <tr>
              <th className="font-designer-14m text-text-subtlest py-100 pl-250 text-left">
                정산 ID
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-[10px] text-left">
                스터디명(진행 상태)
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-[10px] text-left">
                개설자(ID)
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-[10px] text-left">
                정산 내역
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-[10px] text-left">
                상태
              </th>
              <th className="font-designer-14m text-text-subtlest py-100 pl-[10px] text-left">
                정산일시
              </th>
              <th className="py-100 pr-250" />
            </tr>
          </thead>
          <tbody>
            {mockSalesData && mockSalesData.length > 0 ? (
              mockSalesData.map((sale, index) => (
                <tr
                  key={`${sale.id}-${index}`}
                  className="border-b-border-default border-b"
                >
                  {/* 거래 ID */}
                  <td className="py-200 pl-250">
                    <span className="font-designer-14r text-text-default">
                      {sale.id}
                    </span>
                  </td>

                  {/* 스터디명 */}
                  <td className="py-200 pl-[10px]">
                    <span className="font-designer-14r text-text-default">
                      {sale.studyTitle}
                    </span>
                  </td>

                  {/* 결제자 */}
                  <td className="py-200 pl-[10px]">
                    <span className="font-designer-14r text-text-default">
                      {sale.buyer}
                    </span>
                  </td>

                  {/* 결제 내역 */}
                  <td className="py-200 pl-[10px]">
                    <span className="font-designer-14r text-text-default">
                      {sale.amount.toLocaleString()}원({sale.paymentType})
                    </span>
                  </td>

                  {/* 상태 */}
                  <td className="py-200 pl-[10px]">
                    <Badge
                      color={getStatusBadgeColor(sale.status)}
                      shape="rectangle"
                    >
                      {sale.status}
                    </Badge>
                  </td>

                  {/* 일시 */}
                  <td className="py-200 pl-[10px]">
                    <span className="font-designer-14r text-text-default">
                      {sale.date}
                    </span>
                  </td>

                  {/* 액션 버튼 */}
                  <td className="py-200 pr-250">
                    <SettlementActionButtons status={sale.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border-b-border-default border-b py-[200px] text-center"
                >
                  <p className="font-designer-16r text-text-subtlest">
                    매출 내역이 없습니다.
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
          총 {mockSalesData.length}건
        </span>
        <Pagination page={page} onChangePage={setPage} totalPages={5} />
        <div />
      </div>
    </>
  );
}

function SettlementActionButtons({ status }: { status: SalesStatus }) {
  switch (status) {
    case '결제완료':
      return (
        <div className="flex items-center gap-100">
          <SettlementButton />
        </div>
      );
    default:
      return null;
  }
}

function SettlementButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        color="outlined"
        size="small"
        className="font-designer-14r"
        onClick={() => {
          setOpen(true);
        }}
      >
        정산하기
      </Button>

      {open && <AdminSettlementModal open={open} onOpenChange={setOpen} />}
    </>
  );
}
