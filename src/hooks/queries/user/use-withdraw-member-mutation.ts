import { useMutation } from '@tanstack/react-query';
import { axiosInstanceV6 } from '@/api/client/axios';
import { AUTH_ROUTE_PATHS } from '@/features/auth/model/auth-route';
import { clearClientAuthStateAndRedirect } from '@/features/auth/model/client-auth-cleanup';
import { useToastStore } from '@/stores/use-toast-store';
import { analyzeError, sendErrorToSentry } from '@/utils/error-handler';

export const useWithdrawMemberMutation = () => {
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: () =>
      axiosInstanceV6.delete('mypage/class/withdraw', {
        data: { agreedToClassWithdrawalNotice: true },
      }),
    onSuccess: () => {
      clearClientAuthStateAndRedirect(AUTH_ROUTE_PATHS.LANDING);
    },
    onError: (error) => {
      const errorInfo = analyzeError(error);
      showToast(errorInfo.userMessage, 'error');
      sendErrorToSentry(errorInfo, { source: 'useWithdrawMemberMutation' });
    },
  });
};
