'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '@/shared/shadcn/lib/utils';

import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/shared/shadcn/ui/dialog';

function ModalProvider({
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
      className={cn(
        'bg-background-dimmer opacity-20',
        className,
      )}
      {...props}
    />
  );
}

function ModalContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: 'small' | 'medium' | 'large';
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
        'max-h-[90vh] ',
        'bg-background-default',
        'z-50',
        'rounded-150',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200',
        'shadow-[0px_10px_10px_0px_rgba(0,0,0,0.24), 0px_4px_32px_0px_rgba(0,0,0,0.24)]',
        'border border-border-default',
        className,
      )}
      {...rest}
    >
      <div className="flex flex-col max-h-[90vh]">
        {children}
      </div>
    </DialogPrimitive.Content>
  );
}

function ModalHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="modal-header"
      className={cn(
        'px-400 pt-400 pb-300 border-b border-border-default',
        className,
      )}
      {...props}
    />
  );
}

function ModalBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="modal-body"
      className={cn(
        'px-400 py-300 overflow-auto',
        'flex-1',
        className,
      )}
      {...props}
    />
  );
}

function ModalFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        'px-400 py-200',
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
      className={cn('d20b', 'text-text-strong', className)}
      {...props}
    />
  );
}

export const Modal = {
  Provider: ModalProvider,
  Trigger: ModalTrigger,
  Close: ModalClose,
  Portal: ModalPortal,
  Overlay: ModalOverlay,
  Content: ModalContent,
  Header: ModalHeader,
  Footer: ModalFooter,
  Body: ModalBody,
  Title: ModalTitle,
} as const;
