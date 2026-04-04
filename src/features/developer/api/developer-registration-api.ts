import { z } from 'zod';
import { ApiError } from '@/api/client/api-error';
import { axiosInstance } from '@/api/client/axios';
import type { UpdateDeveloperRegistrationParams } from '@/types/developer/api-params';
import type { DeveloperRegistrationState } from '@/types/developer/domain';

const developerRegistrationContentSchema = z.object({
  developerId: z.number().int().nullable(),
  registered: z.boolean(),
  updatedAt: z.string().nullable(),
});

const developerRegistrationResponseSchema = z.object({
  content: developerRegistrationContentSchema,
});

const parseDeveloperRegistrationResponse = (
  input: unknown,
): DeveloperRegistrationState => {
  const { developerId, registered, updatedAt } =
    developerRegistrationResponseSchema.parse(input).content;

  return {
    developerId: developerId ?? undefined,
    registered,
    updatedAt: updatedAt ?? undefined,
  };
};

export const getMyDeveloperRegistration = async () => {
  const response = await axiosInstance.get('/developers/me');

  return parseDeveloperRegistrationResponse(response.data);
};

export const updateMyDeveloperRegistration = async ({
  registered,
}: UpdateDeveloperRegistrationParams) => {
  const response = await axiosInstance.put('/developers/me/registration', {
    registered,
  });

  return parseDeveloperRegistrationResponse(response.data);
};

export const getDeveloperRegistrationErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (error instanceof ApiError && error.message.trim().length > 0) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
};

export { parseDeveloperRegistrationResponse };
