'use client';

import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ApiError } from '@/api/client/api-error';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
import Button from '@/components/common/ui/button';
import Checkbox from '@/components/common/ui/checkbox';
import { TextAreaInput } from '@/components/common/ui/input';
import List from '@/components/common/ui/list';
import { Modal } from '@/components/common/ui/modal';
import {
  reviewQueryKeys,
  useAddStudyReviewMutation,
  usePartnerStudyReviewQuery,
} from '@/hooks/queries/use-review-query';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  EvalKeyword,
  StudyEvaluationResponse,
} from '@/types/api/review.types';

interface FormState {
  studySpaceId: number;
  targetMemberId: number;
  satisfactionId: 10 | 20 | 30 | undefined; // 10 - "좋았어요", 20 - "괜찮아요", 30 - "아쉬워요"
  keywordIds: number[];
  content: string;
}

interface ReminderDismissOptions {
  hideForOneHour: boolean;
  hideForever: boolean;
}

const createInitialFormState = (): FormState => ({
  studySpaceId: 0,
  targetMemberId: 0,
  satisfactionId: undefined,
  keywordIds: [],
  content: '',
});

const hasErrorStatus = (error: unknown, statusCode: number) => {
  if (error instanceof ApiError) return error.statusCode === statusCode;
  if (isAxiosError(error)) return error.response?.status === statusCode;

  return false;
};

const getReviewErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return '후기 작성에 실패했습니다. 다시 시도해주세요.';
};

