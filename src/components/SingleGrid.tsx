import { useEffect, useRef, useState, useCallback } from 'react';
import { Character, PathPoint, ScoreResult, WritingAnalysis } from '@/types';
import type { GridStatus } from '@/types';
import { useDrawing } from '@/hooks/useDrawing';
import {
  createCharMask,
  createUserPathMask,
  calculateScore,
  getScoreColor,
} from '@/utils/pathDetector';
import { analyzeWriting } from '@/utils/writingAnalysis';
import { Check, X, RotateCcw } from 'lucide-react';

interface SingleGridProps {
  character: Character;
  gridIndex: number;
  isActive: boolean;
  onClick?: () => void;
  onScoreComputed?: (score: number) => void;
  onAnalysisComputed?: (analysis: WritingAnalysis) => void;
}

const GRID_SIZE = 200;
const LINE_WIDTH = 8;

export function SingleGrid({
  character,
  gridIndex,
  isActive,
  onClick,
  onScoreComputed,
  onAnalysisComputed,
}: SingleGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paths, setPaths] = useState<PathPoint[][]>([]);
  const [currentPath, setCurrentPath] = useState<PathPoint[]>([]);
  const [status, setStatus] = useState<GridStatus>('idle');
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const charMaskRef = useRef<Uint8ClampedArray | null>(null);

  const pathsRef = useRef<PathPoint[][]>([]);
  const onScoreComputedRef = useRef<((score: number) => void) | undefined>(undefined);
  const onAnalysisComputedRef = useRef<((analysis: WritingAnalysis) => void) | undefined>(undefined);
  onScoreComputedRef.current = onScoreComputed;
  onAnalysisComputedRef.current = onAnalysisComputed;

  const fontFamily =
    character.type === 'chinese'
      ? '"KaiTi", "STKaiti", "楷体", serif'
      : '"Dancing Script", "Great Vibes", cursive';
  const fontSize = character.type === 'chinese' ? 150 : 140;

  useEffect(() => {
    try {
      const mask = createCharMask(
        character.char,
        GRID_SIZE,
        fontFamily,
        fontSize
      );
      charMaskRef.current = mask;
    } catch (e) {
      console.error('Failed to create char mask:', e);
    }
    setPaths([]);
    pathsRef.current = [];
    setCurrentPath([]);
    setStatus('idle');
    setScoreResult(null);
  }, [character]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);

    ctx.fillStyle = '#FFFBF2';
    ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);

    ctx.strokeStyle = '#C53D43';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, GRID_SIZE - 2, GRID_SIZE - 2);

    ctx.strokeStyle = '#D4C4B0';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(GRID_SIZE / 2, 0);
    ctx.lineTo(GRID_SIZE / 2, GRID_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, GRID_SIZE / 2);
    ctx.lineTo(GRID_SIZE, GRID_SIZE / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(GRID_SIZE, GRID_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(GRID_SIZE, 0);
    ctx.lineTo(0, GRID_SIZE);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(138, 138, 138, 0.45)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillText(character.char, GRID_SIZE / 2, GRID_SIZE / 2);

    const allPaths =
      currentPath.length > 0 ? [...paths, currentPath] : paths;

    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const path of allPaths) {
      if (path.length === 0) continue;
      if (path.length === 1) {
        ctx.fillStyle = '#2C2C2C';
        ctx.beginPath();
        ctx.arc(path[0].x, path[0].y, LINE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }

    if (status === 'completed' && scoreResult) {
      const color = getScoreColor(scoreResult.level);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, GRID_SIZE - 4, GRID_SIZE - 4);
    }
  }, [character, paths, currentPath, status, scoreResult, fontFamily, fontSize]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const computeScore = useCallback(() => {
    if (!charMaskRef.current) return;
    const allPaths = pathsRef.current;
    if (allPaths.length === 0) return;

    try {
      const userMask = createUserPathMask(allPaths, GRID_SIZE, LINE_WIDTH);
      const result = calculateScore(charMaskRef.current, userMask, GRID_SIZE);
      setScoreResult(result);
      if (result.score >= 50) {
        setStatus('completed');
      } else {
        setStatus('failed');
      }
      onScoreComputedRef.current?.(result.score);

      const analysis = analyzeWriting(allPaths);
      onAnalysisComputedRef.current?.(analysis);
    } catch (e) {
      console.error('Failed to compute score:', e);
    }
  }, []);

  const evaluateTimerRef = useRef<number | null>(null);

  useDrawing(canvasRef, {
    onStrokeStart: (point) => {
      if (status === 'completed') return;
      setStatus('drawing');
      setCurrentPath([point]);
      if (evaluateTimerRef.current) {
        window.clearTimeout(evaluateTimerRef.current);
        evaluateTimerRef.current = null;
      }
    },
    onStrokeMove: (point) => {
      setCurrentPath((prev) => [...prev, point]);
    },
    onStrokeEnd: (path) => {
      const newPaths = [...pathsRef.current, path];
      pathsRef.current = newPaths;
      setPaths(newPaths);
      setCurrentPath([]);
      if (evaluateTimerRef.current) {
        window.clearTimeout(evaluateTimerRef.current);
      }
      evaluateTimerRef.current = window.setTimeout(() => {
        computeScore();
      }, 800);
    },
    enabled: status !== 'completed',
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPaths([]);
    pathsRef.current = [];
    setCurrentPath([]);
    setStatus('idle');
    setScoreResult(null);
  };

  const statusIcon = () => {
    if (status === 'completed' && scoreResult) {
      if (scoreResult.level === 'excellent' || scoreResult.level === 'good') {
        return (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-md animate-bounce-in">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        );
      }
      return (
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      );
    }
    if (status === 'failed' && scoreResult) {
      return (
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-400 flex items-center justify-center shadow-md">
          <X className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden transition-all duration-200 cursor-pointer select-none
        ${
          isActive
            ? 'ring-4 ring-red-400/60 shadow-xl scale-[1.02]'
            : 'shadow-md hover:shadow-lg hover:scale-[1.01]'
        }
        ${status === 'completed' ? '' : ''}
      `}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        width={GRID_SIZE}
        height={GRID_SIZE}
        className="block touch-none w-full h-auto"
        style={{
          aspectRatio: '1 / 1',
          maxWidth: '100%',
          cursor:
            status === 'completed'
              ? 'default'
              : "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' fill='%232C2C2C'/></svg>\") 0 24, crosshair",
        }}
      />

      <div className="absolute top-2 left-2 text-xs font-bold text-red-400/80 bg-white/80 px-1.5 py-0.5 rounded">
        {gridIndex + 1}
      </div>

      {statusIcon()}

      {paths.length > 0 && status !== 'completed' && (
        <button
          onClick={handleClear}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
          title="清除重写"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
        </button>
      )}

      {scoreResult && (
        <div
          className="absolute bottom-0 left-0 right-0 px-2 py-1 text-xs font-bold text-center text-white"
          style={{
            backgroundColor: `${getScoreColor(scoreResult.level)}E6`,
          }}
        >
          {scoreResult.score}分 · {scoreResult.message}
        </div>
      )}
    </div>
  );
}
