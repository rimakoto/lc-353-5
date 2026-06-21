export interface Character {
  id: string;
  char: string;
  type: 'chinese' | 'english';
  difficulty: 1 | 2 | 3;
  strokes?: number;
  pinyin?: string;
  meaning?: string;
}

export interface PathPoint {
  x: number;
  y: number;
  pressure?: number;
  speed?: number;
  timestamp: number;
}

export type GridStatus = 'idle' | 'drawing' | 'completed' | 'failed';

export interface GridState {
  gridIndex: number;
  isActive: boolean;
  paths: PathPoint[][];
  score: number | null;
  status: GridStatus;
}

export interface ProgressRecord {
  characterId: string;
  bestScore: number;
  practiceCount: number;
  completedCount: number;
  lastPracticeAt: number;
}

export interface UserProgress {
  records: Record<string, ProgressRecord>;
  totalPracticed: number;
  todayPracticed: number;
  todayDate: string;
}

export type ScoreLevel = 'excellent' | 'good' | 'pass' | 'fail';

export interface ScoreResult {
  score: number;
  level: ScoreLevel;
  coverage: number;
  overflow: number;
  message: string;
}

export interface StrokeMetrics {
  avgSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  avgPressure: number;
  maxPressure: number;
  minPressure: number;
  duration: number;
  pointCount: number;
}

export interface StrokeAnalysis {
  strokeIndex: number;
  path: PathPoint[];
  speeds: number[];
  pressures: number[];
  timestamps: number[];
  metrics: StrokeMetrics;
  strokeType?: 'horizontal' | 'vertical' | 'diagonal' | 'dot' | 'curve' | 'unknown';
  suggestions: string[];
}

export interface WritingAnalysis {
  strokes: StrokeAnalysis[];
  overallAvgSpeed: number;
  overallAvgPressure: number;
  speedVariance: number;
  pressureVariance: number;
  totalDuration: number;
  uniformityScore: number;
  overallSuggestions: string[];
}

export interface GridWritingRecord {
  gridIndex: number;
  score: number;
  analysis: WritingAnalysis | null;
  completedAt: number;
}
