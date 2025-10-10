'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useState } from 'react';

import { useController, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/shared/ui/button';
import Checkbox from '@/shared/ui/checkbox';
import { Modal } from '@/shared/ui/modal';
import { useApplyGroupStudyMutation } from '../model/use-apply-group-study';

interface ApplyGroupStudyModalProps {
  groupStudyId: number;
  title: string;
  questions: string[];
}

export default function ApplyGroupStudyModal({
  groupStudyId,
  title,
  questions,
}: ApplyGroupStudyModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button size="large">신청하기</Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              스터디 신청서 작성하기
            </Modal.Title>
            <Modal.Close onClick={() => setOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <ApplyGroupStudyForm
            groupStudyId={groupStudyId}
            title={title}
            questions={questions}
            onClose={() => setOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

const ApplyGroupStudyFormSchema = z.object({
  answer: z.array(
    z.string().min(1, '답변을 작성해주세요.'), // 각 항목에 최소 1글자 이상
  ),
  agree: z
    .boolean()
    .refine((val) => val === true, { message: '참여 규칙에 동의해야 합니다.' }),
});

type ApplyGroupStudyFormData = z.infer<typeof ApplyGroupStudyFormSchema>;

function ApplyGroupStudyForm({
  groupStudyId,
  title,
  questions,
  onClose,
}: {
  groupStudyId: number;
  title: string;
  questions: string[];
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ApplyGroupStudyFormData>({
    resolver: zodResolver(ApplyGroupStudyFormSchema),
    defaultValues: {
      answer: Array(questions.length).fill(''),
    },
  });

  // ✅ checkbox를 controller로 제어
  const {
    field: { value: checked, onChange: onToggle },
  } = useController({
    name: 'agree',
    control,
  });

  const { mutate: applyGroupStudy } = useApplyGroupStudyMutation();

  const onSubmit = (data: ApplyGroupStudyFormData) => {
    const { answer } = data;

    console.log(groupStudyId, answer);

    return;

    applyGroupStudy(
      { answer, groupStudyId },
      {
        onSuccess: () => {
          alert('스터디 신청이 완료되었습니다.');
          onClose();
        },
      },
    );
  };

  return (
    <>
      <Modal.Body className="flex flex-col gap-400 px-400 py-300">
        <h2 className="font-designer-20b text-text-default">{title}</h2>

        <div className="flex flex-col gap-250">
          <span className="font-designer-16b text-text-default">
            리더의 질문
          </span>

          <form
            id="apply-group-study"
            className="flex flex-col gap-300"
            onSubmit={handleSubmit(onSubmit)}
          >
            {questions.map((question, index) => (
              <div key={question} className="flex flex-col gap-150">
                <label
                  htmlFor={`question-${index}`}
                  className="font-designer-15b text-text-default"
                >
                  {`${index + 1}. ${question}`}
                </label>

                <div className="flex flex-col gap-75">
                  <textarea
                    id={`question-${index}`}
                    className={`rounded-100 ${errors.answer?.[index] ? 'border-border-error' : 'border-border-default'} font-designer-16m text-text-default min-h-[150px] w-full border p-150 focus-visible:ring-0 focus-visible:outline-none`}
                    placeholder="리더의 질문에 답변을 작성해주세요."
                    {...register(`answer.${index}`)}
                  />
                  {errors.answer?.[index] && (
                    <span className="text-text-error font-designer-13r">
                      {errors.answer[index].message}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </form>
        </div>

        <div className="text-text-default bg-background-alternative rounded-150 flex flex-col gap-300 px-400 py-300">
          <h3 className="font-designer-20b">스터디 참여 규칙을 준수해주세요</h3>

          <ul className="font-designer-16m text-text-subtle flex flex-col gap-100">
            <li className="flex items-center gap-150">
              <span>·</span>
              <span>모집 공고의 정보는 사실에 기반해 작성해야 합니다.</span>
            </li>
            <li className="flex items-center gap-150">
              <span>·</span>
              <span>진행 기간과 모임 빈도를 명확히 안내해야 합니다.</span>
            </li>
            <li className="flex items-center gap-150">
              <span>·</span>
              <span>
                스터디 개설 후 최소 1회 이상 정기 모임을 진행해야 합니다.
              </span>
            </li>
            <li className="flex items-center gap-150">
              <span>·</span>
              <span>스터디원과의 약속을 존중하고 성실히 운영해야 합니다.</span>
            </li>
            <li className="flex items-center gap-150">
              <span>·</span>
              <span>
                타인의 개인정보 및 자료를 무단으로 공유하거나 외부 유출해서는 안
                됩니다.
              </span>
            </li>
            <li className="flex items-center gap-150">
              <span>·</span>
              <span>
                플랫폼의 운영 정책 및 커뮤니티 가이드를 준수해야 합니다.
              </span>
            </li>
          </ul>

          <div
            className={`${errors.agree ? 'border-border-error' : 'border-border-default'} rounded-100 flex items-center justify-between border p-300`}
          >
            <div className="flex items-center gap-100">
              <span className="text-text-default font-designer-16b">
                참여 규칙을 확인하시고 동의해 주시겠습니까?
              </span>
              <span className="font-designer-13m text-text-error">필수</span>
            </div>

            <Checkbox id="agree" checked={checked} onToggle={onToggle} />
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="flex justify-end gap-100">
        <Modal.Close asChild>
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
        </Modal.Close>
        <Button
          color="primary"
          size="large"
          type="submit"
          form="apply-group-study"
        >
          신청하기
        </Button>
      </Modal.Footer>
    </>
  );
}