export default function StudyReviewModal({
  open,
  onOpenChange,
  onDismissPreferenceChange,
  targetStudySpaceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismissPreferenceChange?: (
    options: ReminderDismissOptions,
  ) => Promise<void> | void;
  targetStudySpaceId?: number;
}) {
  const [hideForOneHour, setHideForOneHour] = useState(false);
  const [hideForever, setHideForever] = useState(false);

  useEffect(() => {
    if (open) {
      setHideForOneHour(false);
      setHideForever(false);
    }
  }, [open]);

  const handleDismiss = () => {
    onOpenChange(false);
    if (onDismissPreferenceChange) {
      Promise.resolve(
        onDismissPreferenceChange({ hideForOneHour, hideForever }),
      ).catch(() => {});
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);

      return;
    }

    handleDismiss();
  };

  const handleToggleHideForOneHour = () => {
    const nextHideForOneHour = !hideForOneHour;

    setHideForOneHour(nextHideForOneHour);

    if (nextHideForOneHour) {
      setHideForever(false);
    }
  };

  const handleToggleHideForever = () => {
    const nextHideForever = !hideForever;

    setHideForever(nextHideForever);

    if (nextHideForever) {
      setHideForOneHour(false);
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large">
          <Modal.Header className="border-border-default flex justify-end border-b">
            <Modal.Close aria-label="후기 모달 닫기">
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <div className="flex flex-col items-center justify-center gap-100 px-400 pt-300">
            <Modal.Title>함께 스터디한 멤버에 대해 알려주세요</Modal.Title>

            <div className="font-designer-14r text-text-subtle flex flex-col text-center">
              <span>
                같이 성장할 수 있는 스터디 문화를 만들기 위해 평가를 남겨주세요.
              </span>
              <span>평가한 내용은 성실 온도에 반영됩니다.</span>
            </div>
          </div>

          <StudyReviewForm
            open={open}
            targetStudySpaceId={targetStudySpaceId}
            onDismiss={handleDismiss}
            onSubmitSuccessClose={() => onOpenChange(false)}
            hideForOneHour={hideForOneHour}
            hideForever={hideForever}
            onToggleHideForOneHour={handleToggleHideForOneHour}
            onToggleHideForever={handleToggleHideForever}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function StudyReviewForm({
  open,
  targetStudySpaceId,
  onDismiss,
  onSubmitSuccessClose,
  hideForOneHour,
  hideForever,
  onToggleHideForOneHour,
  onToggleHideForever,
}: {
  open: boolean;
  targetStudySpaceId?: number;
  onDismiss: () => void;
  onSubmitSuccessClose: () => void;
  hideForOneHour: boolean;
  hideForever: boolean;
  onToggleHideForOneHour: () => void;
  onToggleHideForever: () => void;
}) {
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const { data, error, isError, isFetching } = usePartnerStudyReviewQuery({
    enabled: open,
    targetStudySpaceId,
  });
  const { mutate: addStudyReview, isPending } = useAddStudyReviewMutation();

  const [form, setForm] = useState<FormState>(createInitialFormState);

  useEffect(() => {
    setForm(createInitialFormState());
  }, [open, targetStudySpaceId]);

  useEffect(() => {
    if (!open || !isError) return;

    if (hasErrorStatus(error, 404)) {
      queryClient
        .invalidateQueries({
          queryKey: reviewQueryKeys.modalState(),
        })
        .catch(() => {});
      onSubmitSuccessClose();
    }
  }, [open, isError, error, onSubmitSuccessClose, queryClient]);

  useEffect(() => {
    if (!data || data.studySpaceId !== targetStudySpaceId) return;

    setForm({
      studySpaceId: data.studySpaceId,
      targetMemberId: data.targetMembers[0]?.memberId ?? 0,
      satisfactionId: undefined,
      keywordIds: [],
      content: '',
    });
  }, [data, targetStudySpaceId]);

  if (!open) return null;

  if (!targetStudySpaceId) {
    return (
      <>
        <Modal.Body className="mt-400 flex items-center justify-center pt-0">
          <p className="font-designer-14r text-text-subtle text-center">
            후기 대상 스터디를 찾지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </Modal.Body>
        <Modal.Footer className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onDismiss}>
            닫기
          </Button>
        </Modal.Footer>
      </>
    );
  }

  if (isFetching && !data) {
    return (
      <Modal.Body className="mt-400 flex items-center justify-center pt-0">
        <p className="font-designer-14r text-text-subtle text-center">
          후기 정보를 불러오는 중입니다.
        </p>
      </Modal.Body>
    );
  }

  if (isError && !data) {
    return (
      <>
        <Modal.Body className="mt-400 flex items-center justify-center pt-0">
          <p className="font-designer-14r text-text-subtle text-center">
            후기 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </Modal.Body>
        <Modal.Footer className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onDismiss}>
            닫기
          </Button>
        </Modal.Footer>
      </>
    );
  }

  if (!data) return null;

  if (data.studySpaceId !== targetStudySpaceId) {
    return (
      <>
        <Modal.Body className="mt-400 flex items-center justify-center pt-0">
          <p className="font-designer-14r text-text-subtle text-center">
            최신 후기 대상을 다시 불러오는 중입니다. 잠시 후 다시 시도해주세요.
          </p>
        </Modal.Body>
        <Modal.Footer className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onDismiss}>
            닫기
          </Button>
        </Modal.Footer>
      </>
    );
  }

  const handleSubmit = () => {
    if (
      form.keywordIds.length === 0 ||
      form.satisfactionId === undefined ||
      form.studySpaceId <= 0 ||
      form.targetMemberId <= 0
    ) {
      return;
    }

    addStudyReview(
      {
        ...form,
        content: form.content || undefined,
      },
      {
        onSuccess: () => {
          onSubmitSuccessClose();
        },
        onError: async (error) => {
          await queryClient.invalidateQueries({
            queryKey: reviewQueryKeys.modalState(),
          });

          if (hasErrorStatus(error, 404)) {
            onSubmitSuccessClose();

            return;
          }

          showToast(getReviewErrorMessage(error), 'error');
        },
      },
    );
  };

  return (
    <>
      <Modal.Body className="mt-400 flex flex-col gap-400 pt-0">
        <PartnerInfo {...data} />

        <div className="flex flex-col items-center justify-center gap-100">
          <span className="font-designer-16b text-text-default">
            스터디 만족도
          </span>

          <div className="flex items-center justify-center gap-200">
            <SatisfactionButton
              label="아쉬워요"
              isSelected={form.satisfactionId === 30}
              imageSrc="/icons/shame-review.svg"
              onClick={() => {
                setForm({
                  ...form,
                  satisfactionId: 30,
                  keywordIds: [],
                  content: '',
                });
              }}
            />

            <SatisfactionButton
              label="괜찮아요"
              isSelected={form.satisfactionId === 20}
              imageSrc="/icons/fine-review.svg"
              onClick={() => {
                setForm({
                  ...form,
                  satisfactionId: 20,
                  keywordIds: [],
                  content: '',
                });
              }}
            />

            <SatisfactionButton
              label="좋았어요"
              isSelected={form.satisfactionId === 10}
              imageSrc="/icons/good-review.svg"
              onClick={() => {
                setForm({
                  ...form,
                  satisfactionId: 10,
                  keywordIds: [],
                  content: '',
                });
              }}
            />
          </div>
        </div>

        {form.satisfactionId === 30 && (
          <NegativeReview data={data} form={form} onChange={setForm} />
        )}

        {(form.satisfactionId === 10 || form.satisfactionId === 20) && (
          <PositiveReview data={data} form={form} onChange={setForm} />
        )}
      </Modal.Body>
      <Modal.Footer className="flex items-center justify-end gap-100">
        <div className="mr-auto flex items-center gap-300">
          <label
            htmlFor="study-review-hide-forever"
            className="font-designer-13m text-text-subtle inline-flex cursor-pointer items-center gap-75"
          >
            <Checkbox
              id="study-review-hide-forever"
              checked={hideForever}
              onToggle={onToggleHideForever}
            />
            다시 보지 않기
          </label>

          <label
            htmlFor="study-review-hide-one-hour"
            className="font-designer-13m text-text-subtle inline-flex cursor-pointer items-center gap-75"
          >
            <Checkbox
              id="study-review-hide-one-hour"
              checked={hideForOneHour}
              onToggle={onToggleHideForOneHour}
            />
            1시간 동안 보지 않기
          </label>
        </div>

        <Button color="secondary" size="large" onClick={onDismiss}>
          취소
        </Button>
        <Button
          color="primary"
          size="large"
          disabled={
            form.keywordIds.length === 0 ||
            form.satisfactionId === undefined ||
            isPending
          }
          onClick={handleSubmit}
        >
          등록하기
        </Button>
      </Modal.Footer>
    </>
  );
}

