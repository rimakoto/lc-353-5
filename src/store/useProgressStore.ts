import { create } from 'zustand';
import { UserProgress } from '@/types';
import {
  loadProgress,
  saveProgress,
  updateProgress as updateProgressUtil,
  getDefaultProgress,
} from '@/utils/storage';

interface ProgressState {
  progress: UserProgress;
  load: () => void;
  recordScore: (characterId: string, score: number) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: getDefaultProgress(),
  load: () => {
    const loaded = loadProgress();
    set({ progress: loaded });
  },
  recordScore: (characterId: string, score: number) => {
    const { progress } = get();
    const updated = updateProgressUtil(progress, characterId, score);
    saveProgress(updated);
    set({ progress: updated });
  },
  reset: () => {
    const defaultProgress = getDefaultProgress();
    saveProgress(defaultProgress);
    set({ progress: defaultProgress });
  },
}));
