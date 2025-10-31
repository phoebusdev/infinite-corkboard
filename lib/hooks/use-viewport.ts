import { useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Viewport } from '@/types/viewport';

export function useViewport() {
  const viewport = useStore((state) => state.viewport);
  const updateViewport = useStore((state) => state.updateViewport);
  const setIsPanning = useStore((state) => state.setIsPanning);
  const isPanning = useStore((state) => state.isPanning);
  const resetViewport = useStore((state) => state.resetViewport);

  // Update viewport dimensions on window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      updateViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateViewport]);

  const setZoom = useCallback(
    (zoom: number) => {
      const clampedZoom = Math.min(Math.max(0.5, zoom), 2);
      updateViewport({ zoom: clampedZoom });
    },
    [updateViewport]
  );

  const setPan = useCallback(
    (x: number, y: number) => {
      updateViewport({ x, y });
    },
    [updateViewport]
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.5, viewport.zoom + delta), 2);
      setZoom(newZoom);
    },
    [viewport.zoom, setZoom]
  );

  return {
    viewport,
    isPanning,
    setIsPanning,
    setZoom,
    setPan,
    resetViewport,
    handleWheel,
  };
}
