'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { usePapers } from '@/lib/hooks/use-papers';
import { useViewport } from '@/lib/hooks/use-viewport';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Paper as PaperType } from '@/types/paper';
import Paper from './Paper';
import AuthDialog from './AuthDialog';

interface CorkboardProps {
  initialPapers: PaperType[];
  initialAuth: boolean;
}

export default function Corkboard({ initialPapers, initialAuth }: CorkboardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  // Store state
  const papers = useStore((state) => state.papers);
  const setPapers = useStore((state) => state.setPapers);
  const focusedPaperId = useStore((state) => state.focusedPaperId);
  const setFocusedPaperId = useStore((state) => state.setFocusedPaperId);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const setIsAuthenticated = useStore((state) => state.setIsAuthenticated);

  // Hooks
  const { addPaper: addPaperAction, updatePaper: updatePaperAction } = usePapers();
  const { viewport, isPanning, setIsPanning, setPan, setZoom, handleWheel } = useViewport();

  // Hydrate store on mount
  useEffect(() => {
    setPapers(initialPapers);
    setIsAuthenticated(initialAuth);
  }, [initialPapers, initialAuth, setPapers, setIsAuthenticated]);

  // Pan state
  const panStartRef = useRef({ x: 0, y: 0 });

  const handleBoardClick = async (e: React.MouseEvent) => {
    if (focusedPaperId) {
      setFocusedPaperId(null);
      return;
    }

    if (!isAuthenticated || isPanning) return;

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;

    await addPaperAction(x - 96, y - 96);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === boardRef.current) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan(e.clientX - panStartRef.current.x, e.clientY - panStartRef.current.y);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheelEvent = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, viewport.zoom + delta), 2);
    setZoom(newZoom);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#8B7355]">
      <AuthDialog />

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 z-40 bg-white bg-opacity-90 p-4 rounded shadow-lg max-w-xs">
        <h3 className="font-bold mb-2">How to use:</h3>
        <ul className="text-sm space-y-1">
          <li>• {isAuthenticated ? 'Click anywhere to add paper' : 'Login to add papers'}</li>
          <li>• Click paper to focus/edit</li>
          {isAuthenticated && <li>• Drag papers to reposition</li>}
          <li>• Click outside to unfocus</li>
          <li>• Drag board to pan, scroll to zoom</li>
        </ul>
      </div>

      {/* Corkboard */}
      <div
        ref={boardRef}
        className="w-full h-full cursor-move"
        onClick={handleBoardClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheelEvent}
        style={{
          backgroundImage: `radial-gradient(circle, #6B5A44 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      >
        <div
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
            width: '5000px',
            height: '5000px',
            position: 'relative',
          }}
        >
          {papers.map((paper) => (
            <Paper key={paper.id} paper={paper} zoom={viewport.zoom} />
          ))}
        </div>
      </div>
    </div>
  );
}
