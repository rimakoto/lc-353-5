import { useEffect, useRef } from 'react';
import { StrokeAnalysis } from '@/types';

interface StrokeAnalysisChartProps {
  strokes: StrokeAnalysis[];
  width?: number;
  height?: number;
}

const COLORS = {
  speed: '#3B82F6',
  pressure: '#EF4444',
  grid: '#E5E7EB',
  text: '#6B7280',
  background: '#FAFAF9',
};

export function StrokeAnalysisChart({
  strokes,
  width = 480,
  height = 200,
}: StrokeAnalysisChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 24, right: 24, bottom: 36, left: 44 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    const allSpeeds: number[] = [];
    const allPressures: number[] = [];
    let totalPoints = 0;

    for (const stroke of strokes) {
      allSpeeds.push(...stroke.speeds.filter((s) => s > 0));
      allPressures.push(...stroke.pressures);
      totalPoints += stroke.speeds.length;
    }

    if (totalPoints === 0) {
      ctx.fillStyle = COLORS.text;
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无数据', width / 2, height / 2);
      return;
    }

    const maxSpeed = Math.max(...allSpeeds, 1) * 1.1;
    const maxPressure = 1;

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    for (let i = 0; i <= 5; i++) {
      const x = padding.left + (chartWidth / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    ctx.fillStyle = COLORS.text;
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      const value = maxSpeed - (maxSpeed / 4) * i;
      ctx.fillText(value.toFixed(1), padding.left - 6, y);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const timeLabels = ['0s', '25%', '50%', '75%', '100%'];
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (chartWidth / 4) * i;
      ctx.fillText(timeLabels[i], x, height - padding.bottom + 6);
    }

    let cumulativeOffset = 0;
    const strokeSegments: { x: number; speed: number; pressure: number }[][] = [];

    for (const stroke of strokes) {
      const segment: { x: number; speed: number; pressure: number }[] = [];
      const pointCount = stroke.speeds.length;
      for (let i = 0; i < pointCount; i++) {
        const xRatio = (cumulativeOffset + i) / Math.max(1, totalPoints - 1);
        const x = padding.left + chartWidth * xRatio;
        segment.push({
          x,
          speed: stroke.speeds[i] || 0,
          pressure: stroke.pressures[i] || 0,
        });
      }
      strokeSegments.push(segment);
      cumulativeOffset += pointCount;
    }

    ctx.strokeStyle = COLORS.speed;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (const segment of strokeSegments) {
      if (segment.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(
        segment[0].x,
        padding.top + chartHeight - (segment[0].speed / maxSpeed) * chartHeight
      );
      for (let i = 1; i < segment.length; i++) {
        const y =
          padding.top + chartHeight - (segment[i].speed / maxSpeed) * chartHeight;
        ctx.lineTo(segment[i].x, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = COLORS.pressure;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    for (const segment of strokeSegments) {
      if (segment.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(
        segment[0].x,
        padding.top + chartHeight - (segment[0].pressure / maxPressure) * chartHeight
      );
      for (let i = 1; i < segment.length; i++) {
        const y =
          padding.top +
          chartHeight -
          (segment[i].pressure / maxPressure) * chartHeight;
        ctx.lineTo(segment[i].x, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const legendY = 14;
    ctx.fillStyle = COLORS.speed;
    ctx.fillRect(padding.left, legendY - 4, 16, 2);
    ctx.fillStyle = COLORS.text;
    ctx.fillText('速度', padding.left + 22, legendY);

    ctx.fillStyle = COLORS.pressure;
    ctx.fillRect(padding.left + 80, legendY - 4, 16, 2);
    ctx.setLineDash([4, 2]);
    ctx.strokeStyle = COLORS.pressure;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left + 80, legendY);
    ctx.lineTo(padding.left + 96, legendY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.text;
    ctx.fillText('压力', padding.left + 102, legendY);

    ctx.textAlign = 'right';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText('单位: px/ms', width - padding.right, height - 8);
  }, [strokes, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded-lg border border-gray-200"
    />
  );
}
