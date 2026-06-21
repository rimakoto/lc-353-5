import { useProgressStore } from '@/store/useProgressStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import {
  CalendarDays,
  TrendingUp,
  Trophy,
  Target,
  Award,
  RefreshCcw,
} from 'lucide-react';
import { getRecordForCharacter } from '@/utils/storage';

export function ProgressPanel() {
  const progress = useProgressStore((s) => s.progress);
  const currentCharacter = useCharacterStore((s) => s.currentCharacter);
  const reset = useProgressStore((s) => s.reset);

  const currentRecord = getRecordForCharacter(progress, currentCharacter.id);

  const masteredCount = Object.values(progress.records).filter(
    (r) => r.bestScore >= 85
  ).length;

  const stats = [
    {
      icon: <CalendarDays className="w-5 h-5" />,
      label: '今日练习',
      value: progress.todayPracticed,
      unit: '字',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: '累计练习',
      value: progress.totalPracticed,
      unit: '字',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: '精通范字',
      value: masteredCount,
      unit: '个',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
  ];

  const handleReset = () => {
    if (window.confirm('确定要重置所有练习进度吗？此操作不可撤销。')) {
      reset();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
      <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-bold text-gray-800 flex items-center gap-2"
            style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}
          >
            <span className="text-purple-500">📊</span> 练习进度
          </h2>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="重置进度"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-xl p-3 text-center transition-transform hover:scale-[1.03]`}
            >
              <div
                className={`w-9 h-9 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center mb-1.5 ${stat.iconColor}`}
              >
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800 leading-none">
                {stat.value}
                <span className="text-xs font-normal text-gray-400 ml-0.5">
                  {stat.unit}
                </span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-xl border border-amber-100">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-red-500" />
            当前范字 ·{' '}
            <span
              className="text-red-600"
              style={{
                fontFamily:
                  currentCharacter.type === 'chinese'
                    ? '"KaiTi", "STKaiti", serif'
                    : '"Dancing Script", cursive',
                fontSize: 18,
              }}
            >
              {currentCharacter.char}
            </span>
          </h3>

          {currentRecord ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  最佳成绩
                </span>
                <span className="font-bold text-amber-600">
                  {currentRecord.bestScore} 分
                </span>
              </div>

              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${currentRecord.bestScore}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="text-center p-2 bg-white/60 rounded-lg">
                  <p className="text-lg font-bold text-gray-700">
                    {currentRecord.practiceCount}
                  </p>
                  <p className="text-[11px] text-gray-500">练习次数</p>
                </div>
                <div className="text-center p-2 bg-white/60 rounded-lg">
                  <p className="text-lg font-bold text-green-600">
                    {currentRecord.completedCount}
                  </p>
                  <p className="text-[11px] text-gray-500">达标次数</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              <p className="text-sm">还没有练习记录</p>
              <p className="text-xs mt-1">开始在右侧描摹吧！</p>
            </div>
          )}
        </div>

        <div className="text-[11px] text-gray-400 text-center space-y-1 pt-1">
          <p>💾 进度自动保存到本地</p>
          <p>下次打开可以继续练习</p>
        </div>
      </div>
    </div>
  );
}
