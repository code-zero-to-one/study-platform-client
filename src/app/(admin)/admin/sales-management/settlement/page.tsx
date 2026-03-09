'use client';

import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import {
  SettlementSearchConditionStatusEnum,
  StudySettlementSummaryResponse,
} from '@/api/openapi/models';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import DatePicker from '@/components/common/ui/date-picker';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import { BaseInput } from '@/components/common/ui/input';
import Pagination from '@/components/common/ui/pagination';
import { useGetSettlementsForAdmin } from '@/hooks/queries/admin-settlement-api';
import { formatToKST } from '@/utils/time';

const AdminApproveSettlementModal = dynamic(
  () => import('@/components/common/modals/admin-approve-settlement-modal'),
  { ssr: false },
);

const AdminCompleteSettlementModal = dynamic(
  () => import('@/components/common/modals/admin-complete-settlement-modal'),
  { ssr: false },
);

const SETTLEMENT_STATUS_MAP: Record<
  StudySettlementSummaryResponse['status'],
  {
    label: string;
    color: 'primary' | 'red' | 'green' | 'blue' | 'orange' | 'gray';
  }
> = {
  PENDING: { label: '정산대기', color: 'blue' },
  APPROVED: { label: '정산승인', color: 'orange' },
  COMPLETED: { label: '정산완료', color: 'green' },
};

export default function SettlementPage() {
  const [status, setStatus] = useState<
    SettlementSearchConditionStatusEnum | undefined
  >(undefined);
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [page, setPage] = useState<number>(1);

  // API 호출
  const { data } = useGetSettlementsForAdmin({
    startDate:
      dateRange?.from && dateRange.from.toISOString()
        ? format(formatToKST(dateRange.from.toISOString()), 'yyyy-MM-dd')
        : undefined,
    endDate:
      dateRange?.to && dateRange.to.toISOString()
        ? format(formatToKST(dateRange.to.toISOString()), 'yyyy-MM-dd')
        : undefined,
    studyTitle: keyword || undefined,
    settlementCode: keyword || undefined,
    status,
    page: page - 1,
    size: 20,
  });

  const settlements = data?.content ?? [];

  const statusOptions = [
    { value: undefined, label: '전체' },
    ...Object.entries(SETTLEMENT_STATUS_MAP).map(([key, value]) => ({
      value: key,
      label: value.label,
    })),
  ];

  return (
    <>
      {/* 필터 영역 */}
      <div className="flex items-center justify-between py-100">
        <div className="flex items-center gap-100">
          {/* 상태 필터 드롭다운 */}
          <div className="w-[160px]">
            <SingleDropdown
              options={statusOptions}
              value={status}
              onChange={(value) =>
                setStatus(
                  value as SettlementSearchConditionStatusEnum | undefined,
                )
              }
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
            {settlements && settlements.length > 0 ? (
              settlements.map((settlement, index) => (
                <tr
                  key={`${settlement.settlementCode}-${index}`}
                  className="border-b-border-default border-b"
                >
                  {/* 정산 ID */}
                  <td className="py-200 pl-250">
                    <span className="font-designer-14r text-text-default">
                      {settlement.settlementCode}
                    </span>
                  </td>

                  {/* 스터디명 */}
                  <td className="py-200 pl-[10px]">
                    <span className="font-designer-14r text-text-default">
                      {settlement.groupStudyTitle}
                    </span>
                  </td>

                  {/* 개설자 */}
                  <td className="py-200 pl-[10px]">
                    <span className="font-designer-14r text-text-default">
                      {settlement.leaderName}({settlement.leaderId})
                    </span>
                  </td>

                  {/* 정산 내역 */}
                  <td className="py-200 pl-[10px]">
                    <span className="font-designer-14r text-text-default">
                      {settlement.settlementAmount?.toLocaleString()}원
                    </span>
                  </td>

                  {/* 상태 */}
                  <td className="py-200 pl-[10px]">
                    <Badge
                      color={SETTLEMENT_STATUS_MAP[settlement.status].color}
                      shape="rectangle"
                    >
                      {SETTLEMENT_STATUS_MAP[settlement.status].label}
                    </Badge>
                  </td>

                  {/* 일시 */}
                  <td className="py-200 pl-[10px]">
                    <span className="font-designer-14r text-text-default">
                      {formatToKST(settlement.settledAt)
                        ? format(
                            formatToKST(settlement.settledAt)!,
                            'yyyy.MM.dd HH:mm',
                          )
                        : '-'}
                    </span>
                  </td>

                  {/* 액션 버튼 */}
                  <td className="py-200 pr-250">
                    <SettlementActionButtons
                      status={settlement.status}
                      settlementId={settlement.settlementId}
                    />
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
          총 {data?.totalElements ?? 0}건
        </span>
        <Pagination
          page={page}
          onChangePage={setPage}
          totalPages={data?.totalPages ?? 1}
        />
        <div />
      </div>
    </>
  );
}

function SettlementActionButtons({
  settlementId,
  status,
}: Pick<StudySettlementSummaryResponse, 'status' | 'settlementId'>) {
  switch (status) {
    case 'PENDING':
      return <ApproveSettlementButton settlementId={settlementId} />;

    case 'APPROVED':
      return <CompletedSettlementButton settlementId={settlementId} />;

    default:
      return null;
  }
}

function ApproveSettlementButton({
  settlementId,
}: Pick<StudySettlementSummaryResponse, 'settlementId'>) {
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
        정산 승인
      </Button>

      <AdminApproveSettlementModal
        settlementId={settlementId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

function CompletedSettlementButton({
  settlementId,
}: Pick<StudySettlementSummaryResponse, 'settlementId'>) {
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
        정산 완료
      </Button>

      <AdminCompleteSettlementModal
        settlementId={settlementId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
