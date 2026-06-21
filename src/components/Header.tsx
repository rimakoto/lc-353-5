import { useCharacterStore } from '@/store/useCharacterStore';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  Brush,
} from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { goToNext, goToPrev, currentCharacter } = useCharacterStore();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
              <Brush className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-white tracking-wider drop-shadow-sm"
                style={{ fontFamily: '"KaiTi", "STKaiti", "楷体", serif' }}
              >
                练字描红本
              </h1>
              <p className="text-xs text-white/75 -mt-0.5">
                Miaohong · 书法练习助手
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm transition-all backdrop-blur-sm border border-white/20"
              title="上一个范字"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">上一字</span>
            </button>

            <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
              <span
                className="text-xl font-bold text-white leading-none"
                style={{
                  fontFamily:
                    currentCharacter.type === 'chinese'
                      ? '"KaiTi", "STKaiti", serif'
                      : '"Dancing Script", cursive',
                }}
              >
                {currentCharacter.char}
              </span>
            </div>

            <button
              onClick={goToNext}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm transition-all backdrop-blur-sm border border-white/20"
              title="下一个范字"
            >
              <span className="hidden sm:inline">下一字</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-px h-7 bg-white/25 mx-1" />

            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20"
              title="重置画布"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20"
              title="使用帮助"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="mt-4 p-4 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm animate-fade-in">
            <h4 className="font-bold mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> 使用说明
            </h4>
            <ul className="space-y-1.5 text-white/90 text-sm">
              <li>🖱️ 用鼠标或手指沿着灰色范字描摹，每格可独立练习</li>
              <li>⏱️ 停笔 0.8 秒后自动评分，≥50 分记录练习</li>
              <li>✅ 绿色对勾代表优秀，黄色代表良好，红色提示需要多练习</li>
              <li>🔄 每格右下角的 ↻ 按钮可清除重写</li>
              <li>💾 所有练习进度会自动保存到浏览器本地</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
