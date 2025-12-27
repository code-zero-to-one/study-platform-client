import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/ui/button';
import SingleDropdown from '@/components/ui/dropdown/single';
import FormField from '@/components/ui/form/form-field';
import { Modal } from '@/components/ui/modal';
import { useSearchBanks } from '@/hooks/queries/bank-search-api';
import { BaseInput } from '../ui/input';

// Form Schema
const AddAccountFormSchema = z.object({
  bankName: z.string().min(1, '은행을 선택해주세요.'),
  accountNumber: z.string().min(1, '계좌번호를 입력해주세요.'),
});

type AddAccountFormValues = z.infer<typeof AddAccountFormSchema>;

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: AddAccountFormValues) => void;
}

export default function AddAccountModal({
  open,
  onOpenChange,
  onSubmit,
}: AddAccountModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              계좌 정보
            </Modal.Title>
            <Modal.Close onClick={() => onOpenChange(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <AddAccountForm
            onClose={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface AddAccountFormProps {
  onClose: () => void;
  onSubmit?: (values: AddAccountFormValues) => void;
}

function AddAccountForm({ onClose, onSubmit }: AddAccountFormProps) {
  const methods = useForm<AddAccountFormValues>({
    resolver: zodResolver(AddAccountFormSchema),
    mode: 'onChange',
    defaultValues: {
      bankName: '',
      accountNumber: '',
    },
  });

  const { handleSubmit, formState, control } = methods;

  const onValidSubmit = (values: AddAccountFormValues) => {
    // TODO: API 호출로 대체
    if (onSubmit) {
      onSubmit(values);
    } else {
      alert('계좌 정보가 등록되었습니다!');
    }
    onClose();
  };

  const { data } = useSearchBanks();
  const bankOptions =
    data?.map((bank) => ({
      value: bank.bankCode,
      label: bank.bankName,
    })) || [];

  return (
    <FormProvider {...methods}>
      <Modal.Body className="flex flex-col gap-400 px-400 py-300">
        <form
          id="add-account"
          className="flex flex-col gap-300"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<AddAccountFormValues, 'bankName'>
            name="bankName"
            label="은행 선택"
            direction="vertical"
            required
          >
            <Controller
              name="bankName"
              control={control}
              render={({ field, fieldState }) => (
                <div className="w-1/2">
                  <SingleDropdown
                    options={bankOptions}
                    value={field.value}
                    onChange={(value) => field.onChange(value || '')}
                    placeholder="은행 선택"
                    error={!!fieldState.error}
                  />
                </div>
              )}
            />
          </FormField>

          <FormField<AddAccountFormValues, 'accountNumber'>
            name="accountNumber"
            label="계좌번호"
            direction="vertical"
            required
          >
            <BaseInput
              id="accountNumber"
              placeholder="계좌 번호를 입력해주세요."
              maxLength={50}
            />
          </FormField>
        </form>
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
          form="add-account"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          입력완료
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
