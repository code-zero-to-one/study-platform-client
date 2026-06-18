'use client';

import type { ComponentProps } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import KeyValueRow from '@/components/common/ui/key-value-row';
import AdminMatchingPanel from './admin-matching-panel';

interface AdminMatchingSystemPanelProps {
  currentWeekMonday: string;
  statusMeta: {
    label: string;
    color: ComponentProps<typeof Badge>['color'];
    description: string;
  };
  errorMessage?: string;
  isLoading: boolean;
  isStartPending: boolean;
  isEndPending: boolean;
  canStartCycle: boolean;
  canEndCycle: boolean;
  onStartCycle: () => Promise<void>;
  onEndCycle: () => Promise<void>;
}

export default function AdminMatchingSystemPanel({
  currentWeekMonday,
  statusMeta,
  errorMessage,
  isLoading,
  isStartPending,
  isEndPending,
  canStartCycle,
  canEndCycle,
  onStartCycle,
  onEndCycle,
}: AdminMatchingSystemPanelProps) {
  return (
    <AdminMatchingPanel
      title="시스템 상태와 사이클 제어"
      description="매칭 시스템의 현재 상태를 확인하고 사이클 시작/종료를 제어합니다."
    >
      <div className="flex flex-col gap-150">
        <div className="rounded-100 bg-background-neutral-subtle flex flex-col gap-100 p-150">
          <div className="flex items-center gap-100">
            <p className="font-designer-14b text-text-default">현재 상태</p>
            {isLoading ? (
              <span className="font-designer-13r text-text-subtle">
                불러오는 중...
              </span>
            ) : (
              <Badge color={statusMeta.color} shape="rectangle">
                {statusMeta.label}
              </Badge>
            )}
          </div>
          <p className="font-designer-13r text-text-subtle">
            {errorMessage || statusMeta.description}
          </p>
        </div>

        <div className="grid gap-100 xl:grid-cols-2">
          <div className="rounded-100 border-border-subtle border p-150">
            <KeyValueRow
              label="운영 기본 주차"
              columnsClassName="grid-cols-[88px_minmax(0,1fr)] items-center"
            >
              {currentWeekMonday}
            </KeyValueRow>
          </div>
          <div className="rounded-100 border-border-subtle border p-150">
            <KeyValueRow
              label="기본값 안내"
              columnsClassName="grid-cols-[88px_minmax(0,1fr)] items-center"
            >
              이번 주 월요일, 필요 시 직접 수정 가능
            </KeyValueRow>
          </div>
        </div>

        <div className="flex flex-wrap gap-100">
          <Button
            type="button"
            size="small"
            loading={isStartPending}
            disabled={!canStartCycle || isLoading || isEndPending}
            onClick={() => {
              onStartCycle().catch((): undefined => undefined);
            }}
          >
            스터디 사이클 시작
          </Button>
          <Button
            type="button"
            size="small"
            color="outlined"
            loading={isEndPending}
            disabled={!canEndCycle || isLoading || isStartPending}
            onClick={() => {
              onEndCycle().catch((): undefined => undefined);
            }}
          >
            스터디 사이클 종료
          </Button>
        </div>
      </div>
    </AdminMatchingPanel>
  );
}
