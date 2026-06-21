import { WritingAnalysis } from '@/types';
import { StrokeAnalysisChart } from './StrokeAnalysisChart';
import { Activity, Zap, Gauge, Clock, Sparkles } from 'lucide-react';

interface WritingAnalysisPanelProps {
  analysis: WritingAnalysis | null;
  gridIndex: number;
}

export function WritingAnalysisPanel({ analysis, gridIndex }: WritingAnalysisPanelProps) {
  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2
            className="text-lg font-bold text-gray-800 flex items-center gap-2"
            style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}
          >
            <Activity className="w-5 h-5 text-blue-500" />
            书写分析
          </h2>
        </div>
        <div className="p-6 text-center text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">完成描摹后即可查看分析</p>
        </div>
      </div>
    );
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
      <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2
          className="text-lg font-bold text-gray-800 flex items-center gap-2"
          style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}
        >
          <Activity className="w-5 h-5 text-blue-500" />
          书写分析 · 第{gridIndex + 1}格
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-2">速度 & 压力曲线</p>
          <div className="flex justify-center">
            <StrokeAnalysisChart strokes={analysis.strokes} width={320} height={140} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">平均速度</span>
            </div>
            <p className="text-xl font-bold text-blue-600">
              {analysis.overallAvgSpeed.toFixed(2)}
              <span className="text-xs font-normal text-blue-400 ml-1">px/ms</span>
            </p>
          </div>

          <div className="bg-red-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Gauge className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">平均力度</span>
            </div>
            <p className="text-xl font-bold text-red-500">
              {Math.round(analysis.overallAvgPressure * 100)}
              <span className="text-xs font-normal text-red-400 ml-1">%</span>
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">均匀度</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              {analysis.uniformityScore}
              <span className="text-xs font-normal text-green-400 ml-1">分</span>
            </p>
          </div>

          <div className="bg-amber-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-gray-500">总用时</span>
            </div>
            <p className="text-xl font-bold text-amber-600">
              {formatDuration(analysis.totalDuration)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            书写建议
          </p>
          <div className="space-y-2">
            {analysis.overallSuggestions.length > 0 ? (
              analysis.overallSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600 bg-amber-50/50 rounded-lg p-2.5 border border-amber-100"
                >
                  <span className="text-amber-500 font-bold shrink-0 mt-0.5">
                    {index + 1}.
                  </span>
                  <span>{suggestion}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 text-center py-2">
                写得不错，继续保持！
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">笔画详情</p>
          <div className="grid grid-cols-3 gap-2 max-h-24 overflow-y-auto pr-1">
            {analysis.strokes.map((stroke) => (
              <div
                key={stroke.strokeIndex}
                className="bg-gray-50 rounded-lg p-2 text-center"
              >
                <p className="text-xs text-gray-400">#{stroke.strokeIndex + 1}</p>
                <p className="text-sm font-medium text-gray-700">
                  {stroke.strokeType === 'horizontal' && '横'}
                  {stroke.strokeType === 'vertical' && '竖'}
                  {stroke.strokeType === 'diagonal' && '撇捺'}
                  {stroke.strokeType === 'dot' && '点'}
                  {stroke.strokeType === 'curve' && '折'}
                  {stroke.strokeType === 'unknown' && '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