function PartnerInfo(data: StudyEvaluationResponse) {
  const partner = data.targetMembers[0];

  if (!partner) return null;

  return (
    <div className="flex justify-center gap-200">
      <UserAvatar
        image={partner.profileImageUrl}
        size={80}
        alt="Study Member"
      />

      <div className="flex flex-col justify-center gap-50">
        <span className="text-text-default font-designer-16b">
          {partner.memberName}
        </span>

        <div className="flex flex-col gap-25">
          <span className="font-designer-14r text-text-default">
            {data.studySubject}
          </span>
          <span className="font-designer-14r text-text-subtlest">
            {data.startDate} ~ {data.endDate}
          </span>
        </div>
      </div>
    </div>
  );
}

function SatisfactionButton({
  label,
  isSelected,
  imageSrc,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  imageSrc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-fit cursor-pointer flex-col items-center gap-100"
      onClick={onClick}
    >
      <span className="text-text-default font-designer-14r">{label}</span>

      <div
        className={cn(
          'bg-background-neutral-subtle w-fit rounded-full p-150 transform transition-all ease-in-out hover:scale-110 hover:opacity-100',
          isSelected ? 'opacity-100' : 'opacity-40',
        )}
      >
        <Image src={imageSrc} width="24" height="24" alt={label} />
      </div>
    </button>
  );
}

function PositiveReview({
  data,
  form,
  onChange,
}: {
  form: FormState;
  data: StudyEvaluationResponse;
  onChange: (form: FormState | ((prev: FormState) => FormState)) => void;
}) {
  return (
    <>
      <PositiveCheckboxList
        positiveKeywords={
          form.satisfactionId === 20
            ? data.notBadEvalKeywords
            : data.satisfiedEvalKeywords
        }
        keywordIds={form.keywordIds}
        onChange={(keywordIds) => onChange((prev) => ({ ...prev, keywordIds }))}
      />
      <PositiveTextArea
        value={form.content}
        onChange={(content) => onChange((prev) => ({ ...prev, content }))}
      />
    </>
  );
}

