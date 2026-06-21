import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { CharacterPanel } from '@/components/CharacterPanel';
import { ProgressPanel } from '@/components/ProgressPanel';
import { MiZiGeCanvas } from '@/components/MiZiGeCanvas';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useProgressStore } from '@/store/useProgressStore';

export default function Home() {
  const currentCharacter = useCharacterStore((s) => s.currentCharacter);
  const initChar = useCharacterStore((s) => s.init);
  const loadProgress = useProgressStore((s) => s.load);

  useEffect(() => {
    loadProgress();
    initChar();
  }, [loadProgress, initChar]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-stagger">
          <div className="xl:col-span-3 space-y-6 order-2 xl:order-1 min-w-0">
            <CharacterPanel />
          </div>

          <div className="xl:col-span-6 order-1 xl:order-2 min-w-0 w-full">
            <MiZiGeCanvas character={currentCharacter} />
          </div>

          <div className="xl:col-span-3 space-y-6 order-3 min-w-0">
            <ProgressPanel />

            <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
              <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <h2
                  className="text-lg font-bold text-gray-800 flex items-center gap-2"
                  style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}
                >
                  <span className="text-green-500">💡</span> 书写技巧
                </h2>
              </div>
              <div className="p-4 space-y-3 text-sm text-gray-600">
                <div className="flex gap-2">
                  <span className="text-red-500">①</span>
                  <span>
                    <strong className="text-gray-800">起笔要稳</strong>
                    ：下笔轻顿，不要犹豫
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-amber-500">②</span>
                  <span>
                    <strong className="text-gray-800">行笔要缓</strong>
                    ：保持速度均匀，感受笔锋
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-500">③</span>
                  <span>
                    <strong className="text-gray-800">收笔要顿</strong>
                    ：收住笔势，回锋藏尾
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-500">④</span>
                  <span>
                    <strong className="text-gray-800">结构要准</strong>
                    ：注意米字格辅助线定位
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
        <p className="text-xs text-gray-400">
          练字描红本 · 每日一练，字如其人
          <span className="mx-2">|</span>
          进度保存在本地浏览器中
        </p>
      </footer>
    </div>
  );
}
