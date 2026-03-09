'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { BaseInput, NativeSelect } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ADMIN_MATCHING_REQUEST_STATUS_META,
  ADMIN_MATCHING_STATUS_OPTIONS,
  ADMIN_MATCHING_TYPE_META,
  ADMIN_MATCHING_TYPE_OPTIONS,
} from '@/features/admin/matching/model/admin-matching-meta';
import type { AdminMatchingRequestListPage } from '@/types/matching/admin-domain';
import type {
  AdminMatchingRequestListFilterFormInput,
  AdminMatchingRequestListFilterFormValues,
} from '@/types/schemas/admin-matching-schema';
import {
  ADMIN_MATCHING_FILTER_ALL_VALUE,
  adminMatchingRequestListFilterFormSchema,
} from '@/types/schemas/admin-matching-schema';
import {
  formatDateDot,
  formatDateTimeDot,
  MONDAY_DATE_INPUT_MIN,
} from '@/utils/time';
import AdminMatchingPanel from './admin-matching-panel';
import MatchingFormField from './matching-form-field';

type RequestListFilterErrors = Partial<
  Record<keyof AdminMatchingRequestListFilterFormInput, string>
>;

const PAGE_SIZE_OPTIONS = ['20', '50', '100'] as const;

interface AdminMatchingRequestListPanelProps {
  defaultFilterValues: AdminMatchingRequestListFilterFormInput;
  requestList?: AdminMatchingRequestListPage;
  selectedMatchingRequestId?: number;
  errorMessage?: string;
  isLoading: boolean;
  isFetching: boolean;
  isDetailLoading: boolean;
  className?: string;
  onApplyFilters: (values: AdminMatchingRequestListFilterFormValues) => void;
  onChangePage: (page: number) => void;
  onSelectRequest: (matchingRequestId: number) => Promise<void>;
}

