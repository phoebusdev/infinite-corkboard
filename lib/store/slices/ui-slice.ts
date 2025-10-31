import { StateCreator } from 'zustand';
import { UISlice } from '@/types/store';

export const createUISlice: StateCreator<UISlice> = (set) => ({
  focusedPaperId: null,
  selectedPaperIds: new Set(),
  searchQuery: '',
  filterTags: [],

  setFocusedPaperId: (id) => set({ focusedPaperId: id }),

  setSelectedPaperIds: (ids) => set({ selectedPaperIds: ids }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilterTags: (tags) => set({ filterTags: tags }),
});
