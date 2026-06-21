import { create } from 'zustand';
import { Character } from '@/types';
import { chineseCharacters } from '@/data/chineseChars';
import { englishCharacters } from '@/data/englishChars';
import {
  loadCurrentCharacterId,
  saveCurrentCharacterId,
} from '@/utils/storage';

type CharacterType = 'chinese' | 'english';
type DifficultyFilter = 0 | 1 | 2 | 3;

interface CharacterState {
  currentType: CharacterType;
  currentCharacter: Character;
  difficultyFilter: DifficultyFilter;
  setType: (type: CharacterType) => void;
  setCharacter: (char: Character) => void;
  setDifficultyFilter: (d: DifficultyFilter) => void;
  getFilteredCharacters: () => Character[];
  goToNext: () => void;
  goToPrev: () => void;
  init: () => void;
}

function findCharacterById(
  chars: Character[],
  id: string | null
): Character {
  if (id) {
    const found = chars.find((c) => c.id === id);
    if (found) return found;
  }
  return chars[0];
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  currentType: 'chinese',
  currentCharacter: chineseCharacters[0],
  difficultyFilter: 0,
  setType: (type: CharacterType) => {
    const chars =
      type === 'chinese' ? chineseCharacters : englishCharacters;
    const defaultChar = chars.find(
      (c) =>
        get().difficultyFilter === 0 || c.difficulty === get().difficultyFilter
    ) || chars[0];
    set({
      currentType: type,
      currentCharacter: defaultChar,
    });
    saveCurrentCharacterId(defaultChar.id);
  },
  setCharacter: (char: Character) => {
    set({
      currentCharacter: char,
      currentType: char.type,
    });
    saveCurrentCharacterId(char.id);
  },
  setDifficultyFilter: (d: DifficultyFilter) => {
    set({ difficultyFilter: d });
  },
  getFilteredCharacters: () => {
    const { currentType, difficultyFilter } = get();
    const allChars =
      currentType === 'chinese' ? chineseCharacters : englishCharacters;
    if (difficultyFilter === 0) return allChars;
    return allChars.filter((c) => c.difficulty === difficultyFilter);
  },
  goToNext: () => {
    const chars = get().getFilteredCharacters();
    const currentIndex = chars.findIndex(
      (c) => c.id === get().currentCharacter.id
    );
    const nextIndex = (currentIndex + 1) % chars.length;
    const nextChar = chars[nextIndex];
    set({ currentCharacter: nextChar });
    saveCurrentCharacterId(nextChar.id);
  },
  goToPrev: () => {
    const chars = get().getFilteredCharacters();
    const currentIndex = chars.findIndex(
      (c) => c.id === get().currentCharacter.id
    );
    const prevIndex =
      (currentIndex - 1 + chars.length) % chars.length;
    const prevChar = chars[prevIndex];
    set({ currentCharacter: prevChar });
    saveCurrentCharacterId(prevChar.id);
  },
  init: () => {
    const savedId = loadCurrentCharacterId();
    let targetList = [
      ...chineseCharacters,
      ...englishCharacters,
    ];
    let found = targetList.find((c) => c.id === savedId);
    if (found) {
      set({
        currentCharacter: found,
        currentType: found.type,
      });
    }
  },
}));
