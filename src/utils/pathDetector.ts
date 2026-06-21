import { PathPoint, ScoreResult, ScoreLevel } from '@/types';

export function createCharMask(
  char: string,
  size: number,
  fontFamily: string,
  fontSize: number
): Uint8ClampedArray {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillText(char, size / 2, size / 2);

  const imageData = ctx.getImageData(0, 0, size, size);
  const mask = new Uint8ClampedArray(size * size);
  for (let i = 0; i < size * size; i++) {
    const alpha = imageData.data[i * 4 + 3];
    mask[i] = alpha > 50 ? 1 : 0;
  }
  return mask;
}

export function createUserPathMask(
  paths: PathPoint[][],
  size: number,
  lineWidth: number
): Uint8ClampedArray {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const path of paths) {
    if (path.length < 2) {
      if (path.length === 1) {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(path[0].x, path[0].y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  }

  const imageData = ctx.getImageData(0, 0, size, size);
  const mask = new Uint8ClampedArray(size * size);
  for (let i = 0; i < size * size; i++) {
    const alpha = imageData.data[i * 4 + 3];
    mask[i] = alpha > 50 ? 1 : 0;
  }
  return mask;
}

export function dilateMask(
  mask: Uint8ClampedArray,
  size: number,
  radius: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(mask.length);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      if (mask[idx] === 1) {
        result[idx] = 1;
        continue;
      }
      let found = false;
      for (let dy = -radius; dy <= radius && !found; dy++) {
        for (let dx = -radius; dx <= radius && !found; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
          if (dx * dx + dy * dy > radius * radius) continue;
          if (mask[ny * size + nx] === 1) {
            result[idx] = 1;
            found = true;
          }
        }
      }
    }
  }
  return result;
}

export function calculateScore(
  charMask: Uint8ClampedArray,
  userMask: Uint8ClampedArray,
  size: number
): ScoreResult {
  const dilatedCharMask = dilateMask(charMask, size, 6);

  let charPixels = 0;
  let userPixels = 0;
  let overlapPixels = 0;
  let overflowPixels = 0;

  for (let i = 0; i < size * size; i++) {
    if (charMask[i] === 1) charPixels++;
    if (userMask[i] === 1) userPixels++;
    if (charMask[i] === 1 && userMask[i] === 1) overlapPixels++;
    if (userMask[i] === 1 && dilatedCharMask[i] === 0) overflowPixels++;
  }

  if (userPixels === 0 || charPixels === 0) {
    return {
      score: 0,
      level: 'fail',
      coverage: 0,
      overflow: 0,
      message: '请先描摹汉字',
    };
  }

  const coverage = (overlapPixels / charPixels) * 100;
  const overflow = (overflowPixels / userPixels) * 100;

  let rawScore = coverage * 0.75 - overflow * 0.4;
  rawScore = Math.max(0, Math.min(100, rawScore));

  const score = Math.round(rawScore);

  let level: ScoreLevel;
  let message: string;

  if (score >= 85) {
    level = 'excellent';
    message = '太棒了！描摹非常精准！';
  } else if (score >= 70) {
    level = 'good';
    message = '写得不错！继续加油！';
  } else if (score >= 50) {
    level = 'pass';
    message = '还可以，注意笔画位置哦';
  } else {
    level = 'fail';
    message = '需要多多练习，别灰心！';
  }

  return {
    score,
    level,
    coverage: Math.round(coverage),
    overflow: Math.round(overflow),
    message,
  };
}

export function getScoreColor(level: ScoreLevel): string {
  switch (level) {
    case 'excellent':
      return '#22C55E';
    case 'good':
      return '#EAB308';
    case 'pass':
      return '#F97316';
    case 'fail':
      return '#EF4444';
  }
}
