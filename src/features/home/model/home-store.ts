import { create } from 'zustand';

interface HomeState {
  todayStudyTitle: string;
  setTodayStudyTitle: (title: string) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  todayStudyTitle: '',
  setTodayStudyTitle: (title) => set({ todayStudyTitle: title }),
}));
