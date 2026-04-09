import { z } from 'zod';

const HOME_TAB_VALUES = [
  'study',
  'ranking',
  'archive',
  'history',
  'community',
] as const;

const homeSearchParamsSchema = z.object({
  tab: z.enum(HOME_TAB_VALUES).optional().default('study'),
  tutorial: z.enum(['study']).optional(),
});

export type HomeTab = z.infer<typeof homeSearchParamsSchema>['tab'];

export interface HomePageSearchParamsResult {
  activeTab: HomeTab;
  tutorial?: 'study';
}

const toFirstValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const parseHomePageSearchParams = (
  rawSearchParams?: Record<string, string | string[] | undefined>,
): HomePageSearchParamsResult => {
  const parsedSearchParams = homeSearchParamsSchema.safeParse({
    tab: toFirstValue(rawSearchParams?.tab),
    tutorial: toFirstValue(rawSearchParams?.tutorial),
  });

  if (!parsedSearchParams.success) {
    return {
      activeTab: 'study',
    };
  }

  return {
    activeTab: parsedSearchParams.data.tab,
    tutorial: parsedSearchParams.data.tutorial,
  };
};
