import { type BankListResponseSchema, type BankResponse } from '@/api/openapi';

export type BankSearchQueryParams = Record<string, never>;

export type BankSearchQueryKey = readonly ['bankSearch'];

export type BankSearchApiResponse = BankListResponseSchema;

export type BankSearchResponse = BankResponse[];
