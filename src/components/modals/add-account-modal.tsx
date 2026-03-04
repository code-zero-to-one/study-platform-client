import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/common/ui/button';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import FormField from '@/components/common/ui/form/form-field';
import { Modal } from '@/components/common/ui/modal';
import { useSearchBanks } from '@/hooks/queries/bank-search-api';
import {
  useRegisterSettlementAccount,
  useUpdateSettlementAccount,
} from '@/hooks/queries/settlement-account-api';
import { BaseInput } from '../common/ui/input';

// Form Schema
const AddAccountFormSchema = z.object({
  bankName: z.string().min(1, '은행을 선택해주세요.'),
  accountNumber: z.string().min(1, '계좌번호를 입력해주세요.'),
  accountHolder: z.string().min(1, '예금주명을 입력해주세요.'),
});

type AddAccountFormValues = z.infer<typeof AddAccountFormSchema>;

interface AddAccountModalProps {
  defaultValues?: AddAccountFormValues;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddAccountModal({
  defaultValues,
  open,
  onOpenChange,
}: AddAccountModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header variant="form">
            <Modal.Title className="font-designer-20b text-text-strong">
              계좌 정보
            </Modal.Title>
            <Modal.CloseButton onClick={() => onOpenChange(false)} />
          </Modal.Header>

          <AddAccountForm
            defaultValues={defaultValues}
            onClose={() => onOpenChange(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface AddAccountFormProps {
  defaultValues?: AddAccountFormValues;
  onClose: () => void;
}

function AddAccountForm({ defaultValues, onClose }: AddAccountFormProps) {
  const methods = useForm<AddAccountFormValues>({
    resolver: zodResolver(AddAccountFormSchema),
    mode: 'onChange',
    defaultValues: defaultValues || {
      bankName: '',
      accountNumber: '',
      accountHolder: '',
    },
  });

  const { handleSubmit, formState, control } = methods;

  const { mutate: registerAccount } = useRegisterSettlementAccount();
  const { mutate: updateAccount } = useUpdateSettlementAccount();

  const onValidSubmit = (values: AddAccountFormValues) => {
    const mode = defaultValues ? 'update' : 'add';

    if (mode === 'add') {
      registerAccount(values, {
        onSuccess: () => {
          alert('계좌가 성공적으로 등록되었습니다!');
          onClose();
        },
        onError: () => {
          alert('계좌 등록에 실패했습니다. 다시 시도해주세요.');
        },
      });

      return;
    } else if (mode === 'update') {
      updateAccount(values, {
        onSuccess: () => {
          alert('계좌 정보가 성공적으로 변경되었습니다!');
          onClose();
        },
        onError: () => {
          alert('계좌 정보 변경에 실패했습니다. 다시 시도해주세요.');
        },
      });
    }
  };

  const { data } = useSearchBanks();
  const bankOptions =
    data?.map((bank) => ({
      value: bank.bankCode,
      label: bank.bankName,
    })) || [];

  return (
    <FormProvider {...methods}>
      <Modal.Body variant="form">
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

          <FormField<AddAccountFormValues, 'accountHolder'>
            name="accountHolder"
            label="예금주명"
            direction="vertical"
            required
          >
            <BaseInput
              id="accountHolder"
              placeholder="예금주명을 입력해주세요."
              maxLength={50}
            />
          </FormField>
        </form>
      </Modal.Body>

      <Modal.Footer variant="form">
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
