'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CircleChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useToastStore } from '@/stores/use-toast-store';

/* ─── Course options (Figma 1782:10769) ─────────────── */

const COURSE_OPTIONS = [
  '웹을 넘어 앱으로, 바이브 코딩 앱 런칭편',
  '일잘러의 비밀 무기, 맞춤형 스크래핑 및 루틴 자동화 툴',
  "화면 설계에서 멈추지 않는 '실제 구현' 바이브",
  '반복 루틴 박살내기, 마케팅/데이터 자동화 바이브',
  '기획서 대신 워킹 모델로 설득하기',
  '엔지니어의 무기, AI 페어 프로그래밍과 리팩토링',
] as const;

const CONCERN_PLACEHOLDER =
  "예) 프로토파이로 복잡한 쿠폰 발급 로직이나 구매 플로우를 아무리 화려하게 설계해도, 막상 개발자분들께 보여주면 '시간이 너무 걸린다', '구조상 어렵다'는 크리틱을 받을 때가 많아 답답합니다. 제 머릿속에 있는 디자인 시스템을 다른 사람의 손을 빌리지 않고 직접 라이브 서버에 띄워보고 싶은데, 코딩 쌩초보도 바이브 코딩으로 구현할 수 있을까요?";

/* ─── Schema ─────────────────────────────────────────── */
// Standalone schema — no backend survey DTO exists yet (live swagger has no
// survey-submit endpoint). When the endpoint ships, import its Request DTO and
// add a transformer per schema-validation.md.

const StudyReadyFormSchema = z
  .object({
    courses: z.array(z.string()),
    customCourses: z.array(z.string()),
    concern: z.string(),
    email: z.string().email('올바른 이메일 형식이 아니에요.'),
    agree: z.boolean().refine((v) => v === true, {
      message: '개인정보 이용약관에 동의해주세요.',
    }),
  })
  .refine((v) => v.courses.length + v.customCourses.length > 0, {
    path: ['courses'],
    message: '관심 있는 코스를 하나 이상 선택해주세요.',
  });

type StudyReadyFormValues = z.infer<typeof StudyReadyFormSchema>;

/* ─── Pill chip ──────────────────────────────────────── */

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'whitespace-normal rounded-full border px-375 py-125 text-left text-[14px] leading-[1.5] tracking-[-0.304px] transition-colors md:text-[16px]',
        selected
          ? 'border-rose-500 bg-white font-bold text-rose-500'
          : 'border-gray-400 font-medium text-gray-600 hover:border-rose-300',
      )}
    >
      {label}
    </button>
  );
}

/* ─── Form ───────────────────────────────────────────── */

