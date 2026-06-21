import {
  PathPoint,
  StrokeAnalysis,
  StrokeMetrics,
  WritingAnalysis,
} from '@/types';

function calculateStrokeMetrics(
  speeds: number[],
  pressures: number[],
  timestamps: number[]
): StrokeMetrics {
  if (speeds.length === 0) {
    return {
      avgSpeed: 0,
      maxSpeed: 0,
      minSpeed: 0,
      avgPressure: 0,
      maxPressure: 0,
      minPressure: 0,
      duration: 0,
      pointCount: 0,
    };
  }

  const validSpeeds = speeds.filter((s) => s > 0);
  const validPressures = pressures.filter((p) => p !== undefined && p !== null);

  const avgSpeed =
    validSpeeds.length > 0
      ? validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length
      : 0;
  const maxSpeed = Math.max(...speeds);
  const minSpeed = validSpeeds.length > 0 ? Math.min(...validSpeeds) : 0;

  const avgPressure =
    validPressures.length > 0
      ? validPressures.reduce((a, b) => a + b, 0) / validPressures.length
      : 0.5;
  const maxPressure =
    validPressures.length > 0 ? Math.max(...validPressures) : 0.5;
  const minPressure =
    validPressures.length > 0 ? Math.min(...validPressures) : 0.5;

  const duration =
    timestamps.length > 1
      ? timestamps[timestamps.length - 1] - timestamps[0]
      : 0;

  return {
    avgSpeed,
    maxSpeed,
    minSpeed,
    avgPressure,
    maxPressure,
    minPressure,
    duration,
    pointCount: speeds.length,
  };
}

function detectStrokeType(path: PathPoint[]): StrokeAnalysis['strokeType'] {
  if (path.length < 2) return 'dot';

  const start = path[0];
  const end = path[path.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 15) return 'dot';

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const absAngle = Math.abs(angle);

  let totalCurvature = 0;
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];
    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const cross = v1x * v2y - v1y * v2x;
    totalCurvature += Math.abs(cross);
  }
  const avgCurvature = totalCurvature / Math.max(1, path.length - 2);

  if (avgCurvature > 800 && distance > 30) return 'curve';

  if (absAngle < 20 || absAngle > 160) return 'horizontal';
  if (absAngle > 70 && absAngle < 110) return 'vertical';
  return 'diagonal';
}

function generateStrokeSuggestions(
  metrics: StrokeMetrics,
  strokeType: StrokeAnalysis['strokeType']
): string[] {
  const suggestions: string[] = [];

  if (strokeType === 'dot') {
    if (metrics.duration > 300) {
      suggestions.push('点画书写太慢了，点要干脆利落');
    }
    if (metrics.avgPressure < 0.3) {
      suggestions.push('点画力度太轻，落点要沉稳');
    }
    return suggestions;
  }

  if (strokeType === 'horizontal') {
    if (metrics.avgSpeed < 0.8) {
      suggestions.push('横画书写太慢，试试行笔更果断');
    }
    if (metrics.avgSpeed > 3.5) {
      suggestions.push('横画太快了，容易飘，稳住速度');
    }
    if (metrics.maxPressure < 0.4) {
      suggestions.push('横画起收笔缺少顿笔，加重起收');
    }
  }

  if (strokeType === 'vertical') {
    if (metrics.avgSpeed < 0.8) {
      suggestions.push('竖画速度偏慢，保持流畅');
    }
    if (metrics.avgSpeed > 3) {
      suggestions.push('竖画速度过快，注意垂直稳定性');
    }
    if (metrics.avgPressure < 0.4) {
      suggestions.push('竖画力度不足，中锋行笔要扎实');
    }
  }

  if (strokeType === 'diagonal') {
    if (metrics.avgSpeed > 3.5) {
      suggestions.push('撇捺速度太快，控制好笔锋');
    }
    if (metrics.avgPressure < 0.35) {
      suggestions.push('斜画力度偏轻，注意笔画粗细变化');
    }
  }

  if (strokeType === 'curve') {
    if (metrics.avgSpeed > 3) {
      suggestions.push('转折处速度太快，放慢找弧度');
    }
    if (metrics.maxPressure - metrics.minPressure < 0.1) {
      suggestions.push('曲线缺少粗细变化，注意提按');
    }
  }

  return suggestions;
}

export function analyzeStroke(
  path: PathPoint[],
  strokeIndex: number
): StrokeAnalysis {
  const speeds: number[] = [];
  const pressures: number[] = [];
  const timestamps: number[] = [];

  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    speeds.push(point.speed ?? 0);
    pressures.push(point.pressure ?? 0.5);
    timestamps.push(point.timestamp);
  }

  const metrics = calculateStrokeMetrics(speeds, pressures, timestamps);
  const strokeType = detectStrokeType(path);
  const suggestions = generateStrokeSuggestions(metrics, strokeType);

  return {
    strokeIndex,
    path,
    speeds,
    pressures,
    timestamps,
    metrics,
    strokeType,
    suggestions,
  };
}

function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

