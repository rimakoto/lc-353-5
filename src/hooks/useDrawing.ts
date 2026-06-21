import { useRef, useCallback, useEffect } from 'react';
import { PathPoint } from '@/types';

interface UseDrawingOptions {
  onStrokeStart?: (point: PathPoint) => void;
  onStrokeMove?: (point: PathPoint) => void;
  onStrokeEnd?: (path: PathPoint[]) => void;
  enabled?: boolean;
}

export function useDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: UseDrawingOptions = {}
) {
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<PathPoint[]>([]);
  const lastPointRef = useRef<PathPoint | null>(null);

  const getCanvasPoint = useCallback(
    (e: PointerEvent | MouseEvent | TouchEvent): PathPoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX: number;
      let clientY: number;
      let pressure = 0.5;

      if ('pressure' in e && 'pointerType' in e) {
        const pointerEvent = e as PointerEvent;
        clientX = pointerEvent.clientX;
        clientY = pointerEvent.clientY;
        if (pointerEvent.pointerType === 'pen' || pointerEvent.pointerType === 'touch') {
          pressure = pointerEvent.pressure > 0 ? pointerEvent.pressure : 0.5;
        } else {
          pressure = 0.5;
        }
      } else if ('touches' in e) {
        if (e.touches.length === 0) return null;
        const touch = e.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      const timestamp = Date.now();

      let speed = 0;
      const lastPoint = lastPointRef.current;
      if (lastPoint) {
        const dx = x - lastPoint.x;
        const dy = y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dt = timestamp - lastPoint.timestamp;
        if (dt > 0) {
          speed = distance / dt;
        }
      }

      const point: PathPoint = {
        x,
        y,
        timestamp,
        pressure,
        speed,
      };

      return point;
    },
    [canvasRef]
  );

  const handleStart = useCallback(
    (e: PointerEvent) => {
      if (options.enabled === false) return;
      const point = getCanvasPoint(e);
      if (!point) return;
      isDrawingRef.current = true;
      lastPointRef.current = point;
      currentPathRef.current = [point];
      options.onStrokeStart?.(point);
      e.preventDefault();
    },
    [getCanvasPoint, options]
  );

  const handleMove = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      if (options.enabled === false) return;
      const point = getCanvasPoint(e);
      if (!point) return;
      lastPointRef.current = point;
      currentPathRef.current.push(point);
      options.onStrokeMove?.(point);
      e.preventDefault();
    },
    [getCanvasPoint, options]
  );

  const handleEnd = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      lastPointRef.current = null;
      const path = [...currentPathRef.current];
      currentPathRef.current = [];
      if (path.length > 0) {
        options.onStrokeEnd?.(path);
      }
      e.preventDefault();
    },
    [options]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    (canvas as HTMLCanvasElement).addEventListener('pointerdown', handleStart);
    (canvas as HTMLCanvasElement).addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);

    return () => {
      (canvas as HTMLCanvasElement).removeEventListener('pointerdown', handleStart);
      (canvas as HTMLCanvasElement).removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
  }, [canvasRef, handleStart, handleMove, handleEnd]);

  return {
    isDrawingRef,
  };
}