export function StudyReadyForm() {
  const showToast = useToastStore((s) => s.showToast);

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDraft, setCustomDraft] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StudyReadyFormValues>({
    resolver: zodResolver(StudyReadyFormSchema),
    defaultValues: {
      courses: [],
      customCourses: [],
      concern: '',
      email: '',
      agree: false,
    },
  });

  const courses = watch('courses');
  const customCourses = watch('customCourses');
  const agree = watch('agree');

  const toggleCourse = (label: string) => {
    setValue(
      'courses',
      courses.includes(label)
        ? courses.filter((c) => c !== label)
        : [...courses, label],
      { shouldValidate: true },
    );
  };

  const addCustom = () => {
    const value = customDraft.trim();
    if (!value) return;
    setValue('customCourses', [...customCourses, value], {
      shouldValidate: true,
    });
    setCustomDraft('');
    setShowCustomInput(false);
  };

  const removeCustom = (value: string) => {
    setValue(
      'customCourses',
      customCourses.filter((c) => c !== value),
      { shouldValidate: true },
    );
  };

  const onSubmit = (_values: StudyReadyFormValues) => {
    // TODO: API not found — survey-submit endpoint does not exist on the backend.
    // Run `yarn generate:api <survey-api-title>` once the backend ships it, then
    // wire a useMutation here (onError/onSettled + analyzeError per backend-edge-case-gate.md).
    showToast(
      '소중한 의견 감사합니다! 코스 오픈 시 가장 먼저 알려드릴게요.',
      'success',
    );
    reset();
    setCustomDraft('');
    setShowCustomInput(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full flex-col gap-500 rounded-500 bg-white px-300 py-400 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.2)] md:px-625 md:py-750"
    >
      {/* Q1 — course selection */}
      <fieldset className="flex flex-col gap-250">
        <legend className="flex gap-125 text-[16px] leading-[1.5] tracking-[-0.38px] md:text-[20px]">
          <span className="shrink-0 font-bold text-rose-500">Q1</span>
          <span className="text-gray-800">
            제로원에서 배우고 싶은 코스가 있다면 어떤것이 좋을지 선택해주세요.
          </span>
        </legend>

        <div className="flex flex-wrap gap-250">
          {COURSE_OPTIONS.map((label) => (
            <Chip
              key={label}
              label={label}
              selected={courses.includes(label)}
              onClick={() => toggleCourse(label)}
            />
          ))}

          {/* Added custom entries render as removable selected chips */}
          {customCourses.map((label) => (
            <Chip
              key={label}
              label={label}
              selected
              onClick={() => removeCustom(label)}
            />
          ))}

          {/* 기타(직접작성하기) toggle */}
          <Chip
            label="기타(직접작성하기)"
            selected={showCustomInput}
            onClick={() => setShowCustomInput((v) => !v)}
          />
        </div>

        {showCustomInput && (
          <div className="flex flex-wrap items-center gap-250 rounded-full border border-gray-400 px-375 py-125">
            <input
              type="text"
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="내용을 기재해주세요."
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium leading-[1.5] tracking-[-0.304px] text-gray-800 placeholder:text-gray-600 focus:outline-none md:text-[16px]"
            />
            <div className="flex items-center gap-100">
              <button
                type="button"
                onClick={addCustom}
                className="rounded-175 border border-rose-500 px-150 py-25 text-[13px] font-medium leading-[1.5] tracking-[-0.247px] text-rose-500"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomDraft('');
                  setShowCustomInput(false);
                }}
                className="rounded-175 border border-gray-400 px-150 py-25 text-[13px] font-medium leading-[1.5] tracking-[-0.247px] text-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {errors.courses && (
          <p className="text-[13px] text-rose-500">{errors.courses.message}</p>
        )}
      </fieldset>

      {/* Q2 — free-form concern */}
      <div className="flex flex-col gap-250">
        <label
          htmlFor="study-ready-concern"
          className="text-[16px] leading-[1.5] tracking-[-0.38px] text-gray-800 md:text-[20px]"
        >
          바이브 코딩에 대해 고민이 있으신가요? 자유롭게 적어주세요. 많은 고민을
          하며 돕겠습니다.
        </label>
        <textarea
          id="study-ready-concern"
          {...register('concern')}
          placeholder={CONCERN_PLACEHOLDER}
          className="min-h-2850 w-full resize-none rounded-100 border border-gray-300 px-300 py-175 text-[16px] leading-[1.6] tracking-[-0.304px] text-gray-800 placeholder:text-gray-500 focus:border-rose-500 focus:outline-none"
        />
      </div>

      {/* Q3 — email */}
      <div className="flex flex-col gap-250">
        <label
          htmlFor="study-ready-email"
          className="text-[16px] leading-[1.5] tracking-[-0.38px] text-black md:text-[20px]"
        >
          후속 코스 오픈 시 안내 받을 이메일 주소를 입력해 주세요.
        </label>
        <input
          id="study-ready-email"
          type="email"
          {...register('email')}
          placeholder="이메일을 입력해주세요"
          className="w-full rounded-100 border border-gray-300 px-300 py-175 text-[16px] leading-[1.5] tracking-[-0.342px] text-gray-800 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none md:text-[18px]"
        />
        {errors.email && (
          <p className="text-[13px] text-rose-500">{errors.email.message}</p>
        )}
      </div>

      {/* Privacy agreement */}
      <div className="flex flex-col gap-125">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setValue('agree', !agree, {
                shouldValidate: true,
              })
            }
            aria-pressed={agree}
            className="flex items-center gap-125"
          >
            <CircleChevronDown
              className={cn(
                'size-300 shrink-0 transition-colors',
                agree ? 'text-rose-500' : 'text-gray-800',
              )}
            />
            <span className="flex items-center gap-50 text-[16px] font-bold leading-[1.5] tracking-[-0.304px] text-gray-800">
              <span>개인정보 이용약관 동의</span>
              <span>(필수)</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => showToast('약관 페이지 준비 중이에요.', 'info')}
            className="text-[16px] font-bold leading-[1.5] tracking-[-0.304px] text-rose-500 underline"
          >
            보기
          </button>
        </div>
        {errors.agree && (
          <p className="text-[13px] text-rose-500">{errors.agree.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="flex h-625 w-full items-center justify-center rounded-100 bg-rose-500 text-[14px] font-bold leading-[1.5] tracking-[-0.266px] text-white transition-colors hover:bg-rose-600"
      >
        제출하기
      </button>
    </form>
  );
}
