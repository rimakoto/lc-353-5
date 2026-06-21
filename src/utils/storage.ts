import { UserProgress, ProgressRecord } from '@/types';

const PROGRESS_KEY = 'miaohong_progress';
const CURRENT_CHAR_KEY = 'miaohong_current_char';

function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDefaultProgress(): UserProgress {
  return {
    records: {},
    totalPracticed: 0,
    todayPracticed: 0,
    todayDate: getTodayDate(),
  };
}

export function loadProgress(): UserProgress {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) return getDefaultProgress();
    const progress = JSON.parse(data) as UserProgress;
    const today = getTodayDate();
    if (progress.todayDate !== today) {
      progress.todayDate = today;
      progress.todayPracticed = 0;
    }
    return progress;
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export function updateProgress(
  progress: UserProgress,
  characterId: string,
  score: number
): UserProgress {
  const today = getTodayDate();
  const isNewDay = progress.todayDate !== today;

  const existingRecord = progress.records[characterId];
  const newRecord: ProgressRecord = existingRecord
    ? {
        ...existingRecord,
        bestScore: Math.max(existingRecord.bestScore, score),
        practiceCount: existingRecord.practiceCount + 1,
        completedCount:
          score >= 70
            ? existingRecord.completedCount + 1
            : existingRecord.completedCount,
        lastPracticeAt: Date.now(),
      }
    : {
        characterId,
        bestScore: score,
        practiceCount: 1,
        completedCount: score >= 70 ? 1 : 0,
        lastPracticeAt: Date.now(),
      };

  return {
    records: {
      ...progress.records,
      [characterId]: newRecord,
    },
    totalPracticed: progress.totalPracticed + 1,
    todayPracticed: isNewDay ? 1 : progress.todayPracticed + 1,
    todayDate: today,
  };
}

export function loadCurrentCharacterId(): string | null {
  try {
    return localStorage.getItem(CURRENT_CHAR_KEY);
  } catch {
    return null;
  }
}

export function saveCurrentCharacterId(id: string): void {
  try {
    localStorage.setItem(CURRENT_CHAR_KEY, id);
  } catch (e) {
    console.error('Failed to save current character:', e);
  }
}

export function getRecordForCharacter(
  progress: UserProgress,
  characterId: string
): ProgressRecord | null {
  return progress.records[characterId] || null;
}
