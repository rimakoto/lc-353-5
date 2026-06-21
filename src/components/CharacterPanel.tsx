import { useMemo } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useProgressStore } from '@/store/useProgressStore';
import { Type, Languages, Star, Award } from 'lucide-react';

type DifficultyFilter = 0 | 1 | 2 | 3;

export function CharacterPanel() {
  const {
    currentType,
    currentCharacter,
    difficultyFilter,
    setType,
    setCharacter,
    setDifficultyFilter,
    getFilteredCharacters,
  } = useCharacterStore();

  const progress = useProgressStore((s) => s.progress);

  const filteredChars = useMemo(() => getFilteredCharacters(), [
    currentType,
    difficultyFilter,
    getFilteredCharacters,
  ]);

  const difficultyLabels: { value: DifficultyFilter; label: string }[] = [
    { value: 0, label: '全部' },
    { value: 1, label: '简单' },
    { value: 2, label: '中等' },
    { value: 3, label: '困难' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
      <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-red-50 to-amber-50">
        <h2
          className="text-lg font-bold text-gray-800 flex items-center gap-2"
          style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}
        >
          <span className="text-red-500">📚</span> 选择范字
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setType('chinese')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium transition-all ${
              currentType === 'chinese'
                ? 'bg-red-500 text-white shadow-md shadow-red-200 scale-[1.02]'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Type className="w-4 h-4" />
            汉字书法
          </button>
          <button
            onClick={() => setType('english')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium transition-all ${
              currentType === 'english'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Languages className="w-4 h-4" />
            英文花体
          </button>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Star className="w-3 h-3" /> 难度筛选
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {difficultyLabels.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficultyFilter(d.value)}
                className={`py-1.5 px-2 text-sm rounded-lg transition-all ${
                  difficultyFilter === d.value
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">
            共 {filteredChars.length} 个范字
          </p>
          <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {filteredChars.map((char) => {
              const record = progress.records[char.id];
              const isSelected = currentCharacter.id === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => setCharacter(char)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all group ${
                    isSelected
                      ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg scale-105 ring-2 ring-red-300'
                      : 'bg-gradient-to-br from-amber-50 to-orange-50 text-gray-800 hover:shadow-md hover:scale-105 border border-amber-100'
                  }`}
                  style={{
                    fontFamily:
                      char.type === 'chinese'
                        ? '"KaiTi", "STKaiti", "楷体", serif'
                        : '"Dancing Script", "Great Vibes", cursive',
                    fontSize: char.type === 'chinese' ? 26 : 22,
                    fontWeight: 'bold',
                  }}
                >
                  <span>{char.char}</span>
                  {record && record.bestScore >= 70 && (
                    <div
                      className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        isSelected
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-amber-400 text-white'
                      } shadow-sm`}
                    >
                      <Award className="w-3 h-3" />
                    </div>
                  )}
                  {record && (
                    <span
                      className={`text-[10px] mt-0.5 font-medium ${
                        isSelected ? 'text-red-100' : 'text-gray-400'
                      }`}
                      style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                      {record.bestScore}分
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
