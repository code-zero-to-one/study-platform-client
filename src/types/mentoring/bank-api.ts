import { type BankListResponseSchema, type BankResponse } from '@/api/openapi';

export type MentoringBankSearchParams = Record<string, never>;

export type MentoringBankSearchQueryKey = readonly ['bankSearch'];

export type MentoringBankSearchApiResponse = BankListResponseSchema;

export type MentoringBankSearchResponse = BankResponse[];

export type BankSearchQueryParams = MentoringBankSearchParams;

export type BankSearchQueryKey = MentoringBankSearchQueryKey;

export type BankSearchApiResponse = MentoringBankSearchApiResponse;

export type BankSearchResponse = MentoringBankSearchResponse;
