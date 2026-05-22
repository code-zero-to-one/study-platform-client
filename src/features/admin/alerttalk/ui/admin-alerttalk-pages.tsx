'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import { BaseInput, NativeSelect } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
} from '@/components/common/ui/table/data-table';
import type {
  AdminAlerttalkDeliveryLog,
  AdminAlerttalkDeliveryLogFilters,
  AdminAlerttalkDeliveryLogDetail,
  AdminAlerttalkTemplate,
  AdminAlerttalkTemplateTestSendResponse,
  AlerttalkApprovalStatus,
  AlerttalkDeliveryStatus,
  AlerttalkRuleType,
} from '@/features/admin/alerttalk/model/admin-alerttalk-contract';
import {
  useAdminAlerttalkDeliveryLogDetailQuery,
  useAdminAlerttalkDeliveryLogsQuery,
  useAdminAlerttalkTemplatesQuery,
  useDryRunAdminAlerttalkScheduleMutation,
  useRetryAdminAlerttalkDeliveryLogMutation,
  useSyncAdminAlerttalkTemplatesMutation,
  useTestSendAdminAlerttalkTemplateMutation,
} from '@/features/admin/alerttalk/model/use-admin-alerttalk-query';

const APPROVAL_STATUS_OPTIONS: Array<AlerttalkApprovalStatus | ''> = [
  '',
  'APPROVED',
  'REJECTED',
  'PENDING_REVIEW',
  'NOT_SYNCED',
];
const DELIVERY_STATUS_OPTIONS: Array<
  Extract<AlerttalkDeliveryStatus, 'SENT' | 'FAILED' | 'SKIPPED'> | ''
> = ['', 'SENT', 'FAILED', 'SKIPPED'];
const RULE_TYPE_OPTIONS: AlerttalkRuleType[] = [
  'DAILY_REMINDER',
  'LESSON_NUDGE_3D',
  'RE_ENGAGEMENT',
  'FINAL_NOTICE',
];
const EMPTY_TEMPLATES: AdminAlerttalkTemplate[] = [];

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const statusLabelMap: Record<string, string> = {
  APPROVED: '승인완료',
  REJECTED: '반려',
  PENDING_REVIEW: '검수중',
  NOT_SYNCED: '미등록',
  CREATED: '생성',
  READY: '대기',
  SENT: '성공',
  FAILED: '실패',
  SKIPPED: '스킵',
};

const getBadgeColor = (status: string) => {
  if (status === 'APPROVED' || status === 'SENT' || status === 'READY') {
    return 'green' as const;
  }
  if (status === 'REJECTED' || status === 'FAILED') return 'red' as const;
  if (status === 'PENDING_REVIEW' || status === 'CREATED')
    return 'orange' as const;

  return 'gray' as const;
};

const StatusBadge = ({ status }: { status: string }) => (
  <Badge color={getBadgeColor(status)} shape="rectangle">
    {statusLabelMap[status] ?? status}
  </Badge>
);

const BooleanBadge = ({ enabled }: { enabled: boolean }) => (
  <Badge color={enabled ? 'green' : 'gray'} shape="rectangle">
    {enabled ? '가능' : '불가'}
  </Badge>
);