function NegativeReview({
  data,
  form,
  onChange,
}: {
  data: StudyEvaluationResponse;
  form: FormState;
  onChange: (form: FormState | ((prev: FormState) => FormState)) => void;
}) {
  return (
    <>
      <NegativeCheckboxList
        negativeKeywords={data.unsatisfiedEvalKeywords}
        keywordIds={form.keywordIds}
        onChange={(keywordIds) => onChange((prev) => ({ ...prev, keywordIds }))}
      />
      <NegativeTextArea
        value={form.content}
        onChange={(content) => onChange((prev) => ({ ...prev, content }))}
      />
    </>
  );
}

const toggleKeywordId = (ids: number[], id: number) =>
  ids.includes(id) ? ids.filter((k) => k !== id) : [...ids, id];

function PositiveCheckboxList({
  positiveKeywords,
  keywordIds,
  onChange,
}: {
  positiveKeywords: EvalKeyword[];
  keywordIds: FormState['keywordIds'];
  onChange: (keywordIds: FormState['keywordIds']) => void;
}) {
  const handleToggle = (id: number) => {
    onChange(toggleKeywordId(keywordIds, id));
  };

  return (
    <div className="flex flex-col justify-center gap-100">
      <div className="flex items-center justify-center gap-100">
        <span className="font-designer-16b text-text-default">
          이런 점이 좋았어요
        </span>
        <span className="font-designer-13m text-text-error">필수</span>
      </div>

      <List className="mx-auto">
        {positiveKeywords.map(({ id, keyword }) => (
          <List.Item key={id}>
            <Checkbox
              id={`satisfaction-${id}`}
              checked={keywordIds.includes(id)}
              onToggle={() => {
                handleToggle(id);
              }}
            />
            <label htmlFor={`satisfaction-${id}`}>{keyword}</label>
          </List.Item>
        ))}
      </List>
    </div>
  );
}

function PositiveTextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) {
  return (
    <div className="flex flex-col gap-100">
      <div>
        <h3 className="text-text-default font-designer-16b text-center">
          어떤 점이 좋았나요?
        </h3>
        <div className="font-designer-14r text-text-subtle flex flex-col text-center">
          <span>
            같이 성장할 수 있는 스터디 문화를 만들기 위해 평가를 남겨주세요.
          </span>
          <span>평가한 내용은 성실 온도에 반영됩니다.</span>
        </div>
      </div>

      <TextAreaInput
        value={value}
        maxLength={1000}
        placeholder="좋았던 점을 자세히 말해주세요"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NegativeCheckboxList({
  negativeKeywords,
  keywordIds,
  onChange,
}: {
  negativeKeywords: StudyEvaluationResponse['unsatisfiedEvalKeywords'];
  keywordIds: FormState['keywordIds'];
  onChange: (keywordIds: FormState['keywordIds']) => void;
}) {
  const handleToggle = (id: number) => {
    onChange(toggleKeywordId(keywordIds, id));
  };

  return (
    <div className="flex flex-col justify-center gap-100">
      <div className="flex items-center justify-center gap-100">
        <span className="font-designer-16b text-text-default">
          이런 점이 아쉬웠어요
        </span>
        <span className="font-designer-13m text-text-error">필수</span>
      </div>

      <List className="mx-auto">
        {negativeKeywords.map(({ id, keyword }) => (
          <List.Item key={id}>
            <Checkbox
              id={`bad-satisfaction-${id}`}
              checked={keywordIds.includes(id)}
              onToggle={() => {
                handleToggle(id);
              }}
            />
            <label htmlFor={`bad-satisfaction-${id}`}>{keyword}</label>
          </List.Item>
        ))}
      </List>
    </div>
  );
}

function NegativeTextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) {
  return (
    <div className="flex flex-col gap-100">
      <div>
        <h3 className="text-text-default font-designer-16b text-center">
          어떤 점이 아쉬웠나요?
        </h3>
        <div className="font-designer-14r text-text-subtle flex flex-col text-center">
          <span>
            스터디 과정에서 아쉬웠던 점이 있다면, 이는 성장을 위한 소중한
            피드백이 됩니다.
          </span>
          <span>작성하신 내용은 오직 상대방만 확인할 수 있어요.</span>
        </div>
      </div>

      <TextAreaInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={1000}
        placeholder="아쉬웠던 점을 자세히 말해주세요"
      />
    </div>
  );
}
