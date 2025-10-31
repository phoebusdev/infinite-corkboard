import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createPapersSlice } from './slices/papers-slice';
import { createViewportSlice } from './slices/viewport-slice';
import { createAuthSlice } from './slices/auth-slice';
import { createUISlice } from './slices/ui-slice';
import { StoreState } from '@/types/store';

export const useStore = create<StoreState>()(
  devtools(
    (...a) => ({
      ...createPapersSlice(...a),
      ...createViewportSlice(...a),
      ...createAuthSlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: 'Corkboard Store',
    }
  )
);

// Selector hooks for optimized re-renders
export const usePapers = () => useStore((state) => state.papers);
export const usePapersById = () => useStore((state) => state.papersById);
export const useViewport = () => useStore((state) => state.viewport);
export const useIsPanning = () => useStore((state) => state.isPanning);
export const useFocusedPaperId = () => useStore((state) => state.focusedPaperId);
export const useIsAuthenticated = () =>
  useStore((state) => state.isAuthenticated);
export const useSearchQuery = () => useStore((state) => state.searchQuery);
