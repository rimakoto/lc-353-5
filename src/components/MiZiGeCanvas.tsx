import { useState, useCallback, useEffect } from 'react';
import { Character, WritingAnalysis, GridWritingRecord } from '@/types';
import { SingleGrid } from './SingleGrid';
import { WritingAnalysisPanel } from './WritingAnalysisPanel';
import { PageStatsPanel } from './PageStatsPanel';
import { useProgressStore } from '@/store/useProgressStore';

interface MiZiGeCanvasProps {
  character: Character;
}

const GRID_COUNT = 9;

export function MiZiGeCanvas({ character }: MiZiGeCanvasProps) {
  const [activeGrid, setActiveGrid] = useState(0);
  const [scoredGrids, setScoredGrids] = useState<Set<number>>(new Set());
  const [gridRecords, setGridRecords] = useState<GridWritingRecord[]>(
    Array.from({ length: GRID_COUNT }, (_, i) => ({
      gridIndex: i,
      score: 0,
      analysis: null,
      completedAt: 0,
    }))
  );
  const [activeAnalysis, setActiveAnalysis] = useState<WritingAnalysis | null>(null);
  const recordScore = useProgressStore((s) => s.recordScore);

  useEffect(() => {
    setScoredGrids(new Set());
    setActiveGrid(0);
    setGridRecords(
      Array.from({ length: GRID_COUNT }, (_, i) => ({
        gridIndex: i,
        score: 0,
        analysis: null,
        completedAt: 0,
      }))
    );
    setActiveAnalysis(null);
  }, [character.id]);

  const handleScoreComputed = useCallback(
    (gridIndex: number, score: number) => {
      setScoredGrids((prev) => {
        const next = new Set(prev);
        next.add(gridIndex);
        return next;
      });
      recordScore(character.id, score);
    },
    [character.id, recordScore]
  );

  const handleAnalysisComputed = useCallback(
    (gridIndex: number, analysis: WritingAnalysis) => {
      setGridRecords((prev) => {
        const next = [...prev];
        next[gridIndex] = {
          ...next[gridIndex],
          analysis,
          completedAt: Date.now(),
        };
        return next;
      });
      if (gridIndex === activeGrid) {
        setActiveAnalysis(analysis);
      }
    },
    [activeGrid]
  );

  const handleGridClick = useCallback((index: number) => {
    setActiveGrid(index);
    setActiveAnalysis(gridRecords[index]?.analysis ?? null);
  }, [gridRecords]);

  const scoredGridsArr = Array.from(scoredGrids);

  return (
    <div
      key={character.id}
      className="space-y-4"
    >
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/80 border-2 border-amber-200/60 shadow-inner min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center border-2 border-red-200"
              style={{
                fontFamily:
                  character.type === 'chinese'
                    ? '"KaiTi", "STKaiti", "楷体", serif'
                    : '"Dancing Script", "Great Vibes", cursive',
                fontSize: character.type === 'chinese' ? 42 : 38,
                fontWeight: 'bold',
                color: '#C53D43',
              }}
            >
              {character.char}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}>
                描摹练习
              </h3>
              {character.pinyin && (
                <p className="text-sm text-gray-500">
                  <span className="text-red-500 font-medium">{character.pinyin}</span>
                  {character.meaning && ` · ${character.meaning}`}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                难度：{'★'.repeat(character.difficulty)}
                {'☆'.repeat(3 - character.difficulty)}
                {character.strokes && ` · ${character.strokes}画`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">已描摹</p>
            <p className="text-2xl font-bold text-red-500" style={{ fontFamily: '"KaiTi", serif' }}>
              {scoredGridsArr.length}
              <span className="text-sm text-gray-400 font-normal">/{GRID_COUNT}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full min-w-0">
          {Array.from({ length: GRID_COUNT }).map((_, index) => (
            <div key={`${character.id}-${index}`} className="min-w-0">
              <SingleGrid
                character={character}
                gridIndex={index}
                isActive={activeGrid === index}
                onClick={() => handleGridClick(index)}
                onScoreComputed={(score) => {
                  handleScoreComputed(index, score);
                  setGridRecords((prev) => {
                    const next = [...prev];
                    next[index] = { ...next[index], score };
                    return next;
                  });
                }}
                onAnalysisComputed={(analysis) => handleAnalysisComputed(index, analysis)}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          💡 提示：用鼠标或手指沿着灰色范字描摹，描完一个字会自动评分和分析
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WritingAnalysisPanel analysis={activeAnalysis} gridIndex={activeGrid} />
        <PageStatsPanel records={gridRecords} />
      </div>
    </div>
  );
}
