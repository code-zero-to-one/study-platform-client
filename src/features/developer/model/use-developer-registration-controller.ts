'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getDeveloperRegistrationErrorMessage } from '@/features/developer/api/developer-registration-api';
import {
  useMyDeveloperRegistrationQuery,
  useUpdateMyDeveloperRegistrationMutation,
} from '@/features/developer/model/use-developer-registration-query';
import { useToastStore } from '@/stores/use-toast-store';

const REGISTRATION_SUCCESS_MESSAGE = '개발자 등록이 완료되었습니다.';
const UNREGISTRATION_SUCCESS_MESSAGE = '개발자 등록을 해제했습니다.';
const LOAD_ERROR_MESSAGE =
  '개발자 등록 상태를 불러오지 못했습니다. 다시 시도해주세요.';
const SUBMIT_ERROR_MESSAGE =
  '개발자 등록 상태를 저장하지 못했습니다. 다시 시도해주세요.';

interface UseDeveloperRegistrationControllerResult {
  state: {
    viewState: 'loading' | 'error' | 'ready';
    currentRegistration:
      | import('@/types/developer/domain').DeveloperRegistrationState
      | undefined;
    selectedRegistered: boolean;
    errorMessage: string;
    isSubmitting: boolean;
    hasSelectionChanged: boolean;
  };
  actions: {
    handleSelectRegistered: (registered: boolean) => void;
    handleRetry: () => Promise<void>;
    handleMoveHome: () => void;
    handleSubmit: () => Promise<void>;
  };
}

export const useDeveloperRegistrationController =
  (): UseDeveloperRegistrationControllerResult => {
    const router = useRouter();
    const showToast = useToastStore((state) => state.showToast);
    const registrationQuery = useMyDeveloperRegistrationQuery();
    const updateRegistrationMutation =
      useUpdateMyDeveloperRegistrationMutation();
    const [selectedRegistered, setSelectedRegistered] = useState<
      boolean | undefined
    >(undefined);

    useEffect(() => {
      if (!registrationQuery.data) {
        return;
      }

      setSelectedRegistered(registrationQuery.data.registered);
    }, [registrationQuery.data]);

    const viewState: 'loading' | 'error' | 'ready' = registrationQuery.isPending
      ? 'loading'
      : registrationQuery.isError
        ? 'error'
        : 'ready';

    const errorMessage = useMemo(() => {
      if (!registrationQuery.isError) {
        return '';
      }

      return getDeveloperRegistrationErrorMessage(
        registrationQuery.error,
        LOAD_ERROR_MESSAGE,
      );
    }, [registrationQuery.error, registrationQuery.isError]);

    const currentRegistration = registrationQuery.data;
    const resolvedSelectedRegistered =
      selectedRegistered ?? currentRegistration?.registered ?? false;
    const hasSelectionChanged = currentRegistration
      ? currentRegistration.registered !== resolvedSelectedRegistered
      : false;

    const handleSelectRegistered = (registered: boolean) => {
      setSelectedRegistered(registered);
    };

    const handleRetry = async () => {
      await registrationQuery.refetch();
    };

    const handleMoveHome = () => {
      router.push('/home');
    };

    const handleSubmit = async () => {
      try {
        const updatedRegistration =
          await updateRegistrationMutation.mutateAsync({
            registered: resolvedSelectedRegistered,
          });

        setSelectedRegistered(updatedRegistration.registered);
        showToast(
          updatedRegistration.registered
            ? REGISTRATION_SUCCESS_MESSAGE
            : UNREGISTRATION_SUCCESS_MESSAGE,
          'success',
        );
        router.refresh();
      } catch (error) {
        showToast(
          getDeveloperRegistrationErrorMessage(error, SUBMIT_ERROR_MESSAGE),
          'error',
        );
      }
    };

    return {
      state: {
        viewState,
        currentRegistration,
        selectedRegistered: resolvedSelectedRegistered,
        errorMessage,
        isSubmitting: updateRegistrationMutation.isPending,
        hasSelectionChanged,
      },
      actions: {
        handleSelectRegistered,
        handleRetry,
        handleMoveHome,
        handleSubmit,
      },
    };
  };
