'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useReducer, useState } from 'react';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import {
  useCreateMyOneToOneInquiry,
  useSaveDraftOneToOneInquiry,
  type InquiryCategory,
} from '@/hooks/queries/my-inquiry/inquiry-queries';
import { useToastStore } from '@/stores/use-toast-store';
import {
  INQUIRY_CATEGORIES,
  INQUIRY_CATEGORY_LABELS,
} from '@/types/schemas/inquiry.schema';

interface InquiryForm {
  category: InquiryCategory | '';
  content: string;
  notifyEmail: boolean;
  notifyKakao: boolean;
}

type InquiryFormAction =
  | { type: 'setCategory'; value: InquiryCategory | '' }
  | { type: 'setContent'; value: string }
  | { type: 'setNotifyEmail'; value: boolean }
  | { type: 'setNotifyKakao'; value: boolean };

const INITIAL_INQUIRY_FORM: InquiryForm = {
  category: '',
  content: '',
  notifyEmail: false,
  notifyKakao: false,
};

function inquiryFormReducer(
  state: InquiryForm,
  action: InquiryFormAction,
): InquiryForm {
  switch (action.type) {
    case 'setCategory':
      return { ...state, category: action.value };
    case 'setContent':
      return { ...state, content: action.value };
    case 'setNotifyEmail':
      return { ...state, notifyEmail: action.value };
    case 'setNotifyKakao':
      return { ...state, notifyKakao: action.value };
  }
}

export default function MyInquiryWritePage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const [form, dispatch] = useReducer(inquiryFormReducer, INITIAL_INQUIRY_FORM);
  const { category, content, notifyEmail, notifyKakao } = form;
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { mutateAsync: createInquiry, isPending: isSubmitting } =
    useCreateMyOneToOneInquiry();
  const { mutateAsync: saveDraft, isPending: isSavingDraft } =
    useSaveDraftOneToOneInquiry();

  const handleBack = () => {
    const hasDraft =
      Boolean(category) ||
      Boolean(content.trim()) ||
      notifyEmail ||
      notifyKakao;
    if (hasDraft) {
      setCancelDialogOpen(true);
    } else {
      router.push('/my-inquiry');
    }
  };

  const handleDraft = async () => {
    if (!category && !content.trim()) {
      showToast('내용을 입력 후 임시저장할 수 있습니다.', 'error');
      return;
    }
    try {
      await saveDraft({
        id: 0,
        request: {
          inquiryCategory: category || undefined,
          inquiryContent: content.trim() || undefined,
        },
      });
      showToast('임시저장되었습니다.', 'success');
    } catch {
      showToast('임시저장에 실패했습니다.', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      showToast('문의 유형을 선택해 주세요.', 'error');
      return;
    }
    if (!content.trim()) {
      showToast('내용을 입력해 주세요.', 'error');
      return;
    }

    try {
      await createInquiry({
        inquiryCategory: category,
        inquiryContent: content.trim(),
        inquiryAttachmentKeys: [],
        replyEmailOptIn: notifyEmail,
        replyAlerttalkOptIn: notifyKakao,
      });
      showToast('문의가 등록되었습니다.', 'success');
      router.push('/my-inquiry');
    } catch {
      showToast('문의 등록에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-500">
      {/* 헤더 */}
      <div className="flex items-center gap-200">
        <button
          type="button"
          onClick={handleBack}
          aria-label="문의 목록으로 돌아가기"
          className="flex items-center gap-100 text-text-subtle hover:text-text-default"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-designer-24b text-text-default">문의 작성</h1>
      </div>

      {/* 폼 */}
      <div className="flex flex-col gap-400">
        {/* 유형 선택 */}
        <div className="flex flex-col gap-100">
          <label
            htmlFor="inquiry-category"
            className="font-designer-14m text-text-default"
          >
            유형 선택 <span className="text-red-500">*</span>
          </label>
          <select
            id="inquiry-category"
            value={category}
            onChange={(e) =>
              dispatch({
                type: 'setCategory',
                value: e.target.value as InquiryCategory | '',
              })
            }
            className="border-border-default rounded-100 font-designer-14r text-text-default border px-200 py-150 outline-none"
          >
            <option value="">유형을 선택해 주세요</option>
            {INQUIRY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {INQUIRY_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-100">
          <label
            htmlFor="inquiry-content"
            className="font-designer-14m text-text-default"
          >
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="inquiry-content"
            value={content}
            onChange={(e) =>
              dispatch({ type: 'setContent', value: e.target.value })
            }
            rows={8}
            maxLength={2000}
            placeholder="문의 내용을 자세히 작성해 주세요."
            className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest resize-none border px-200 py-150 outline-none"
          />
          <p className="font-designer-12r text-text-subtlest text-right">
            {content.length}/2000
          </p>
        </div>

        {/* 알림 설정 */}
        <div className="flex flex-col gap-200">
          <p className="font-designer-14m text-text-default">알림 설정</p>
          <div className="flex flex-col gap-150">
            <label className="flex cursor-pointer items-center gap-200">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) =>
                  dispatch({ type: 'setNotifyEmail', value: e.target.checked })
                }
                className="size-400 rounded-50 accent-rose-500"
              />
              <span className="font-designer-14r text-text-default">
                이메일 알림
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-200">
              <input
                type="checkbox"
                checked={notifyKakao}
                onChange={(e) =>
                  dispatch({ type: 'setNotifyKakao', value: e.target.checked })
                }
                className="size-400 rounded-50 accent-rose-500"
              />
              <span className="font-designer-14r text-text-default">
                카카오톡 알림
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-200">
        <Button
          color="secondary"
          size="medium"
          className="flex-1"
          disabled={isSavingDraft}
          onClick={handleDraft}
        >
          {isSavingDraft ? '저장 중...' : '임시저장'}
        </Button>
        <Button
          color="primary"
          size="medium"
          className="flex-1"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? '등록 중...' : '등록하기'}
        </Button>
      </div>

      {/* 작성 취소 확인 다이얼로그 */}
      <Modal.Root open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="medium">
            <Modal.Header variant="alert">
              <Modal.Title>작성을 취소하시겠어요?</Modal.Title>
            </Modal.Header>
            <Modal.Body variant="alert">
              <p className="font-designer-14r text-text-subtle text-center">
                작성 중인 내용이 저장되지 않습니다.
              </p>
            </Modal.Body>
            <Modal.Footer variant="alert">
              <div className="flex gap-200">
                <Button
                  color="secondary"
                  size="medium"
                  className="flex-1"
                  onClick={() => setCancelDialogOpen(false)}
                >
                  계속 작성
                </Button>
                <Button
                  color="primary"
                  size="medium"
                  className="flex-1"
                  onClick={() => router.push('/my-inquiry')}
                >
                  확인
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </div>
  );
}
