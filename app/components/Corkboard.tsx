'use client';

import { useState, useRef, useEffect } from 'react';
import { Paper as PaperType } from '@/types/paper';
import Paper from './Paper';
import AuthDialog from './AuthDialog';
import {
  getPapers,
  addPaper,
  updatePaper,
  deletePaper,
  checkAuth,
} from '@/app/actions';

interface CorkboardProps {
  initialPapers: PaperType[];
  initialAuth: boolean;
}

export default function Corkboard({ initialPapers, initialAuth }: CorkboardProps) {
  const [papers, setPapers] = useState<PaperType[]>(initialPapers);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [focusedPaperId, setFocusedPaperId] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const boardRef = useRef<HTMLDivElement>(null);

  const refreshAuth = async () => {
    const auth = await checkAuth();
    setIsAuthenticated(auth);
  };

  const refreshPapers = async () => {
    const updatedPapers = await getPapers();
    setPapers(updatedPapers);
  };

  const handleBoardClick = async (e: React.MouseEvent) => {
    if (focusedPaperId) {
      setFocusedPaperId(null);
      return;
    }

    if (!isAuthenticated || isPanning) return;

    // Calculate position relative to the board with zoom and pan
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;

    const result = await addPaper(x - 96, y - 96); // Center the paper (48px * 2 = 96)
    if (result.success && result.paper) {
      setPapers([...papers, result.paper]);
    }
  };

  const handlePaperUpdate = async (id: string, text: string) => {
    await updatePaper(id, { text });
    await refreshPapers();
  };

  const handlePaperDelete = async (id: string) => {
    await deletePaper(id);
    setPapers(papers.filter((p) => p.id !== id));
    setFocusedPaperId(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === boardRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 2);
    setZoom(newZoom);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#8B7355]">
      <AuthDialog isAuthenticated={isAuthenticated} onAuthChange={refreshAuth} />

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 z-40 bg-white bg-opacity-90 p-4 rounded shadow-lg max-w-xs">
        <h3 className="font-bold mb-2">How to use:</h3>
        <ul className="text-sm space-y-1">
          <li>• {isAuthenticated ? 'Click anywhere to add paper' : 'Login to add papers'}</li>
          <li>• Click paper to focus/edit</li>
          <li>• Click outside to unfocus</li>
          <li>• Drag to pan, scroll to zoom</li>
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
        onWheel={handleWheel}
        style={{
          backgroundImage: `
            radial-gradient(circle, #6B5A44 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '5000px',
            height: '5000px',
            position: 'relative',
          }}
        >
          {papers.map((paper) => (
            <Paper
              key={paper.id}
              paper={paper}
              isEditable={isAuthenticated}
              isFocused={focusedPaperId === paper.id}
              onFocus={() => setFocusedPaperId(paper.id)}
              onUpdate={(text) => handlePaperUpdate(paper.id, text)}
              onDelete={() => handlePaperDelete(paper.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
