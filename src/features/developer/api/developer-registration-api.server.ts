import { isAxiosError } from 'axios';
import { axiosServerInstance } from '@/api/client/axios.server';
import type { DeveloperRegistrationState } from '@/types/developer/domain';
import { parseDeveloperRegistrationResponse } from './developer-registration-api';

const shouldSilentlyIgnoreDeveloperRegistrationError = (status?: number) => {
  return status === 401 || status === 403 || status === 404;
};

export const getMyDeveloperRegistrationInServer =
  async (): Promise<DeveloperRegistrationState> => {
    const response = await axiosServerInstance.get('/developers/me');

    return parseDeveloperRegistrationResponse(response.data);
  };

export const tryGetMyDeveloperRegistrationInServer = async () => {
  try {
    return await getMyDeveloperRegistrationInServer();
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status;

      if (
        !error.response ||
        shouldSilentlyIgnoreDeveloperRegistrationError(status)
      ) {
        return null;
      }
    }

    throw error;
  }
};
