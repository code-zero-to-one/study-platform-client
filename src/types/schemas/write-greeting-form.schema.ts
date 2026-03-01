import z from 'zod';

export const WriteGreetingFormSchema = z.object({
  greeting: z
    .string()
    .min(20, '최소 20자 이상 입력해주세요.')
    .max(500, '최대 500자까지 입력 가능합니다.'),
});

export type WriteGreetingFormValues = z.infer<typeof WriteGreetingFormSchema>;
