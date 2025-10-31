import { StateCreator } from 'zustand';
import { ViewportSlice } from '@/types/store';

const DEFAULT_VIEWPORT = {
  x: 0,
  y: 0,
  zoom: 1,
  width: typeof window !== 'undefined' ? window.innerWidth : 1920,
  height: typeof window !== 'undefined' ? window.innerHeight : 1080,
};

export const createViewportSlice: StateCreator<ViewportSlice> = (set) => ({
  viewport: DEFAULT_VIEWPORT,
  isPanning: false,

  setViewport: (viewport) => set({ viewport }),

  updateViewport: (updates) =>
    set((state) => ({
      viewport: { ...state.viewport, ...updates },
    })),

  setIsPanning: (isPanning) => set({ isPanning }),

  resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),
});