function generateOverallSuggestions(
  analysis: WritingAnalysis,
  strokes: StrokeAnalysis[]
): string[] {
  const suggestions: string[] = [];

  const speedCV =
    analysis.overallAvgSpeed > 0
      ? Math.sqrt(analysis.speedVariance) / analysis.overallAvgSpeed
      : 0;
  const pressureCV =
    analysis.overallAvgPressure > 0
      ? Math.sqrt(analysis.pressureVariance) / analysis.overallAvgPressure
      : 0;

  if (speedCV > 0.6) {
    suggestions.push('书写速度波动较大，尝试保持节奏稳定');
  } else if (speedCV < 0.15 && analysis.overallAvgSpeed < 1.5) {
    suggestions.push('书写过于谨慎，可以稍微放松提速');
  }

  if (pressureCV < 0.1) {
    suggestions.push('力度变化太平坦，注意提按顿挫');
  } else if (pressureCV > 0.5) {
    suggestions.push('力度波动过大，保持均匀用力');
  }

  if (analysis.overallAvgPressure < 0.3) {
    suggestions.push('整体力度偏轻，握笔可以再实一些');
  } else if (analysis.overallAvgPressure > 0.8) {
    suggestions.push('整体力度偏重，试试放松手腕');
  }

  if (strokes.length > 1) {
    const strokeDurations = strokes.map((s) => s.metrics.duration);
    const avgDuration =
      strokeDurations.reduce((a, b) => a + b, 0) / strokeDurations.length;
    const minDuration = Math.min(...strokeDurations);
    if (minDuration < avgDuration * 0.3) {
      suggestions.push('部分笔画过于仓促，每一笔都要到位');
    }
  }

  const strokeSuggestions = strokes.flatMap((s) => s.suggestions);
  const uniqueSuggestions = [...new Set(strokeSuggestions)];
  suggestions.push(...uniqueSuggestions.slice(0, 2));

  return suggestions.slice(0, 4);
}

export function analyzeWriting(paths: PathPoint[][]): WritingAnalysis {
  const strokes: StrokeAnalysis[] = paths.map((path, index) =>
    analyzeStroke(path, index)
  );

  const allSpeeds = strokes.flatMap((s) => s.metrics.avgSpeed);
  const allPressures = strokes.flatMap((s) => s.metrics.avgPressure);
  const allDurations = strokes.map((s) => s.metrics.duration);

  const overallAvgSpeed =
    allSpeeds.length > 0
      ? allSpeeds.reduce((a, b) => a + b, 0) / allSpeeds.length
      : 0;
  const overallAvgPressure =
    allPressures.length > 0
      ? allPressures.reduce((a, b) => a + b, 0) / allPressures.length
      : 0.5;

  const speedVariance = calculateVariance(allSpeeds);
  const pressureVariance = calculateVariance(allPressures);

  const totalDuration =
    allDurations.reduce((a, b) => a + b, 0) +
    (strokes.length > 1 ? (strokes.length - 1) * 500 : 0);

  const speedStd = Math.sqrt(speedVariance);
  const pressureStd = Math.sqrt(pressureVariance);
  const speedUniformity =
    overallAvgSpeed > 0 ? Math.max(0, 100 - (speedStd / overallAvgSpeed) * 100) : 50;
  const pressureUniformity =
    overallAvgPressure > 0
      ? Math.max(0, 100 - (pressureStd / overallAvgPressure) * 100)
      : 50;
  const uniformityScore = Math.round((speedUniformity + pressureUniformity) / 2);

  const analysis: WritingAnalysis = {
    strokes,
    overallAvgSpeed,
    overallAvgPressure,
    speedVariance,
    pressureVariance,
    totalDuration,
    uniformityScore,
    overallSuggestions: [],
  };

  analysis.overallSuggestions = generateOverallSuggestions(analysis, strokes);

  return analysis;
}

export function getPageUniformity(records: { score: number; analysis: WritingAnalysis | null }[]): {
  avgScore: number;
  scoreVariance: number;
  avgSpeed: number;
  avgPressure: number;
  overallUniformity: number;
  bestGrids: number[];
  worstGrids: number[];
} {
  if (records.length === 0) {
    return {
      avgScore: 0,
      scoreVariance: 0,
      avgSpeed: 0,
      avgPressure: 0,
      overallUniformity: 0,
      bestGrids: [],
      worstGrids: [],
    };
  }

  const scores = records.map((r) => r.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const scoreVariance = calculateVariance(scores);

  const validAnalyses = records
    .filter((r) => r.analysis !== null)
    .map((r) => r.analysis!);

  const avgSpeed =
    validAnalyses.length > 0
      ? validAnalyses.reduce((a, b) => a + b.overallAvgSpeed, 0) /
        validAnalyses.length
      : 0;
  const avgPressure =
    validAnalyses.length > 0
      ? validAnalyses.reduce((a, b) => a + b.overallAvgPressure, 0) /
        validAnalyses.length
      : 0;

  const avgUniformity =
    validAnalyses.length > 0
      ? validAnalyses.reduce((a, b) => a + b.uniformityScore, 0) /
        validAnalyses.length
      : 0;

  const scoreStd = Math.sqrt(scoreVariance);
  const scoreUniformity =
    avgScore > 0 ? Math.max(0, 100 - (scoreStd / avgScore) * 50) : 0;
  const overallUniformity = Math.round(
    (scoreUniformity + avgUniformity) / 2
  );

  const scoredIndices = records
    .map((r, i) => ({ index: i, score: r.score }))
    .sort((a, b) => b.score - a.score);

  const bestGrids = scoredIndices.slice(0, 3).map((s) => s.index);
  const worstGrids = scoredIndices.slice(-3).reverse().map((s) => s.index);

  return {
    avgScore: Math.round(avgScore),
    scoreVariance,
    avgSpeed,
    avgPressure,
    overallUniformity,
    bestGrids,
    worstGrids,
  };
}
