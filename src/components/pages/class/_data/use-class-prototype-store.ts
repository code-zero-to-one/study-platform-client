import { create } from 'zustand';
import { type LessonStatus } from '../_components/roadmap-tab';

const DEFAULT_LESSON_STATUS: LessonStatus[] = [
  'done',
  'done',
  'current',
  'locked',
  'locked',
  'locked',
  'locked',
  'locked',
  'locked',
  'locked',
];

interface ClassPrototypeState {
  lessonStatus: LessonStatus[];
  isLoggedIn: boolean;
  reset: () => void;
  markAllDone: () => void;
  completeLesson: (num: number) => void;
  setLoggedIn: (value: boolean) => void;
}

export const useClassPrototypeStore = create<ClassPrototypeState>((set) => ({
  lessonStatus: DEFAULT_LESSON_STATUS,
  isLoggedIn: true,
  reset: () =>
    set({
      lessonStatus: [...DEFAULT_LESSON_STATUS],
    }),
  markAllDone: () =>
    set({
      lessonStatus: Array<LessonStatus>(DEFAULT_LESSON_STATUS.length).fill(
        'done',
      ),
    }),
  completeLesson: (num) =>
    set((state) => {
      const next: LessonStatus[] = [...state.lessonStatus];
      const idx = num - 1;
      if (idx < 0 || idx >= next.length) return {};
      next[idx] = 'done';
      if (idx + 1 < next.length && next[idx + 1] === 'locked') {
        next[idx + 1] = 'current';
      }
      return { lessonStatus: next };
    }),
  setLoggedIn: (value) => set({ isLoggedIn: value }),
}));
