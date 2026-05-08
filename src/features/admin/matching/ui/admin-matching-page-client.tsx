'use client';

import type { ReactNode } from 'react';
import type { AdminMatchingCreateRequest } from '@/api/openapi/models';
import Badge from '@/components/common/ui/badge';
import SectionHeader from '@/components/common/ui/section-header';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { useAdminMatchingController } from '@/features/admin/matching/model/use-admin-matching-controller';
import AdminMatchingCreatePanel from '@/features/admin/matching/ui/blocks/admin-matching-create-panel';
import AdminMatchingRequestDetailPanel from '@/features/admin/matching/ui/blocks/admin-matching-request-detail-panel';
import AdminMatchingRequestListPanel from '@/features/admin/matching/ui/blocks/admin-matching-request-list-panel';
import AdminMatchingResetPanel from '@/features/admin/matching/ui/blocks/admin-matching-reset-panel';
import AdminMatchingRunFormPanel from '@/features/admin/matching/ui/blocks/admin-matching-run-form-panel';
import AdminMatchingSchedulerConfigPanel from '@/features/admin/matching/ui/blocks/admin-matching-scheduler-config-panel';
import AdminMatchingSystemPanel from '@/features/admin/matching/ui/blocks/admin-matching-system-panel';

interface AdminMatchingOverviewStatCardProps {
  label: string;
  value: string;
  helper: string;
  accent?: boolean;
  trailing?: ReactNode;
}

function AdminMatchingOverviewStatCard({
  label,
  value,
  helper,
  accent = false,
  trailing,
}: AdminMatchingOverviewStatCardProps) {
  return (
    <div
      className={
        accent
          ? 'rounded-150 border-border-brand bg-fill-brand-subtle-default border p-175'
          : 'rounded-150 border-border-subtle bg-background-default border p-175'
      }
    >
      <div className="flex items-start justify-between gap-100">
        <div className="min-w-0">
          <p className="font-designer-12m text-text-subtle">{label}</p>
          <p className="font-designer-20b text-text-strong mt-75 break-words">
            {value}
          </p>
        </div>
        {trailing}
      </div>
      <p className="font-designer-13r text-text-subtle mt-100">{helper}</p>
    </div>
  );
}

interface AdminMatchingWorkflowStepProps {
  step: string;
  title: string;
  description: string;
}

