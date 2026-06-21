import { GridWritingRecord } from '@/types';
import { getPageUniformity } from '@/utils/writingAnalysis';
import { BarChart3, Trophy, ThumbsDown, TrendingUp, Activity } from 'lucide-react';

interface PageStatsPanelProps {
  records: GridWritingRecord[];
}

export function PageStatsPanel({ records }: PageStatsPanelProps) {
  const stats = getPageUniformity(records);

  const completedCount = records.filter((r) => r.completedAt > 0).length;

  const getUniformityLabel = (score: number) => {
    if (score >= 85)
      return { text: '非常均匀', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70)
      return { text: '比较均匀', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 50)
      return { text: '一般', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { text: '波动较大', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const uniformityInfo = getUniformityLabel(stats.overallUniformity);

  const getRecordByGridIndex = (gridIndex: number) =>
    records.find((r) => r.gridIndex === gridIndex);

  if (completedCount === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2
            className="text-lg font-bold text-gray-800 flex items-center gap-2"
            style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}
          >
            <BarChart3 className="w-5 h-5 text-purple-500" />
            整页统计
          </h2>
        </div>
        <div className="p-6 text-center text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">完成描摹后查看整页统计</p>
        </div>
      </div>
    );
  }

  const bestRecords = stats.bestGrids
    .map((idx) => getRecordByGridIndex(idx))
    .filter((r): r is GridWritingRecord => r !== undefined && r.completedAt > 0 && r.score > 0);

  const worstRecords = stats.worstGrids
    .map((idx) => getRecordByGridIndex(idx))
    .filter(
      (r): r is GridWritingRecord =>
        r !== undefined && r.completedAt > 0 && !stats.bestGrids.includes(r.gridIndex)
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
      <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <h2
          className="text-lg font-bold text-gray-800 flex items-center gap-2"
          style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}
        >
          <BarChart3 className="w-5 h-5 text-purple-500" />
          整页统计
          <span className="text-xs font-normal text-gray-400 ml-auto">
            已完成 {completedCount} 格
          </span>
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-500" />
              书写均匀度
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${uniformityInfo.bg} ${uniformityInfo.color}`}
            >
              {uniformityInfo.text}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-purple-600">
              {stats.overallUniformity}
            </span>
            <span className="text-sm text-gray-400 mb-1">分</span>
          </div>
          <div className="mt-2 h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
              style={{ width: `${stats.overallUniformity}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">平均分数</p>
            <p className="text-2xl font-bold text-gray-800">{stats.avgScore}分</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">平均速度</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.avgSpeed.toFixed(2)}
              <span className="text-xs font-normal text-gray-400 ml-1">px/ms</span>
            </p>
          </div>
        </div>

        {bestRecords.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              写得最好的
            </p>
            <div className="flex gap-2">
              {bestRecords.map((record) => (
                <div
                  key={record.gridIndex}
                  className="flex-1 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-2 text-center border border-amber-200"
                >
                  <p className="text-xs text-amber-600">
                    第{record.gridIndex + 1}格
                  </p>
                  <p className="text-lg font-bold text-amber-700">
                    {record.score}分
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {worstRecords.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
              <ThumbsDown className="w-3.5 h-3.5 text-gray-500" />
              需要加强的
            </p>
            <div className="flex gap-2">
              {worstRecords.map((record) => (
                <div
                  key={record.gridIndex}
                  className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-200"
                >
                  <p className="text-xs text-gray-500">
                    第{record.gridIndex + 1}格
                  </p>
                  <p className="text-lg font-bold text-gray-600">
                    {record.score}分
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            提示：多练习薄弱的字，整体水平提升更快
          </p>
        </div>
      </div>
    </div>
  );
}
