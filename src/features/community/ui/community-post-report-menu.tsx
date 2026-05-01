'use client';

import { MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/ui/(shadcn)/ui/dropdown-menu';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { useToastStore } from '@/stores/use-toast-store';

import { COMMUNITY_REPORT_CATEGORY_GROUPS } from './community-report-categories';

const DETAIL_MIN_LEN = 10;

interface CommunityPostReportMenuProps {
  contentTitle: string;
  dialogTitle?: string;
  triggerClassName?: string;
}

export default function CommunityPostReportMenu({
  contentTitle,
  dialogTitle = '게시글 신고',
  triggerClassName,
}: CommunityPostReportMenuProps) {
  const showToast = useToastStore((s) => s.showToast);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (!dialogOpen) {
      setCategory('');
      setDetail('');
    }
  }, [dialogOpen]);

  const handleSubmit = () => {
    if (!category) {
      showToast('신고 유형을 선택해 주세요.', 'error');
      return;
    }
    const trimmed = detail.trim();
    if (trimmed.length < DETAIL_MIN_LEN) {
      showToast(`신고 내용을 ${DETAIL_MIN_LEN}자 이상 입력해 주세요.`, 'error');
      return;
    }
    setDialogOpen(false);
    showToast(
      '신고가 접수되었습니다. 익명으로 처리되며, 48시간 이내 검토 후 등록 이메일로 안내드릴게요.',
      'success',
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          aria-label="더보기"
          className={cn(
            'rounded-100 text-text-subtle hover:bg-fill-neutral-subtle-default hover:text-text-default focus-visible:ring-fill-brand-default-default inline-flex h-400 w-400 shrink-0 items-center justify-center border border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none',
            triggerClassName,
          )}
        >
          <MoreVertical className="h-200 w-200" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-border-default bg-background-default rounded-100 flex min-w-max flex-col gap-75 border p-150 shadow-2"
        >
          <DropdownMenuItem
            variant="destructive"
            className="rounded-100 font-designer-14m cursor-pointer px-200 py-150"
            onSelect={() => setDialogOpen(true)}
          >
            신고하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content
            size="small"
            className="max-w-lg"
            description="익명으로 신고가 접수되며 48시간 이내 검토 후 이메일로 안내됩니다."
          >
            <Modal.Header variant="form" className="items-start">
              <Modal.Title className="font-designer-20b text-text-strong min-w-0 flex-1 text-left">
                {dialogTitle}
              </Modal.Title>
              <Modal.CloseButton
                className="text-text-subtle hover:text-text-default shrink-0"
                onClick={() => setDialogOpen(false)}
              />
            </Modal.Header>

            <Modal.Body variant="form" className="gap-300">
              <div className="font-designer-13r text-text-subtle gap-100 flex flex-col text-left">
                <p className="m-0">
                  신고는 작성자에게 노출되지 않으며 익명으로 접수됩니다. 접수 후
                  48시간 이내 검토하고, 처리 결과는 회원 정보에 등록된 이메일로
                  안내드립니다.
                </p>
                <p className="text-text-subtlest m-0">
                  허위·악의적인 신고는 이용 제재 대상이 될 수 있습니다.
                </p>
              </div>

              <p className="font-designer-12r text-text-subtlest line-clamp-2 m-0">
                대상: {contentTitle}
              </p>

              <label className="gap-75 flex flex-col">
                <span className="font-designer-14m text-text-default">
                  신고 유형
                </span>
                <select
                  className="border-border-default bg-background-default font-designer-14r text-text-default rounded-100 border px-150 py-100"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">유형을 선택해 주세요</option>
                  {COMMUNITY_REPORT_CATEGORY_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              <label className="gap-75 flex flex-col">
                <span className="font-designer-14m text-text-default">
                  상세 내용
                </span>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={5}
                  placeholder="위반 정황, 해당 문구·링크, 필요 시 화면 설명 등을 적어 주세요."
                  className="border-border-default bg-background-default font-designer-14r text-text-default placeholder:text-text-subtlest rounded-100 resize-y border px-150 py-100"
                />
              </label>
            </Modal.Body>

            <Modal.Footer
              variant="form"
              className="items-center gap-150 py-250"
            >
              <Button
                type="button"
                color="secondary"
                size="medium"
                onClick={() => setDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                color="primary"
                size="medium"
                onClick={handleSubmit}
              >
                신고 접수
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  );
}