const PageTabs = ({ active }: { active: 'templates' | 'logs' | 'dry-run' }) => {
  const tabs = [
    {
      key: 'templates',
      label: '템플릿 관리',
      href: '/admin/alerttalk/templates',
    },
    { key: 'logs', label: '발송 로그', href: '/admin/alerttalk/delivery-logs' },
    {
      key: 'dry-run',
      label: '배치 점검',
      href: '/admin/alerttalk/schedules/dry-run',
    },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-75">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            'font-designer-14b rounded-100 border px-150 py-100',
            active === tab.key
              ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
              : 'border-border-default bg-background-default text-text-subtle',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
};

const PageShell = ({
  active,
  title,
  description,
  action,
  children,
}: {
  active: 'templates' | 'logs' | 'dry-run';
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <main className="bg-background-alternative min-h-screen w-full p-300">
    <div className="mx-auto flex w-full flex-col gap-200">
      <PageTabs active={active} />
      <header className="border-border-default bg-background-default rounded-150 flex flex-wrap items-start justify-between gap-150 border p-250">
        <div>
          <h1 className="font-designer-24b text-text-default">{title}</h1>
          <p className="font-designer-14r text-text-subtle mt-75">
            {description}
          </p>
        </div>
        {action}
      </header>
      {children}
    </div>
  </main>
);

const SummaryCard = ({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description?: string;
}) => (
  <div className="border-border-default bg-background-default rounded-150 border p-200">
    <p className="font-designer-13r text-text-subtle">{label}</p>
    <p className="font-designer-24b text-text-default mt-75">{value}</p>
    {description ? (
      <p className="font-designer-12r text-text-subtlest mt-50">
        {description}
      </p>
    ) : null}
  </div>
);

const RejectionReasonModal = ({
  template,
  open,
  onOpenChange,
}: {
  template?: AdminAlerttalkTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Modal.Root open={open} onOpenChange={onOpenChange}>
    <Modal.Portal>
      <Modal.Overlay />
      <Modal.Content size="small">
        <Modal.Header className="flex items-start justify-between gap-150">
          <div>
            <Modal.Title>반려/미등록 사유</Modal.Title>
            <p className="font-designer-13r text-text-subtle mt-75">
              {template?.templateName ?? '-'}
            </p>
          </div>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <p className="font-designer-14r text-text-default whitespace-pre-wrap">
            {template?.rejectionReason || '등록된 사유가 없습니다.'}
          </p>
        </Modal.Body>
      </Modal.Content>
    </Modal.Portal>
  </Modal.Root>
);

const TemplateTestSendModal = ({
  template,
  open,
  onOpenChange,
}: {
  template?: AdminAlerttalkTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [result, setResult] =
    useState<AdminAlerttalkTemplateTestSendResponse>();
  const mutation = useTestSendAdminAlerttalkTemplateMutation();

  const submit = async () => {
    if (!template || !phoneNumber.trim()) return;
    const response = await mutation.mutateAsync({
      templateKey: template.templateKey,
      request: {
        phoneNumber: phoneNumber.trim(),
        ...(receiverName.trim() ? { receiverName: receiverName.trim() } : {}),
      },
    });
    setResult(response);
  };

  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setPhoneNumber('');
          setReceiverName('');
          setResult(undefined);
        }
      }}
    >
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium">
          <Modal.Header className="flex items-start justify-between gap-150">
            <div>
              <Modal.Title>템플릿 테스트 발송</Modal.Title>
              <p className="font-designer-13r text-text-subtle mt-75">
                실제 알림톡 발송 요청입니다. 검증용 번호만 입력하세요.
              </p>
            </div>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-200">
            {template ? (
              <section className="bg-background-alternative rounded-150 p-150">
                <p className="font-designer-16b text-text-default">
                  {template.templateName}
                </p>
                <p className="font-designer-13r text-text-subtle mt-50 break-all">
                  {template.templateKey} ·{' '}
                  {template.aligoTemplateCode ?? '코드 없음'}
                </p>
                <p className="font-designer-13r text-text-subtle mt-50">
                  {template.sendPolicySummary}
                </p>
              </section>
            ) : null}
            <label className="flex flex-col gap-75">
              <span className="font-designer-13b text-text-default">
                전화번호
              </span>
              <BaseInput
                inputMode="numeric"
                placeholder="01012345678"
                value={phoneNumber}
                onValueChange={setPhoneNumber}
              />
            </label>
            <label className="flex flex-col gap-75">
              <span className="font-designer-13b text-text-default">
                수신자명 선택
              </span>
              <BaseInput
                placeholder="미입력 시 서버 기본값 사용"
                value={receiverName}
                onValueChange={setReceiverName}
              />
            </label>
            {result ? (
              <section className="border-border-success bg-fill-success-subtle-default rounded-150 flex flex-col gap-100 border p-150">
                <div className="flex flex-wrap items-center gap-75">
                  <StatusBadge
                    status={result.requestAccepted ? 'SENT' : 'READY'}
                  />
                  <span className="font-designer-14b text-text-default">
                    요청 접수: {result.requestAccepted ? '성공' : '확인 필요'}
                  </span>
                </div>
                <p className="font-designer-13r text-text-default whitespace-pre-wrap">
                  {result.finalPreview}
                </p>
                <p className="font-designer-13r text-text-subtle">
                  Aligo message id: {result.aligoMessageId ?? '-'}
                </p>
              </section>
            ) : null}
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-100">
            <Button color="outlined" onClick={() => onOpenChange(false)}>
              닫기
            </Button>
            <Button
              loading={mutation.isPending}
              disabled={!template || !phoneNumber.trim()}
              onClick={submit}
            >
              발송하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
};

const JsonPreview = ({ value }: { value?: Record<string, unknown> }) => {
  if (!value) return <span>-</span>;

  return (
    <pre className="bg-background-alternative rounded-100 font-designer-12r text-text-subtle overflow-auto p-100 whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
};

export function AdminAlerttalkTemplatePageClient() {
  const [approvalStatus, setApprovalStatus] = useState<
    AlerttalkApprovalStatus | ''
  >('');
  const [templateKey, setTemplateKey] = useState('');
  const [reasonTemplate, setReasonTemplate] =
    useState<AdminAlerttalkTemplate>();
  const [testTemplate, setTestTemplate] = useState<AdminAlerttalkTemplate>();
  const params = useMemo(
    () => ({
      ...(approvalStatus ? { approvalStatus } : {}),
      ...(templateKey.trim() ? { templateKey: templateKey.trim() } : {}),
    }),
    [approvalStatus, templateKey],
  );
  const templatesQuery = useAdminAlerttalkTemplatesQuery(params);
  const syncMutation = useSyncAdminAlerttalkTemplatesMutation();
  const templates = templatesQuery.data?.templates ?? EMPTY_TEMPLATES;
  const counts = useMemo(
    () => ({
      approved: templates.filter((item) => item.approvalStatus === 'APPROVED')
        .length,
      rejected: templates.filter((item) => item.approvalStatus === 'REJECTED')
        .length,
      notSynced: templates.filter(
        (item) => item.approvalStatus === 'NOT_SYNCED',
      ).length,
      lastSyncedAt: templates
        .map((item) => item.lastSyncedAt)
        .filter(Boolean)
        .sort()
        .at(-1),
    }),
    [templates],
  );

  return (
    <PageShell
      active="templates"
      title="클래스 알림톡 템플릿"
      description="승인 상태, 반려 사유, 테스트 발송 가능 여부를 한 화면에서 확인합니다."
      action={
        <Button
          loading={syncMutation.isPending}
          onClick={() => syncMutation.mutate({ force: false })}
        >
          알리고 상태 다시 불러오기
        </Button>
      }
    >
      <section className="grid grid-cols-1 gap-150 md:grid-cols-4">
        <SummaryCard label="승인완료" value={counts.approved} />
        <SummaryCard label="반려" value={counts.rejected} />
        <SummaryCard label="미등록" value={counts.notSynced} />
        <SummaryCard
          label="마지막 sync"
          value={formatDateTime(counts.lastSyncedAt)}
        />
      </section>

      <section className="border-border-default bg-background-default rounded-150 flex flex-col gap-150 border p-200">
        <div className="flex flex-wrap gap-100">
          <NativeSelect
            value={approvalStatus}
            onChange={(event) =>
              setApprovalStatus(
                event.target.value as AlerttalkApprovalStatus | '',
              )
            }
          >
            {APPROVAL_STATUS_OPTIONS.map((status) => (
              <option key={status || 'ALL'} value={status}>
                {status ? (statusLabelMap[status] ?? status) : '전체 상태'}
              </option>
            ))}
          </NativeSelect>
          <div className="min-w-0 flex-1">
            <BaseInput
              placeholder="templateKey 검색"
              value={templateKey}
              onValueChange={setTemplateKey}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable>
            <DataTableHead>
              <DataTableRow>
                {[
                  '템플릿명',
                  '내부 키',
                  '알리고 코드',
                  '승인상태',
                  '발송시점',
                  '발송',
                  '테스트',
                  '본문 미리보기',
                  '액션',
                ].map((header) => (
                  <DataTableHeadCell key={header}>{header}</DataTableHeadCell>
                ))}
              </DataTableRow>
            </DataTableHead>
            <tbody>
              {templates.length === 0 ? (
                <DataTableRow>
                  <DataTableCell colSpan={9} align="center" tone="subtle">
                    {templatesQuery.isLoading
                      ? '템플릿을 불러오는 중입니다.'
                      : '조회된 템플릿이 없습니다.'}
                  </DataTableCell>
                </DataTableRow>
              ) : (
                templates.map((template) => (
                  <DataTableRow key={template.templateKey}>
                    <DataTableCell tone="strong">
                      {template.templateName}
                    </DataTableCell>
                    <DataTableCell>
                      <span className="break-all">{template.templateKey}</span>
                    </DataTableCell>
                    <DataTableCell>
                      {template.aligoTemplateCode ?? '-'}
                    </DataTableCell>
                    <DataTableCell>
                      <StatusBadge status={template.approvalStatus} />
                    </DataTableCell>
                    <DataTableCell>{template.sendPolicySummary}</DataTableCell>
                    <DataTableCell>
                      <BooleanBadge enabled={template.dispatchEnabled} />
                    </DataTableCell>
                    <DataTableCell>
                      <BooleanBadge enabled={template.testSendEnabled} />
                    </DataTableCell>
                    <DataTableCell>
                      <p className="line-clamp-2 whitespace-normal">
                        {template.templateBodyPreview ?? '-'}
                      </p>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex flex-wrap gap-75">
                        <Button
                          color="outlined"
                          size="xsmall"
                          disabled={!template.rejectionReason}
                          onClick={() => setReasonTemplate(template)}
                        >
                          사유 보기
                        </Button>
                        <Button
                          size="xsmall"
                          disabled={!template.testSendEnabled}
                          onClick={() => setTestTemplate(template)}
                        >
                          발송 테스트
                        </Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))
              )}
            </tbody>
          </DataTable>
        </div>
      </section>

      <RejectionReasonModal
        template={reasonTemplate}
        open={Boolean(reasonTemplate)}
        onOpenChange={(open) => !open && setReasonTemplate(undefined)}
      />
      <TemplateTestSendModal
        template={testTemplate}
        open={Boolean(testTemplate)}
        onOpenChange={(open) => !open && setTestTemplate(undefined)}
      />
    </PageShell>
  );
}

const DeliveryLogFilters = ({
  filters,
  onChange,
}: {
  filters: AdminAlerttalkDeliveryLogFilters;
  onChange: (filters: AdminAlerttalkDeliveryLogFilters) => void;
}) => (
  <section className="border-border-default bg-background-default rounded-150 flex flex-wrap items-end gap-100 border p-200">
    <label className="flex min-w-0 flex-1 flex-col gap-75">
      <span className="font-designer-13b text-text-default">템플릿</span>
      <BaseInput
        placeholder="templateKey"
        value={filters.templateKey ?? ''}
        onValueChange={(value) =>
          onChange({ ...filters, templateKey: value || undefined })
        }
      />
    </label>
    <label className="flex flex-col gap-75">
      <span className="font-designer-13b text-text-default">상태</span>
      <NativeSelect
        value={filters.status ?? ''}
        onChange={(event) =>
          onChange({
            ...filters,
            status: event.target.value
              ? (event.target
                  .value as AdminAlerttalkDeliveryLogFilters['status'])
              : undefined,
          })
        }
      >
        {DELIVERY_STATUS_OPTIONS.map((status) => (
          <option key={status || 'ALL'} value={status}>
            {status ? (statusLabelMap[status] ?? status) : '전체'}
          </option>
        ))}
      </NativeSelect>
    </label>
    <label className="flex flex-col gap-75">
      <span className="font-designer-13b text-text-default">from</span>
      <BaseInput
        type="datetime-local"
        value={filters.from ?? ''}
        onValueChange={(value) =>
          onChange({ ...filters, from: value || undefined })
        }
      />
    </label>
    <label className="flex flex-col gap-75">
      <span className="font-designer-13b text-text-default">to</span>
      <BaseInput
        type="datetime-local"
        value={filters.to ?? ''}
        onValueChange={(value) =>
          onChange({ ...filters, to: value || undefined })
        }
      />
    </label>
    <Button color="outlined" onClick={() => onChange({})}>
      초기화
    </Button>
  </section>
);

const DeliveryLogTable = ({ logs }: { logs: AdminAlerttalkDeliveryLog[] }) => (
  <div className="border-border-default bg-background-default rounded-150 overflow-x-auto border p-200">
    <DataTable>
      <DataTableHead>
        <DataTableRow>
          {[
            '발송시각',
            '템플릿',
            '트리거',
            '회원 ID',
            '전화번호',
            '상태',
            '실패 사유',
            'source key',
            '상세',
          ].map((header) => (
            <DataTableHeadCell key={header}>{header}</DataTableHeadCell>
          ))}
        </DataTableRow>
      </DataTableHead>
      <tbody>
        {logs.length === 0 ? (
          <DataTableRow>
            <DataTableCell colSpan={9} align="center" tone="subtle">
              조회된 로그가 없습니다.
            </DataTableCell>
          </DataTableRow>
        ) : (
          logs.map((log) => (
            <DataTableRow key={`${log.jobId}-${log.memberId ?? 'job'}`}>
              <DataTableCell>{formatDateTime(log.sentAt)}</DataTableCell>
              <DataTableCell>{log.templateKey}</DataTableCell>
              <DataTableCell>{log.triggerType}</DataTableCell>
              <DataTableCell>{log.memberId ?? '-'}</DataTableCell>
              <DataTableCell>{log.phoneMasked ?? '-'}</DataTableCell>
              <DataTableCell>
                <StatusBadge status={log.status} />
              </DataTableCell>
              <DataTableCell>{log.failureReason ?? '-'}</DataTableCell>
              <DataTableCell>{log.sourceKey}</DataTableCell>
              <DataTableCell>
                <Button asChild size="xsmall" color="outlined">
                  <Link href={`/admin/alerttalk/delivery-logs/${log.jobId}`}>
                    상세
                  </Link>
                </Button>
              </DataTableCell>
            </DataTableRow>
          ))
        )}
      </tbody>
    </DataTable>
  </div>
);

export function AdminAlerttalkDeliveryLogListPageClient() {
  const [filters, setFilters] = useState<AdminAlerttalkDeliveryLogFilters>({});
  const logsQuery = useAdminAlerttalkDeliveryLogsQuery(filters);

  return (
    <PageShell
      active="logs"
      title="알림톡 발송 로그"
      description="성공, 실패, 스킵 결과를 검색하고 상세 원인을 확인합니다."
    >
      <DeliveryLogFilters filters={filters} onChange={setFilters} />
      <DeliveryLogTable logs={logsQuery.data?.logs ?? []} />
    </PageShell>
  );
}

const RetryModal = ({
  detail,
  open,
  onOpenChange,
}: {
  detail?: AdminAlerttalkDeliveryLogDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [reason, setReason] = useState('');
  const mutation = useRetryAdminAlerttalkDeliveryLogMutation(
    detail?.jobId ?? 0,
  );

  const submit = async () => {
    if (!detail) return;
    await mutation.mutateAsync({
      jobId: detail.jobId,
      request: reason.trim() ? { reason: reason.trim() } : {},
    });
    setReason('');
    onOpenChange(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small">
          <Modal.Header className="flex items-start justify-between gap-150">
            <div>
              <Modal.Title>실패/스킵 건 재실행</Modal.Title>
              <p className="font-designer-13r text-text-subtle mt-75">
                원본 job {detail?.jobId ?? '-'}의 재실행 job을 새로 만듭니다.
              </p>
            </div>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <label className="flex flex-col gap-75">
              <span className="font-designer-13b text-text-default">
                재실행 사유 선택
              </span>
              <textarea
                className="font-designer-14r border-border-default bg-background-default text-text-default rounded-100 min-h-600 w-full resize-y border p-150 focus:border-border-brand focus:outline-none"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="운영자 재실행 사유를 남기면 감사에 도움이 됩니다."
              />
            </label>
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-100">
            <Button color="outlined" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button loading={mutation.isPending} onClick={submit}>
              재실행
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
};

export function AdminAlerttalkDeliveryLogDetailPageClient({
  jobId,
}: {
  jobId: number;
}) {
  const [retryOpen, setRetryOpen] = useState(false);
  const detailQuery = useAdminAlerttalkDeliveryLogDetailQuery(jobId);
  const detail = detailQuery.data;
  const retryVisible = detail
    ? detail.failedCount + detail.skippedCount > 0
    : false;

  return (
    <PageShell
      active="logs"
      title="알림톡 발송 로그 상세"
      description="job 집계와 target별 실패/스킵 원인을 확인합니다."
      action={
        retryVisible ? (
          <Button onClick={() => setRetryOpen(true)}>재실행</Button>
        ) : undefined
      }
    >
      {detail ? (
        <>
          <section className="grid grid-cols-1 gap-150 md:grid-cols-4">
            <SummaryCard
              label="job"
              value={detail.jobId}
              description={detail.status}
            />
            <SummaryCard label="대상" value={detail.targetCount} />
            <SummaryCard label="성공" value={detail.sentCount} />
            <SummaryCard
              label="실패/스킵"
              value={`${detail.failedCount}/${detail.skippedCount}`}
            />
          </section>
          <section className="border-border-default bg-background-default rounded-150 border p-200">
            <div className="mb-150 grid grid-cols-1 gap-100 md:grid-cols-3">
              <SummaryCard label="templateKey" value={detail.templateKey} />
              <SummaryCard label="triggerType" value={detail.triggerType} />
              <SummaryCard label="sourceKey" value={detail.sourceKey} />
            </div>
            <div className="overflow-x-auto">
              <DataTable>
                <DataTableHead>
                  <DataTableRow>
                    {[
                      'memberId',
                      'phoneMasked',
                      'status',
                      'failureReason',
                      'payloadSnapshot',
                    ].map((header) => (
                      <DataTableHeadCell key={header}>
                        {header}
                      </DataTableHeadCell>
                    ))}
                  </DataTableRow>
                </DataTableHead>
                <tbody>
                  {detail.targets.map((target) => (
                    <DataTableRow
                      key={`${target.jobId}-${target.memberId ?? target.phoneMasked}`}
                    >
                      <DataTableCell>{target.memberId ?? '-'}</DataTableCell>
                      <DataTableCell>{target.phoneMasked ?? '-'}</DataTableCell>
                      <DataTableCell>
                        <StatusBadge status={target.status} />
                      </DataTableCell>
                      <DataTableCell>
                        {target.failureReason ?? '-'}
                      </DataTableCell>
                      <DataTableCell>
                        <JsonPreview value={target.payloadSnapshot} />
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </tbody>
              </DataTable>
            </div>
          </section>
          <RetryModal
            detail={detail}
            open={retryOpen}
            onOpenChange={setRetryOpen}
          />
        </>
      ) : (
        <section className="border-border-default bg-background-default rounded-150 border p-300 text-center">
          <p className="font-designer-14r text-text-subtle">
            {detailQuery.isLoading
              ? '상세를 불러오는 중입니다.'
              : '상세를 찾지 못했습니다.'}
          </p>
        </section>
      )}
    </PageShell>
  );
}

export function AdminAlerttalkDryRunPageClient() {
  const [templateKey, setTemplateKey] =
    useState<AlerttalkRuleType>('DAILY_REMINDER');
  const [at, setAt] = useState('');
  const [limit, setLimit] = useState('100');
  const mutation = useDryRunAdminAlerttalkScheduleMutation();
  const result = mutation.data;

  const submit = () => {
    const now = new Date().toISOString().slice(0, 16);
    mutation.mutate({
      templateKey,
      at: at || now,
      limit: Number(limit) || 100,
    });
  };

  return (
    <PageShell
      active="dry-run"
      title="알림톡 배치 점검"
      description="예약성 알림 후보를 실제 발송 없이 미리 확인합니다."
    >
      <section className="border-border-brand bg-fill-brand-subtle-default rounded-150 border p-200">
        <p className="font-designer-16b text-text-brand">실제 발송 없음</p>
        <p className="font-designer-14r text-text-default mt-75">
          이 화면은 후보만 계산하며 dispatch job을 생성하지 않습니다.
        </p>
      </section>
      <section className="border-border-default bg-background-default rounded-150 flex flex-wrap items-end gap-100 border p-200">
        <label className="flex flex-col gap-75">
          <span className="font-designer-13b text-text-default">rule</span>
          <NativeSelect
            value={templateKey}
            onChange={(event) =>
              setTemplateKey(event.target.value as AlerttalkRuleType)
            }
          >
            {RULE_TYPE_OPTIONS.map((rule) => (
              <option key={rule} value={rule}>
                {rule}
              </option>
            ))}
          </NativeSelect>
        </label>
        <label className="flex flex-col gap-75">
          <span className="font-designer-13b text-text-default">기준 시각</span>
          <BaseInput type="datetime-local" value={at} onValueChange={setAt} />
        </label>
        <label className="flex flex-col gap-75">
          <span className="font-designer-13b text-text-default">limit</span>
          <BaseInput
            inputMode="numeric"
            value={limit}
            onValueChange={setLimit}
          />
        </label>
        <Button loading={mutation.isPending} onClick={submit}>
          후보 미리보기
        </Button>
      </section>
      {result ? (
        <section className="border-border-default bg-background-default rounded-150 border p-200">
          <div className="mb-150 flex flex-wrap items-center gap-100">
            <SummaryCard label="templateKey" value={result.templateKey} />
            <SummaryCard label="candidateCount" value={result.candidateCount} />
            <Badge
              color={result.dispatchCreated ? 'red' : 'green'}
              shape="rectangle"
            >
              dispatchCreated={String(result.dispatchCreated)}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <DataTable>
              <DataTableHead>
                <DataTableRow>
                  {['memberId', 'phoneMasked', 'whyIncluded'].map((header) => (
                    <DataTableHeadCell key={header}>{header}</DataTableHeadCell>
                  ))}
                </DataTableRow>
              </DataTableHead>
              <tbody>
                {result.previewTargets.map((target) => (
                  <DataTableRow
                    key={`${target.memberId ?? 'unknown'}-${target.phoneMasked ?? target.whyIncluded}`}
                  >
                    <DataTableCell>{target.memberId ?? '-'}</DataTableCell>
                    <DataTableCell>{target.phoneMasked ?? '-'}</DataTableCell>
                    <DataTableCell>{target.whyIncluded}</DataTableCell>
                  </DataTableRow>
                ))}
              </tbody>
            </DataTable>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
