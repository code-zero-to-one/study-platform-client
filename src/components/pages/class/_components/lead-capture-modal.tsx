'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ChangeEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { Modal } from '@/components/common/ui/modal';
import { useToastStore } from '@/stores/use-toast-store';
import { MaterialIcon } from './material-icon';
import {
  type LeadCaptureInput,
  LeadCaptureSchema,
  type LeadCaptureValues,
  formatPhoneOnInput,
} from '../_data/lead-capture-schema';

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  releaseLabel: string;
}

const DEFAULT_VALUES: LeadCaptureInput = {
  name: '',
  phone: '',
  email: '',
  consent: false,
};

export function LeadCaptureModal({
  open,
  onOpenChange,
  courseTitle,
  releaseLabel,
}: LeadCaptureModalProps) {
  const showToast = useToastStore((state) => state.showToast);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LeadCaptureInput, unknown, LeadCaptureValues>({
    resolver: zodResolver(LeadCaptureSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  const phoneValue = watch('phone');
  const consentChecked = watch('consent') === true;

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue('phone', formatPhoneOnInput(event.target.value), {
      shouldValidate: true,
    });
  };

  const onValid = (values: LeadCaptureValues) => {
    showToast(
      `${values.name}님, 신청 완료되었어요. 오픈 소식을 가장 먼저 보내드릴게요!`,
      'success',
    );
    onOpenChange(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content
          size="small"
          description={`${courseTitle} 오픈 알림 신청`}
        >
          <Modal.Header variant="form">
            <Modal.Title>OPEN 알림 신청</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>

          <Modal.Body variant="form">
            <PromoCallout
              courseTitle={courseTitle}
              releaseLabel={releaseLabel}
            />

            <form
              id="lead-capture-form"
              onSubmit={handleSubmit(onValid)}
              className="flex flex-col gap-300"
              noValidate
            >
              <Field
                id="lead-name"
                label="이름"
                placeholder="실명을 입력해주세요"
                error={errors.name?.message}
                {...register('name')}
              />
              <Field
                id="lead-phone"
                label="전화번호"
                placeholder="010-1234-5678"
                inputMode="tel"
                value={phoneValue}
                onChange={handlePhoneChange}
                onBlur={register('phone').onBlur}
                name="phone"
                ref={register('phone').ref}
                error={errors.phone?.message}
              />
              <Field
                id="lead-email"
                label="이메일"
                type="email"
                inputMode="email"
                placeholder="alert@zero-one.kr"
                error={errors.email?.message}
                {...register('email')}
              />

              <ConsentCheckbox
                id="lead-consent"
                checked={consentChecked}
                error={errors.consent?.message}
                {...register('consent')}
              />
            </form>
          </Modal.Body>

          <Modal.Footer variant="form">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                'h-500 rounded-100 px-300',
                'font-designer-14b text-text-default',
                'bg-fill-neutral-subtle-default hover:bg-fill-neutral-subtle-hover',
                'transition-colors',
              )}
            >
              나중에
            </button>
            <button
              type="submit"
              form="lead-capture-form"
              disabled={!isValid || isSubmitting}
              className={cn(
                'h-500 rounded-100 px-300 inline-flex items-center gap-75',
                'font-designer-14b text-text-inverse',
                'bg-fill-brand-default-default hover:bg-fill-brand-default-hover',
                'disabled:bg-background-disabled disabled:text-text-disabled disabled:cursor-not-allowed',
                'transition-colors',
              )}
            >
              <MaterialIcon name="notifications_active" size={16} />
              알림 신청하기
            </button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function PromoCallout({
  courseTitle,
  releaseLabel,
}: {
  courseTitle: string;
  releaseLabel: string;
}) {
  return (
    <div
      className={cn(
        'rounded-150 px-300 py-250',
        'bg-fill-brand-subtle-default border-l-4 border-fill-brand-default-default',
      )}
    >
      <div className="flex items-center gap-75">
        <MaterialIcon
          name="local_fire_department"
          size={18}
          className="text-icon-brand"
          filled
        />
        <span className="font-designer-12b text-text-brand uppercase tracking-wider">
          Earlybird Special
        </span>
      </div>
      <p className="font-designer-15b text-text-strong mt-100">
        지금 신청하면 <span className="text-text-brand">최대 50% 할인</span>{' '}
        혜택과 사전 학습 자료를 가장 먼저 받아보실 수 있어요.
      </p>
      <p className="font-designer-13r text-text-subtle mt-50">
        <strong className="text-text-default">{courseTitle}</strong> ·{' '}
        {releaseLabel}
      </p>
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

function Field({
  id,
  label,
  error,
  className,
  ref,
  ...inputProps
}: FieldProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <div className="flex flex-col gap-75">
      <label htmlFor={id} className="font-designer-13b text-text-strong">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          'h-500 rounded-100 px-200',
          'font-designer-14r text-text-default',
          'bg-background-default placeholder:text-text-subtlest',
          'border border-border-default',
          'transition-colors outline-none',
          'focus:border-fill-neutral-strong-default focus:ring-2 focus:ring-fill-neutral-default-default',
          'aria-[invalid=true]:border-border-error aria-[invalid=true]:focus:ring-fill-danger-subtle-default',
          className,
        )}
        {...inputProps}
      />
      {error ? (
        <p
          role="alert"
          className="font-designer-12r text-text-error mt-25 inline-flex items-center gap-50"
        >
          <MaterialIcon name="error" size={14} className="text-icon-error" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface ConsentCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  checked: boolean;
  error?: string;
}

function ConsentCheckbox({
  id,
  checked,
  error,
  ref,
  ...inputProps
}: ConsentCheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <div className="flex flex-col gap-50 mt-150">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-150">
        <span className="relative inline-flex shrink-0 items-center justify-center">
          <input
            id={id}
            type="checkbox"
            ref={ref}
            value="true"
            className="peer sr-only"
            {...inputProps}
          />
          <span
            className={cn(
              'h-300 w-300 rounded-50 inline-flex items-center justify-center',
              'border transition-colors',
              checked
                ? 'bg-fill-brand-default-default border-fill-brand-default-default'
                : 'bg-background-default border-border-default',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-fill-brand-subtle-default',
            )}
            aria-hidden="true"
          >
            {checked ? (
              <MaterialIcon
                name="check"
                size={16}
                className="text-text-inverse"
                weight={700}
              />
            ) : null}
          </span>
        </span>
        <div className="flex-1">
          <p className="font-designer-13m text-text-default">
            <span className="text-text-brand font-designer-13b">[필수]</span>{' '}
            오픈 알림 발송을 위한 개인정보 수집·이용에 동의합니다.
          </p>
          <p className="font-designer-12r text-text-subtle mt-25">
            수집 항목: 이름·전화번호·이메일 / 보유 기간: 오픈 안내 발송 후 30일
          </p>
        </div>
      </label>
      {error ? (
        <p
          role="alert"
          className="font-designer-12r text-text-error inline-flex items-center gap-50 ml-500"
        >
          <MaterialIcon name="error" size={14} className="text-icon-error" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
