import { StateCreator } from 'zustand';
import { Paper } from '@/types/paper';
import { PapersSlice } from '@/types/store';

export const createPapersSlice: StateCreator<PapersSlice> = (set, get) => ({
  papers: [],
  papersById: new Map(),
  loading: false,
  error: null,

  setPapers: (papers) =>
    set({
      papers,
      papersById: new Map(papers.map((p) => [p.id, p])),
    }),

  addPaper: (paper) =>
    set((state) => {
      const newById = new Map(state.papersById);
      newById.set(paper.id, paper);
      return {
        papers: [...state.papers, paper],
        papersById: newById,
      };
    }),

  updatePaper: (id, updates) =>
    set((state) => {
      const paper = state.papersById.get(id);
      if (!paper) return state;

      const updated = { ...paper, ...updates, updatedAt: Date.now() };
      const newById = new Map(state.papersById);
      newById.set(id, updated);

      return {
        papersById: newById,
        papers: state.papers.map((p) => (p.id === id ? updated : p)),
      };
    }),

  deletePaper: (id) =>
    set((state) => {
      const newById = new Map(state.papersById);
      newById.delete(id);

      return {
        papersById: newById,
        papers: state.papers.filter((p) => p.id !== id),
      };
    }),

  optimisticUpdate: (id, updates) => {
    const previous = get().papersById.get(id);
    get().updatePaper(id, updates);
    return () => {
      if (previous) {
        get().updatePaper(id, previous);
      }
    };
  },
});
