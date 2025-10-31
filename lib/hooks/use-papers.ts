import { useCallback } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import {
  addPaper as addPaperAction,
  updatePaper as updatePaperAction,
  deletePaper as deletePaperAction,
} from '@/app/actions';
import { Paper, PaperColor } from '@/types/paper';

export function usePapers() {
  const papers = useStore((state) => state.papers);
  const addPaper = useStore((state) => state.addPaper);
  const updatePaper = useStore((state) => state.updatePaper);
  const deletePaper = useStore((state) => state.deletePaper);
  const optimisticUpdate = useStore((state) => state.optimisticUpdate);

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
      // Optimistic update
      const rollback = optimisticUpdate(id, updates);

      const result = await updatePaperAction(id, updates, version);

      if (result.success && result.paper) {
        updatePaper(id, result.paper);
      } else {
        // Rollback on error
        rollback();

        if (result.conflict) {
          toast.error('Paper was modified by another process', {
            action: {
              label: 'Reload',
              onClick: () => window.location.reload(),
            },
          });
        } else {
          toast.error(result.error || 'Failed to update paper');
        }
      }

      return result;
    },
    [updatePaper, optimisticUpdate]
  );

  const handleDeletePaper = useCallback(
    async (id: string) => {
      // Optimistic delete
      const paperToDelete = papers.find((p) => p.id === id);
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
    [papers, deletePaper, addPaper]
  );

  return {
    papers,
    addPaper: handleAddPaper,
    updatePaper: handleUpdatePaper,
    deletePaper: handleDeletePaper,
  };
}
