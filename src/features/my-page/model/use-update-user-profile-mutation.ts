import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { UpdateUserProfileRequest } from '../api/types';
import { updateUserProfile } from '../api/update-user-profile';

export const useUpdateUserProfileMutation = (memberId: number) => {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: UpdateUserProfileRequest) =>
      updateUserProfile(memberId, formData),

    onSuccess: () => {
      router.refresh();
    },
  });
};
