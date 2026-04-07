'use client';

import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import ListStateBoundary from '@/components/common/ui/list/list-state-boundary';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { useDeveloperRegistrationController } from '@/features/developer/model/use-developer-registration-controller';

const OPTION_ITEMS = [
  {
    registered: true,
    title: '예, 개발자로 등록할게요',
    description:
      '커뮤니티와 서비스 내 개발자 전용 표시/사용처에서 이 등록 상태를 기준으로 활용합니다.',
  },
  {
    registered: false,
    title: '아니오, 지금은 등록하지 않을게요',
    description:
      '개발자 등록 상태를 유지하지 않습니다. 나중에 다시 이 화면에서 변경할 수 있습니다.',
  },
] as const;

const formatUpdatedAt = (updatedAt?: string) => {
  if (!updatedAt) {
    return '아직 등록 이력이 없습니다.';
  }

  return `마지막 변경 시각: ${updatedAt}`;
};

function DeveloperRegistrationLoading() {
  return (
    <SurfacePanel className="flex flex-col gap-150 p-300">
      <p className="font-designer-18b text-text-default">
        개발자 등록 상태를 확인 중입니다.
      </p>
      <p className="font-designer-14r text-text-subtle">잠시만 기다려주세요.</p>
    </SurfacePanel>
  );
}

function DeveloperRegistrationError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  const handleRetryClick = (): void => {
    onRetry().catch((): undefined => undefined);
  };

  return (
    <SurfacePanel className="flex flex-col gap-250 p-300">
      <div className="flex flex-col gap-100">
        <p className="font-designer-18b text-text-default">
          개발자 등록 정보를 불러오지 못했습니다.
        </p>
        <p className="font-designer-14r text-text-subtle">{message}</p>
      </div>
      <div className="flex flex-wrap gap-100">
        <Button size="small" onClick={handleRetryClick}>
          다시 시도
        </Button>
        <Button asChild size="small" color="outlined">
          <Link href="/home">홈으로 이동</Link>
        </Button>
      </div>
    </SurfacePanel>
  );
}

export default function DeveloperRegistrationPage() {
  const { state, actions } = useDeveloperRegistrationController();
  const handleSubmitClick = (): void => {
    actions.handleSubmit().catch((): undefined => undefined);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-300 px-600 py-700">
      <div className="flex flex-col gap-100">
        <h1 className="font-designer-24b text-text-default">개발자 등록</h1>
        <p className="font-designer-14r text-text-subtle">
          개발자 등록은 역할 변경이 아니라 별도 등록 상태입니다. 아래에서 현재
          상태를 확인하고 예/아니오로 변경할 수 있습니다.
        </p>
      </div>

      <ListStateBoundary
        state={state.viewState}
        loading={<DeveloperRegistrationLoading />}
        error={
          <DeveloperRegistrationError
            message={state.errorMessage}
            onRetry={actions.handleRetry}
          />
        }
        ready={
          <SurfacePanel className="flex flex-col gap-300 p-300">
            <div className="flex flex-col gap-100">
              <p className="font-designer-18b text-text-default">
                개발자 등록 여부를 선택해주세요.
              </p>
              <p className="font-designer-14r text-text-subtle">
                {state.currentRegistration?.registered
                  ? '현재 개발자 등록이 완료된 상태입니다.'
                  : '현재 개발자 등록이 되어 있지 않습니다.'}
              </p>
              <p className="font-designer-13r text-text-subtle">
                {formatUpdatedAt(state.currentRegistration?.updatedAt)}
              </p>
            </div>

            <div className="grid gap-150">
              {OPTION_ITEMS.map((option) => {
                const isSelected =
                  state.selectedRegistered === option.registered;

                return (
                  <button
                    key={String(option.registered)}
                    type="button"
                    onClick={() =>
                      actions.handleSelectRegistered(option.registered)
                    }
                    className={cn(
                      'flex flex-col items-start gap-75 rounded-150 border p-250 text-left transition-colors',
                      isSelected
                        ? 'border-border-brand bg-fill-brand-subtle-default'
                        : 'border-border-subtle bg-background-default hover:bg-fill-neutral-subtle-hover',
                    )}
                  >
                    <span className="font-designer-16b text-text-default">
                      {option.title}
                    </span>
                    <span className="font-designer-14r text-text-subtle">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-100">
              <Button
                size="small"
                onClick={handleSubmitClick}
                disabled={!state.hasSelectionChanged}
                loading={state.isSubmitting}
                loadingText="저장 중..."
              >
                저장하기
              </Button>
              <Button
                size="small"
                color="outlined"
                onClick={actions.handleMoveHome}
              >
                홈으로 이동
              </Button>
            </div>
          </SurfacePanel>
        }
      />
    </div>
  );
}