function AdminMatchingWorkflowStep({
  step,
  title,
  description,
}: AdminMatchingWorkflowStepProps) {
  return (
    <div className="rounded-150 border-border-subtle bg-background-default flex items-start gap-125 border p-150">
      <div className="bg-fill-brand-default-default font-designer-13b text-text-inverse flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full">
        {step}
      </div>
      <div className="min-w-0">
        <p className="font-designer-14b text-text-default">{title}</p>
        <p className="font-designer-13r text-text-subtle mt-50">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AdminMatchingPageClient() {
  const { state, viewModel, actions } = useAdminMatchingController();

  return (
    <div className="bg-background-alternative min-h-full">
      <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-250 p-250 xl:p-400">
        <SurfacePanel className="rounded-200 shadow-1 overflow-hidden">
          <div className="grid gap-250 p-250 xl:grid-cols-[minmax(0,1.15fr)_420px] xl:p-300">
            <div className="flex flex-col gap-175">
              <div className="flex flex-wrap items-center gap-75">
                <Badge color="primary" shape="rectangle">
                  운영 콘솔
                </Badge>
                <Badge
                  color={viewModel.schedulerConfigMeta.color}
                  shape="rectangle"
                >
                  스케줄러 {viewModel.schedulerConfigMeta.label}
                </Badge>
                <Badge color="green" shape="rectangle">
                  목록 API 연결
                </Badge>
                <Badge
                  color={viewModel.systemStatusMeta.color}
                  shape="rectangle"
                >
                  {viewModel.systemStatusMeta.label}
                </Badge>
              </div>

              <SectionHeader
                title="스터디 그룹 매칭 관리"
                description="운영자는 스케줄러 설정과 현재 주차 운영 상태를 함께 확인하고, 목록 탐색·자동 매칭 실행·수동 매칭 생성·선택 요청 수정까지 한 화면에서 처리할 수 있습니다."
                className="gap-100"
                titleClassName="font-designer-28b text-text-strong"
                descriptionClassName="max-w-[760px] font-designer-14r text-text-subtle"
              />

              <div className="grid gap-100 sm:grid-cols-2 xl:grid-cols-3">
                <AdminMatchingOverviewStatCard
                  label="운영 기본 주차"
                  value={viewModel.currentWeekMonday}
                  helper="조회, 수동 생성, 초기화 입력의 기본값이며 필요하면 직접 바꿀 수 있습니다."
                />
                <AdminMatchingOverviewStatCard
                  label="스케줄러"
                  value={viewModel.schedulerConfigMeta.label}
                  helper="매주 다음 주 자동 매칭 스케줄러의 런타임 활성 상태입니다."
                  accent={state.schedulerConfig?.enabled}
                />
                <AdminMatchingOverviewStatCard
                  label="시스템 상태"
                  value={viewModel.systemStatusMeta.label}
                  helper="현재 사이클 상태에 따라 시작/종료 액션이 달라집니다."
                  trailing={
                    <Badge
                      color={viewModel.systemStatusMeta.color}
                      shape="rectangle"
                    >
                      상태
                    </Badge>
                  }
                />
              </div>
            </div>

            <div className="rounded-200 border-border-subtle bg-fill-brand-subtle-default border p-200">
              <p className="font-designer-13b text-text-brand">운영 흐름</p>
              <p className="font-designer-14r text-text-subtle mt-75">
                이 화면은 상단에서 하단으로 운영 순서대로 쌓아, 상태 확인부터
                실행과 사후 수정까지 한 흐름으로 따라가게 구성했습니다.
              </p>

              <div className="mt-175 flex flex-col gap-100">
                <AdminMatchingWorkflowStep
                  step="1"
                  title="시스템 상태와 사이클 제어 확인"
                  description="현재 모집 중인지 스터디 진행 중인지 먼저 확인하고, 사이클 시작과 종료를 이 자리에서 제어합니다."
                />
                <AdminMatchingWorkflowStep
                  step="2"
                  title="스케줄러 설정 저장"
                  description="자동 매칭 스케줄러의 활성 상태와 관리자, 실행 파라미터를 저장해 다음 주 배치 기준을 맞춥니다."
                />
                <AdminMatchingWorkflowStep
                  step="3"
                  title="자동 실행과 주차 초기화"
                  description="필요 시 자동 매칭을 즉시 실행하고, 운영 중 문제가 생기면 특정 주차 데이터를 초기화합니다."
                />
                <AdminMatchingWorkflowStep
                  step="4"
                  title="목록 탐색 후 선택 요청 수정"
                  description="목록과 상세 패널을 한 줄에서 함께 보고, 선택한 요청만 drill-down 해서 수정한 뒤 마지막에 수동 매칭을 추가합니다."
                />
              </div>
            </div>
          </div>
        </SurfacePanel>

        <AdminMatchingSystemPanel
          currentWeekMonday={viewModel.currentWeekMonday}
          statusMeta={viewModel.systemStatusMeta}
          errorMessage={viewModel.systemStatusErrorMessage}
          isLoading={state.isSystemStatusLoading}
          isStartPending={state.isStartCyclePending}
          isEndPending={state.isEndCyclePending}
          canStartCycle={viewModel.canStartCycle}
          canEndCycle={viewModel.canEndCycle}
          onStartCycle={actions.startStudyCycle}
          onEndCycle={actions.endStudyCycle}
        />

        <AdminMatchingSchedulerConfigPanel
          adminOptions={state.adminOptions}
          adminOptionsErrorMessage={state.adminOptionsErrorMessage}
          defaultValues={viewModel.schedulerConfigDefaultValues}
          errorMessage={state.schedulerConfigErrorMessage}
          isAdminOptionsLoading={state.isAdminOptionsLoading}
          isLoading={state.isSchedulerConfigLoading}
          isPending={state.isSchedulerConfigSaving}
          schedulerMeta={viewModel.schedulerConfigMeta}
          schedulerSummary={viewModel.schedulerConfigSummary}
          onSubmit={actions.updateSchedulerConfig}
        />

        <AdminMatchingRunFormPanel
          adminOptions={state.adminOptions}
          adminOptionsErrorMessage={state.adminOptionsErrorMessage}
          defaultAdminId={state.defaultAdminId}
          isAdminOptionsLoading={state.isAdminOptionsLoading}
          isPending={state.isRunPending}
          onSubmit={actions.runAutoMatching}
        />

        <AdminMatchingResetPanel
          defaultWeeklyPeriodIdentifier={viewModel.currentWeekMonday}
          isPending={state.isResetPending}
          onSubmit={actions.resetWeeklyMatching}
        />

        <div className="grid items-stretch gap-250 xl:grid-cols-2">
          <AdminMatchingRequestListPanel
            className="h-full"
            defaultFilterValues={viewModel.requestListDefaultFilterValues}
            requestList={state.requestList}
            selectedMatchingRequestId={state.selectedMatchingRequestId}
            errorMessage={state.requestListErrorMessage}
            isLoading={state.isRequestListLoading}
            isFetching={state.isRequestListFetching}
            isDetailLoading={state.isRequestDetailLoading}
            onApplyFilters={actions.applyRequestListFilters}
            onChangePage={actions.changeRequestListPage}
            onSelectRequest={actions.selectMatchingRequest}
          />

          <AdminMatchingRequestDetailPanel
            className="h-full"
            selectedRequest={state.selectedRequest}
            selectedRequestSummary={viewModel.selectedRequestSummary}
            selectedRequestStatusMeta={viewModel.selectedRequestStatusMeta}
            detailErrorMessage={state.requestDetailErrorMessage}
            isLoading={state.isRequestDetailLoading}
            isUpdatePending={state.isUpdatePending}
            isDeletePending={state.isDeletePending}
            onUpdateRequest={async (values) => {
              await actions.updateMatchingRequest({
                request: {
                  partnerId: values.partnerId,
                  status: values.status,
                  content: values.content,
                },
              });
            }}
            onDeleteRequest={actions.deleteMatchingRequest}
          />
        </div>

        <AdminMatchingCreatePanel
          defaultWeeklyPeriodIdentifier={viewModel.currentWeekMonday}
          isPending={state.isCreatePending}
          onSubmit={async (values) => {
            const request: AdminMatchingCreateRequest = {
              memberId: values.memberId,
              partnerId: values.partnerId,
              status: values.status,
              type: values.type,
              content: values.content || undefined,
              weeklyPeriodIdentifier: values.weeklyPeriodIdentifier,
            };

            await actions.createMatchingRequest(request);
          }}
        />
      </div>
    </div>
  );
}
