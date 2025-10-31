import { useCallback } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import {
  addPaper as addPaperAction,
  updatePaper as updatePaperAction,
  deletePaper as deletePaperAction,
  getPapers,
} from '@/app/actions';
import { Paper, PaperColor } from '@/types/paper';

export function usePapers() {
  const papers = useStore((state) => state.papers);
  const setPapers = useStore((state) => state.setPapers);
  const addPaper = useStore((state) => state.addPaper);
  const updatePaper = useStore((state) => state.updatePaper);
  const deletePaper = useStore((state) => state.deletePaper);
  const papersById = useStore((state) => state.papersById);

  const refreshPapers = useCallback(async () => {
    const updated = await getPapers();
    setPapers(updated);
  }, [setPapers]);

  const handleAddPaper = useCallback(
    async (x: number, y: number, color?: PaperColor) => {
      const result = await addPaperAction(x, y, color);

      if (result.success && result.paper) {
        addPaper(result.paper);
        toast.success('Paper added');
      } else {
        toast.error(result.error || 'Failed to add paper');
      }

      return result;
    },
    [addPaper]
  );

  const handleUpdatePaper = useCallback(
    async (id: string, updates: Partial<Paper>, version: number) => {
      // Get current paper for optimistic update
      const currentPaper = papersById.get(id);
      if (!currentPaper) {
        toast.error('Paper not found');
        return { success: false };
      }

      // Optimistic update
      updatePaper(id, updates);

      const result = await updatePaperAction(id, updates, version);

      if (result.success && result.paper) {
        // Update with server version (includes new version number)
        updatePaper(id, result.paper);
      } else {
        // Rollback to current paper
        updatePaper(id, currentPaper);

        if (result.conflict) {
          toast.error('Paper was modified elsewhere. Reloading...', {
            duration: 2000,
          });
          // Refresh all papers to get latest
          setTimeout(() => refreshPapers(), 1000);
        } else {
          toast.error(result.error || 'Failed to update paper');
        }
      }

      return result;
    },
    [updatePaper, papersById, refreshPapers]
  );

  const handleDeletePaper = useCallback(
    async (id: string) => {
      // Optimistic delete
      const paperToDelete = papersById.get(id);
      if (!paperToDelete) return;

      deletePaper(id);

      const result = await deletePaperAction(id);

      if (result.success) {
        toast.success('Paper deleted');
      } else {
        // Rollback on error
        addPaper(paperToDelete);
        toast.error(result.error || 'Failed to delete paper');
      }

      return result;
    },
    [papersById, deletePaper, addPaper]
  );

  return {
    papers,
    addPaper: handleAddPaper,
    updatePaper: handleUpdatePaper,
    deletePaper: handleDeletePaper,
    refreshPapers,
  };
}