export default function AdminMatchingRequestListPanel({
  defaultFilterValues,
  requestList,
  selectedMatchingRequestId,
  errorMessage,
  isLoading,
  isFetching,
  isDetailLoading,
  className,
  onApplyFilters,
  onChangePage,
  onSelectRequest,
}: AdminMatchingRequestListPanelProps) {
  const [filterValues, setFilterValues] =
    useState<AdminMatchingRequestListFilterFormInput>(defaultFilterValues);
  const [errors, setErrors] = useState<RequestListFilterErrors>({});

  useEffect(() => {
    setFilterValues(defaultFilterValues);
    setErrors({});
  }, [defaultFilterValues]);

  const handleFieldChange = (
    field: keyof AdminMatchingRequestListFilterFormInput,
    value: string,
  ) => {
    setFilterValues((previous) => ({
      ...previous,
      [field]: value,
    }));
    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  const handleInputChange =
    (field: keyof AdminMatchingRequestListFilterFormInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      handleFieldChange(field, event.target.value);
    };

  const handleSubmit = () => {
    const parsed =
      adminMatchingRequestListFilterFormSchema.safeParse(filterValues);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        weeklyPeriodIdentifier: fieldErrors.weeklyPeriodIdentifier?.[0],
        status: fieldErrors.status?.[0],
        type: fieldErrors.type?.[0],
        searchKeyword: fieldErrors.searchKeyword?.[0],
        pageSize: fieldErrors.pageSize?.[0],
      });

      return;
    }

    onApplyFilters(parsed.data);
  };

  const handleReset = () => {
    setFilterValues(defaultFilterValues);
    setErrors({});

    const parsed =
      adminMatchingRequestListFilterFormSchema.safeParse(defaultFilterValues);

    if (parsed.success) {
      onApplyFilters(parsed.data);
    }
  };

  return (
    <AdminMatchingPanel
      title="매칭 요청 목록"
      description="주차, 상태, 유형, 검색어로 목록을 조회하고 선택한 요청만 상세 API로 drill-down 합니다."
      className={className}
      rightSlot={
        <p className="font-designer-13r text-text-subtle">
          {isFetching && !isLoading
            ? '목록 갱신 중'
            : `총 ${requestList?.totalElements ?? 0}건`}
        </p>
      }
    >
      <div className="flex flex-col gap-150">
        <div className="bg-background-neutral-subtle rounded-150 flex flex-col gap-150 p-175">
          <p className="font-designer-13r text-text-subtle">
            기본 조회 기준은 이번 주 월요일이며, 필요하면 직접 주차를 바꿀 수
            있습니다. 주차를 비우면 전체 주차를 조회합니다. 검색은 회원명,
            파트너명, 닉네임, loginId를 지원합니다.
          </p>

          <div className="grid gap-125 xl:grid-cols-[minmax(0,1.1fr)_180px_180px]">
            <MatchingFormField
              label="주차"
              error={errors.weeklyPeriodIdentifier}
              htmlFor="request-list-weekly-period"
            >
              <BaseInput
                id="request-list-weekly-period"
                type="date"
                size="m"
                min={MONDAY_DATE_INPUT_MIN}
                step={7}
                value={filterValues.weeklyPeriodIdentifier}
                disabled={isLoading}
                onChange={handleInputChange('weeklyPeriodIdentifier')}
              />
            </MatchingFormField>

            <MatchingFormField
              label="상태"
              error={errors.status}
              htmlFor="request-list-status"
            >
              <NativeSelect
                id="request-list-status"
                value={filterValues.status}
                disabled={isLoading}
                onChange={handleInputChange('status')}
              >
                <option value={ADMIN_MATCHING_FILTER_ALL_VALUE}>
                  전체 상태
                </option>
                {ADMIN_MATCHING_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value} ({option.label})
                  </option>
                ))}
              </NativeSelect>
            </MatchingFormField>

            <MatchingFormField
              label="유형"
              error={errors.type}
              htmlFor="request-list-type"
            >
              <NativeSelect
                id="request-list-type"
                value={filterValues.type}
                disabled={isLoading}
                onChange={handleInputChange('type')}
              >
                <option value={ADMIN_MATCHING_FILTER_ALL_VALUE}>
                  전체 유형
                </option>
                {ADMIN_MATCHING_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </MatchingFormField>
          </div>

          <div className="grid gap-125 xl:grid-cols-[minmax(0,1fr)_140px_auto] xl:items-end">
            <MatchingFormField
              label="검색어"
              error={errors.searchKeyword}
              htmlFor="request-list-search-keyword"
            >
              <BaseInput
                id="request-list-search-keyword"
                type="search"
                size="m"
                value={filterValues.searchKeyword}
                disabled={isLoading}
                onChange={handleInputChange('searchKeyword')}
              />
            </MatchingFormField>

            <MatchingFormField
              label="페이지 크기"
              error={errors.pageSize}
              htmlFor="request-list-page-size"
            >
              <NativeSelect
                id="request-list-page-size"
                value={filterValues.pageSize}
                disabled={isLoading}
                onChange={handleInputChange('pageSize')}
              >
                {PAGE_SIZE_OPTIONS.map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}개
                  </option>
                ))}
              </NativeSelect>
            </MatchingFormField>

            <div className="flex flex-wrap justify-end gap-100">
              <Button
                type="button"
                size="small"
                color="outlined"
                disabled={isLoading}
                onClick={handleReset}
              >
                필터 초기화
              </Button>
              <Button
                type="button"
                size="small"
                loading={isLoading}
                onClick={handleSubmit}
              >
                목록 조회
              </Button>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-100 border-border-error bg-fill-danger-subtle-default border px-150 py-200">
            <p className="font-designer-14r text-text-error">{errorMessage}</p>
          </div>
        ) : null}

        {!errorMessage && isLoading ? (
          <div className="rounded-100 bg-background-neutral-subtle px-150 py-200">
            <p className="font-designer-14r text-text-subtle">
              매칭 요청 목록을 불러오는 중입니다.
            </p>
          </div>
        ) : null}

        {!errorMessage &&
        !isLoading &&
        requestList &&
        requestList.content.length > 0 ? (
          <>
            <div className="border-border-subtle rounded-100 overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background-alternative hover:bg-background-alternative border-border-subtle">
                    <TableHead className="font-designer-13r text-text-subtle px-150 py-125 text-left">
                      요청 ID
                    </TableHead>
                    <TableHead className="font-designer-13r text-text-subtle px-150 py-125 text-left">
                      회원
                    </TableHead>
                    <TableHead className="font-designer-13r text-text-subtle px-150 py-125 text-left">
                      파트너
                    </TableHead>
                    <TableHead className="font-designer-13r text-text-subtle px-150 py-125 text-left">
                      상태
                    </TableHead>
                    <TableHead className="font-designer-13r text-text-subtle px-150 py-125 text-left">
                      유형
                    </TableHead>
                    <TableHead className="font-designer-13r text-text-subtle px-150 py-125 text-left">
                      주차
                    </TableHead>
                    <TableHead className="font-designer-13r text-text-subtle px-150 py-125 text-left">
                      수정일
                    </TableHead>
                    <TableHead className="font-designer-13r text-text-subtle px-150 py-125 text-right">
                      선택
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestList.content.map((request, index) => {
                    const statusMeta =
                      ADMIN_MATCHING_REQUEST_STATUS_META[request.status];
                    const typeMeta = ADMIN_MATCHING_TYPE_META[request.type];
                    const isSelected =
                      selectedMatchingRequestId === request.matchingRequestId;
                    const isLastRow = index === requestList.content.length - 1;

                    return (
                      <TableRow
                        key={request.matchingRequestId}
                        className={
                          isSelected
                            ? 'bg-background-accent-blue-subtle'
                            : undefined
                        }
                        data-last-row={isLastRow || undefined}
                      >
                        <TableCell className="font-designer-14b text-text-default px-150 py-150 align-middle">
                          #{request.matchingRequestId}
                        </TableCell>
                        <TableCell className="px-150 py-150 align-middle">
                          <div className="flex flex-col gap-25">
                            <span className="font-designer-14m text-text-default">
                              {request.memberName ?? '-'}
                            </span>
                            <span className="font-designer-13r text-text-subtle">
                              #{request.memberId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-150 py-150 align-middle">
                          <div className="flex flex-col gap-25">
                            <span className="font-designer-14m text-text-default">
                              {request.partnerName ?? '-'}
                            </span>
                            <span className="font-designer-13r text-text-subtle">
                              #{request.partnerId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-150 py-150 align-middle">
                          <Badge color={statusMeta.color} shape="rectangle">
                            {statusMeta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-150 py-150 align-middle">
                          <Badge color={typeMeta.color} shape="rectangle">
                            {typeMeta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-designer-13r text-text-subtle px-150 py-150 align-middle">
                          {request.weeklyPeriodIdentifier
                            ? formatDateDot(request.weeklyPeriodIdentifier)
                            : '-'}
                        </TableCell>
                        <TableCell className="font-designer-13r text-text-subtle px-150 py-150 align-middle">
                          {request.updatedAt
                            ? formatDateTimeDot(request.updatedAt)
                            : '-'}
                        </TableCell>
                        <TableCell className="px-150 py-150 text-right align-middle">
                          <Button
                            type="button"
                            size="small"
                            color={isSelected ? 'primary' : 'outlined'}
                            loading={isDetailLoading && isSelected}
                            disabled={isDetailLoading}
                            onClick={() => {
                              onSelectRequest(request.matchingRequestId).catch(
                                (): undefined => undefined,
                              );
                            }}
                          >
                            {isSelected ? '선택됨' : '상세 보기'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-100 xl:flex-row xl:items-center xl:justify-between">
              <p className="font-designer-13r text-text-subtle">
                {requestList.page} / {requestList.totalPages}페이지
              </p>
              {requestList.totalPages > 1 ? (
                <Pagination
                  page={requestList.page}
                  totalPages={requestList.totalPages}
                  onChangePage={onChangePage}
                />
              ) : null}
            </div>
          </>
        ) : null}

        {!errorMessage &&
        !isLoading &&
        (!requestList || requestList.content.length === 0) ? (
          <div className="rounded-100 bg-background-neutral-subtle px-150 py-200">
            <p className="font-designer-14r text-text-subtle">
              조건에 맞는 매칭 요청이 없습니다.
            </p>
          </div>
        ) : null}
      </div>
    </AdminMatchingPanel>
  );
}
