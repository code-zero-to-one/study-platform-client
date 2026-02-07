'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/components/ui/(shadcn)/lib/utils';

import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/(shadcn)/ui/dialog';

/**
 * Modal variant types:
 * - 'alert': 확인/삭제형 모달 (w-[423px], 중앙 정렬, 작은 패딩)
 * - 'form': 폼 입력 모달 (w-[840px], 양끝 정렬, 큰 패딩)
 */
export type ModalVariant = 'alert' | 'form';

function ModalRoot({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <Dialog data-slot="modal" {...props} />;
}

function ModalTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger> & {
  className?: string;
}) {
  return (
    <DialogTrigger
      data-slot="modal-trigger"
      className={cn('cursor-pointer', className)}
      {...props}
    />
  );
}

function ModalPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPortal data-slot="modal-portal" {...props} />;
}

function ModalClose({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
  className?: string;
}) {
  return (
    <DialogClose
      data-slot="modal-close"
      className={cn('cursor-pointer', className)}
      {...props}
    />
  );
}

function ModalOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogOverlay
      data-slot="modal-overlay"
      className={cn('bg-background-dimmer opacity-20', className)}
      {...props}
    />
  );
}

function ModalContent({
  className,
  children,
  description = '',
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: 'small' | 'medium' | 'large';
  description?: string;
}) {
  const { size = 'small', ...rest } = props;

  const sizeClass = {
    small: 'max-w-2xl',
    medium: 'max-w-3xl',
    large: 'max-w-4xl',
  }[size];

  return (
    <DialogPrimitive.Content
      data-slot="modal-content"
      className={cn(
        'fixed',
        'top-[50%] left-[50%]',
        'translate-x-[-50%] translate-y-[-50%]',
        'max-w-[calc(100%-2rem)], w-full',
        sizeClass,
        'max-h-[90vh]',
        'bg-background-default',
        'z-50',
        'rounded-150',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200',
        'shadow-[0px_10px_10px_0px_rgba(0,0,0,0.24), 0px_4px_32px_0px_rgba(0,0,0,0.24)]',
        'border-border-default border',
        className,
      )}
      {...rest}
    >
      <div className="flex max-h-[90vh] flex-col">{children}</div>
      <DialogDescription className="sr-only">{description}</DialogDescription>
    </DialogPrimitive.Content>
  );
}

function ModalHeader({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & {
  variant?: ModalVariant;
}) {
  const variantClass = {
    alert: 'border-border-default flex justify-center border-b py-200',
    form: 'border-border-default flex justify-between border-b',
  };

  return (
    <div
      data-slot="modal-header"
      className={cn(
        'px-400 pt-400 pb-300',
        variant && variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}

function ModalBody({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & {
  variant?: ModalVariant;
}) {
  const variantClass = {
    alert:
      'font-designer-14r text-text-default flex justify-center py-250 text-center',
    form: 'flex flex-col gap-400 px-400 py-300',
  };

  return (
    <div
      data-slot="modal-body"
      className={cn(
        'overflow-auto px-400 py-300',
        'flex-1',
        variant && variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}

function ModalFooter({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & {
  variant?: ModalVariant;
}) {
  const variantClass = {
    alert: 'flex justify-center gap-200 border-t-0 py-250',
    form: 'flex justify-end gap-100',
  };

  return (
    <div
      data-slot="modal-footer"
      className={cn(
        'border-border-default border-t px-400 py-200',
        variant && variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}

function ModalTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogTitle
      data-slot="modal-title"
      className={cn('text-text-strong !font-designer-18b', className)}
      {...props}
    />
  );
}

/**
 * Form 모달 헤더 닫기 버튼 컴포넌트
 * form variant 사용 시 헤더에 X 버튼 추가용
 */
function ModalCloseButton({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
  className?: string;
}) {
  return (
    <DialogClose
      data-slot="modal-close-button"
      className={cn('cursor-pointer', className)}
      onClick={onClick}
      {...props}
    >
      <XIcon />
    </DialogClose>
  );
}

export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Close: ModalClose,
  Portal: ModalPortal,
  Overlay: ModalOverlay,
  Content: ModalContent,
  Header: ModalHeader,
  Footer: ModalFooter,
  Body: ModalBody,
  Title: ModalTitle,
  CloseButton: ModalCloseButton,
} as const;
