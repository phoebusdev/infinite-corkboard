import { Paper } from './paper';
import { Viewport } from './viewport';

export interface PapersSlice {
  papers: Paper[];
  papersById: Map<string, Paper>;
  loading: boolean;
  error: string | null;
  setPapers: (papers: Paper[]) => void;
  addPaper: (paper: Paper) => void;
  updatePaper: (id: string, updates: Partial<Paper>) => void;
  deletePaper: (id: string) => void;
  optimisticUpdate: (id: string, updates: Partial<Paper>) => () => void;
}

export interface ViewportSlice {
  viewport: Viewport;
  isPanning: boolean;
  setViewport: (viewport: Viewport) => void;
  updateViewport: (updates: Partial<Viewport>) => void;
  setIsPanning: (isPanning: boolean) => void;
  resetViewport: () => void;
}

export interface UISlice {
  focusedPaperId: string | null;
  selectedPaperIds: Set<string>;
  searchQuery: string;
  filterTags: string[];
  setFocusedPaperId: (id: string | null) => void;
  setSelectedPaperIds: (ids: Set<string>) => void;
  setSearchQuery: (query: string) => void;
  setFilterTags: (tags: string[]) => void;
}

export interface AuthSlice {
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export type StoreState = PapersSlice & ViewportSlice & UISlice & AuthSlice;
